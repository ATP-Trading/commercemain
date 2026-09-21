# Complete Deployment Guide: Next.js + Shopify Headless Storefront

A comprehensive guide to deploying your ATP Group Services e-commerce website with Shopify headless integration.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Pre-Deployment Checklist](#pre-deployment-checklist)
3. [Shopify Store Configuration](#shopify-store-configuration)
4. [Environment Variables Setup](#environment-variables-setup)
5. [Local Development](#local-development)
6. [Vercel Deployment](#vercel-deployment)
7. [Post-Deployment Configuration](#post-deployment-configuration)
8. [Testing & Verification](#testing--verification)
9. [Troubleshooting](#troubleshooting)
10. [Performance Optimization](#performance-optimization)
11. [Security Best Practices](#security-best-practices)

---

## Architecture Overview

### Tech Stack
- **Frontend**: Next.js 16+ (App Router) + TypeScript
- **Styling**: Tailwind CSS 4 + Radix UI + Framer Motion
- **Backend**: Next.js API Routes + Server Actions
- **E-commerce**: Shopify Headless (Storefront API + Customer Account API)
- **Payments**: Shopify Payments + Tabby + Tamara
- **Hosting**: Vercel (recommended) or self-hosted
- **CDN**: Shopify CDN for images
- **Internationalization**: next-intl (English/Arabic)

### Key Components

```
┌─────────────────────────────────────────────────────────────┐
│                    NEXT.JS APPLICATION                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Products    │  │    Cart      │  │  Checkout    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Membership  │  │   Customer   │  │   Search     │      │
│  │   System     │  │   Accounts   │  │              │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ Storefront API (GraphQL)
                         │ Customer Account API
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                      SHOPIFY BACKEND                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Products   │  │  Inventory   │  │   Orders     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Customers   │  │  Metafields  │  │  Webhooks    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

---

## Pre-Deployment Checklist

### ✅ Required Accounts & Access

- [ ] Shopify store (Basic plan minimum, Shopify Plus recommended for advanced features)
- [ ] Vercel account (or alternative hosting)
- [ ] Git repository access
- [ ] Domain name (configured in Shopify and Vercel)

### ✅ Technical Requirements

- [ ] Node.js 18+ installed locally
- [ ] npm/pnpm/yarn package manager
- [ ] Git CLI
- [ ] Vercel CLI (optional, for advanced deployments)

### ✅ Project Setup Verification

```bash
# Clone and setup the repository
git clone <your-repo-url>
cd commercemain
npm install

# Verify project structure
npm run build
```

### ✅ Shopify Store Prerequisites

- [ ] Products created and published
- [ ] Collections configured
- [ ] Payment providers activated (Shopify Payments, Tabby, Tamara)
- [ ] Shipping rates configured
- [ ] Taxes configured
- [ ] Legal pages created (Privacy Policy, Terms, Refund Policy)

---

## Shopify Store Configuration

### Step 1: Install Headless Channel

1. Go to your **Shopify Admin**
2. Navigate to **Settings** → **Apps and sales channels**
3. Click **Shopify App Store**
4. Search for "**Headless**" channel
5. Click **Add channel**
6. Create a new storefront (or use existing)

### Step 2: Get Storefront API Credentials

1. In Shopify Admin, go to **Settings** → **Apps and sales channels**
2. Click on **Headless** channel
3. Select your storefront
4. Click **Manage** under Storefront API

**Copy these values:**
- **Storefront ID**
- **Public access token** (for client-side)
- **Private access token** (for server-side - keep secret!)
- **API version** (use latest: `2026-01`)

### Step 3: Configure API Permissions

From the Headless channel settings, enable these permissions:

**Storefront API Access Scopes:**
- ✅ Read products, variants, and collections
- ✅ Read and modify cart
- ✅ Read and modify customer addresses
- ✅ Read and modify customer details
- ✅ Read and modify checkouts
- ✅ Read content (pages, blogs, articles)
- ✅ Read metaobjects and metafields
- ✅ Read inventory
- ✅ Read selling plans
- ✅ Read translations

### Step 4: Configure Customer Account API (Optional)

For customer login and account management:

1. In Shopify Admin, go to **Settings** → **Customer accounts**
2. Enable **Customer accounts** (choose "Customer accounts" option)
3. Go to Headless channel → **Customer Account API settings**
4. Copy:
   - **Client ID**
   - **Client Secret** (if confidential client)

**Application Setup:**
- **Callback URI**: `https://yourdomain.com/account/authorize`
- **JavaScript Origins**: `https://yourdomain.com`
- **Logout URI**: `https://yourdomain.com`

### Step 5: Configure Webhooks (Production)

**Critical webhooks for headless storefront:**

| Webhook Topic | Endpoint URL | Purpose |
|--------------|--------------|---------|
| `orders/paid` | `/api/webhooks/shopify/orders/paid` | Process completed orders |
| `orders/cancelled` | `/api/webhooks/shopify/orders/cancelled` | Handle cancellations |
| `orders/refunded` | `/api/webhooks/shopify/orders/refunded` | Process refunds |
| `customers/update` | `/api/webhooks/shopify/customers/update` | Sync customer data |
| `products/update` | `/api/webhooks/shopify/products/update` | Cache invalidation |
| `app/uninstalled` | `/api/webhooks/shopify/app/uninstalled` | App cleanup |

**Setup steps:**
1. In Shopify Admin, go to **Settings** → **Notifications** → **Webhooks**
2. Click **Create webhook**
3. Select event topic
4. Enter your endpoint URL (full HTTPS URL)
5. Set format to **JSON**
6. Save webhook

### Step 6: Set Up Metafields for Membership System

If using the ATP Membership system, create these customer metafields:

```bash
npm run setup:shopify:metafields
```

**Required metafields:**
- `atp.membership_status` (single_line_text_field)
- `atp.membership_start_date` (date)
- `atp.membership_expiration_date` (date)
- `atp.membership_subscription_id` (single_line_text_field)
- `atp.membership_total_savings` (number_decimal)
- `atp.membership_services_used` (number_integer)
- `atp.membership_orders_with_free_delivery` (number_integer)
- `atp.membership_payment_status` (single_line_text_field)

---

## Environment Variables Setup

### Required Environment Variables

Create a `.env.local` file in the project root:

```bash
# ============================================
# SHOPIFY CONFIGURATION (Required)
# ============================================
# Your Shopify store domain (e.g., your-store.myshopify.com)
SHOPIFY_STORE_DOMAIN=your-store.myshopify.com

# Storefront API access token (Public token from Headless channel)
SHOPIFY_STOREFRONT_ACCESS_TOKEN=your_storefront_public_token

# Storefront API version (use latest)
SHOPIFY_API_VERSION=2026-01

# ============================================
# CUSTOMER ACCOUNT API (Optional but Recommended)
# ============================================
# Customer Account API access token
SHOPIFY_CUSTOMER_ACCOUNT_ACCESS_TOKEN=your_customer_account_token

# ============================================
# WEBHOOK SECURITY (Required for Production)
# ============================================
# Secret for validating webhook signatures
SHOPIFY_REVALIDATION_SECRET=your_random_secure_string

# ============================================
# SITE CONFIGURATION
# ============================================
# Production site URL
NEXT_PUBLIC_SITE_URL=https://yourdomain.com

# For Vercel deployments (auto-set by Vercel)
VERCEL_PROJECT_PRODUCTION_URL=yourdomain.com

# ============================================
# ANALYTICS (Optional)
# ============================================
GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
SHOPIFY_ANALYTICS_ENABLED=true

# ============================================
# FEATURE FLAGS
# ============================================
ENABLE_CUSTOMER_ACCOUNTS=true
ENABLE_SUBSCRIPTIONS=true
ENABLE_PREDICTIVE_SEARCH=true
ENABLE_ADVANCED_FILTERS=true

# ============================================
# CACHE CONFIGURATION
# ============================================
CACHE_PRODUCTS=true
CACHE_COLLECTIONS=true
CACHE_CART=true

# ============================================
# MEMBERSHIP SYSTEM (If applicable)
# ============================================
NEXT_PUBLIC_MEMBERSHIP_VARIANT_ID=your_membership_variant_id
NEXT_PUBLIC_MEMBERSHIP_PRODUCT_HANDLE=atp-membership-annual
NEXT_PUBLIC_USE_DIRECT_MEMBERSHIP_CHECKOUT=false

# ============================================
# PAYMENT PROVIDERS (Region-specific)
# ============================================
# Tabiy (Buy Now Pay Later - UAE/SA)
NEXT_PUBLIC_TABBY_PUBLIC_KEY=your_tabby_public_key

# Tamara (Buy Now Pay Later - UAE/SA/KW)
NEXT_PUBLIC_TAMARA_PUBLIC_KEY=your_tamara_public_key
```

### Environment Variable Security

**NEVER commit these to Git:**
- `SHOPIFY_STOREFRONT_ACCESS_TOKEN`
- `SHOPIFY_CUSTOMER_ACCOUNT_ACCESS_TOKEN`
- `SHOPIFY_REVALIDATION_SECRET`
- Any private API keys

**✅ DO:**
- Use `.env.local` for local development
- Set environment variables in Vercel dashboard for production
- Use Vercel CLI for secure env var management

**❌ DON'T:**
- Hardcode tokens in code
- Share tokens in public repositories
- Use private tokens on client-side

---

## Local Development

### Step 1: Install Dependencies

```bash
# Using npm
npm install

# Or using pnpm (faster)
pnpm install
```

### Step 2: Configure Local Environment

```bash
# Copy example environment file
cp env.example .env.local

# Edit .env.local with your credentials
nano .env.local
```

### Step 3: Start Development Server

```bash
# Start with Turbopack (fastest)
npm run dev

# Or without Turbopack
next dev
```

**Access the site:**
- Main site: `http://localhost:3000`
- English: `http://localhost:3000/en`
- Arabic: `http://localhost:3000/ar`

### Step 4: Test Shopify Connection

```bash
# Run validation script
npm run deploy:validate
```

This checks:
- ✅ Environment variables
- ✅ Shopify API connectivity
- ✅ File structure
- ✅ Configuration validity

### Step 5: Run Tests

```bash
# Run all tests
npm run test:run

# Run unit tests only
npm run test:unit

# Run component tests
npm run test:components

# Run E2E tests
npm run test:e2e
```

---

## Vercel Deployment

### Option 1: Deploy via Vercel Dashboard (Easiest)

1. Push your code to GitHub/GitLab/Bitbucket
2. Go to [vercel.com](https://vercel.com)
3. Click **Add New Project**
4. Import your repository
5. Configure project:
   - **Framework Preset**: Next.js
   - **Build Command**: `next build`
   - **Output Directory**: `.next`
6. Add environment variables (copy from `.env.local`)
7. Click **Deploy**

### Option 2: Deploy via Vercel CLI

```bash
# Install Vercel CLI globally
npm i -g vercel

# Login to Vercel
vercel login

# Deploy to preview environment
vercel

# Deploy to production
vercel --prod
```

### Option 3: Deploy via Git Integration (Recommended)

1. Connect your Git repository to Vercel
2. Enable **Git Integration**:
   - Go to Project Settings → Git
   - Connect to GitHub/GitLab
3. Configure **Deploy Hooks**:
   - Production branch: `main`
   - Preview branches: `develop`, `feature/*`
4. Set **Environment Variables**:
   - Go to Project Settings → Environment Variables
   - Add all variables from `.env.local`
5. Enable **Auto-Deploy**:
   - Pushes to `main` → Production
   - Pull requests → Preview deployments

### Environment Variables in Vercel

**Add via Dashboard:**
1. Go to Project → Settings → Environment Variables
2. Add each variable individually
3. Or bulk import from `.env` file

**Add via CLI:**
```bash
# Add individual variables
vercel env add SHOPIFY_STORE_DOMAIN production
vercel env add SHOPIFY_STOREFRONT_ACCESS_TOKEN production

# Or add from local file
vercel env pull
```

### Vercel Configuration (vercel.json)

If needed, create `vercel.json` in project root:

```json
{
  "buildCommand": "next build",
  "devCommand": "next dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["fra1"],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        }
      ]
    }
  ]
}
```

---

## Post-Deployment Configuration

### Step 1: Configure Custom Domain

1. In Vercel Dashboard:
   - Go to Project → Domains
   - Click **Add**
   - Enter your domain (e.g., `yourdomain.com`)
   - Follow DNS configuration instructions

2. Configure DNS (at your domain registrar):
   ```
   Type    Name    Value
   A       @       76.76.21.21
   CNAME   www     cname.vercel-dns.com
   ```

3. In Shopify Admin:
   - Go to **Settings** → **Domains**
   - Connect your custom domain
   - Set as primary domain

### Step 2: Configure Shopify Webhooks (Production URLs)

Update webhook URLs to use production domain:

```bash
# Run webhook setup script
npm run setup:shopify:webhooks
```

**Or manually update in Shopify Admin:**
1. Settings → Notifications → Webhooks
2. Edit each webhook to use `https://yourdomain.com/api/webhooks/shopify/*`

### Step 3: Enable SSL/HTTPS

- Vercel provides automatic SSL
- Verify HTTPS works: `https://yourdomain.com`
- Test all assets load over HTTPS

### Step 4: Configure Image CDN

Your `next.config.ts` already includes Shopify CDN configuration:

```typescript
images: {
  remotePatterns: [
    {
      protocol: "https",
      hostname: "cdn.shopify.com",
      pathname: "/s/files/**",
    },
  ],
}
```

### Step 5: Test Checkout Flow

1. Add products to cart
2. Go to checkout
3. Complete test purchase (use Shopify test mode)
4. Verify order appears in Shopify admin
5. Verify webhooks fire correctly

### Step 6: Configure Analytics

**Google Analytics:**
1. Create GA4 property
2. Copy Measurement ID (G-XXXXXXXXXX)
3. Add to environment variables: `GOOGLE_ANALYTICS_ID`

**Shopify Analytics:**
- Enable in environment: `SHOPIFY_ANALYTICS_ENABLED=true`
- Verify Shopify Pixel tracking

---

## Testing & Verification

### Pre-Launch Testing Checklist

#### Core E-commerce Flows
- [ ] Homepage loads correctly
- [ ] Product listing pages display
- [ ] Product detail pages work
- [ ] Add to cart functionality
- [ ] Cart updates (quantity, remove)
- [ ] Checkout process completes
- [ ] Payment processing (test mode)
- [ ] Order confirmation emails
- [ ] Inventory updates correctly

#### Customer Account Features
- [ ] Registration works
- [ ] Login/logout works
- [ ] Password reset works
- [ ] Order history displays
- [ ] Address management works
- [ ] Account profile updates

#### Membership System (If applicable)
- [ ] Membership signup
- [ ] Discount application (15% off)
- [ ] Free delivery for members
- [ ] Membership dashboard
- [ ] Renewal process

#### Internationalization
- [ ] English version works
- [ ] Arabic version works
- [ ] RTL layout correct
- [ ] Currency display correct (AED)
- [ ] Language switching works

#### Performance & SEO
- [ ] Page load times < 3s
- [ ] Mobile responsiveness
- [ ] SEO meta tags present
- [ ] Structured data valid
- [ ] Sitemap.xml accessible
- [ ] robots.txt correct

### Automated Testing

```bash
# Run comprehensive test suite
npm run test:all

# Run specific test suites
npm run test:unit
npm run test:components
npm run test:e2e
npm run test:accessibility
npm run test:performance
```

### Manual Testing Commands

```bash
# Test health monitoring endpoint
curl https://yourdomain.com/api/monitoring/membership/health

# Test webhook endpoints
curl -X POST https://yourdomain.com/api/webhooks/shopify/orders/paid \
  -H "Content-Type: application/json" \
  -H "X-Shopify-Topic: orders/paid" \
  -d '{"test": true}'

# Test Shopify API connectivity
curl -X POST https://yourdomain.com/api/shopify/test
```

---

## Troubleshooting

### Common Issues & Solutions

#### 1. "Invalid URL" Error

**Symptoms:**
```
Error: Invalid URL
    at new NodeError (node:internal/errors:...)
```

**Causes:**
- Missing `SHOPIFY_STORE_DOMAIN`
- Incorrect domain format
- Missing `https://` protocol

**Solutions:**
```bash
# Check environment variables
vercel env ls

# Fix domain format (should be: your-store.myshopify.com)
vercel env add SHOPIFY_STORE_DOMAIN your-store.myshopify.com

# Redeploy
vercel --prod
```

#### 2. "Unauthorized" or 401 Errors

**Symptoms:**
- API returns 401 Unauthorized
- Products not loading
- Cart operations fail

**Causes:**
- Invalid Storefront access token
- Missing API permissions
- Token expired

**Solutions:**
1. Verify token in Shopify Admin
2. Regenerate token if needed
3. Update environment variable
4. Check API permissions in Headless channel

#### 3. Webhooks Not Firing

**Symptoms:**
- Orders not creating memberships
- Inventory not syncing
- No webhook logs

**Solutions:**
```bash
# Check webhook endpoint accessibility
curl -I https://yourdomain.com/api/webhooks/shopify/orders/paid

# Verify webhook secret
vercel env add SHOPIFY_REVALIDATION_SECRET your_secret

# Check Shopify webhook logs
# Shopify Admin → Settings → Notifications → Webhooks → View logs
```

#### 4. Images Not Loading

**Symptoms:**
- Product images 404
- Placeholder images showing

**Solutions:**
1. Verify `next.config.ts` image domains:
```typescript
remotePatterns: [
  {
    protocol: "https",
    hostname: "cdn.shopify.com",
    pathname: "/s/files/**",
  },
]
```

2. Check product images in Shopify admin
3. Verify products are published to Headless channel

#### 5. Build Failures

**Symptoms:**
```
Build failed
TypeScript errors
Module not found
```

**Solutions:**
```bash
# Clear cache
rm -rf .next node_modules
npm install

# Fix TypeScript errors
npm run lint

# Build locally to catch errors
npm run build
```

#### 6. Environment Variables Not Loading

**Symptoms:**
- Variables work locally but not in production
- `undefined` values in production

**Solutions:**
1. Check Vercel environment variables:
   - Project → Settings → Environment Variables
2. Ensure correct environment (Production/Preview/Development)
3. Redeploy after adding variables

#### 7. Customer Account API Issues

**Symptoms:**
- Login not working
- Account pages 404
- OAuth errors

**Solutions:**
1. Verify Customer Account API is enabled:
   - Shopify Admin → Settings → Customer accounts
2. Check callback URLs match deployment URL
3. Verify Client ID is correct
4. Check OAuth scopes

---

## Performance Optimization

### Next.js Optimization

```typescript
// next.config.ts - Already configured
{
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-accordion',
      'framer-motion',
    ],
  },
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60,
  },
}
```

### Shopify API Optimization

1. **Use Caching:**
```typescript
// lib/shopify/index.ts
export const revalidate = 3600; // 1 hour
```

2. **Batch Requests:**
- Use GraphQL fragments
- Batch product queries
- Use `stale-while-revalidate` pattern

3. **Image Optimization:**
- Shopify serves images via CDN
- Use Next.js Image component
- Enable WebP/AVIF formats

### Vercel Performance Settings

1. **Edge Network:**
   - Vercel automatically uses edge caching
   - Configure regions for your audience

2. **Analytics:**
   - Enable Vercel Analytics
   - Monitor Core Web Vitals

3. **Speed Insights:**
   - Install `@vercel/speed-insights`
   - Monitor real-user performance

---

## Security Best Practices

### 1. Environment Variable Security

```bash
# NEVER commit .env.local
echo ".env.local" >> .gitignore

# Use Vercel for production secrets
vercel env add SHOPIFY_STOREFRONT_ACCESS_TOKEN production
```

### 2. Webhook Validation

```typescript
// Always validate webhook signatures
import crypto from 'crypto';

function validateWebhookSignature(payload: string, signature: string, secret: string): boolean {
  const hash = crypto
    .createHmac('sha256', secret)
    .update(payload, 'utf8')
    .digest('base64');
  
  return signature === hash;
}
```

### 3. Content Security Policy

Already configured in `next.config.ts`:
```typescript
headers: [
  {
    source: "/(.*)",
    headers: [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "X-Frame-Options", value: "DENY" },
      { key: "X-XSS-Protection", value: "1; mode=block" },
    ],
  },
]
```

### 4. Rate Limiting

Shopify API limits:
- **Storefront API**: 40 requests/second per IP (public) or per token (private)
- **Customer Account API**: 10 requests/second per customer
- **Admin API**: Variable based on plan

### 5. Regular Security Tasks

- [ ] Rotate API tokens quarterly
- [ ] Review webhook logs weekly
- [ ] Update dependencies monthly
- [ ] Monitor for security advisories
- [ ] Enable 2FA on all accounts

---

## Quick Reference Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run start            # Start production server

# Testing
npm run test             # Run tests
npm run test:e2e         # Run E2E tests
npm run test:coverage    # Run with coverage

# Shopify
npm run setup:shopify:metafields   # Setup metafields
npm run setup:shopify:webhooks     # Setup webhooks
npm run sync:shopify-data          # Sync data

# Deployment
npm run deploy:validate  # Validate deployment
vercel                   # Deploy to preview
vercel --prod            # Deploy to production

# Monitoring
npm run health:check     # Check system health
vercel logs              # View logs
```

---

## Support & Resources

### Official Documentation
- [Shopify Storefront API](https://shopify.dev/docs/api/storefront)
- [Shopify Customer Account API](https://shopify.dev/docs/api/customer)
- [Next.js Documentation](https://nextjs.org/docs)
- [Vercel Documentation](https://vercel.com/docs)

### Community
- [Shopify Community Forums](https://community.shopify.com/)
- [Next.js Discord](https://nextjs.org/discord)
- [Vercel Discord](https://vercel.com/discord)

### Emergency Contacts
- **Shopify Support**: help.shopify.com
- **Vercel Support**: vercel.com/support
- **Project Issues**: Create GitHub issue

---

## Summary Checklist

### Pre-Deployment
- [ ] Environment variables configured
- [ ] Shopify Headless channel installed
- [ ] API tokens generated
- [ ] Webhooks configured
- [ ] Metafields set up
- [ ] Domain configured

### Deployment
- [ ] Build passes locally
- [ ] Deployed to Vercel
- [ ] Environment variables added
- [ ] Custom domain connected
- [ ] SSL enabled

### Post-Deployment
- [ ] Webhooks updated to production URLs
- [ ] Analytics configured
- [ ] Testing completed
- [ ] Monitoring enabled
- [ ] Documentation updated

**🎉 Congratulations! Your headless Shopify storefront is now live!**

---

*Last Updated: January 2026*
*For ATP Group Services E-commerce Platform*
