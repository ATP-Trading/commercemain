'use client'
import { OPTIONAL_TRACKING_ENABLED } from './tracking-policy'

// Shopify Analytics Integration based on latest documentation
declare global {
    interface Window {
        analytics: any
        _gaUTracker: any
        fbq: any
        ShopifyAnalytics: any
    }
}

interface AnalyticsConfig {
    shopifyAnalytics?: {
        enabled: boolean
        appName: string
    }
    googleAnalytics?: {
        enabled: boolean
        trackingId: string
    }
    facebookPixel?: {
        enabled: boolean
        pixelId: string
    }
}

interface TrackingEvent {
    event: string
    properties?: Record<string, any>
    userId?: string
    anonymousId?: string
}

class ShopifyAnalyticsManager {
    private config: AnalyticsConfig
    private initialized = false

    constructor(config: AnalyticsConfig) {
        this.config = config
    }

    // Initialize all analytics services
    async initialize() {
        if (!OPTIONAL_TRACKING_ENABLED || this.initialized) return

        try {
            // Initialize Shopify Trekkie Analytics
            if (this.config.shopifyAnalytics?.enabled) {
                await this.initializeShopifyAnalytics()
            }

            // Initialize Google Analytics
            if (this.config.googleAnalytics?.enabled) {
                await this.initializeGoogleAnalytics()
            }

            // Initialize Facebook Pixel
            if (this.config.facebookPixel?.enabled) {
                await this.initializeFacebookPixel()
            }

            this.initialized = true
            console.log('✅ Analytics initialized successfully')
        } catch (error) {
            console.error('❌ Analytics initialization failed:', error)
        }
    }

    // Initialize Shopify Trekkie Analytics
    private async initializeShopifyAnalytics() {
        const config = {
            'Trekkie': {
                'appName': this.config.shopifyAnalytics?.appName || 'storefront'
            },
            'Session Attribution': {},
            'CrossDomainTracking': {}
        }

        const trekkie_version = '2021.05.04'
        const analytics = window.analytics = window.analytics || []

        if (analytics.integrations) {
            return
        }

        analytics.methods = [
            'identify',
            'page',
            'ready',
            'track',
        ]

        analytics.factory = function (method: string) {
            return function () {
                const args = Array.prototype.slice.call(arguments)
                args.unshift(method)
                analytics.push(args)
                return analytics
            }
        }

        for (let i = 0; i < analytics.methods.length; i++) {
            const key = analytics.methods[i]
            analytics[key] = analytics.factory(key)
        }

        analytics.load = function (config: any) {
            analytics.config = config
            const script = document.createElement('script')
            script.type = 'text/javascript'
            script.async = true
            script.src = `https://cdn.shopify.com/s/javascripts/tricorder/trekkie.${config.Trekkie.appName}.min.js?v=${trekkie_version}`
            const first = document.getElementsByTagName('script')[0]
            if (first?.parentNode) {
                first.parentNode.insertBefore(script, first)
            }
        }

        analytics.load(config)
        analytics.page()
    }

    // Initialize Google Analytics
    private async initializeGoogleAnalytics() {
        const trackingId = this.config.googleAnalytics?.trackingId

        if (!trackingId) return

        // Load Google Analytics script
        const script = document.createElement('script')
        script.async = true
        script.src = 'https://www.google-analytics.com/analytics.js'
        document.head.appendChild(script)

        // Initialize tracker
        window._gaUTracker = window._gaUTracker || function () {
            (window._gaUTracker.q = window._gaUTracker.q || []).push(arguments)
        }

        const _gaUTrackerOptions: any = {}

        // Wait for analytics to be ready
        if (window.analytics && window.analytics.ready) {
            window.analytics.ready(() => {
                if (window.analytics.user && window.analytics.user().traits) {
                    _gaUTrackerOptions.clientId = window.analytics.user().traits().uniqToken
                }

                window._gaUTracker('create', trackingId, _gaUTrackerOptions)
                window._gaUTracker('set', 'transport', 'beacon')
                window._gaUTracker('require', 'displayfeatures')
                window._gaUTracker('send', 'pageview')
            })
        } else {
            // Fallback initialization
            window._gaUTracker('create', trackingId, _gaUTrackerOptions)
            window._gaUTracker('send', 'pageview')
        }
    }

    // Initialize Facebook Pixel
    private async initializeFacebookPixel() {
        const pixelId = this.config.facebookPixel?.pixelId

        if (!pixelId) return

        // Facebook Pixel initialization
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        (function (f: any, b: any, e: any, v: any, n?: any, t?: any, s?: any) {
            if (f.fbq) return
            n = f.fbq = function () {
                n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments)
            }
            if (!f._fbq) f._fbq = n
            n.push = n
            n.loaded = !0
            n.version = '2.0'
            n.queue = []
            t = b.createElement(e)
            t.async = !0
            t.src = v
            s = b.getElementsByTagName(e)[0]
            s.parentNode.insertBefore(t, s)
        })(
            window,
            document,
            'script',
            '//connect.facebook.net/en_US/fbevents.js'
        )

        window.fbq('dataProcessingOptions', ['LDU'], 0, 0)
        window.fbq('init', pixelId)
        window.fbq('track', 'PageView')
    }

    // Track custom events
    track(event: TrackingEvent) {
        if (!OPTIONAL_TRACKING_ENABLED) return
        if (!this.initialized) {
            console.warn('Analytics not initialized')
            return
        }

        try {
            // Track with Shopify Analytics
            if (window.analytics && window.analytics.track) {
                window.analytics.track(event.event, event.properties, {
                    userId: event.userId,
                    anonymousId: event.anonymousId
                })
            }

            // Track with Google Analytics
            if (window._gaUTracker) {
                window._gaUTracker('send', 'event', {
                    eventCategory: event.properties?.category || 'General',
                    eventAction: event.event,
                    eventLabel: event.properties?.label,
                    eventValue: event.properties?.value
                })
            }

            // Track with Facebook Pixel
            if (window.fbq) {
                window.fbq('track', event.event, event.properties)
            }
        } catch (error) {
            console.error('Analytics tracking error:', error)
        }
    }

    // Track page views
    trackPageView(page: string, properties?: Record<string, any>) {
        if (!OPTIONAL_TRACKING_ENABLED) return
        this.track({
            event: 'Page Viewed',
            properties: {
                page,
                ...properties
            }
        })
    }

    // Track ecommerce events
    trackPurchase(orderId: string, total: number, currency: string, items: any[]) {
        if (!OPTIONAL_TRACKING_ENABLED) return
        this.track({
            event: 'Purchase',
            properties: {
                orderId,
                total,
                currency,
                items
            }
        })

        // Facebook Pixel Purchase event
        if (window.fbq) {
            window.fbq('track', 'Purchase', {
                value: total,
                currency: currency,
                content_ids: items.map(item => item.id),
                content_type: 'product'
            })
        }
    }

    trackAddToCart(productId: string, productName: string, price: number, quantity: number) {
        if (!OPTIONAL_TRACKING_ENABLED) return
        this.track({
            event: 'Product Added',
            properties: {
                productId,
                productName,
                price,
                quantity,
                category: 'Ecommerce'
            }
        })

        // Facebook Pixel AddToCart event
        if (window.fbq) {
            window.fbq('track', 'AddToCart', {
                content_ids: [productId],
                content_name: productName,
                content_type: 'product',
                value: price * quantity,
                currency: 'AED'
            })
        }
    }

    trackProductView(productId: string, productName: string, price: number, category?: string) {
        if (!OPTIONAL_TRACKING_ENABLED) return
        this.track({
            event: 'Product Viewed',
            properties: {
                productId,
                productName,
                price,
                category: category || 'Products'
            }
        })

        // Facebook Pixel ViewContent event
        if (window.fbq) {
            window.fbq('track', 'ViewContent', {
                content_ids: [productId],
                content_name: productName,
                content_type: 'product',
                value: price,
                currency: 'AED'
            })
        }
    }

    trackSearch(query: string, results: number) {
        if (!OPTIONAL_TRACKING_ENABLED) return
        this.track({
            event: 'Products Searched',
            properties: {
                query,
                results,
                category: 'Search'
            }
        })

        // Facebook Pixel Search event
        if (window.fbq) {
            window.fbq('track', 'Search', {
                search_string: query
            })
        }
    }

    // Identify user
    identify(userId: string, traits?: Record<string, any>) {
        if (!OPTIONAL_TRACKING_ENABLED) return
        if (window.analytics && window.analytics.identify) {
            window.analytics.identify(userId, traits)
        }
    }
}

// Create singleton instance
let analyticsManager: ShopifyAnalyticsManager | null = null

export function initializeAnalytics(config: AnalyticsConfig) {
    if (!analyticsManager) {
        analyticsManager = new ShopifyAnalyticsManager(config)
    }
    return analyticsManager.initialize()
}

export function getAnalytics(): ShopifyAnalyticsManager | null {
    return analyticsManager
}

// Convenience functions
export function trackEvent(event: TrackingEvent) {
    analyticsManager?.track(event)
}

export function trackPageView(page: string, properties?: Record<string, any>) {
    analyticsManager?.trackPageView(page, properties)
}

export function trackPurchase(orderId: string, total: number, currency: string, items: any[]) {
    analyticsManager?.trackPurchase(orderId, total, currency, items)
}

export function trackAddToCart(productId: string, productName: string, price: number, quantity: number) {
    analyticsManager?.trackAddToCart(productId, productName, price, quantity)
}

export function trackProductView(productId: string, productName: string, price: number, category?: string) {
    analyticsManager?.trackProductView(productId, productName, price, category)
}

export function trackSearch(query: string, results: number) {
    analyticsManager?.trackSearch(query, results)
}

export function identifyUser(userId: string, traits?: Record<string, any>) {
    analyticsManager?.identify(userId, traits)
}