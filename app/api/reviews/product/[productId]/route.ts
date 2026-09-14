import { NextResponse } from 'next/server'
export async function GET() {
 return NextResponse.json({ error: 'Reviews are currently unavailable' }, { status: 503 })
}
