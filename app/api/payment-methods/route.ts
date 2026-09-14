import { NextRequest, NextResponse } from 'next/server';
import {
    STORE_PAYMENT_METHODS,
    getPaymentMethodsByLocale,
    mapShopifyPaymentToConfig,
    PaymentMethodConfig
} from '@/lib/shopify/payment-methods-config';
import { getShopPaymentSettings } from '@/lib/shopify/server';

export async function GET(request: NextRequest) {
    try {
        // Get locale from query params
        const { searchParams } = new URL(request.url);
        const locale = searchParams.get('locale') || 'en';

        // Add CORS headers for client-side requests
        const headers = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400', // Cache for 1 hour, serve stale for 1 day
        };

        let paymentMethods: PaymentMethodConfig[] = [];
        let source = 'static';

        try {
            // Fetch dynamic payment settings from Shopify
            // Both storefront languages serve the UAE market.
            const countryCode = 'AE';

            const paymentSettings = await getShopPaymentSettings({
                language: locale,
                country: countryCode
            });

            if (paymentSettings) {
                source = 'shopify_api';
                const { acceptedCardBrands, supportedDigitalWallets } = paymentSettings;

                // Map cards
                const cardMethods = acceptedCardBrands
                    .map(brand => mapShopifyPaymentToConfig(brand, 'card'))
                    .filter((m): m is PaymentMethodConfig => m !== null);

                // Map wallets
                const walletMethods = supportedDigitalWallets
                    .map(wallet => mapShopifyPaymentToConfig(wallet, 'digital_wallet'))
                    .filter((m): m is PaymentMethodConfig => m !== null);

                paymentMethods = [...cardMethods, ...walletMethods];

                // Deduplicate by name
                paymentMethods = paymentMethods.filter((method, index, self) =>
                    index === self.findIndex((m) => m.name === method.name)
                );
            }
        } catch (apiError) {
            console.warn('Failed to fetch from Shopify API, falling back to static config:', apiError);
            // Fallback will happen below if paymentMethods is empty
        }

        // If API returned nothing or failed, use static fallback
        if (paymentMethods.length === 0) {
            source = 'static_fallback';
            paymentMethods = getPaymentMethodsByLocale(locale);
        }

        return NextResponse.json(
            {
                success: true,
                paymentMethods,
                locale,
                source,
                timestamp: new Date().toISOString(),
                count: paymentMethods.length,
            },
            {
                status: 200,
                headers,
            }
        );
    } catch (error) {
        console.error('Error in payment methods API route:', error);

        // Fallback to the same store payment methods
        const fallbackMethods = STORE_PAYMENT_METHODS;

        return NextResponse.json(
            {
                success: false,
                paymentMethods: fallbackMethods,
                error: 'Failed to fetch payment methods from Shopify',
                fallback: true,
                timestamp: new Date().toISOString(),
            },
            {
                status: 200, // Return 200 with fallback data instead of error
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET',
                    'Access-Control-Allow-Headers': 'Content-Type',
                },
            }
        );
    }
}

// Handle preflight requests
export async function OPTIONS(request: NextRequest) {
    return NextResponse.json(
        {},
        {
            status: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
            },
        }
    );
}
