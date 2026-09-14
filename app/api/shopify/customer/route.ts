import { NextResponse } from 'next/server'
// Retired internal/legacy endpoint. Never execute privileged work from the public storefront.
export async function POST() { return NextResponse.json({ error: 'Not found' }, { status: 404 }) }
