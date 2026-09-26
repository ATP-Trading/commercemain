import { identity, moderate, adminQuery, reviewResponse, reviewFailure } from '@/lib/reviews/server'
import { documentSchema, ReviewError } from '@/lib/reviews/model'
const LIST = `query ReviewAdminProducts($after: String) { products(first: 20, after: $after) { nodes { id title metafield(namespace: "atp_reviews", key: "verified_reviews_v1") { jsonValue } } pageInfo { hasNextPage endCursor } } }`
export async function GET(request: Request) {
 try {
  await identity(true)
  const after = new URL(request.url).searchParams.get('after')
  if (after && after.length > 500) throw new ReviewError(400, 'invalid_input')
  const data = await adminQuery<{products: {nodes: {id: string; title: string; metafield: {jsonValue: unknown} | null}[]; pageInfo: {hasNextPage: boolean; endCursor: string | null}}}>(LIST, {after})
  return reviewResponse({...data.products, nodes: data.products.nodes.map(p => ({id: p.id, title: p.title, reviews: documentSchema.parse(p.metafield?.jsonValue ?? {version: 1, reviews: []}).reviews}))})
 } catch (error) { return reviewFailure(error) }
}
export async function POST(request: Request) {
 try { await moderate(request); return reviewResponse({ok: true}) }
 catch (error) { return reviewFailure(error) }
}
