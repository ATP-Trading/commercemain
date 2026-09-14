import { canonicalCollectionHandle } from "@/lib/collection-handle";
import { InactiveServicePage, inactiveServiceMetadata } from "@/components/inactive-service-page";
import { isEmsPromotion } from "@/lib/publication-policy";
import { Suspense } from "react";
import { notFound, permanentRedirect } from "next/navigation";
import { getCollection, getCollectionProducts } from "@/lib/shopify/server";
import { defaultSort, sorting } from "@/lib/constants";
import CollectionHero from "@/components/collection/collection-hero";
import CollectionPageClient from "@/components/collections/collection-page-client";
import { CollectionPageSkeleton } from "@/components/product/product-card-skeleton";
import type { Metadata } from "next";

export async function generateMetadata(props: {
    params: Promise<{ handle: string; locale: string }>;
}): Promise<Metadata> {
    const params = await props.params;
    const canonicalHandle = canonicalCollectionHandle(params.handle);
  if (isEmsPromotion(params.handle)) return inactiveServiceMetadata(params.locale, `/collections/${params.handle}`);
    const localeForApi = params.locale === 'ar'
        ? { language: 'AR', country: 'AE' }
        : { language: 'EN', country: 'AE' };
    
    const collection = await getCollection(canonicalHandle, localeForApi);
    
    if (!collection) {
        notFound();
    }

    const seoTitle = collection.seo?.title;
    const title = params.locale === 'ar' && !/\p{Script=Arabic}/u.test(seoTitle || '')
        ? collection.title
        : seoTitle || collection.title;
    const description = collection.description || (params.locale === 'ar'
        ? `تسوّق ${collection.title} لدى ATP Trading`
        : `Shop ${collection.title} at ATP Trading`);

    return {
        alternates: { canonical: `/${params.locale}/collections/${canonicalHandle}`, languages: { en: `/en/collections/${canonicalHandle}`, ar: `/ar/collections/${canonicalHandle}` } },
        title,
        description,
        openGraph: {
            title: collection.title,
            description,
            images: collection.image ? [{ url: collection.image.url }] : [],
        },
    };
}

export default async function CollectionPage(props: {
    params: Promise<{ handle: string; locale: string }>;
    searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const searchParams = (await props.searchParams) || {};
    const params = await props.params;
    const canonicalHandle = canonicalCollectionHandle(params.handle);
  if (isEmsPromotion(params.handle)) return <InactiveServicePage locale={params.locale} />;

    if (canonicalHandle !== params.handle) {
        const query = new URLSearchParams();
        for (const [key, value] of Object.entries(searchParams)) {
            if (Array.isArray(value)) value.forEach(item => query.append(key, item));
            else if (value !== undefined) query.set(key, value);
        }
        permanentRedirect(`/${params.locale}/collections/${canonicalHandle}${query.size ? `?${query}` : ''}`);
    }

    const { sort } = searchParams as { [key: string]: string };
    const { sortKey, reverse } =
        sorting.find((item) => item.slug === sort) || defaultSort;

    const localeForApi = params.locale === 'ar'
        ? { language: 'AR', country: 'AE' }
        : { language: 'EN', country: 'AE' };

    const [products, collection] = await Promise.all([
        getCollectionProducts({
            collection: canonicalHandle,
            sortKey,
            reverse,
            locale: localeForApi,
        }),
        getCollection(canonicalHandle, localeForApi),
    ]);

    if (!collection) {
        notFound();
    }

    const isRTL = params.locale === 'ar';

    // Hero image from Shopify collection, with fallback
    const heroImage = collection.image ? {
        src: collection.image.url,
        alt: collection.image.altText || collection.title,
        mobileSrc: collection.image.url,
    } : {
        src: "/skincare-hero-banner.jpg",
        alt: collection.title,
        mobileSrc: "/skincare-hero-banner.jpg",
    };

    return (
        <>
            {/* Collection Hero - uses Shopify collection image */}
            <CollectionHero
                title={collection.title}
                subtitle={isRTL ? "مجموعة متميزة" : "Premium Collection"}
                description={collection.description}
                image={heroImage}
                isRTL={isRTL}
            />

            {/* Client component for stats and animated product grid */}
            <Suspense fallback={<CollectionPageSkeleton isRTL={isRTL} />}>
                <CollectionPageClient
                    collection={{
                        title: collection.title,
                        description: collection.description,
                        handle: collection.handle,
                    }}
                    products={products}
                    locale={params.locale as "en" | "ar"}
                />
            </Suspense>
        </>
    );
}
