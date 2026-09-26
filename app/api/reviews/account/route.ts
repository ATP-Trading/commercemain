import { identity, ORDERS, reviewResponse, reviewFailure } from '@/lib/reviews/server'
import { queryCustomerAccountApi } from '@/lib/shopify/customer-account-oauth'
import { ReviewError } from '@/lib/reviews/model'
export async function GET(request: Request) {
 try {
  const account = await identity()
  const after = new URL(request.url).searchParams.get('after')
  if (after && after.length > 500) throw new ReviewError(400, 'invalid_input')
  const result = await queryCustomerAccountApi<{customer: {orders: {nodes: {id: string; number: number}[]; pageInfo: {hasNextPage: boolean; endCursor: string | null}}}}>(account.token, ORDERS, {after})
  if (result.errors?.length || !result.data?.customer) throw new ReviewError(502, 'unavailable')
  return reviewResponse({isOwner: account.isOwner, ...result.data.customer.orders})
 } catch (error) { return reviewFailure(error) }
}
