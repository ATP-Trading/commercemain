import 'server-only';
import { shopifyFetch } from './server';
import { sitemapProductsQuery, sitemapCollectionsQuery } from './queries/sitemap';

export type SitemapResource = {
  id: string;
  handle: string;
  title: string;
  updatedAt: string;
  tags?: string[];
};
type Connection = {
  nodes: SitemapResource[];
  pageInfo: { hasNextPage: boolean; endCursor: string | null };
};
type Operation = {
  variables: { after?: string; language: 'EN' | 'AR' };
  data: { products?: Connection; collections?: Connection };
};

// Bypass demo-data fallbacks: a catalog failure must not publish invented URLs.
export async function getSitemapResources(kind: 'products' | 'collections', language: 'EN' | 'AR') {
  const resources = new Map<string, SitemapResource>();
  const cursors = new Set<string>();
  let after: string | undefined;
  while (true) {
    const { body } = await shopifyFetch<Operation>({
      query: kind === 'products' ? sitemapProductsQuery : sitemapCollectionsQuery,
      variables: { language, ...(after ? { after } : {}) },
    });
    const connection = body.data?.[kind];
    if (!connection || !Array.isArray(connection.nodes) || typeof connection.pageInfo?.hasNextPage !== 'boolean') {
      throw new Error(`Invalid sitemap ${kind} response`);
    }
    for (const node of connection.nodes) resources.set(node.id, node);
    if (!connection.pageInfo.hasNextPage) return [...resources.values()];
    const cursor = connection.pageInfo.endCursor;
    if (!cursor || cursors.has(cursor) || connection.nodes.length === 0) {
      throw new Error(`Sitemap ${kind} pagination did not advance`);
    }
    cursors.add(cursor);
    after = cursor;
  }
}
