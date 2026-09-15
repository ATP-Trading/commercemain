import { NextRequest, NextResponse } from 'next/server';
import { getOnlineStock } from '@/lib/shopify/stock-server';
export async function GET(request: NextRequest) {
  const value = request.nextUrl.searchParams.get('variantId') ?? '';
  const id = value.replace('gid://shopify/ProductVariant/', '');
  if (!/^\d+$/.test(id)) return NextResponse.json({ error: 'Invalid variant' }, { status: 400 });
  try {
    const stock = await getOnlineStock(`gid://shopify/ProductVariant/${id}`);
    return NextResponse.json({ variantId: value, ...stock, totalAvailable: stock.quantityAvailable }, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return NextResponse.json({ error: 'Stock is temporarily unavailable', totalAvailable: null }, { status: 503 });
  }
}
