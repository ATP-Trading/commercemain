# ATP Membership System Deployment Guide

This guide covers the complete deployment process for the ATP Group Services Membership system.

## Prerequisites

### Environment Requirements
- Node.js 18+ 
- Next.js 14+
- Shopify Plus store (for advanced features)
- Vercel/Netlify account (recommended for hosting)

### Required Environment Variables

```bash
# Shopify Configuration
SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
SHOPIFY_STOREFRONT_ACCESS_TOKEN=your_storefront_token
SHOPIFY_ADMIN_ACCESS_TOKEN=your_admin_token
SHOPIFY_WEBHOOK_SECRET=your_webhook_secret

# Application Configuration
NEXT_PUBLIC_SITE_URL=https://your-domain.com
NODE_ENV=production

# Optional Configuration
MEMBERSHIP_ANALYTICS_ENABLED=true
MEMBERSHIP_DEBUG_MODE=false
MEMBERSHIP_CACHE_TTL=3600
MEMBERSHIP_NOTIFICATION_EMAIL=admin@your-domain.com
```

## Deployment Steps

### 1. Pre-deployment Validation

Run the deployment validation script:

```bash
npm run deploy:validate
```

This will check:
- ✅ All required environment variables
- ✅ Critical membership components
- ✅ File structure integrity
- ✅ Configuration validity

### 2. Shopify Configuration

#### Set up Customer Metafields

```bash
npm run setup:shopify:metafields
```

This creates the following customer metafields:
- `atp.membership_status` - Membership status (active/expired/cancelled)
- `atp.membership_start_date` - Membership start date
- `atp.membership_expiration_date` - Membership expiration date
- `atp.membership_subscription_id` - Shopify subscription ID
- `atp.membership_total_savings` - Total savings amount
- `atp.membership_services_used` - Number of services used
- `atp.membership_orders_with_free_delivery` - Free delivery orders count
- `atp.membership_payment_status` - Payment status

#### Configure Webhooks

```bash
npm run setup:shopify:webhooks
```

This sets up webhooks for:
- `orders/paid` - Process membership purchases
- `customers/update` - Sync membership data changes
- `orders/cancelled` - Handle membership cancellations
- `orders/refunded` - Process membership refunds

### 3. Application Deployment

#### Deploy to Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Set environment variables
vercel env add SHOPIFY_STORE_DOMAIN
vercel env add SHOPIFY_STOREFRONT_ACCESS_TOKEN
vercel env add SHOPIFY_ADMIN_ACCESS_TOKEN
vercel env add SHOPIFY_WEBHOOK_SECRET
```

#### Deploy to Netlify

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Build and deploy
npm run build
netlify deploy --prod --dir=.next
```

### 4. Post-deployment Verification

#### Test Webhook Endpoints

```bash
# Test order paid webhook
curl -X POST https://your-domain.com/api/webhooks/shopify/orders/paid \
  -H "Content-Type: application/json" \
  -H "X-Shopify-Hmac-Sha256: test" \
  -d '{"test": true}'

# Test customer update webhook
curl -X POST https://your-domain.com/api/webhooks/shopify/customers/update \
  -H "Content-Type: application/json" \
  -H "X-Shopify-Hmac-Sha256: test" \
  -d '{"test": true}'
```

#### Verify Health Monitoring

```bash
# Check system health
curl https://your-domain.com/api/monitoring/membership/health
```

Expected response:
```json
{
  "status": "healthy",
  "metrics": {
    "activeMemberships": 0,
    "newSignups": 0,
    "renewals": 0,
    "cancellations": 0,
    "totalRevenue": 0,
    "averageDiscount": 0,
    "webhookFailures": 0,
    "apiErrors": 0
  },
  "recentAlerts": [],
  "recommendations": []
}
```

### 5. Test Membership Flow

1. **Signup Test**
   - Visit `/atp-membership`
   - Complete signup process
   - Verify membership creation in Shopify

2. **Discount Test**
   - Add eligible services to cart
   - Verify 15% discount application
   - Complete checkout

3. **Free Delivery Test**
   - Add products to cart
   - Verify free delivery for members
   - Complete checkout

4. **Dashboard Test**
   - Visit `/account/membership`
   - Verify membership status display
   - Test renewal functionality

## Monitoring and Maintenance

### Health Monitoring

The system includes built-in health monitoring at:
- `/api/monitoring/membership/health` - System health status
- Admin dashboard - Real-time metrics and alerts

### Key Metrics to Monitor

- **Active Memberships** - Total active subscriptions
- **Signup Rate** - New memberships per day/week
- **Renewal Rate** - Percentage of renewals vs. expirations
- **Cancellation Rate** - Membership cancellations
- **Revenue** - Total membership revenue
- **Webhook Failures** - Failed webhook processing
- **API Errors** - Shopify API integration issues

### Alerting Thresholds

- 🚨 **Critical**: >5 errors per hour
- ⚠️ **Warning**: >3 warnings per hour
- 📊 **Info**: High cancellation rate (>10% of signups)

### Log Monitoring

Monitor these log patterns:
```bash
# Successful membership creation
"✅ Membership created for customer"

# Webhook processing
"Processing membership purchase for order"

# Error patterns
"❌ Membership Alert:"
"Error creating membership:"
"Webhook processing error:"
```

## Troubleshooting

### Common Issues

#### 1. Webhook Failures
**Symptoms**: Orders not creating memberships
**Solution**: 
- Check webhook URL accessibility
- Verify webhook secret configuration
- Review webhook logs in Shopify admin

#### 2. Discount Not Applied
**Symptoms**: Members not receiving 15% discount
**Solution**:
- Verify membership status in customer metafields
- Check cart middleware configuration
- Review discount calculation logic

#### 3. Metafield Access Issues
**Symptoms**: Cannot read/write customer data
**Solution**:
- Verify Shopify Admin API permissions
- Check metafield definitions in Shopify admin
- Confirm access token scopes

### Emergency Procedures

#### Disable Membership System
```bash
# Set environment variable
MEMBERSHIP_SYSTEM_DISABLED=true

# Or use feature flag in admin dashboard
```

#### Rollback Deployment
```bash
# Vercel rollback
vercel rollback

# Manual rollback
git revert <commit-hash>
vercel --prod
```

## Performance Optimization

### Caching Strategy
- Membership status cached for 1 hour
- Discount calculations cached per session
- Shopify API responses cached for 5 minutes

### Rate Limiting
- Shopify API: 40 requests per app per store per second
- Webhook processing: Queued for high volume
- Customer lookups: Batched when possible

## Security Considerations

### Data Protection
- Customer data encrypted in transit and at rest
- Webhook signatures verified for all requests
- Admin access protected with authentication

### Compliance
- GDPR compliant data handling
- UAE data protection regulations
- PCI DSS compliance for payment data

## Support and Maintenance

### Regular Maintenance Tasks
- [ ] Weekly: Review membership metrics and alerts
- [ ] Monthly: Analyze membership performance and trends
- [ ] Quarterly: Update Shopify API versions
- [ ] Annually: Review and update pricing strategy

### Support Contacts
- **Technical Issues**: tech-support@your-domain.com
- **Business Issues**: membership-support@your-domain.com
- **Emergency**: emergency@your-domain.com

---

## Quick Reference

### Useful Commands
```bash
# Validate deployment
npm run deploy:validate

# Setup Shopify configuration
npm run setup:shopify:metafields
npm run setup:shopify:webhooks

# Run tests
npm run test:membership
npm run test:e2e:membership

# Check system health
curl https://your-domain.com/api/monitoring/membership/health

# View logs
vercel logs
```

### Important URLs
- Membership signup: `/atp-membership`
- Member dashboard: `/account/membership`
- Admin dashboard: `/admin/membership`
- Health monitoring: `/api/monitoring/membership/health`
- Webhook endpoints: `/api/webhooks/shopify/*`