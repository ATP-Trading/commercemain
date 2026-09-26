import 'server-only'
import { randomUUID } from 'node:crypto'
import { getAdminAccessToken } from '@/lib/shopify/admin-access-token'
import { getValidAccessToken, queryCustomerAccountApi } from '@/lib/shopify/customer-account-oauth'
import { customerAccountOrigin } from '@/lib/auth/site-origin'
import { appendReview, documentSchema, moderateReview, ReviewError, type ReviewDocument, submitSchema, moderateSchema } from './model'

export const namespace = 'atp_reviews'
export const key = 'verified_reviews_v1'
export function requireReviews() {
  if (process.env.PRODUCT_REVIEWS_ENABLED !== 'true' || !/^gid:\/\/shopify\/Customer\/\d+$/.test(process.env.REVIEW_OWNER_CUSTOMER_ID || '')) throw new ReviewError(503, 'unavailable')
}
export function checkOrigin(request: Request) {
  if (request.headers.get('origin') !== customerAccountOrigin(process.env) || !request.headers.get('content-type')?.startsWith('application/json')) throw new ReviewError(403, 'forbidden')
}
export async function readInput(request: Request) {
  checkOrigin(request)
  const reader = request.body?.getReader()
  if (!reader) throw new ReviewError(400, 'invalid_input')
  const chunks: Uint8Array[] = []; let length = 0
  try { while (true) { const result = await reader.read(); if (result.done) break
    length += result.value.length
    if (length > 8192) { await reader.cancel(); throw new ReviewError(413, 'too_large') }
    chunks.push(result.value)
  }} finally { reader.releaseLock() }
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8')) } catch { throw new ReviewError(400, 'invalid_input') }
}
export async function adminQuery<T>(query: string, variables: Record<string, unknown> = {}): Promise<T> {
  const token = await getAdminAccessToken()
  const response = await fetch(`https://${process.env.SHOPIFY_STORE_DOMAIN}/admin/api/2026-07/graphql.json`, {
    method: 'POST', cache: 'no-store', redirect: 'error', signal: AbortSignal.timeout(15000),
    headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': token }, body: JSON.stringify({ query, variables }),
  })
  if (!response.ok) throw new ReviewError(502, 'unavailable')
  const result = await response.json()
  if (result.errors?.length || !result.data) throw new ReviewError(502, 'unavailable')
  return result.data as T
}
export const IDENTITY = `query ReviewIdentity { customer { id } }`
export async function identity(owner = false) {
  requireReviews()
  const token = await getValidAccessToken()
  if (!token) throw new ReviewError(401, 'login_required')
  const result = await queryCustomerAccountApi<{customer: {id: string} | null}>(token, IDENTITY)
  if (result.errors?.length || !result.data?.customer) throw new ReviewError(502, 'unavailable')
  const customerId = result.data.customer.id
  const isOwner = customerId === process.env.REVIEW_OWNER_CUSTOMER_ID
  if (owner && !isOwner) throw new ReviewError(403, 'forbidden')
  return { token, customerId, isOwner }
}
export const ORDERS = `query ReviewOrders($after: String) { customer { orders(first: 20, after: $after) { nodes { id number } pageInfo { hasNextPage endCursor } } } }`
export const ORDER = `query ReviewOrder($id: ID!, $after: String) { order(id: $id) { id lineItems(first: 100, after: $after) { nodes { productId quantity } pageInfo { hasNextPage endCursor } } } }`
export async function verifyPurchase(token: string, orderId: string, productId: string) {
  let after: string | null = null
  for (let page = 0; page < 20; page++) {
    type Result = { order: { id: string; lineItems: {nodes: { productId: string | null; quantity: number }[]; pageInfo: { hasNextPage: boolean; endCursor: string | null }} } | null }
    const result: {data: Result; errors?: {message: string}[]} = await queryCustomerAccountApi<Result>(token, ORDER, { id: orderId, after })
    if (result.errors?.length) throw new ReviewError(502, 'unavailable')
    if (!result.data?.order) throw new ReviewError(403, 'purchase_required')
    const lines = result.data.order.lineItems
    if (lines.nodes.some(line => line.productId === productId && line.quantity > 0)) return
    if (!lines.pageInfo.hasNextPage) throw new ReviewError(403, 'purchase_required')
    if (!lines.pageInfo.endCursor || lines.pageInfo.endCursor === after) throw new ReviewError(502, 'unavailable')
    after = lines.pageInfo.endCursor
  }
  throw new ReviewError(502, 'unavailable')
}
export const READ = `query ProductReviews($id: ID!) { product(id: $id) { id status metafield(namespace: "atp_reviews", key: "verified_reviews_v1") { jsonValue compareDigest } } }`
export const WRITE = `mutation SaveProductReviews($metafields: [MetafieldsSetInput!]!) { metafieldsSet(metafields: $metafields) { metafields { id } userErrors { code message } } }`
export async function readReviews(productId: string) {
  const data = await adminQuery<{product: {id: string; status: string; metafield: {jsonValue: unknown; compareDigest: string} | null} | null}>(READ, { id: productId })
  if (!data.product || data.product.status !== 'ACTIVE') throw new ReviewError(404, 'not_found')
  const doc = documentSchema.safeParse(data.product.metafield?.jsonValue ?? { version: 1, reviews: [] })
  if (!doc.success) throw new ReviewError(502, 'unavailable')
  return { document: doc.data, digest: data.product.metafield?.compareDigest ?? null }
}
export async function updateReviews(productId: string, transform: (document: ReviewDocument) => ReviewDocument) {
  for (let attempt = 0; attempt < 3; attempt++) {
    const { document, digest } = await readReviews(productId)
    const next = transform(document); const value = JSON.stringify(next)
    if (Buffer.byteLength(value) > 100000) throw new ReviewError(409, 'capacity_reached')
    const result = await adminQuery<{metafieldsSet: {userErrors: {code: string; message: string}[]}}>(WRITE, {metafields: [{ownerId: productId, namespace, key, type: 'json', value, compareDigest: digest}]})
    const errors = result.metafieldsSet.userErrors
    if (!errors.length) return
    if (!errors.every(error => error.code === 'STALE_OBJECT')) throw new ReviewError(502, 'unavailable')
  }
  throw new ReviewError(409, 'retry')
}
export async function submitReview(request: Request) {
  const account = await identity()
  const parsed = submitSchema.safeParse(await readInput(request))
  if (!parsed.success) throw new ReviewError(400, 'invalid_input')
  const {productId, orderId, author, body, rating} = parsed.data
  await verifyPurchase(account.token, orderId, productId)
  const review = {id: randomUUID(), buyerId: account.customerId, author, body, rating, createdAt: new Date().toISOString(), status: 'published' as const, history: []}
  await updateReviews(productId, document => appendReview(document, review))
}
export async function moderate(request: Request) {
  const account = await identity(true)
  const parsed = moderateSchema.safeParse(await readInput(request))
  if (!parsed.success) throw new ReviewError(400, 'invalid_input')
  const {productId, reviewId, action, reason} = parsed.data
  await updateReviews(productId, document => moderateReview(document, reviewId, action, reason, account.customerId))
}
export function reviewResponse(data: unknown, status = 200) {
  return Response.json(data, { status, headers: {'Cache-Control': 'private, no-store'} })
}
export function reviewFailure(error: unknown) {
  return reviewResponse({error: error instanceof ReviewError ? error.code : 'unavailable'}, error instanceof ReviewError ? error.status : 503)
}
