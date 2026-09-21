import type { FullConfig } from '@playwright/test';

export default async function globalSetup(config: FullConfig) {
  const target = process.env.TEST_BASE_URL;
  if (!target) throw new Error('Set TEST_BASE_URL explicitly to an authorized test deployment. No server is started automatically.');
  const url = new URL(target);
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.search || url.hash) {
    throw new Error('TEST_BASE_URL must be an HTTP(S) URL without credentials, query tokens or fragments.');
  }
  if (url.pathname !== '/') throw new Error('TEST_BASE_URL must name the deployment origin, not a route.');
  if (config.projects.some(project => project.use.baseURL !== target)) throw new Error('All smoke projects must use the explicitly authorized TEST_BASE_URL.');
  // No fake customer/localStorage state, merchant requests or test-data writes.
}
