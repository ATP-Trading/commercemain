import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { sorting } from '@/lib/constants';
vi.mock('next-intl', () => ({ useLocale: () => 'ar' }));
vi.mock('next/navigation', () => ({ useSearchParams: () => new URLSearchParams('q=soap&sort=price-asc') }));
import SearchLayoutClient from '@/app/[locale]/search/search-layout-client';
afterEach(cleanup);
describe('Arabic search journey', () => {
 it('submits an editable query and selected sort to the Arabic search route', () => {
  render(<SearchLayoutClient sorting={sorting}><div>collections</div><div>results</div></SearchLayoutClient>);
  const input = screen.getByRole('searchbox') as HTMLInputElement;
  expect(input.value).toBe('soap');
  expect(input.form?.getAttribute('action')).toBe('/ar/search');
  expect(input.name).toBe('q');
  const select = screen.getByRole('combobox') as HTMLSelectElement;
  expect(select.value).toBe('price-asc');
  expect(select.name).toBe('sort');
  expect(screen.getByRole('button', { name: 'بحث' }).getAttribute('type')).toBe('submit');
  expect(screen.queryByText('Member Exclusive')).toBeNull();
 });
});
