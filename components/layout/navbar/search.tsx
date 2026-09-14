"use client";

import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useSearchParams } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";

export default function Search() {
  const searchParams = useSearchParams();
  const t = useTranslations('navbar');
  const locale = useLocale();

  return (
    <form
      action={`/${locale}/search`}
      className="relative w-full max-w-[550px]"
    >
      <input
        key={searchParams?.get("q")}
        type="text"
        name="q"
        aria-label={t("searchProducts")}
        placeholder={t('searchProducts')}
        autoComplete="off"
        defaultValue={searchParams?.get("q") || ""}
        className="text-base min-h-12 w-full rounded-lg border bg-white ps-4 pe-12 py-2 text-black placeholder:text-neutral-500 md:text-sm dark:border-neutral-800 dark:bg-transparent dark:text-white dark:placeholder:text-neutral-400"
      />
      <div className="absolute end-0 top-0 flex h-full items-center">
        <button
          type="submit"
          aria-label={t("searchProducts")}
          className="flex h-12 w-12 items-center justify-center hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors"
        >
          <MagnifyingGlassIcon className="h-4" />
        </button>
      </div>
    </form>
  );
}

export function SearchSkeleton() {
  return (
    <form className="relative w-full max-w-[550px]">
      <input
        placeholder="..."
        className="w-full rounded-lg border bg-white px-4 py-2 text-sm text-black placeholder:text-neutral-500 dark:border-neutral-800 dark:bg-transparent dark:text-white dark:placeholder:text-neutral-400"
      />
      <div className="absolute end-0 top-0 flex h-full items-center">
        <button
          type="submit"
          className="hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors"
        >
          <MagnifyingGlassIcon className="h-4" />
        </button>
      </div>
    </form>
  );
}
