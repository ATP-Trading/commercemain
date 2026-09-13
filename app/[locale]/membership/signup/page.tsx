/**
 * ATP Membership Signup Page
 * 
 * Dedicated page for ATP membership signup with full component display.
 * Requirements: 1.2, 1.3, 1.4, 2.1, 2.2
 */

import React from 'react';
import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { AtpMembershipSignup } from '@/components/membership/atp-membership-signup';

interface MembershipSignupPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: MembershipSignupPageProps): Promise<Metadata> {
  const { locale } = await params;
  const isArabic = locale === 'ar';
  
  const title = isArabic
    ? 'انضم إلى عضوية ATP | ATP Trading'
    : 'Join ATP Membership | ATP Trading';
  
  const description = isArabic
    ? 'انضم إلى عضوية ATP واستمتع بخصومات حصرية بنسبة 15% وتوصيل مجاني وفوائد حصرية للأعضاء. فقط 99 درهم سنوياً.'
    : 'Join ATP Membership and enjoy exclusive 15% discounts, free delivery, and exclusive member benefits. Only 99 AED per year.';
  
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      locale: isArabic ? 'ar_AE' : 'en_AE',
    },
    alternates: {
      canonical: `/${locale}/membership/signup`,
      languages: {
        en: '/en/membership/signup',
        ar: '/ar/membership/signup',
      },
    },
  };
}

export default async function MembershipSignupPage({ params }: MembershipSignupPageProps) {
  const { locale } = await params;
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <AtpMembershipSignup 
          className="w-full"
          onSignupSuccess={() => {
            // Could add analytics tracking here
            console.log('Membership signup successful');
          }}
          onSignupError={(error: Error) => {
            // Could add error tracking here
            console.error('Membership signup error:', error);
          }}
        />
      </div>
    </div>
  );
}