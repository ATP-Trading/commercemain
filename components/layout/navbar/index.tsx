import { filterPromotedMenu } from "@/lib/publication-policy";
import Link from "next/link";
import Image from "next/image";
import { Suspense } from "react";
import MobileMenu from "./mobile-menu";
import { NavbarLinks } from "./navbar-links";
import { NavbarActions } from "./navbar-actions";
import { getLocale, getTranslations } from 'next-intl/server';
import { getMenuItems } from "@/lib/shopify/server";
import type { ShopifyMenuItem } from "@/lib/shopify/types";

export async function Navbar() {
  const locale = await getLocale();
  const t = await getTranslations('navbar'); // Fetch translations on server if needed for static parts
  const isRTL = locale === 'ar';

  const menuHandle = process.env.SHOPIFY_NAV_MENU_HANDLE || "atp-menu";
  let menuItems: ShopifyMenuItem[] = [];

  try {
    // Pass locale to get translated menu items from Shopify via @inContext directive
    menuItems = filterPromotedMenu(await getMenuItems(menuHandle, { language: locale }));
  } catch (error) {
    console.warn('[Navbar] Failed to fetch Shopify menu:', error);
  }

  // Define simplified menu structure for MobileMenu
  // Note: MobileMenu might still be client-side and expect full props. 
  // For now we pass the same structure as before but generated here.
  const atpMembershipText = t('atpMembership');
  const skincareSupplementsText = t('skincareSupplements');
  const waterSoilTechText = t('waterSoilTechnology');
  const aboutUsText = t('aboutUs');
  const contactUsText = t('contactUs');

  const fallbackMenuItems = [
    { title: atpMembershipText, path: `/${locale}/atp-membership`, handle: "atp-membership" },
    { title: skincareSupplementsText, path: `/${locale}/collections/skincare-supplements`, handle: "skincare-supplements" },
    { title: waterSoilTechText, path: `/${locale}/water-soil-technology`, handle: "water-soil-technology" },
    { title: aboutUsText, path: `/${locale}/about`, handle: "about" },
    { title: contactUsText, path: `/${locale}/contact`, handle: "contact" },
  ];

  return (
    <nav className="bg-black text-white sticky top-0 z-50 border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-3 sm:py-4">
          {/* Mobile menu */}
          <div className="block flex-none lg:hidden">
            <Suspense fallback={null}>
              <MobileMenu menuItems={menuItems} fallbackMenu={fallbackMenuItems} />
            </Suspense>
          </div>

          <div className={`flex items-center ${isRTL ? "flex-row-reverse" : ""}`}>
            <Link href={`/${locale}`} className="flex items-center group">
              <div className="relative h-8 w-16 sm:h-10 sm:w-20 md:h-12 md:w-24 transition-all duration-500 group-hover:scale-105">
                <Image
                  src="/images/atp_logo-removebg-preview.png"
                  alt="ATP Trading"
                  fill
                  className="object-contain filter brightness-0 invert group-hover:brightness-75 transition-all duration-500"
                  priority
                />
              </div>
            </Link>
          </div>

          <div className="hidden lg:flex flex-col items-center flex-1 mx-4">
            <NavbarLinks locale={locale} menuItems={menuItems} fallbackMenu={fallbackMenuItems} />
          </div>

          <div className="relative">
            <NavbarActions locale={locale} isRTL={isRTL} />
          </div>
        </div>
      </div>
    </nav>
  );
}
