import Link from "next/link";
import { useLocale } from "next-intl";

export default function ServiceHighlights() {
  const locale = useLocale();
  const ar = locale === "ar";
  const collection = `/${locale}/collections/amazing-thai-products`;
  const linkStyle = "flex min-h-12 items-center justify-center rounded-xl border border-atp-gold px-6 py-3 text-center font-semibold hover:bg-atp-gold/10 focus-visible:outline-2";

  return (
    <nav aria-label={ar ? "تسوّق حسب الفئة" : "Shop by category"} className="mx-auto grid max-w-2xl gap-3 px-4 py-8 sm:grid-cols-2">
      <Link href={`${collection}?category=supplements`} className={linkStyle}>
        {ar ? "تسوّق المكملات" : "Shop supplements"}
      </Link>
      <Link href={`${collection}?category=skincare`} className={linkStyle}>
        {ar ? "تسوّق العناية بالبشرة" : "Shop skincare"}
      </Link>
    </nav>
  );
}
