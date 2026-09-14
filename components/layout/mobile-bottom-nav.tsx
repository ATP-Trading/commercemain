"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { m } from "framer-motion";
import { Home, Search, ShoppingBag, User } from "lucide-react";
import { useCart } from "@/components/cart/cart-context";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { cn } from "@/lib/utils";

interface NavItem {
    icon: React.ComponentType<{ className?: string }>;
    labelKey: string;
    href: string;
    isCart?: boolean;
}

export function MobileBottomNav() {
    const pathname = usePathname();
    const params = useParams();
    const locale = (params?.locale as string) || "en";
    const { cart } = useCart();
    const t = useTranslations("mobileNav");

    const totalQuantity = cart?.totalQuantity || 0;

    const navItems: NavItem[] = [
        {
            icon: Home,
            labelKey: "home",
            href: `/${locale}`,
        },
        {
            icon: Search,
            labelKey: "search",
            href: `/${locale}/search`,
        },
        {
            icon: ShoppingBag,
            labelKey: "cart",
            href: `/${locale}/cart`,
            isCart: true,
        },
        {
            icon: User,
            labelKey: "account",
            href: `/${locale}/account`,
        },
    ];

    const isActive = (href: string) => {
        // Exact match for home, starts-with for others
        if (href === `/${locale}`) {
            return pathname === href;
        }
        return pathname?.startsWith(href);
    };

    return (
        <nav
            className={cn(
                "fixed bottom-0 left-0 right-0 z-40 md:hidden",
                "bg-atp-black",
                "border-t border-neutral-800",
                "shadow-[0_-2px_10px_rgba(0,0,0,0.1)]",
                "safe-area-inset-bottom"
            )}
        >
            <div className="flex items-center justify-around h-16 max-w-md mx-auto">
                {navItems.map((item) => {
                    const active = isActive(item.href);
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.labelKey}
                            href={item.href}
                            className={cn(
                                "flex flex-col items-center justify-center flex-1 h-full",
                                "transition-colors duration-200",
                                "relative"
                            )}
                        >
                            <m.div
                                className="relative"
                                whileTap={{ scale: 0.9 }}
                                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                            >
                                <Icon
                                    className={cn(
                                        "w-6 h-6 transition-colors duration-200",
                                        active
                                            ? "text-atp-gold"
                                            : "text-neutral-300"
                                    )}
                                />

                                {/* Cart Badge */}
                                {item.isCart && totalQuantity > 0 && (
                                    <m.span
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className={cn(
                                            "absolute -top-1.5 -right-1.5",
                                            "flex items-center justify-center",
                                            "min-w-[18px] h-[18px] px-1",
                                            "text-[10px] font-bold",
                                            "bg-atp-gold text-atp-black",
                                            "rounded-full"
                                        )}
                                    >
                                        {totalQuantity > 99 ? "99+" : totalQuantity}
                                    </m.span>
                                )}

                                {/* Active Indicator */}
                                {active && (
                                    <m.div
                                        layoutId="activeTab"
                                        className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-atp-gold rounded-full"
                                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                    />
                                )}
                            </m.div>

                            <span
                                className={cn(
                                    "text-xs mt-1 font-medium transition-colors duration-200",
                                    active
                                        ? "text-atp-gold font-medium"
                                        : "text-neutral-300"
                                )}
                            >
                                {t(item.labelKey)}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}

export default MobileBottomNav;
