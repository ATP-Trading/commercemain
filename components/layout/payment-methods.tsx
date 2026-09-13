"use client";

import { useEffect, useState } from "react";
import { m, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import {
  STORE_PAYMENT_METHODS,
  getPaymentMethodsByLocale,
  type PaymentMethodConfig,
} from "@/lib/shopify/payment-methods-config";
import { getPaymentIcon } from "@/components/icons/payment-icons";

interface PaymentMethodsProps {
  className?: string;
}

export default function PaymentMethods({
  className = "",
}: PaymentMethodsProps) {
  const locale = useLocale();
  const isRTL = locale === 'ar';
  const t = useTranslations('common');
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodConfig[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Define translated messages
  const paymentMethodsText = t('weAccept');
  const paymentUnavailableText = t('paymentUnavailable');
  const cachedMethodsText = t('cachedPaymentMethods');

  useEffect(() => {
    async function fetchPaymentMethods() {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(`/api/payment-methods?locale=${locale}`);

        if (!response.ok) {
          throw new Error("Failed to fetch payment methods");
        }

        const data = await response.json();
        setPaymentMethods(data.paymentMethods || []);
      } catch (err) {
        console.error("Error fetching payment methods:", err);
        setError("Failed to load payment methods");

        // Fallback to your store's payment methods filtered by locale
        setPaymentMethods(getPaymentMethodsByLocale(locale));
      } finally {
        setIsLoading(false);
      }
    }

    fetchPaymentMethods();
  }, [locale]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.25,
        ease: [0.4, 0, 0.2, 1] as const,
      },
    },
  };

  if (isLoading) {
    return (
      <div className={className}>
        <h4 className="text-sm font-medium text-neutral-400 mb-4 text-center">
          {paymentMethodsText}
        </h4>
        <div
          className={`flex flex-wrap gap-2 justify-center ${isRTL ? "flex-row-reverse" : ""
            }`}
        >
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className="bg-neutral-700 rounded-md animate-pulse"
              style={{ width: 48, height: 30 }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (error && paymentMethods.length === 0) {
    return (
      <div className={className}>
        <h4 className="text-sm font-medium text-neutral-400 mb-4 text-center">
          {paymentMethodsText}
        </h4>
        <p className="text-xs text-neutral-500 text-center">
          {paymentUnavailableText}
        </p>
      </div>
    );
  }

  return (
    <div className={className}>
      <h4 className="text-sm font-medium text-neutral-400 mb-4 text-center">
        {paymentMethodsText}
      </h4>
      <AnimatePresence>
        <m.div
          className={`flex flex-wrap gap-2 justify-center items-center ${isRTL ? "flex-row-reverse" : ""
            }`}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {paymentMethods
            .filter((method) => method.enabled && method.iconKey)
            .map((method, index) => {
              const IconComponent = getPaymentIcon(method.iconKey);
              
              if (!IconComponent) {
                return null;
              }

              return (
                <m.div
                  key={`${method.name}-${index}`}
                  className="flex items-center justify-center hover:scale-105 transition-transform duration-200 cursor-default"
                  variants={itemVariants}
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.95 }}
                  data-payment-method={method.name}
                  title={method.name}
                >
                  <IconComponent width={48} height={30} />
                </m.div>
              );
            })}
        </m.div>
      </AnimatePresence>

      {error && (
        <p className="text-xs text-neutral-500 text-center mt-2">
          {cachedMethodsText}
        </p>
      )}
    </div>
  );
}
