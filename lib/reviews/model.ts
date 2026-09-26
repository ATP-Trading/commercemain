import { z } from 'zod'

export const productIdSchema = z.string().regex(/^gid:\/\/shopify\/Product\/\d+$/)
export const submitSchema = z.object({
  productId: productIdSchema,
  orderId: z.string().regex(/^gid:\/\/shopify\/Order\/[\w?=&%-]+$/).max(300),
  author: z.string().trim().min(1).max(60),
  rating: z.number().int().min(1).max(5),
  body: z.string().trim().min(3).max(1500),
}).strict()
export const moderateSchema = z.object({
  productId: productIdSchema, reviewId: z.string().uuid(),
  action: z.enum(['hide', 'restore']), reason: z.string().trim().min(3).max(300),
}).strict()
const reviewSchema = z.object({
  id: z.string().uuid(), buyerId: z.string(), author: z.string(), rating: z.number().int().min(1).max(5),
  body: z.string(), createdAt: z.string(), status: z.enum(['published', 'hidden']),
  history: z.array(z.object({ actor: z.string(), action: z.enum(['hide', 'restore']), reason: z.string(), at: z.string() })),
})
export const documentSchema = z.object({ version: z.literal(1), reviews: z.array(reviewSchema).max(200) })
export type ReviewDocument = z.infer<typeof documentSchema>
export type Review = z.infer<typeof reviewSchema>
export class ReviewError extends Error {
  constructor(public status: number, public code: string) { super(code) }
}
export function visibleReviews(document: ReviewDocument) {
  return document.reviews.filter(r => r.status === 'published').map(({ id, author, rating, body, createdAt }) => ({ id, author, rating, body, createdAt, verifiedPurchase: true }))
}
export function appendReview(document: ReviewDocument, review: Review): ReviewDocument {
  if (document.reviews.some(r => r.buyerId === review.buyerId)) throw new ReviewError(409, 'already_reviewed')
  if (document.reviews.length >= 200) throw new ReviewError(409, 'capacity_reached')
  return { version: 1, reviews: [review, ...document.reviews] }
}
export function moderateReview(document: ReviewDocument, id: string, action: 'hide' | 'restore', reason: string, actor: string): ReviewDocument {
  if (!document.reviews.some(r => r.id === id)) throw new ReviewError(404, 'not_found')
  return { version: 1, reviews: document.reviews.map(r => r.id !== id ? r : {
    ...r, status: action === 'hide' ? 'hidden' : 'published',
    history: [...r.history, { actor, action, reason, at: new Date().toISOString() }],
  }) }
}
