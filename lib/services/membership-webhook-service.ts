import { NextRequest } from 'next/server';
import { MembershipLifecycleService } from './membership-lifecycle-service';
import { AtpMembershipService } from './atp-membership-service';
import crypto from 'crypto';

export interface WebhookPayload {
  id: string;
  topic: string;
  shop_domain: string;
  created_at: string;
  updated_at: string;
  api_version: string;
}

export interface OrderWebhookPayload extends WebhookPayload {
  topic: 'orders/paid' | 'orders/cancelled' | 'orders/refunded';
  line_items: Array<{
    id: number;
    product_id: number;
    variant_id: number;
    title: string;
    quantity: number;
    price: string;
    sku: string;
    properties: Array<{
      name: string;
      value: string;
    }>;
  }>;
  customer: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
  };
  financial_status: 'paid' | 'pending' | 'refunded' | 'voided';
  fulfillment_status: string | null;
  total_price: string;
  subtotal_price: string;
  total_tax: string;
  currency: string;
}

export interface CustomerWebhookPayload extends Omit<WebhookPayload, 'id'> {
  topic: 'customers/update' | 'customers/create';
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  metafields?: Array<{
    id: number;
    namespace: string;
    key: string;
    value: string;
    type: string;
  }>;
}

export class MembershipWebhookService {
  private lifecycleService: MembershipLifecycleService;
  private membershipService: AtpMembershipService;
  private webhookSecret: string;

  constructor() {
    this.lifecycleService = new MembershipLifecycleService();
    this.membershipService = new AtpMembershipService();
    this.webhookSecret = process.env.SHOPIFY_WEBHOOK_SECRET || '';
  }

  /**
   * Verify webhook signature from Shopify
   */
  verifyWebhookSignature(body: string, signature: string): boolean {
    if (!this.webhookSecret) {
      console.warn('Webhook secret not configured');
      return false;
    }

    const hmac = crypto.createHmac('sha256', this.webhookSecret);
    hmac.update(body, 'utf8');
    const calculatedSignature = hmac.digest('base64');

    const received = Buffer.from(signature, 'base64');
    const expected = Buffer.from(calculatedSignature, 'base64');
    return received.length === expected.length && crypto.timingSafeEqual(received, expected);
  }

  /**
   * Handle incoming webhook requests
   */
  async handleWebhook(request: NextRequest): Promise<Response> {
    try {
      const body = await request.text();
      const signature = request.headers.get('x-shopify-hmac-sha256');
      const topic = request.headers.get('x-shopify-topic');

      if (!signature) {
        return new Response('Missing signature', { status: 401 });
      }

      if (!this.verifyWebhookSignature(body, signature)) {
        return new Response('Invalid signature', { status: 401 });
      }

      const payload = JSON.parse(body);

      switch (topic) {
        case 'orders/paid':
          await this.handleOrderPaid(payload as OrderWebhookPayload);
          break;
        case 'orders/cancelled':
          await this.handleOrderCancelled(payload as OrderWebhookPayload);
          break;
        case 'orders/refunded':
          await this.handleOrderRefunded(payload as OrderWebhookPayload);
          break;
        case 'customers/update':
          await this.handleCustomerUpdate(payload as CustomerWebhookPayload);
          break;
        default:
          console.log(`Unhandled webhook topic: ${topic}`);
      }

      return new Response('OK', { status: 200 });
    } catch (error) {
      console.error('Error handling webhook:', error);
      return new Response('Internal Server Error', { status: 500 });
    }
  }

  /**
   * Handle order paid webhook - check if it's a membership purchase or renewal
   */
  private async handleOrderPaid(payload: OrderWebhookPayload): Promise<void> {
    try {
      // Check if this order contains membership items
      const membershipItems = payload.line_items.filter(item => 
        this.isMembershipProduct(item.sku) || 
        this.isMembershipProduct(item.title)
      );

      if (membershipItems.length === 0) {
        return; // Not a membership order
      }

      const customerId = payload.customer.id.toString();

      for (const item of membershipItems) {
        if (this.isRenewalProduct(item)) {
          // Handle membership renewal
          await this.handleMembershipRenewal(customerId, payload);
        } else if (this.isNewMembershipProduct(item)) {
          // Handle new membership purchase
          await this.handleNewMembershipPurchase(customerId, payload);
        }
      }

    } catch (error) {
      console.error('Error handling order paid webhook:', error);
      throw error;
    }
  }

  /**
   * Handle order cancelled webhook
   */
  private async handleOrderCancelled(payload: OrderWebhookPayload): Promise<void> {
    try {
      const membershipItems = payload.line_items.filter(item => 
        this.isMembershipProduct(item.sku) || 
        this.isMembershipProduct(item.title)
      );

      if (membershipItems.length === 0) {
        return;
      }

      const customerId = payload.customer.id.toString();
      
      // If this was a renewal that got cancelled, we might need to handle it
      console.log(`Membership order cancelled for customer ${customerId}`);
      
      // Could implement logic to handle cancelled renewals
    } catch (error) {
      console.error('Error handling order cancelled webhook:', error);
      throw error;
    }
  }

  /**
   * Handle order refunded webhook
   */
  private async handleOrderRefunded(payload: OrderWebhookPayload): Promise<void> {
    try {
      const membershipItems = payload.line_items.filter(item => 
        this.isMembershipProduct(item.sku) || 
        this.isMembershipProduct(item.title)
      );

      if (membershipItems.length === 0) {
        return;
      }

      const customerId = payload.customer.id.toString();
      
      // Handle membership refund - might need to cancel or adjust membership
      console.log(`Membership order refunded for customer ${customerId}`);
      
      // Could implement logic to handle refunded memberships
      // This might involve cancelling the membership or adjusting the expiration date
    } catch (error) {
      console.error('Error handling order refunded webhook:', error);
      throw error;
    }
  }

  /**
   * Handle customer update webhook
   */
  private async handleCustomerUpdate(payload: CustomerWebhookPayload): Promise<void> {
    try {
      // This could be used to sync customer data or handle membership-related updates
      console.log(`Customer updated: ${payload.id}`);
      
      // If the customer update includes membership metafield changes,
      // we might want to trigger lifecycle processes
    } catch (error) {
      console.error('Error handling customer update webhook:', error);
      throw error;
    }
  }

  /**
   * Handle new membership purchase
   */
  private async handleNewMembershipPurchase(
    customerId: string, 
    payload: OrderWebhookPayload
  ): Promise<void> {
    try {
      // Create new membership
      const membershipResult = await this.membershipService.createMembership({ customerId });
      
      if (!membershipResult.success) {
        console.error(`Failed to create membership for customer ${customerId}:`, membershipResult.error);
        return;
      }
      
      // Update payment status to paid
      await this.lifecycleService.handlePaymentStatusUpdate(
        membershipResult.data.id,
        'paid'
      );

      console.log(`New membership created for customer ${customerId}`);
    } catch (error) {
      console.error(`Error creating membership for customer ${customerId}:`, error);
      throw error;
    }
  }

  /**
   * Handle membership renewal
   */
  private async handleMembershipRenewal(
    customerId: string, 
    payload: OrderWebhookPayload
  ): Promise<void> {
    try {
      // Get existing membership
      const membershipResult = await this.membershipService.getMembership(customerId);
      
      if (!membershipResult.success || !membershipResult.data) {
        console.error(`No membership found for customer ${customerId} during renewal`);
        return;
      }

      // Update payment status to paid (this will trigger renewal logic)
      await this.lifecycleService.handlePaymentStatusUpdate(
        membershipResult.data.id,
        'paid'
      );

      console.log(`Membership renewed for customer ${customerId}`);
    } catch (error) {
      console.error(`Error renewing membership for customer ${customerId}:`, error);
      throw error;
    }
  }

  /**
   * Check if a product is a membership product
   */
  private isMembershipProduct(identifier: string): boolean {
    const membershipKeywords = [
      'atp-membership',
      'membership',
      'annual-membership',
      'premium-membership'
    ];

    return membershipKeywords.some(keyword => 
      identifier.toLowerCase().includes(keyword)
    );
  }

  /**
   * Check if a product is a renewal product
   */
  private isRenewalProduct(item: any): boolean {
    const renewalKeywords = ['renewal', 'renew'];
    
    return renewalKeywords.some(keyword => 
      item.title.toLowerCase().includes(keyword) ||
      item.sku.toLowerCase().includes(keyword)
    );
  }

  /**
   * Check if a product is a new membership product
   */
  private isNewMembershipProduct(item: any): boolean {
    return this.isMembershipProduct(item.sku) && !this.isRenewalProduct(item);
  }

  /**
   * Create webhook endpoint handlers for Next.js API routes
   */
  static createWebhookHandler() {
    const webhookService = new MembershipWebhookService();

    return async function handler(request: NextRequest) {
      return await webhookService.handleWebhook(request);
    };
  }
}