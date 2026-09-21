import { PromotionBanner } from "@/components/layout/promotion-banner";
import { GoogleAnalytics } from "@/components/analytics/google-analytics";
import { type ReactNode } from "react";
import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';
import { routing } from '@/src/i18n/routing';
import { CartProvider } from "@/components/cart/cart-context";
import { CartNotificationProvider } from "@/components/cart/cart-provider";
import { Navbar } from "@/components/layout/navbar";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import Footer from "@/components/layout/footer";
import { getCart } from "@/lib/shopify/server";
import { Toaster } from "sonner";
import { Cinzel, DM_Sans, Tajawal } from "next/font/google";
import { StructuredData } from "@/components/structured-data";
import { SkipToContentSimple } from "@/components/ui/skip-navigation";
import { PageTransitionProvider } from "@/components/ui/page-transition-provider";
import { DirectionProvider } from "@/components/ui/direction";
import { baseUrl } from "@/lib/utils";
import { MetaPixel } from "@/components/analytics/meta-pixel";
import { WhatsAppButton } from "@/components/ui/whatsapp-button";

// Luxury display font for headings - elegant serif with refined character
const cinzel = Cinzel({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-display",
  weight: ["400", "500", "600", "700"],
});

// Modern sans-serif for English body text - excellent readability
const dmSans = DM_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

// Arabic-optimized font with excellent RTL support
const tajawal = Tajawal({
  subsets: ["arabic", "latin"],
  display: "swap",
  variable: "--font-arabic",
  weight: ["300", "400", "500", "700"],
});

interface LocaleLayoutProps {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}

export function generateStaticParams() {
  return ['en', 'ar'].map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'common' });

  return {
    title: { absolute: t('siteTitle') },
    description: t('siteDescription'),
    openGraph: {
      locale: locale === "ar" ? "ar_AE" : "en_AE",
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params;

  // Ensure that the incoming `locale` is valid
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  // Enable static rendering
  setRequestLocale(locale);

  // Get messages for client components
  const messages = await getMessages();

  let cart;
  try {
    cart = await getCart();
  } catch (error) {
    console.error("Error fetching cart:", error);
    cart = undefined;
  }

  const isRTL = locale === 'ar';

  return (
    <>
      {/* Locale-specific structured data */}
      <StructuredData
        type="Organization"
        data={{
          name: locale === "ar" ? "ATP Trading" : "ATP Trading",
          url: `${baseUrl}/${locale}`,
          logo: `${baseUrl}/images/atp-logo.png`,
          description:
            locale === "ar"
              ? "حلول العافية المتميزة والتكنولوجيا المتقدمة مع فوائد العضوية الحصرية لـ ATP"
              : "Premium wellness and technology solutions with exclusive ATP membership benefits",
        }}
      />

      <div
        className={`bg-atp-white text-atp-black selection:bg-atp-gold/20 selection:text-atp-black antialiased min-h-screen flex flex-col ${isRTL ? "rtl arabic" : "ltr english"
          } ${cinzel.variable} ${dmSans.variable} ${tajawal.variable}`}
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        <DirectionProvider direction={isRTL ? 'rtl' : 'ltr'}>
          <NextIntlClientProvider messages={messages}>
            <CartProvider initialCart={cart}>
              <CartNotificationProvider>
                  <SkipToContentSimple label={isRTL ? 'انتقل إلى المحتوى الرئيسي' : 'Skip to main content'} />
                  <PromotionBanner expiresAt="2026-09-21T23:59:00+04:00" deadlineLabelAr="حتى الاثنين ٢١ سبتمبر، ١١:٥٩ مساءً بتوقيت الإمارات" deadlineLabelEn="Until Mon 21 Sep, 11:59 PM UAE time" />
                  <Navbar />
                  <MetaPixel />
                  <GoogleAnalytics />
                  <main id="main-content" className="flex-1 pb-16 md:pb-0" tabIndex={-1}>
                    <PageTransitionProvider>
                      {children}
                    </PageTransitionProvider>
                    <Toaster
                      closeButton
                      theme="light"
                      position={isRTL ? "bottom-left" : "bottom-right"}
                      toastOptions={{
                        style: {
                          background: "var(--atp-white)",
                          border: "1px solid var(--atp-light-gray)",
                          color: "var(--atp-black)",
                        },
                      }}
                    />
                  </main>
                  <Footer />
                  <MobileBottomNav />
                  <WhatsAppButton />
              </CartNotificationProvider>
            </CartProvider>
          </NextIntlClientProvider>
        </DirectionProvider>
      </div>
    </>
  );
}
