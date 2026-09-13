import { Suspense } from "react";
import { notFound } from "next/navigation";
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
    const localeForApi = params.locale === 'ar'
        ? { language: 'AR', country: 'AE' }
        : { language: 'EN', country: 'AE' };
    
    const collection = await getCollection(params.handle, localeForApi);
    
    if (!collection) {
        notFound();
    }

    return {
        alternates: { canonical: `/${params.locale}/collections/${collection.handle}` },
        title: collection.seo?.title || collection.title,
        description: collection.description || `Shop ${collection.title} at ATP Group Services`,
        openGraph: {
            title: collection.title,
            description: collection.description || `Shop ${collection.title} at ATP Group Services`,
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

    const { sort } = searchParams as { [key: string]: string };
    const { sortKey, reverse } =
        sorting.find((item) => item.slug === sort) || defaultSort;

    const localeForApi = params.locale === 'ar'
        ? { language: 'AR', country: 'AE' }
        : { language: 'EN', country: 'AE' };

    const [products, collection] = await Promise.all([
        getCollectionProducts({
            collection: params.handle,
            sortKey,
            reverse,
            locale: localeForApi,
        }),
        getCollection(params.handle, localeForApi),
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
