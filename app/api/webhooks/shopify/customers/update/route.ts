import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import crypto from 'crypto';
import { AtpMembershipService } from '@/lib/services/atp-membership-service';

const WEBHOOK_SECRET = process.env.SHOPIFY_WEBHOOK_SECRET;

function verifyWebhook(body: string, signature: string): boolean {
  if (!WEBHOOK_SECRET) {
    console.error('SHOPIFY_WEBHOOK_SECRET not configured');
    return false;
  }

  const hmac = crypto.createHmac('sha256', WEBHOOK_SECRET);
  hmac.update(body, 'utf8');
  const hash = hmac.digest('base64');

  return Buffer.byteLength(hash) === Buffer.byteLength(signature) && crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(signature));
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get('x-shopify-hmac-sha256');

    if (!signature || !verifyWebhook(body, signature)) {
      console.error('Invalid webhook signature');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const customer = JSON.parse(body);
    
    // Check if membership-related metafields were updated
    const membershipMetafields = customer.metafields?.filter((metafield: any) =>
      metafield.namespace === 'atp' && metafield.key.startsWith('membership_')
    );

    if (!membershipMetafields || membershipMetafields.length === 0) {
      // No membership metafields updated
      return NextResponse.json({ message: 'Customer updated (no membership changes)' });
    }

    console.log(`Processing membership update for customer ${customer.id}`);

    // TODO: Implement syncMembershipFromShopify method in AtpMembershipService
    // const membershipService = new AtpMembershipService();
    // await membershipService.syncMembershipFromShopify(customer.id.toString());
    
    console.log(`✅ Membership update logged for customer ${customer.id} (sync not implemented)`);

    return NextResponse.json({ message: 'Customer membership update processed' });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}