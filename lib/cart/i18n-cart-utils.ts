import { OPTIONAL_TRACKING_ENABLED } from '@/lib/analytics/tracking-policy';
import { type Locale } from '@/lib/i18n/config'

// Cart state with language persistence
export interface I18nCartState {
  cartId?: string
  locale: Locale
  items: CartItem[]
  lastUpdated: number
}

export interface CartItem {
  id: string
  variantId: string
  quantity: number
  productHandle: string
  // Cached localized content for performance
  localizedTitle?: {
    en: string
    ar?: string
  }
  localizedPrice?: {
    formatted: string
    locale: Locale
  }
}

const CART_STORAGE_KEY = 'atp-cart-state'
const CART_LOCALE_KEY = 'atp-cart-locale'

export class I18nCartManager {
  private static instance: I18nCartManager
  private currentLocale: Locale = 'en'

  static getInstance(): I18nCartManager {
    if (!I18nCartManager.instance) {
      I18nCartManager.instance = new I18nCartManager()
    }
    return I18nCartManager.instance
  }

  setLocale(locale: Locale): void {
    this.currentLocale = locale
    this.persistLocale(locale)
  }

  getLocale(): Locale {
    if (typeof window === 'undefined') return 'en'
    
    const stored = localStorage.getItem(CART_LOCALE_KEY)
    if (stored && (stored === 'en' || stored === 'ar')) {
      this.currentLocale = stored as Locale
    }
    return this.currentLocale
  }

  private persistLocale(locale: Locale): void {
    if (typeof window === 'undefined') return
    localStorage.setItem(CART_LOCALE_KEY, locale)
  }

  saveCartState(state: I18nCartState): void {
    if (typeof window === 'undefined') return
    
    const stateWithTimestamp = {
      ...state,
      locale: this.currentLocale,
      lastUpdated: Date.now(),
    }
    
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(stateWithTimestamp))
  }

  loadCartState(): I18nCartState | null {
    if (typeof window === 'undefined') return null
    
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY)
      if (!stored) return null
      
      const state = JSON.parse(stored) as I18nCartState
      
      // Check if cart state is too old (24 hours)
      const maxAge = 24 * 60 * 60 * 1000 // 24 hours in milliseconds
      if (Date.now() - state.lastUpdated > maxAge) {
        this.clearCartState()
        return null
      }
      
      return state
    } catch (error) {
      console.error('Error loading cart state:', error)
      this.clearCartState()
      return null
    }
  }

  clearCartState(): void {
    if (typeof window === 'undefined') return
    localStorage.removeItem(CART_STORAGE_KEY)
  }

  // Migrate cart when language changes
  migrateCartForLocale(newLocale: Locale): I18nCartState | null {
    const currentState = this.loadCartState()
    if (!currentState) return null
    
    const migratedState: I18nCartState = {
      ...currentState,
      locale: newLocale,
      lastUpdated: Date.now(),
    }
    
    this.saveCartState(migratedState)
    this.setLocale(newLocale)
    
    return migratedState
  }

  // Update item with localized content
  updateItemLocalizedContent(
    cartId: string,
    variantId: string,
    localizedTitle: { en: string; ar?: string },
    localizedPrice: { formatted: string; locale: Locale }
  ): void {
    const state = this.loadCartState()
    if (!state || state.cartId !== cartId) return
    
    const itemIndex = state.items.findIndex(item => item.variantId === variantId)
    if (itemIndex === -1) return
    
    state.items[itemIndex] = {
      ...state.items[itemIndex],
      localizedTitle,
      localizedPrice,
    }
    
    this.saveCartState(state)
  }

  // Get localized cart summary
  getLocalizedCartSummary(state: I18nCartState, locale: Locale): {
    itemCount: string
    totalItems: number
    hasItems: boolean
  } {
    const totalItems = state.items.reduce((sum, item) => sum + item.quantity, 0)
    
    // Format item count based on locale
    let itemCount: string
    if (locale === 'ar') {
      if (totalItems === 0) {
        itemCount = 'لا توجد عناصر'
      } else if (totalItems === 1) {
        itemCount = 'عنصر واحد'
      } else if (totalItems === 2) {
        itemCount = 'عنصران'
      } else if (totalItems <= 10) {
        itemCount = `${this.toArabicNumerals(totalItems)} عناصر`
      } else {
        itemCount = `${this.toArabicNumerals(totalItems)} عنصراً`
      }
    } else {
      if (totalItems === 0) {
        itemCount = 'No items'
      } else if (totalItems === 1) {
        itemCount = '1 item'
      } else {
        itemCount = `${totalItems} items`
      }
    }
    
    return {
      itemCount,
      totalItems,
      hasItems: totalItems > 0,
    }
  }

  private toArabicNumerals(num: number): string {
    const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩']
    return num.toString().replace(/\d/g, (digit) => arabicNumerals[parseInt(digit)])
  }
}

// Hook for using cart with i18n
export function useI18nCart() {
  const cartManager = I18nCartManager.getInstance()
  
  return {
    saveCartState: (state: I18nCartState) => cartManager.saveCartState(state),
    loadCartState: () => cartManager.loadCartState(),
    clearCartState: () => cartManager.clearCartState(),
    migrateCartForLocale: (locale: Locale) => cartManager.migrateCartForLocale(locale),
    updateItemLocalizedContent: (
      cartId: string,
      variantId: string,
      localizedTitle: { en: string; ar?: string },
      localizedPrice: { formatted: string; locale: Locale }
    ) => cartManager.updateItemLocalizedContent(cartId, variantId, localizedTitle, localizedPrice),
    getLocalizedCartSummary: (state: I18nCartState, locale: Locale) => 
      cartManager.getLocalizedCartSummary(state, locale),
  }
}

// Utility functions for cart localization
export function getLocalizedCartItemTitle(item: CartItem, locale: Locale): string {
  if (locale === 'ar' && item.localizedTitle?.ar) {
    return item.localizedTitle.ar
  }
  return item.localizedTitle?.en || 'Product'
}

export function shouldRefreshLocalizedContent(item: CartItem, currentLocale: Locale): boolean {
  // Check if we need to refresh localized content
  if (!item.localizedPrice) return true
  if (item.localizedPrice.locale !== currentLocale) return true
  if (currentLocale === 'ar' && !item.localizedTitle?.ar) return true
  
  return false
}

// Cart URL utilities for i18n routing
export function getLocalizedCartUrl(locale: Locale): string {
  return `/${locale}/cart`
}

export function getLocalizedCheckoutUrl(locale: Locale, cartId?: string): string {
  const baseUrl = `/${locale}/checkout`
  return cartId ? `${baseUrl}?cart=${cartId}` : baseUrl
}

// Cart analytics with locale tracking
export function trackCartEvent(
  event: 'add_to_cart' | 'remove_from_cart' | 'view_cart' | 'begin_checkout',
  data: {
    locale: Locale
    cartId?: string
    productHandle?: string
    variantId?: string
    quantity?: number
    value?: number
  }
): void {
  // This would integrate with your analytics service
  if (OPTIONAL_TRACKING_ENABLED && typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', event, {
      ...data,
      custom_parameter_locale: data.locale,
    })
  }
  
  console.log('Cart event tracked:', { event, ...data })
}