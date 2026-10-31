"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ShoppingCart } from "lucide-react";

type Props = { locale: string; collections: { handle: string; title: string; href: string }[] };

export function CollectionNavigation({ locale, collections }: Props) {
  const pathname = usePathname();
  const arabic = locale === "ar";
  const home = `/${locale}`;
  const linkStyle = "flex min-h-11 shrink-0 items-center gap-2 rounded-md px-3 text-sm font-medium transition-colors hover:bg-white/10 hover:text-atp-gold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-atp-gold";
  return (
    <div className="border-t border-white/15" dir={arabic ? "rtl" : "ltr"}>
      <div className="mx-auto flex max-w-7xl items-center gap-1 px-3 sm:px-6 lg:px-8">
        <Link href={home} aria-label={arabic ? "الصفحة الرئيسية" : "Home"}
          aria-current={pathname === home ? "page" : undefined} className={`${linkStyle} text-atp-gold`}>
          <Home className="h-5 w-5" aria-hidden="true" />
          <span className="hidden sm:inline">{arabic ? "الرئيسية" : "Home"}</span>
        </Link>
        <div className="min-w-0 flex-1 overflow-x-auto py-1" role="region" aria-label={arabic ? "مجموعات المنتجات" : "Product collections"}>
          <ul className="flex w-max items-center gap-1">
            {collections.map((collection) => (
              <li key={collection.handle}>
                <Link href={collection.href} aria-current={pathname === collection.href ? "page" : undefined}
                  className={`${linkStyle} ${pathname === collection.href ? "bg-white/10 text-atp-gold" : "text-white"}`}>
                  {collection.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <Link href={`/${locale}/cart`} aria-label={arabic ? "سلة المشتريات" : "Shopping cart"}
          aria-current={pathname === `/${locale}/cart` ? "page" : undefined} className={`${linkStyle} text-atp-gold`}>
          <ShoppingCart className="h-5 w-5" aria-hidden="true" />
          <span className="hidden sm:inline">{arabic ? "السلة" : "Cart"}</span>
        </Link>
      </div>
    </div>
  );
}
