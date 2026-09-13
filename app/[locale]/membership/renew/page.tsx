/**
 * Membership Renewal Page
 * 
 * Complete membership renewal flow with payment processing
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5 - Complete renewal system
 */

import React from 'react';
import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { MembershipRenewalFlow } from './membership-renewal-flow';

interface RenewalPageProps {
  params: Promise<{
    locale: string;
  }>;
  searchParams: Promise<{
    membershipId?: string;
    customerId?: string;
  }>;
}

export async function generateMetadata({ params }: RenewalPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'membership.renewal' });
  
  return {
    title: t('meta.title'),
    description: t('meta.description'),
  };
}

export default async function RenewalPage({ params, searchParams }: RenewalPageProps) {
  const { locale } = await params;
  const { membershipId, customerId } = await searchParams;
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <MembershipRenewalFlow
          membershipId={membershipId}
          customerId={customerId}
          locale={locale}
        />
      </div>
    </div>
  );
}