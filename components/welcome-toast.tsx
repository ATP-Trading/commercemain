"use client";

import { useLocale } from "next-intl";
import { useEffect } from "react";
import { toast } from "sonner";
import { Link } from "@/src/i18n/navigation";

export function WelcomeToast() {
  const locale = useLocale();
  const isAr = locale === "ar";
  useEffect(() => {
    // ignore if screen height is too small
    if (window.innerHeight < 650) return;
    if (!document.cookie.includes("welcome-toast=2")) {
      toast(isAr ? "مرحبًا بك في ATP Trading" : "Welcome to ATP Trading", {
        id: "welcome-toast",
        duration: Number.POSITIVE_INFINITY,
        onDismiss: () => {
          document.cookie = "welcome-toast=2; max-age=31536000; path=/";
        },
        description: (
          <>
            {isAr ? "تصفح منتجاتنا المتاحة داخل الإمارات. " : "Browse our products available within the UAE. "}
            <Link
              href="/atp-membership"
              className="text-atp-gold hover:underline font-semibold"
            >
              {isAr ? "استكشف عضوية ATP" : "Explore ATP Membership"}
            </Link>{" "}

          </>
        ),
        style: {
          background: "white",
          color: "black",
          border: "1px solid #E2E8F0",
        },
      });
    }
  }, [isAr]);

  return null;
}
