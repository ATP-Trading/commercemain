import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getValidAccessToken, queryCustomerAccountApi } from '@/lib/shopify/customer-account-oauth'
import { ADDRESSES_QUERY, ADDRESS_CREATE, ADDRESS_UPDATE } from '@/lib/shopify/account-queries'
export const dynamic = 'force-dynamic'
const optionalText = z.string().trim().max(255).optional()
const schema = z.object({
  addressId: z.string().min(1).max(1024).optional(),
  defaultAddress: z.boolean().optional(),
  address: z.object({ firstName: z.string().trim().min(1).max(100), lastName: optionalText,
    address1: z.string().trim().min(1).max(255), address2: optionalText, company: optionalText,
    city: z.string().trim().min(1).max(100), territoryCode: z.string().regex(/^[A-Z]{2}$/),
    zoneCode: optionalText, zip: optionalText,
    phoneNumber: z.string().trim().min(1).max(30).regex(/^\+[1-9]\d{6,14}$/),
  }).strict(),
}).strict()
export async function GET(request: NextRequest) {
  try {
    const token = await getValidAccessToken()
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const after = request.nextUrl.searchParams.get('after')
    if (after && after.length > 2048) return NextResponse.json({ error: 'Invalid cursor' }, { status: 400 })
    const { data, errors } = await queryCustomerAccountApi<{ customer: { defaultAddress: { id: string } | null; addresses: object } | null }>(token, ADDRESSES_QUERY, { after })
    if (errors?.length || !data?.customer) return NextResponse.json({ error: 'Addresses unavailable' }, { status: 502 })
    return NextResponse.json({ ...data.customer.addresses, defaultId: data.customer.defaultAddress?.id }, { headers: { 'Cache-Control': 'private, no-store' } })
  } catch { return NextResponse.json({ error: 'Addresses unavailable' }, { status: 502 }) }
}
export async function POST(request: NextRequest) {
  try {
    const token = await getValidAccessToken()
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const input = schema.parse(await request.json())
    // Customer Account API authorizes address ownership using the session, never an admin token or caller-supplied customer ID.
    const operation = input.addressId ? 'customerAddressUpdate' : 'customerAddressCreate'
    const { data, errors } = await queryCustomerAccountApi<Record<string, { customerAddress: { id: string } | null; userErrors: { field: string[]; message: string }[] }>>(token, input.addressId ? ADDRESS_UPDATE : ADDRESS_CREATE, input)
    const result = data?.[operation]
    if (errors?.length || result?.userErrors?.length) return NextResponse.json({ error: 'Address rejected', fields: result?.userErrors?.map(e => e.field) }, { status: 400 })
    if (!result?.customerAddress) return NextResponse.json({ error: 'Save not confirmed' }, { status: 502 })
    return NextResponse.json({ success: true, address: result.customerAddress }, { headers: { 'Cache-Control': 'private, no-store' } })
  } catch (error) { return NextResponse.json({ error: 'Could not save address' }, { status: error instanceof z.ZodError || error instanceof SyntaxError ? 400 : 502 }) }
}
