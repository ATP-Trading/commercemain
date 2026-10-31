"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/components/cart/cart-context";
import { Home, ShoppingCart } from "lucide-react";

type Props = { locale: string; collections: { handle: string; title: string; href: string }[] };

export function CollectionNavigation({ locale, collections }: Props) {
  const pathname = usePathname();
  const { cart } = useCart();
  const quantity = cart?.totalQuantity || 0;
  const arabic = locale === "ar";
  const home = `/${locale}`;
  const linkStyle = "flex h-12 min-w-0 items-center justify-center gap-2 rounded-xl px-1.5 text-xs sm:px-3 sm:text-sm font-medium transition-colors hover:bg-white/10 hover:text-atp-gold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-atp-gold";
  return (
    <div className="border-t border-atp-gold/20 bg-gradient-to-b from-[#11100c] to-black" dir="ltr">
      <div className="mx-auto grid max-w-3xl grid-cols-[48px_minmax(0,1fr)_48px] items-center gap-2 px-3 py-3 sm:gap-3 sm:px-6">
        <Link href={home} aria-label={arabic ? "الصفحة الرئيسية" : "Home"}
          aria-current={pathname === home ? "page" : undefined} className={`${linkStyle} border border-atp-gold/30 bg-white/[0.03] text-atp-gold`}>
          <Home className="h-5 w-5" aria-hidden="true" />

        </Link>
        <div dir={arabic ? "rtl" : "ltr"} className="min-w-0" role="region" aria-label={arabic ? "مجموعات المنتجات" : "Product collections"}>
          <ul className="grid grid-cols-2 items-center gap-2 sm:gap-3">
            {collections.map((collection) => (
              <li key={collection.handle} className="min-w-0">
                <Link href={collection.href} aria-current={pathname === collection.href ? "page" : undefined}
                  className={`${linkStyle} w-full border border-atp-gold/50 bg-white/[0.03] text-center leading-snug ${pathname === collection.href ? "bg-white/10 text-atp-gold" : "text-white"}`}>
                  {collection.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <Link href={`/${locale}/cart`} aria-label={arabic ? `سلة المشتريات، ${quantity} قطعة` : `Shopping cart, ${quantity} items`}
          aria-current={pathname === `/${locale}/cart` ? "page" : undefined} className={`relative ${linkStyle} border border-atp-gold/30 bg-white/[0.03] text-atp-gold`}>
          <ShoppingCart className="h-5 w-5" aria-hidden="true" />
          {quantity > 0 && <span aria-hidden="true" className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-atp-gold px-1 text-[11px] font-bold leading-none text-black ring-2 ring-black">{quantity > 99 ? "99+" : quantity}</span>}
          <span role="status" className="sr-only">{arabic ? `${quantity} قطعة في السلة` : `${quantity} items in cart`}</span>

        </Link>
      </div>
    </div>
  );
}
