import { NextRequest, NextResponse } from 'next/server'
import { getValidAccessToken, queryCustomerAccountApi } from '@/lib/shopify/customer-account-oauth'
import { ORDERS_QUERY } from '@/lib/shopify/account-queries'
export const dynamic = 'force-dynamic'
export async function GET(request: NextRequest) {
  try {
    const token = await getValidAccessToken()
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const after = request.nextUrl.searchParams.get('after')
    if (after && after.length > 2048) return NextResponse.json({ error: 'Invalid cursor' }, { status: 400 })
    const { data, errors } = await queryCustomerAccountApi<{ customer: { orders: unknown } | null }>(token, ORDERS_QUERY, { after })
    if (errors?.length || !data?.customer) return NextResponse.json({ error: 'Orders unavailable' }, { status: 502 })
    return NextResponse.json(data.customer.orders, { headers: { 'Cache-Control': 'private, no-store' } })
  } catch { return NextResponse.json({ error: 'Orders unavailable' }, { status: 502 }) }
}
