"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { useState } from "react";
import { Search, User, X, LogOut } from "lucide-react";
import { m, AnimatePresence } from "framer-motion";
import { useCustomerOAuth } from "@/hooks/use-customer-oauth";
import { LanguageSwitcher } from "@/components/language-switcher";

import { ATPCartModal } from "@/components/cart/atp-cart-modal";
import EnhancedSearch from "./enhanced-search";

interface NavbarActionsProps {
    locale: string;
    isRTL: boolean;
}

export function NavbarActions({ locale, isRTL }: NavbarActionsProps) {
    const t = useTranslations('navbar');
    const { customer, logout } = useCustomerOAuth();
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    return (
        <>
            <div className={`flex items-center gap-3 sm:gap-4 md:gap-6 ${isRTL ? "flex-row-reverse" : ""}`}>
                <div className="sm:hidden">
                    <LanguageSwitcher variant="compact" />
                </div>
                <div className="hidden sm:block">
                    <LanguageSwitcher />
                </div>

                <button
                    onClick={() => setIsSearchOpen(!isSearchOpen)}
                    className="p-2 sm:p-3 hover:text-yellow-400 hover:bg-gray-900 rounded-full transition-all duration-300 hidden md:block"
                    aria-label={isSearchOpen ? t('closeSearch') : t('openSearch')}
                >
                    {isSearchOpen ? (
                        <X className="w-4 h-4 sm:w-5 sm:h-5" />
                    ) : (
                        <Search className="w-4 h-4 sm:w-5 sm:h-5" />
                    )}
                </button>
                {customer ? (
                    <div className="flex items-center gap-1 sm:gap-2">
                        <Link
                            href={`/${locale}/account`}
                            className="p-2 sm:p-3 hover:text-yellow-400 hover:bg-gray-900 rounded-full transition-all duration-300 hidden sm:block"
                            title={t('welcome', { name: customer.firstName || (isRTL ? 'عميلنا' : 'customer') })}
                        >
                            <User className="w-4 h-4 sm:w-5 sm:h-5" />
                        </Link>
                        <button
                            onClick={() => logout(`/${locale}`)}
                            className="p-2 sm:p-3 hover:text-red-400 hover:bg-gray-900 rounded-full transition-all duration-300 hidden sm:block"
                            title={t('signOut')}
                        >
                            <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                    </div>
                ) : (
                    <Link
                        href={`/${locale}/login`}
                        className="p-2 sm:p-3 hover:text-yellow-400 hover:bg-gray-900 rounded-full transition-all duration-300 hidden sm:block"
                        title={t('signIn')}
                    >
                        <User className="w-4 h-4 sm:w-5 sm:h-5" />
                    </Link>
                )}
                <ATPCartModal />
            </div>

            {/* Dynamic Search Bar - Positioned relative to actions for now, or use portal/absolute in layout */}
            <AnimatePresence>
                {isSearchOpen && (
                    <div className="absolute top-full left-0 w-full flex justify-center pointer-events-none">
                        <m.div
                            initial={{ opacity: 0, y: -20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -20, scale: 0.95 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                            className="mt-4 w-full max-w-md pointer-events-auto"
                        >
                            <EnhancedSearch
                                placeholder={t('searchProducts')}
                                onClose={() => setIsSearchOpen(false)}
                                autoFocus={true}
                            />
                        </m.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
