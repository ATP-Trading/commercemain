/**
 * ATP Membership Overview Page
 * 
 * Main membership page that shows signup component and additional information.
 * Requirements: 1.1, 1.2, 1.3, 1.4
 */

import React from 'react';
import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { AtpMembershipSignup } from '@/components/membership/atp-membership-signup';

interface MembershipPageProps {
  params: {
    locale: string;
  };
}

export async function generateMetadata({ params }: MembershipPageProps): Promise<Metadata> {
  const t = await getTranslations({ locale: params.locale, namespace: 'membership' });
  
  return {
    title: `${t('title')} - ATP Trading`,
    description: t('subtitle'),
    openGraph: {
      title: `${t('title')} - ATP Trading`,
      description: t('subtitle'),
      type: 'website',
    },
  };
}

export default function MembershipPage({ params }: MembershipPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-atp-gold/10 to-atp-gold/5 py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            ATP Membership
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Join our exclusive membership program and unlock premium benefits, 
            discounts, and priority access to our wellness services.
          </p>
        </div>
      </div>

      {/* Signup Section */}
      <div className="py-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <AtpMembershipSignup 
            className="w-full"
            onSignupSuccess={() => {
              // Could redirect to success page or show confirmation
              console.log('Membership signup successful');
            }}
            onSignupError={(error: Error) => {
              // Could show error notification
              console.error('Membership signup error:', error);
            }}
          />
        </div>
      </div>

      {/* Additional Information Section */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose ATP Membership?
            </h2>
            <p className="text-lg text-gray-600">
              Our membership program is designed to provide exceptional value 
              and exclusive access to premium wellness services.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-600">15%</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Service Discounts</h3>
              <p className="text-gray-600">
                Save 15% on all premium services.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-sm font-bold text-blue-600">FREE</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Free Delivery</h3>
              <p className="text-gray-600">
                Enjoy complimentary delivery on all product orders, 
                regardless of order value or location within UAE.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-sm font-bold text-purple-600">VIP</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Priority Access</h3>
              <p className="text-gray-600">
                Get priority booking, dedicated customer support, 
                and early access to new services and products.
              </p>
            </div>
          </div>

          <div className="text-center mt-12">
            <p className="text-lg text-gray-600 mb-4">
              <strong>Annual Investment:</strong> Only 99 د.إ per year
            </p>
            <p className="text-sm text-gray-500">
              Membership pays for itself after just a few bookings. 
              Save up to 500+ د.إ annually with member benefits.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}