"use client";

import { useEffect, useRef } from "react";

interface TamaraWidgetProps {
  price: string;
  currencyCode: string;
  locale: "en" | "ar";
  publicKey: string;
  countryCode: "SA" | "AE" | "KW" | "BH"; // Saudi Arabia, UAE, Kuwait, Bahrain
  widgetType?: "tamara-summary" | "tamara-product-widget";
  inlineType?: "1" | "2" | "3" | "4" | "5" | "6";
  badgePosition?: "left" | "right";
}

declare global {
  interface Window {
    tamaraWidgetConfig?: {
      lang: TamaraWidgetProps["locale"];
      country: TamaraWidgetProps["countryCode"];
      publicKey: string;
      css: string;
      style: { fontSize: string; badgeRatio: number };
    };
  }
}

export function TamaraWidget({
  price,
  currencyCode,
  locale,
  publicKey,
  countryCode,
  widgetType = "tamara-summary",
  inlineType = "2",
  badgePosition = "right",
}: TamaraWidgetProps) {
  const widgetRef = useRef<HTMLDivElement>(null);

  const configuredKey = publicKey.trim();
  const validPrice = Number(price);
  const canRender = Boolean(configuredKey) && Number.isFinite(validPrice) && validPrice > 0;

  useEffect(() => {
    if (!canRender) return;
    // Set global config only once
    {
      window.tamaraWidgetConfig = {
        lang: locale,
        country: countryCode,
        publicKey: configuredKey,
        css: `:host {
          --font-primary: inherit !important;
          --font-secondary: inherit !important;
        }
        .tamara-summary-widget__amount {
          font-weight: 700 !important;
        }
        `,
        style: {
          fontSize: "14px",
          badgeRatio: 1.2,
        },
      };
    }

    // Check if Tamara script is already loaded
    const existingScript = document.querySelector(
      'script[src="https://cdn.tamara.co/widget-v2/tamara-widget.js"]'
    );

    const loadWidget = () => {
      // Widget will auto-initialize based on the custom element
      if (widgetRef.current) {
        // Force a re-render of the widget if needed
        const event = new CustomEvent("tamaraWidgetUpdate");
        window.dispatchEvent(event);
      }
    };

    if (existingScript) {
      // Script already exists, just trigger load
      loadWidget();
      return;
    } else {
      // Load the script
      const script = document.createElement("script");
      script.src = "https://cdn.tamara.co/widget-v2/tamara-widget.js";
      script.defer = true;
      script.onload = loadWidget;
      document.body.appendChild(script);

      return () => {
        // Cleanup: remove script on unmount
        if (document.body.contains(script)) {
          document.body.removeChild(script);
        }
      };
    }
  }, [locale, countryCode, configuredKey, canRender]);

  // Parse price - remove currency symbols and commas
  const cleanPrice = parseFloat(price.replace(/[^0-9.]/g, ""));

  if (!canRender) {
    return null;
  }

  const widgetHtml = `
    <tamara-widget 
      id="tamara-widget-product" 
      type="${widgetType}" 
      amount="${cleanPrice}" 
      config='{"badgePosition":"${badgePosition}","showExtraContent":""}' 
      inline-type="${inlineType}">
    </tamara-widget>
  `;

  return (
    <div 
      ref={widgetRef} 
      className="tamara-widget-container"
      dangerouslySetInnerHTML={{ __html: widgetHtml }}
    />
  );
}
