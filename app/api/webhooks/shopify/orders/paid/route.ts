import { NextResponse } from 'next/server'
// Retired legacy membership endpoint. Membership is authoritative via Shopify/Appstle and /api/membership/status.
export async function GET() { return NextResponse.json({ error: 'Not found' }, { status: 404 }) }
export async function POST() { return NextResponse.json({ error: 'Not found' }, { status: 404 }) }
