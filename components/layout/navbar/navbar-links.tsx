"use client";
import { normalizeNavigationUrl, localizeNavigationPath } from "@/lib/navigation-url";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { useState, useRef, useMemo, useCallback, useEffect } from "react";
import { MegaMenu, menuCategories } from "./mega-menu";
import { fetchCollectionProducts } from "@/components/cart/actions";
import { createLogger } from "@/lib/logger";
import type { Product, ShopifyMenuItem } from "@/lib/shopify/types";

// Helper for collection mapping (moved from index.tsx)
const collectionMapping = {
    "atp-membership": "atp-membership",
    "skincare-supplements": "amazing-thai-products",
    "water-soil-technology": "water-soil-technology-solutions",
    "ems-training": "ems",
};

interface NavbarLinksProps {
    locale: string;
    menuItems?: ShopifyMenuItem[];
    fallbackMenu?: { title: string; path: string; handle: string }[];
}

type NavMenuItem = {
    title: string;
    path: string;
    handle: string;
    item?: ShopifyMenuItem;
};

export function NavbarLinks({ locale, menuItems, fallbackMenu }: NavbarLinksProps) {
    const t = useTranslations('navbar');
    const [hoveredMenu, setHoveredMenu] = useState<string | null>(null);
    const [menuProducts, setMenuProducts] = useState<Record<string, Product[]>>({});
    const [loadingProducts, setLoadingProducts] = useState<Record<string, boolean>>({});
    const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);

    const isHoveringDropdown = useRef(false);

    const navLogger = useMemo(() => createLogger('[NavbarLinks]'), []);


    const atpMembershipText = t('atpMembership');
    const skincareSupplementsText = t('skincareSupplements');
    const waterSoilTechText = t('waterSoilTechnology');
    const emsTrainingText = t('emsTraining');
    const aboutUsText = t('aboutUs');
    const contactUsText = t('contactUs');

    const withLocale = useCallback((path: string) => localizeNavigationPath(path, locale), [locale]);

    const normalizeMenuUrl = normalizeNavigationUrl;

    const getMenuSlug = useCallback((item: ShopifyMenuItem) => {
        const urlPath = normalizeMenuUrl(item.url);
        const cleanPath = urlPath.split("?")[0]?.split("#")[0] || "";
        const segments = cleanPath.split("/").filter(Boolean);

        if (segments[0] === "collections" && segments[1]) return segments[1];
        if (segments[0] === "products" && segments[1]) return segments[1];
        if (segments[0] === "pages" && segments[1]) return segments[1];

        if (segments.length > 0) return segments[segments.length - 1];

        const resource = item.resource;
        if (resource && "handle" in resource && typeof resource.handle === "string") {
            return resource.handle;
        }

        return item.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "");
    }, [normalizeMenuUrl]);

    const translationKeyByHandle: Record<string, string> = {
        "home": "home",
        "atp-membership": "atpMembership",
        "skincare-supplements": "skincareSupplements",
        "amazing-thai-products": "skincareSupplements",
        "water-soil-technology": "waterSoilTechnology",
        "water-soil-technology-solutions": "waterSoilTechnology",
        "ems": "emsTraining",
        "ems-training": "emsTraining",
        "about": "aboutUs",
        "about-us": "aboutUs",
        "contact": "contactUs",
        "contact-us": "contactUs",
    };

    const getMenuLabel = useCallback((item: ShopifyMenuItem) => {
        const slug = getMenuSlug(item);
        const key = translationKeyByHandle[slug];
        return key ? t(key) : item.title;
    }, [getMenuSlug, t]);

    // Map Shopify page handles to actual route paths
    const handleToRoute: Record<string, string> = useMemo(() => ({
        'about-us': '/about',
        'contact-us': '/contact',
    }), []);

    const getMenuPath = useCallback((item: ShopifyMenuItem) => {
        const resource = item.resource;
        if (resource?.__typename === "Collection" && "handle" in resource) {
            return `/collections/${resource.handle}`;
        }
        if (resource?.__typename === "Product" && "handle" in resource) {
            return `/product/${resource.handle}`;
        }
        if (resource?.__typename === "Page" && "handle" in resource) {
            const handle = resource.handle as string;
            return handleToRoute[handle] || `/${handle}`;
        }

        const urlPath = normalizeMenuUrl(item.url);
        if (urlPath.startsWith("/collections/")) {
            const handle = urlPath.split("/")[2];
            return handle ? `/collections/${handle}` : urlPath;
        }
        if (urlPath.startsWith("/products/")) {
            const handle = urlPath.split("/")[2];
            return handle ? `/product/${handle}` : urlPath;
        }
        if (urlPath.startsWith("/pages/")) {
            const handle = urlPath.split("/")[2];
            if (handle) {
                return handleToRoute[handle] || `/${handle}`;
            }
            return urlPath;
        }
        return urlPath || "/";
    }, [normalizeMenuUrl, handleToRoute]);

    const buildNavItem = useCallback((item: ShopifyMenuItem): NavMenuItem => {
        const handle = getMenuSlug(item);
        return {
            title: getMenuLabel(item),
            path: withLocale(getMenuPath(item)),
            handle,
            item,
        };
    }, [getMenuLabel, getMenuPath, getMenuSlug, withLocale]);

    const fallbackMenuItems = useMemo(
        () => fallbackMenu && fallbackMenu.length > 0
            ? fallbackMenu
            : [
                {
                    title: atpMembershipText,
                    path: `/${locale}/atp-membership`,
                    handle: "atp-membership",
                },
                {
                    title: skincareSupplementsText,
                    path: `/${locale}/collections/skincare-supplements`,
                    handle: "skincare-supplements",
                },
                {
                    title: waterSoilTechText,
                    path: `/${locale}/water-soil-technology`,
                    handle: "water-soil-technology",
                },
                {
                    title: emsTrainingText,
                    path: `/${locale}/ems`,
                    handle: "ems-training",
                },
                {
                    title: aboutUsText,
                    path: `/${locale}/about`,
                    handle: "about",
                },
                {
                    title: contactUsText,
                    path: `/${locale}/contact`,
                    handle: "contact",
                },
            ],
        [
            fallbackMenu,
            locale,
            atpMembershipText,
            skincareSupplementsText,
            waterSoilTechText,
            emsTrainingText,
            aboutUsText,
            contactUsText,
        ]
    );

    const menuSource = useMemo(
        () => (menuItems && menuItems.length > 0 ? menuItems : null),
        [menuItems]
    );

    const shopifyNavItems = useMemo(
        () => (menuSource ? menuSource.map(buildNavItem) : []),
        [menuSource, buildNavItem]
    );

    const splitIndex = Math.ceil(
        (menuSource ? shopifyNavItems.length : fallbackMenuItems.length) / 2
    );

    const topRowMenu = menuSource
        ? shopifyNavItems.slice(0, splitIndex)
        : fallbackMenuItems.slice(0, splitIndex);

    const bottomRowMenu = menuSource
        ? shopifyNavItems.slice(splitIndex)
        : fallbackMenuItems.slice(splitIndex);

    const menuItemByHandle = useMemo(() => {
        const map: Record<string, ShopifyMenuItem> = {};
        shopifyNavItems.forEach((navItem) => {
            if (navItem.item) {
                map[navItem.handle] = navItem.item;
            }
        });
        return map;
    }, [shopifyNavItems]);

    const extractCollectionHandle = useCallback((item: ShopifyMenuItem) => {
        const resource = item.resource;
        if (resource?.__typename === "Collection" && "handle" in resource) {
            return resource.handle;
        }

        const urlPath = normalizeMenuUrl(item.url);
        if (urlPath.startsWith("/collections/")) {
            return urlPath.split("/")[2] || null;
        }
        if (urlPath.startsWith("/search/")) {
            return urlPath.split("/")[2] || null;
        }

        return null;
    }, [normalizeMenuUrl]);

    const findCollectionHandle = useCallback((item: ShopifyMenuItem): string | null => {
        const direct = extractCollectionHandle(item);
        if (direct) return direct;
        for (const child of item.items || []) {
            const nested = findCollectionHandle(child);
            if (nested) return nested;
        }
        return null;
    }, [extractCollectionHandle]);

    const buildCategoryFromItem = useCallback((item: ShopifyMenuItem) => {
        const title = getMenuLabel(item);
        const href = getMenuPath(item);
        const subcategories = (item.items || []).map((child) => ({
            title: getMenuLabel(child),
            titleAr: getMenuLabel(child),
            href: getMenuPath(child),
        }));

        return {
            id: getMenuSlug(item),
            title,
            titleAr: title,
            href,
            subcategories,
        };
    }, [getMenuLabel, getMenuPath, getMenuSlug]);

    const activeCategory = useMemo(() => {
        if (hoveredMenu && menuItemByHandle[hoveredMenu]) {
            return buildCategoryFromItem(menuItemByHandle[hoveredMenu]);
        }
        return menuCategories.find((item) => item.id === hoveredMenu) ?? null;
    }, [hoveredMenu, menuItemByHandle, buildCategoryFromItem]);

    const activeProducts = useMemo(
        () => (activeCategory ? (menuProducts[activeCategory.id] ?? []) : []),
        [activeCategory, menuProducts]
    );

    const isMegaMenuOpen = useMemo(() => {
        if (!activeCategory) return false;
        const hasSubcategories = !!activeCategory.subcategories?.length;
        const hasProducts = !!menuProducts[activeCategory.id]?.length;
        const isLoading = !!loadingProducts[activeCategory.id];
        return hasSubcategories || hasProducts || isLoading;
    }, [activeCategory, menuProducts, loadingProducts]);

    const fetchMenuProducts = useCallback(async (menuHandle: string) => {
        const menuItem = menuItemByHandle[menuHandle];
        const collectionHandle = menuItem
            ? findCollectionHandle(menuItem)
            : collectionMapping[menuHandle as keyof typeof collectionMapping];

        if (!collectionHandle || menuProducts[menuHandle] || loadingProducts[menuHandle]) {
            return;
        }

        navLogger.log(`Attempting to fetch products for menu: ${menuHandle}`);
        setLoadingProducts((prev) => ({ ...prev, [menuHandle]: true }));

        try {
            const result = await fetchCollectionProducts(collectionHandle, "BEST_SELLING", false);
            if (!result.success) throw new Error(result.error || "Failed to fetch products");

            const products = result.products;
            const limitedProducts = products.slice(0, 6);
            setMenuProducts((prev) => ({ ...prev, [menuHandle]: limitedProducts }));
        } catch (error) {
            navLogger.error(`Failed to fetch products for ${menuHandle}:`, error);
            setMenuProducts((prev) => ({ ...prev, [menuHandle]: [] }));
        } finally {
            setLoadingProducts((prev) => ({ ...prev, [menuHandle]: false }));
        }
    }, [menuItemByHandle, findCollectionHandle, menuProducts, loadingProducts, navLogger]);

    const handleMenuEnter = useCallback((menuHandle: string) => {
        if (hoverTimeout) {
            clearTimeout(hoverTimeout);
            setHoverTimeout(null);
        }
        setHoveredMenu(menuHandle);
    }, [hoverTimeout]);

    const handleMenuLeave = useCallback((menuHandle: string) => {
        if (!isHoveringDropdown.current) {
            const timeout = setTimeout(() => {
                setHoveredMenu(null);
            }, 500);
            setHoverTimeout(timeout);
        }
    }, []);

    const handleDropdownEnter = useCallback(() => {
        if (hoverTimeout) {
            clearTimeout(hoverTimeout);
            setHoverTimeout(null);
        }
        isHoveringDropdown.current = true;
    }, [hoverTimeout]);

    const handleDropdownLeave = useCallback(() => {
        isHoveringDropdown.current = false;
        const timeout = setTimeout(() => {
            setHoveredMenu(null);
        }, 300);
        setHoverTimeout(timeout);
    }, []);

    useEffect(() => {
        if (!hoveredMenu) return;

        const menuItem = menuItemByHandle[hoveredMenu];
        const collectionHandle = menuItem
            ? findCollectionHandle(menuItem)
            : collectionMapping[hoveredMenu as keyof typeof collectionMapping];

        if (collectionHandle) {
            fetchMenuProducts(hoveredMenu);
        }
    }, [hoveredMenu, menuItemByHandle, findCollectionHandle, fetchMenuProducts]);

    useEffect(() => {
        return () => {
            if (hoverTimeout) clearTimeout(hoverTimeout);
        };
    }, [hoverTimeout]);

    return (
        <div className="flex flex-col items-center flex-1 mx-4">
            {/* Top row navigation */}
            <div className="flex items-center gap-6 mb-1">
                {topRowMenu.map((item) => (
                    <div
                        key={item.path}
                        className="relative"
                        onMouseEnter={() => handleMenuEnter(item.handle)}
                        onMouseLeave={() => handleMenuLeave(item.handle)}
                    >
                        <Link
                            href={item.path}
                            className="text-white hover:text-yellow-400 transition-all duration-300 text-xs font-medium tracking-wide uppercase relative group whitespace-nowrap"
                        >
                            {item.title}
                            <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-yellow-400 transition-all duration-300 group-hover:w-full"></span>
                        </Link>
                    </div>
                ))}
            </div>

            {/* Bottom row navigation */}
            <div className="flex items-center gap-6">
                {bottomRowMenu.map((item) => (
                    <div
                        key={item.path}
                        className="relative"
                        onMouseEnter={() => handleMenuEnter(item.handle)}
                        onMouseLeave={() => handleMenuLeave(item.handle)}
                    >
                        <Link
                            href={item.path}
                            className="text-white hover:text-yellow-400 transition-all duration-300 text-xs font-medium tracking-wide uppercase relative group whitespace-nowrap"
                        >
                            {item.title}
                            <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-yellow-400 transition-all duration-300 group-hover:w-full"></span>
                        </Link>
                    </div>
                ))}
            </div>

            {activeCategory && (
                <MegaMenu
                    category={activeCategory}
                    products={activeProducts}
                    isLoading={!!loadingProducts[activeCategory.id]}
                    isOpen={isMegaMenuOpen}
                    onClose={() => setHoveredMenu(null)}
                    onMouseEnter={handleDropdownEnter}
                    onMouseLeave={handleDropdownLeave}
                    locale={locale}
                />
            )}
        </div>
    );
}
