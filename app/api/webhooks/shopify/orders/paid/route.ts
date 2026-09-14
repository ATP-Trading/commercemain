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

    const order = JSON.parse(body);
    
    // Check if this is a membership purchase
    const membershipLineItem = order.line_items?.find((item: any) => 
      item.product_id && item.variant_id && 
      (item.title?.toLowerCase().includes('atp membership') || 
       item.sku?.toLowerCase().includes('atp-membership'))
    );

    if (!membershipLineItem) {
      // Not a membership order, return success
      return NextResponse.json({ message: 'Order processed (not membership)' });
    }

    console.log(`Processing membership purchase for order ${order.id}`);

    // Create or activate membership
    if (order.customer?.id) {
      try {
        const membershipService = AtpMembershipService.getInstance();
        const result = await membershipService.createMembership({
          customerId: order.customer.id.toString(),
          // orderId is tracked externally, subscriptionId can be added later
          subscriptionId: order.subscription_id?.toString(),
        });

        if (result.success) {
          console.log(`✅ Membership created for customer ${order.customer.id}, ID: ${result.data.id}`);
        } else {
          console.error('Failed to create membership:', result.error);
        }
      } catch (error) {
        console.error('Error creating membership:', error);
        // Don't fail the webhook, log for manual review
      }
    }

    return NextResponse.json({ message: 'Membership order processed successfully' });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}