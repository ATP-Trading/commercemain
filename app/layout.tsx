import { Inter, Cairo } from "next/font/google";
import { StructuredData } from "@/components/structured-data";
import { ThemeProvider } from "@/components/theme-provider";
import { LazyMotionProvider } from "@/components/providers/lazy-motion-provider";
import { DirectionProvider } from "@/components/ui/direction";
import type { ReactNode } from "react";
import "./globals.css";
import { baseUrl } from "@/lib/utils";
import { getLocale } from "next-intl/server";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  display: "swap",
  variable: "--font-cairo",
});

const SITE_NAME = "ATP Trading";

export const metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "Premium wellness products and advanced technology solutions. ATP Membership benefits, skincare & supplements, water & soil technology.",
  keywords: [
    "ATP Membership",
    "wellness products",
    "skincare",
    "supplements",
    "water technology",
    "soil technology",
    "premium health",
    "عضوية ATP",
    "منتجات العافية",
    "العناية بالبشرة",
    "المكملات الغذائية",
    "تكنولوجيا المياه",
  ],
  robots: {
    follow: true,
    index: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: SITE_NAME,
    description:
      "Premium wellness and technology solutions with exclusive ATP membership benefits",
    url: baseUrl,
    images: [
      {
        url: `${baseUrl}/opengraph-image.png`,
        width: 1200,
        height: 630,
        alt: "ATP Trading - Premium Wellness & Technology",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: "Premium wellness products and advanced technology solutions",
    images: [`${baseUrl}/opengraph-image.png`],
  },
  verification: {
    google: "your-google-verification-code",
  },
  generator: "v0.app",
};



export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const locale = await getLocale();
  const direction = locale === "ar" ? "rtl" : "ltr";

  return (
    <html
      lang={locale}
      dir={direction}
      className={`${inter.variable} ${cairo.variable} antialiased`}
      suppressHydrationWarning
    >
      <head>
        {/* Global preconnects */}
        <link rel="preconnect" href="https://cdn.shopify.com" />
        <link rel="dns-prefetch" href="https://cdn.shopify.com" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />

        {/* Global meta tags */}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#000000" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#000000" media="(prefers-color-scheme: dark)" />

        {/* Favicons */}
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/images/favicon-16x16.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/images/favicon-32x32.png"
        />
        <link rel="icon" href="/images/favicon.ico" sizes="any" />
        <link rel="shortcut icon" href="/images/favicon.ico" />

      </head>
      <body>
        <DirectionProvider direction={direction}>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            <LazyMotionProvider>
              {children}
            </LazyMotionProvider>
          </ThemeProvider>
        </DirectionProvider>
      </body>
    </html>
  );
}
