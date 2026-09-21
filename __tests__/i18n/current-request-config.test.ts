// @vitest-environment node
import { describe, expect, it, vi } from 'vitest';
import en from '@/messages/en.json';
import ar from '@/messages/ar.json';

type RequestLoader = (params: { requestLocale: Promise<string | undefined> }) => Promise<{
  locale: string;
  messages: unknown;
}>;
const boundary = vi.hoisted(() => ({ loader: undefined as RequestLoader | undefined }));

// Capture only Next's request-registration boundary. The application callback,
// routing configuration, locale validation and JSON catalogs are the real code.
vi.mock('next-intl/server', () => ({
  getRequestConfig: (loader: RequestLoader) => {
    boundary.loader = loader;
    return loader;
  },
}));
import '@/src/i18n/request';

async function load(requestedLocale: string | undefined) {
  if (!boundary.loader) throw new Error('The current request loader was not registered');
  return boundary.loader({ requestLocale: Promise.resolve(requestedLocale) });
}

describe('Current next-intl request configuration', () => {
  it.each([
    { locale: 'en', messages: en },
    { locale: 'ar', messages: ar },
  ])('loads the actual $locale catalog', async ({ locale, messages }) => {
    const result = await load(locale);
    expect(result.locale).toBe(locale);
    expect(result.messages).toEqual(messages);
    expect(Object.keys(result.messages as object).length).toBeGreaterThan(0);
  });

  it.each([undefined, '', 'fr', '../en'])('uses English for unsupported locale %s', async locale => {
    const result = await load(locale);
    expect(result).toEqual({ locale: 'en', messages: en });
  });

  it('does not share the requested locale between independent requests', async () => {
    const [english, arabic] = await Promise.all([load('en'), load('ar')]);
    expect(english).toEqual({ locale: 'en', messages: en });
    expect(arabic).toEqual({ locale: 'ar', messages: ar });
  });
});
