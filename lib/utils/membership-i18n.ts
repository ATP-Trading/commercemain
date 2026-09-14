/**
 * Membership Internationalization Utilities
 * 
 * Provides localized formatting and RTL support for membership features
 * Requirements: 1.1, 1.2, 1.3, 1.4
 */

import { type Locale } from '@/lib/i18n/config';
import { UAE_DIRHAM_CODE, UAE_DIRHAM_SYMBOL } from '@/lib/constants';

export interface LocalizedPrice {
  amount: number;
  currency: string;
  symbol: string;
  formatted: string;
  display: string;
  locale: Locale;
  isRTL: boolean;
}

export interface MembershipI18nConfig {
  locale: Locale;
  currency: string;
  dateFormat: string;
  numberFormat: string;
  isRTL: boolean;
}

/**
 * Membership Internationalization Service
 */
export class MembershipI18nService {
  public locale: Locale;
  public config: MembershipI18nConfig;

  constructor(locale: Locale = 'en') {
    this.locale = locale;
    this.config = this.getConfig(locale);
  }

  private getConfig(locale: Locale): MembershipI18nConfig {
    const configs: Record<Locale, MembershipI18nConfig> = {
      en: {
        locale: 'en',
        currency: UAE_DIRHAM_CODE,
        dateFormat: 'MM/dd/yyyy',
        numberFormat: 'en-AE',
        isRTL: false,
      },
      ar: {
        locale: 'ar',
        currency: UAE_DIRHAM_CODE,
        dateFormat: 'dd/MM/yyyy',
        numberFormat: 'ar-AE',
        isRTL: true,
      },
    };

    return configs[locale] || configs.en;
  }

  /**
   * Format price with localized currency display
   */
  formatPrice(amount: number, options?: {
    showSymbol?: boolean;
    showCurrency?: boolean;
    precision?: number;
  }): LocalizedPrice {
    const {
      showSymbol = true,
      showCurrency = false,
      precision = 2,
    } = options || {};

    const formattedAmount = new Intl.NumberFormat(this.config.numberFormat, {
      minimumFractionDigits: precision,
      maximumFractionDigits: precision,
    }).format(amount);

    const symbol = UAE_DIRHAM_SYMBOL;
    const currency = this.config.currency;

    let display: string;
    if (this.config.isRTL) {
      // Arabic: amount + symbol (e.g., "99 د.إ")
      display = showSymbol ? `${formattedAmount} ${symbol}` : formattedAmount;
      if (showCurrency) {
        display += ` ${currency}`;
      }
    } else {
      // English: symbol + amount (e.g., "AED 99")
      display = showSymbol ? `${symbol} ${formattedAmount}` : formattedAmount;
      if (showCurrency) {
        display = `${currency} ${formattedAmount}`;
      }
    }

    return {
      amount,
      currency,
      symbol,
      formatted: formattedAmount,
      display,
      locale: this.locale,
      isRTL: this.config.isRTL,
    };
  }

  /**
   * Format membership duration
   */
  formatDuration(days: number): string {
    if (this.locale === 'ar') {
      if (days === 1) return 'يوم واحد';
      if (days === 2) return 'يومان';
      if (days <= 10) return `${this.formatNumber(days)} أيام`;
      return `${this.formatNumber(days)} يوماً`;
    } else {
      if (days === 1) return '1 day';
      return `${days} days`;
    }
  }

  /**
   * Format date with locale-specific format
   */
  formatDate(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    return new Intl.DateTimeFormat(this.config.numberFormat, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(dateObj);
  }

  /**
   * Format number with locale-specific numerals
   */
  formatNumber(num: number): string {
    return new Intl.NumberFormat(this.config.numberFormat).format(num);
  }

  /**
   * Format percentage with locale-specific display
   */
  formatPercentage(percentage: number): string {
    const formatted = new Intl.NumberFormat(this.config.numberFormat, {
      style: 'percent',
      minimumFractionDigits: 0,
      maximumFractionDigits: 1,
    }).format(percentage / 100);

    return formatted;
  }

  /**
   * Get RTL-aware CSS classes
   */
  getRTLClasses(): {
    textAlign: string;
    flexDirection: string;
    marginStart: string;
    marginEnd: string;
    paddingStart: string;
    paddingEnd: string;
  } {
    if (this.config.isRTL) {
      return {
        textAlign: 'text-right',
        flexDirection: 'flex-row-reverse',
        marginStart: 'mr-auto',
        marginEnd: 'ml-auto',
        paddingStart: 'pr-4',
        paddingEnd: 'pl-4',
      };
    } else {
      return {
        textAlign: 'text-left',
        flexDirection: 'flex-row',
        marginStart: 'ml-auto',
        marginEnd: 'mr-auto',
        paddingStart: 'pl-4',
        paddingEnd: 'pr-4',
      };
    }
  }

  /**
   * Get cultural considerations for UAE market
   */
  getCulturalConfig(): {
    preferredPaymentMethods: string[];
    businessHours: string;
    weekendDays: string[];
    currencyPreference: string;
    datePreference: string;
  } {
    return {
      preferredPaymentMethods: ['credit_card', 'debit_card', 'apple_pay', 'google_pay'],
      businessHours: this.locale === 'ar' ? 'الأحد - الخميس: 9:00 - 18:00' : 'Sunday - Thursday: 9:00 AM - 6:00 PM',
      weekendDays: ['friday', 'saturday'],
      currencyPreference: UAE_DIRHAM_CODE,
      datePreference: this.config.dateFormat,
    };
  }

  /**
   * Get localized membership tier names
   */
  getMembershipTierName(tier: string): string {
    const tierNames: Record<string, Record<Locale, string>> = {
      atp: {
        en: 'ATP Membership',
        ar: 'عضوية ATP',
      },
      basic: {
        en: 'Basic',
        ar: 'الأساسية',
      },
      premium: {
        en: 'Premium',
        ar: 'المتميزة',
      },
      elite: {
        en: 'Elite',
        ar: 'النخبة',
      },
    };

    return tierNames[tier]?.[this.locale] || tier;
  }

  /**
   * Get localized service names
   */
  getServiceName(serviceId: string): string {
    const serviceNames: Record<string, Record<Locale, string>> = {
      massage: {
        en: 'Home Massage & Spa Services',
        ar: 'خدمات التدليك والسبا المنزلية',
      },
      ems: {
        en: 'EMS Training',
        ar: 'تدريب التحفيز الكهربائي للعضلات',
      },
      yoga: {
        en: 'Home Yoga Sessions',
        ar: 'جلسات اليوغا المنزلية',
      },
      supplements: {
        en: 'Cosmetics & Healthy Food Supplements',
        ar: 'مستحضرات التجميل والمكملات الغذائية الصحية',
      },
    };

    return serviceNames[serviceId]?.[this.locale] || serviceId;
  }

  /**
   * Get RTL-aware icon positioning
   */
  getIconClasses(position: 'start' | 'end' = 'start'): string {
    if (this.config.isRTL) {
      return position === 'start' ? 'ml-2' : 'mr-2';
    } else {
      return position === 'start' ? 'mr-2' : 'ml-2';
    }
  }

  /**
   * Get localized error messages
   */
  getErrorMessage(errorCode: string): string {
    const errorMessages: Record<string, Record<Locale, string>> = {
      MEMBERSHIP_NOT_FOUND: {
        en: 'Membership not found',
        ar: 'لم يتم العثور على العضوية',
      },
      MEMBERSHIP_EXPIRED: {
        en: 'Your membership has expired',
        ar: 'انتهت صلاحية عضويتك',
      },
      PAYMENT_FAILED: {
        en: 'Payment failed. Please try again.',
        ar: 'فشل الدفع. يرجى المحاولة مرة أخرى.',
      },
      NETWORK_ERROR: {
        en: 'Network connection error',
        ar: 'خطأ في الاتصال بالشبكة',
      },
    };

    return errorMessages[errorCode]?.[this.locale] || errorCode;
  }
}

/**
 * Hook for using membership internationalization
 */
export function useMembershipI18n(locale?: Locale) {
  const service = new MembershipI18nService(locale);
  
  return {
    formatPrice: (amount: number, options?: Parameters<typeof service.formatPrice>[1]) => 
      service.formatPrice(amount, options),
    formatDuration: (days: number) => service.formatDuration(days),
    formatDate: (date: Date | string) => service.formatDate(date),
    formatNumber: (num: number) => service.formatNumber(num),
    formatPercentage: (percentage: number) => service.formatPercentage(percentage),
    getRTLClasses: () => service.getRTLClasses(),
    getCulturalConfig: () => service.getCulturalConfig(),
    getMembershipTierName: (tier: string) => service.getMembershipTierName(tier),
    getServiceName: (serviceId: string) => service.getServiceName(serviceId),
    getIconClasses: (position?: 'start' | 'end') => service.getIconClasses(position),
    getErrorMessage: (errorCode: string) => service.getErrorMessage(errorCode),
    isRTL: service.config.isRTL,
    locale: service.locale,
  };
}

/**
 * Utility functions for membership internationalization
 */
export const membershipI18nUtils = {
  /**
   * Get appropriate font class for locale
   */
  getFontClass: (locale: Locale): string => {
    return locale === 'ar' ? 'font-cairo' : 'font-inter';
  },

  /**
   * Get appropriate text direction class
   */
  getDirectionClass: (locale: Locale): string => {
    return locale === 'ar' ? 'rtl' : 'ltr';
  },

  /**
   * Get appropriate alignment class
   */
  getAlignmentClass: (locale: Locale): string => {
    return locale === 'ar' ? 'text-right' : 'text-left';
  },

  /**
   * Get appropriate flex direction class
   */
  getFlexDirectionClass: (locale: Locale): string => {
    return locale === 'ar' ? 'flex-row-reverse' : 'flex-row';
  },

  /**
   * Convert Western numerals to Arabic numerals
   */
  toArabicNumerals: (text: string): string => {
    const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    return text.replace(/[0-9]/g, (digit) => arabicNumerals[parseInt(digit)]);
  },

  /**
   * Convert Arabic numerals to Western numerals
   */
  toWesternNumerals: (text: string): string => {
    const westernNumerals = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    
    return text.replace(/[٠-٩]/g, (digit) => {
      const index = arabicNumerals.indexOf(digit);
      return index !== -1 ? westernNumerals[index] : digit;
    });
  },
};