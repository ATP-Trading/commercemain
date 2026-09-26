import { submitReview, reviewResponse, reviewFailure } from '@/lib/reviews/server'
export async function POST(request: Request) {
 try { await submitReview(request); return reviewResponse({ok: true}, 201) }
 catch (error) { return reviewFailure(error) }
}
