import { readReviews, requireReviews, reviewResponse, reviewFailure } from '@/lib/reviews/server'
import { productIdSchema, visibleReviews, ReviewError } from '@/lib/reviews/model'
export async function GET(_request: Request, context: {params: Promise<{productId: string}>}) {
 try {
  requireReviews()
  const {productId} = await context.params
  const parsed = productIdSchema.safeParse(productId.startsWith('gid:') ? productId : `gid://shopify/Product/${productId}`)
  if (!parsed.success) throw new ReviewError(400, 'invalid_input')
  const {document} = await readReviews(parsed.data)
  const reviews = visibleReviews(document)
  return reviewResponse({reviews, count: reviews.length, average: reviews.length ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : null})
 } catch (error) { return reviewFailure(error) }
}
