// Payment method configuration using Shopify-style branded SVGs
// Icons are now rendered as React components with official brand styling

export interface PaymentMethodConfig {
    name: string;
    type: 'card' | 'digital_wallet' | 'local_payment';
    iconKey: string; // Key to look up the icon component
    enabled: boolean;
    region?: 'all' | 'en' | 'ar'; // Optional: restrict to specific locale
}

// Map from Shopify Payment Enum to our Config Name/Icon
const BRAND_MAPPING: Record<string, Partial<PaymentMethodConfig>> = {
    'VISA': { name: 'Visa', iconKey: 'visa', type: 'card' },
    'MASTERCARD': { name: 'Mastercard', iconKey: 'mastercard', type: 'card' },
    'AMERICAN_EXPRESS': { name: 'American Express', iconKey: 'amex', type: 'card' },
    'DINERS_CLUB': { name: 'Diners Club', iconKey: 'diners_club', type: 'card' },
    'DISCOVER': { name: 'Discover', iconKey: 'discover', type: 'card' },
    'JCB': { name: 'JCB', iconKey: 'jcb', type: 'card' },
    'UNIONPAY': { name: 'UnionPay', iconKey: 'unionpay', type: 'card' },
    'MAESTRO': { name: 'Maestro', iconKey: 'maestro', type: 'card' },
    // Wallets
    'APPLE_PAY': { name: 'Apple Pay', iconKey: 'apple_pay', type: 'digital_wallet' },
    'GOOGLE_PAY': { name: 'Google Pay', iconKey: 'google_pay', type: 'digital_wallet' },
    'PAYPAL': { name: 'PayPal', iconKey: 'paypal', type: 'digital_wallet' },
    'SHOPIFY_PAY': { name: 'Shop Pay', iconKey: 'shop_pay', type: 'digital_wallet' },
};

// Store payment methods with Shopify-style branded icons
export const STORE_PAYMENT_METHODS: PaymentMethodConfig[] = [
    // American Express - Blue card
    {
        name: 'American Express',
        type: 'card',
        iconKey: 'amex',
        enabled: true,
        region: 'all',
    },
    // Apple Pay - Clean Apple styling
    {
        name: 'Apple Pay',
        type: 'digital_wallet',
        iconKey: 'apple_pay',
        enabled: true,
        region: 'all',
    },
    // Diners Club (all locales)
    {
        name: 'Diners Club',
        type: 'card',
        iconKey: 'diners_club',
        enabled: true,
        region: 'all',
    },
    // Discover (all locales)
    {
        name: 'Discover',
        type: 'card',
        iconKey: 'discover',
        enabled: true,
        region: 'all',
    },
    // Google Pay (all locales)
    {
        name: 'Google Pay',
        type: 'digital_wallet',
        iconKey: 'google_pay',
        enabled: true,
        region: 'all',
    },
    // JCB (all locales)
    {
        name: 'JCB',
        type: 'card',
        iconKey: 'jcb',
        enabled: true,
        region: 'all',
    },
    // Mastercard - Official brand colors
    {
        name: 'Mastercard',
        type: 'card',
        iconKey: 'mastercard',
        enabled: true,
        region: 'all',
    },
    // Visa - Blue
    {
        name: 'Visa',
        type: 'card',
        iconKey: 'visa',
        enabled: true,
        region: 'all',
    },
    // Tabby - BNPL for MENA region
    {
        name: 'Tabby',
        type: 'local_payment',
        iconKey: 'tabby',
        enabled: true,
        region: 'all',
    },
    // Tamara - BNPL for MENA region
    {
        name: 'Tamara',
        type: 'local_payment',
        iconKey: 'tamara',
        enabled: true,
        region: 'all',
    },

];

// Helper function to get payment methods by locale
export function getPaymentMethodsByLocale(locale: string): PaymentMethodConfig[] {
    return STORE_PAYMENT_METHODS.filter(method => {
        if (!method.region || method.region === 'all') return true;
        return method.region === locale;
    });
}

export function mapShopifyPaymentToConfig(
    brandOrWallet: string,
    type: 'card' | 'digital_wallet'
): PaymentMethodConfig | null {
    const mapping = BRAND_MAPPING[brandOrWallet.toUpperCase()];
    if (!mapping) return null;

    return {
        name: mapping.name!,
        iconKey: mapping.iconKey!,
        type: type,
        enabled: true,
        region: 'all', // Default to all, logic can be refined
        ...mapping
    } as PaymentMethodConfig;
}
