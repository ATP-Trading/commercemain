"use client";

import Link from "next/link";
import Image from "next/image";
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import PaymentMethods from "./payment-methods";
import { LanguageSwitcher } from "@/components/language-switcher";
import {
  FaFacebookF,
  FaInstagram,
  FaTiktok,
  FaSnapchatGhost,
} from "react-icons/fa";

const SITE_NAME = "ATP Trading";

export default function Footer() {
  const locale = useLocale();
  const isRTL = locale === 'ar';
  const t = useTranslations('common');
  
  const currentYear = new Date().getFullYear();

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
  ];

  return (
    <footer
      className={`bg-neutral-900 text-neutral-300 pb-20 md:pb-0 ${
        isRTL ? "font-arabic" : ""
      }`}
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* Main Footer Content */}
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div
          className={`grid grid-cols-1 gap-12 lg:grid-cols-4 ${
            isRTL ? "text-right" : ""
          }`}
        >
          {/* Logo and Company Info */}
          <div className="lg:col-span-1">
            <Link
              href={`/${locale}`}
              className={`flex items-center justify-center lg:justify-start text-white group mb-6`}
            >
              <div className="relative w-16 h-16 flex items-center justify-center">
                <Image
                  src="/images/atp_logo-removebg-preview.png"
                  alt="ATP Trading Logo"
                  width={64}
                  height={64}
                  className="object-contain filter brightness-0 invert hover:scale-105 transition-transform duration-200"
                />
              </div>
            </Link>
          </div>

          {/* Contact Information */}
          <div className="lg:col-span-1">
            <h3 className="text-lg font-semibold text-white mb-6">
              {t('contactUs')}
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-neutral-400 mb-1">
                  {t('email')}
                </p>
                <a
                  href="mailto:info@atpgroupservices.ae"
                  className="text-neutral-300 hover:text-white transition-colors"
                  dir="ltr"
                >
                  info@atpgroupservices.ae
                </a>
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-400 mb-1">
                  {t('whatsapp')}
                </p>
                <a
                  href="https://wa.me/971569586422"
                  className="text-neutral-300 hover:text-white transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                  dir="ltr"
                >
                  +971569586422
                </a>
              </div>
            </div>
          </div>

          {/* Social Media */}
          <div className="lg:col-span-1">
            <h3 className="text-lg font-semibold text-white mb-6">
              {t('followUs')}
            </h3>
            <div className="flex gap-4">
              {socialLinks.map((social) => {
                const IconComponent = social.icon;
                return (
                  <a
                    key={social.name}
                    href={social.href}
                    className="text-neutral-400 hover:text-white transition-all duration-300 p-3 rounded-full hover:bg-neutral-800 hover:scale-110 group"
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

          {/* Language Selector */}
          <div className="lg:col-span-1">
            <h3 className="text-lg font-semibold text-white mb-6">
              {t('language')}
            </h3>
            <div className="w-full">
              <LanguageSwitcher variant="footer" />
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="mt-16 pt-8 border-t border-neutral-800">
          <div className="flex justify-center">
            <PaymentMethods />
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-neutral-800">
        <div className="mx-auto max-w-7xl px-6 py-6 lg:px-8">
          <div
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-sm text-neutral-400"
          >
            <p>
              © {currentYear} {SITE_NAME}. {t('allRightsReserved')}.
            </p>
            <div
              className="flex items-center gap-4"
            >
              <Link
                href={`/${locale}/policies/privacy-policy`}
                className="hover:text-white transition-colors"
              >
                {t('privacyPolicy')}
              </Link>
              <Link
                href={`/${locale}/policies/refund-policy`}
                className="hover:text-white transition-colors"
              >
                {t('refundPolicy')}
              </Link>
              <Link
                href={`/${locale}/contact`}
                className="hover:text-white transition-colors"
              >
                {t('contactInformation')}
              </Link>
              <Link
                href={`/${locale}/policies/terms-of-service`}
                className="hover:text-white transition-colors"
              >
                {t('termsOfService')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
