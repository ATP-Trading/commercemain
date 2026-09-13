"use client"
import { normalizeNavigationUrl, localizeNavigationPath } from "@/lib/navigation-url";

import { Dialog, Transition } from "@headlessui/react"
import Link from "next/link"
import Image from "next/image"
import { usePathname, useSearchParams } from "next/navigation"
import { Fragment, Suspense, useEffect, useMemo, useState } from "react"
import { useCustomer } from "@/hooks/use-customer"
import { LanguageSwitcher } from "@/components/language-switcher"

import { Bars3Icon, XMarkIcon, HomeIcon, UserIcon, PhoneIcon, InformationCircleIcon, ArrowRightOnRectangleIcon } from "@heroicons/react/24/outline"
import { FaFacebookF, FaInstagram, FaTiktok, FaSnapchatGhost } from "react-icons/fa"
import type { Menu, ShopifyMenuItem } from "@/lib/shopify/types"
import { useTranslations } from "next-intl"
import { useLocale } from "next-intl"
import Search, { SearchSkeleton } from "./search"

type FallbackMenuItem = {
  title: string;
  path: string;
  handle?: string;
};

type MobileMenuItem = Menu & {
  icon?: typeof HomeIcon;
};

interface MobileMenuProps {
  menuItems?: ShopifyMenuItem[];
  fallbackMenu?: FallbackMenuItem[];
}

export default function MobileMenu({ menuItems, fallbackMenu }: MobileMenuProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const t = useTranslations('navbar')
  const locale = useLocale()
  const isRTL = locale === 'ar'
  const language = locale
  const { customer, logout } = useCustomer()
  const [isOpen, setIsOpen] = useState(false)
  const openMobileMenu = () => setIsOpen(true)
  const closeMobileMenu = () => setIsOpen(false)

  const localizedMenu: MobileMenuItem[] = [
    {
      title: t('home'),
      path: `/${locale}`,
      icon: HomeIcon,
    },
    {
      title: t('atpMembership'),
      path: `/${locale}/atp-membership`,
    },
    {
      title: t('skincareSupplements'),
      path: `/${locale}/collections/skincare-supplements`,
    },
    {
      title: t('waterSoilTechnology'),
      path: `/${locale}/water-soil-technology`,
    },
    {
      title: t('aboutUs'),
      path: `/${locale}/about`,
      icon: InformationCircleIcon,
    },
    {
      title: t('contactUs'),
      path: `/${locale}/contact`,
      icon: PhoneIcon,
    },
  ]

  const normalizeMenuUrl = normalizeNavigationUrl;

  const translationKeyByHandle: Record<string, string> = {
    "atp-membership": "atpMembership",
    "skincare-supplements": "skincareSupplements",
    "skincare": "skincareSupplements",
    "supplements": "skincareSupplements",
    "water-soil-technology": "waterSoilTechnology",
    "water-technology": "waterSoilTechnology",
    "soil-technology": "waterSoilTechnology",
    "ems": "emsTraining",
    "ems-training": "emsTraining",
    "about": "aboutUs",
    "about-us": "aboutUs",
    "our-story": "aboutUs",
    "contact": "contactUs",
    "contact-us": "contactUs",
    "home": "home",
  }

  const getMenuSlug = (item: ShopifyMenuItem) => {
    const urlPath = normalizeMenuUrl(item.url)
    const cleanPath = urlPath.split("?")[0]?.split("#")[0] || ""
    const segments = cleanPath.split("/").filter(Boolean)

    if (segments[0] === "collections" && segments[1]) return segments[1]
    if (segments[0] === "products" && segments[1]) return segments[1]
    if (segments[0] === "pages" && segments[1]) return segments[1]

    if (segments.length > 0) return segments[segments.length - 1]

    const resource = item.resource
    if (resource && "handle" in resource && typeof resource.handle === "string") {
      return resource.handle
    }

    return item.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
  }

  const getMenuLabel = (item: ShopifyMenuItem) => {
    const slug = getMenuSlug(item)
    const key = translationKeyByHandle[slug]
    return key ? t(key) : item.title
  }

  const getMenuPath = (item: ShopifyMenuItem) => {
    // Map Shopify page handles to actual route paths
    const handleToRoute: Record<string, string> = {
      'about-us': '/about',
      'contact-us': '/contact',
    }

    const resource = item.resource
    if (resource?.__typename === "Collection" && "handle" in resource) {
      return `/collections/${resource.handle}`
    }
    if (resource?.__typename === "Product" && "handle" in resource) {
      return `/product/${resource.handle}`
    }
    if (resource?.__typename === "Page" && "handle" in resource) {
      const handle = resource.handle as string
      return handleToRoute[handle] || `/${handle}`
    }

    const urlPath = normalizeMenuUrl(item.url)
    if (urlPath.startsWith("/collections/")) {
      const handle = urlPath.split("/")[2]
      return handle ? `/collections/${handle}` : urlPath
    }
    if (urlPath.startsWith("/products/")) {
      const handle = urlPath.split("/")[2]
      return handle ? `/product/${handle}` : urlPath
    }
    if (urlPath.startsWith("/pages/")) {
      const handle = urlPath.split("/")[2]
      if (handle) {
        return handleToRoute[handle] || `/${handle}`
      }
      return urlPath
    }
    return urlPath || "/"
  }

  const withLocale = (path: string) => localizeNavigationPath(path, locale);

  const iconByHandle: Record<string, typeof HomeIcon> = {
    home: HomeIcon,
    about: InformationCircleIcon,
    contact: PhoneIcon,
  }

  const shopifyMenuLinks = useMemo(() => {
    if (!menuItems || menuItems.length === 0) return [] as MobileMenuItem[]

    return menuItems.map((item) => {
      const slug = getMenuSlug(item)
      return {
        title: getMenuLabel(item),
        path: withLocale(getMenuPath(item)),
        icon: iconByHandle[slug],
      }
    })
  }, [menuItems, locale, t])

  const fallbackMenuItems = useMemo(() => {
    if (fallbackMenu && fallbackMenu.length > 0) {
      return fallbackMenu.map((item) => ({
        title: item.title,
        path: item.path,
      })) as MobileMenuItem[]
    }
    return localizedMenu
  }, [fallbackMenu, localizedMenu])

  const resolvedMenu = useMemo(() => {
    if (shopifyMenuLinks.length > 0) {
      const homePath = `/${locale}`
      // Normalize paths to ensure consistent comparison (remove trailing slashes)
      const normalize = (p: string) => p.replace(/\/$/, "") || "/"
      const normalizedHomePath = normalize(homePath)

      const filtered = shopifyMenuLinks.filter((item) => normalize(item.path) !== normalizedHomePath)
      return [
        { title: t('home'), path: homePath, icon: HomeIcon },
        ...filtered,
      ]
    }
    return fallbackMenuItems
  }, [shopifyMenuLinks, fallbackMenuItems, locale, t])

  // Social media links
  const socialLinks = [
    {
      name: "Facebook",
      icon: FaFacebookF,
      href: "https://www.facebook.com/share/1B5eNBsXgW/",
      label: "Facebook",
    },
    {
      name: "Instagram",
      icon: FaInstagram,
      href: "https://www.instagram.com/atp_trading/",
      label: "Instagram",
    },
    {
      name: "TikTok",
      icon: FaTiktok,
      href: "https://www.tiktok.com/@amazing_tai_products?_t=ZS-8wTwKXjrHW8&_r=1",
      label: "TikTok",
    },
    {
      name: "Snapchat",
      icon: FaSnapchatGhost,
      href: "https://snapchat.com/t/BadLbnDX",
      label: "Snapchat",
    },
  ]

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsOpen(false)
      }
    }
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [isOpen])

  useEffect(() => {
    setIsOpen(false)
  }, [pathname, searchParams])

  return (
    <div className={isRTL ? "font-arabic" : ""}>
      <button
        onClick={openMobileMenu}
        aria-label={t('openMenu')}
        className="flex h-11 w-11 items-center justify-center rounded-md border border-gray-600 bg-transparent text-white hover:bg-gray-800 hover:border-yellow-400 transition-all duration-300 md:hidden touch-target"
      >
        <Bars3Icon className="h-5 w-5" />
      </button>
      <Transition show={isOpen}>
        <Dialog onClose={closeMobileMenu} className="relative z-50">
          <Transition.Child
            as={Fragment}
            enter="transition-all ease-in-out duration-300"
            enterFrom="opacity-0 backdrop-blur-none"
            enterTo="opacity-100 backdrop-blur-[.5px]"
            leave="transition-all ease-in-out duration-200"
            leaveFrom="opacity-100 backdrop-blur-[.5px]"
            leaveTo="opacity-0 backdrop-blur-none"
          >
            <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
          </Transition.Child>
          <Transition.Child
            as={Fragment}
            enter="transition-all ease-in-out duration-300"
            enterFrom={isRTL ? "translate-x-[100%]" : "translate-x-[-100%]"}
            enterTo="translate-x-0"
            leave="transition-all ease-in-out duration-200"
            leaveFrom="translate-x-0"
            leaveTo={isRTL ? "translate-x-[100%]" : "translate-x-[-100%]"}
          >
            <Dialog.Panel
              className={`fixed bottom-0 top-0 flex h-full w-full flex-col bg-gradient-to-b from-black via-gray-900 to-black pb-6 ${isRTL ? "right-0 left-0" : "left-0 right-0"
                }`}
            >
              <div className={`flex flex-col h-full ${isRTL ? "text-right" : ""}`}>
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-800">
                  <div className="flex items-center gap-3">
                    <div className="relative w-8 h-8 flex items-center justify-center">
                      <Image
                        src="/images/atp_logo-removebg-preview.png"
                        alt="ATP Trading"
                        width={32}
                        height={32}
                        className="object-contain filter brightness-0 invert"
                        priority
                      />
                    </div>
                    <span className="text-white font-semibold text-lg">{t('menu')}</span>
                  </div>
                  <button
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-600 text-white hover:bg-gray-800 hover:border-yellow-400 transition-all duration-300"
                    onClick={closeMobileMenu}
                    aria-label={isRTL ? 'إغلاق القائمة' : 'Close menu'}
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>

                {/* Search */}
                <div className="p-6 border-b border-gray-800">
                  <Suspense fallback={<SearchSkeleton />}>
                    <Search />
                  </Suspense>
                </div>

                {/* Navigation Menu */}
                <div className="flex-1 overflow-y-auto">
                  <div className="p-6">
                    {resolvedMenu.length ? (
                      <ul className={`space-y-2 ${isRTL ? "text-right" : ""}`}>
                        {resolvedMenu.map((item: any) => {
                          const IconComponent = item.icon;
                          return (
                            <li key={item.path}>
                              <Link
                                href={item.path}
                                onClick={closeMobileMenu}
                                className="flex items-center gap-4 p-4 rounded-xl text-white hover:bg-gradient-to-r hover:from-yellow-400/10 hover:to-yellow-500/10 hover:text-yellow-400 transition-all duration-300 group border border-transparent hover:border-yellow-400/20 touch-target"
                              >
                                {IconComponent && (
                                  <IconComponent className="h-5 w-5 text-gray-400 group-hover:text-yellow-400 transition-colors duration-300" />
                                )}
                                <span className="text-lg font-medium">{item.title}</span>
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    ) : null}

                    {/* Login/Account Section */}
                    <div className="mt-8 pt-6 border-t border-gray-800">
                      {customer ? (
                        <div className="space-y-2">
                          <Link
                            href={`/${locale}/account`}
                            onClick={closeMobileMenu}
                            className="flex items-center gap-4 p-4 rounded-xl text-white hover:bg-gradient-to-r hover:from-yellow-400/10 hover:to-yellow-500/10 hover:text-yellow-400 transition-all duration-300 group border border-transparent hover:border-yellow-400/20 touch-target"
                          >
                            <UserIcon className="h-5 w-5 text-gray-400 group-hover:text-yellow-400 transition-colors duration-300" />
                            <span className="text-lg font-medium">{t('account')}</span>
                          </Link>
                          <button
                            onClick={() => {
                              logout();
                              closeMobileMenu();
                            }}
                            className="flex items-center gap-4 p-4 rounded-xl text-white hover:bg-gradient-to-r hover:from-red-400/10 hover:to-red-500/10 hover:text-red-400 transition-all duration-300 group border border-transparent hover:border-red-400/20 w-full touch-target"
                          >
                            <ArrowRightOnRectangleIcon className="h-5 w-5 text-gray-400 group-hover:text-red-400 transition-colors duration-300" />
                            <span className="text-lg font-medium">{t('signOut')}</span>
                          </button>
                        </div>
                      ) : (
                        <Link
                          href={`/${locale}/login`}
                          onClick={closeMobileMenu}
                          className="flex items-center gap-4 p-4 rounded-xl text-white hover:bg-gradient-to-r hover:from-yellow-400/10 hover:to-yellow-500/10 hover:text-yellow-400 transition-all duration-300 group border border-transparent hover:border-yellow-400/20 touch-target"
                        >
                          <UserIcon className="h-5 w-5 text-gray-400 group-hover:text-yellow-400 transition-colors duration-300" />
                          <span className="text-lg font-medium">{t('signIn')}</span>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer with Language Switcher and Social Media */}
                <div className="p-6 border-t border-gray-800 space-y-6">
                  {/* Language Switcher */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">
                      {t('switchLanguage')}
                    </h3>
                    <LanguageSwitcher variant="mobile" />
                  </div>

                  {/* Social Media */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">
                      {t('followUs')}
                    </h3>
                    <div className={`flex gap-3 ${isRTL ? "flex-row-reverse" : ""}`}>
                      {socialLinks.map((social) => {
                        const IconComponent = social.icon;
                        return (
                          <a
                            key={social.name}
                            href={social.href}
                            className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-800 text-gray-400 hover:bg-yellow-400 hover:text-black transition-all duration-300 hover:scale-110"
                            aria-label={social.label}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <IconComponent className="w-5 h-5" />
                          </a>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </Dialog>
      </Transition>
    </div>
  )
}
