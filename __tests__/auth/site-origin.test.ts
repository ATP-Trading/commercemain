import { describe, it, expect } from 'vitest'
import { customerAccountOrigin } from '@/lib/auth/site-origin'
describe('Customer account OAuth origin', () => {
 it('keeps preview cookies and OAuth callbacks on the stable preview domain', () => {
  expect(customerAccountOrigin({ VERCEL_ENV: 'preview', VERCEL_BRANCH_URL: 'store-git-preview.vercel.app', NEXT_PUBLIC_SITE_URL: 'https://www.example.com' })).toBe('https://store-git-preview.vercel.app')
 })
 it('keeps the production domain in production', () => {
  expect(customerAccountOrigin({ VERCEL_ENV: 'production', VERCEL_BRANCH_URL: 'store-git-main.vercel.app', NEXT_PUBLIC_SITE_URL: 'https://www.example.com/' })).toBe('https://www.example.com')
 })
 it('supports an explicitly configured account origin', () => {
  expect(customerAccountOrigin({ SHOPIFY_CUSTOMER_ACCOUNT_SITE_URL: 'https://preview.example.com', VERCEL_ENV: 'preview', VERCEL_BRANCH_URL: 'store.vercel.app' })).toBe('https://preview.example.com')
 })
 it('normalizes the legacy production host, including explicit OAuth overrides', () => {
  expect(customerAccountOrigin({ VERCEL_ENV: 'production', SHOPIFY_CUSTOMER_ACCOUNT_SITE_URL: 'https://atpgroupservices.ae' })).toBe('https://www.atpgroupservices.ae')
  expect(customerAccountOrigin({ VERCEL_ENV: 'production', NEXT_PUBLIC_SITE_URL: 'https://atpgroupservices.ae' })).toBe('https://www.atpgroupservices.ae')
 })
 it('retains local development support', () => { expect(customerAccountOrigin({})).toBe('http://localhost:3000') })
 it.each(['javascript:alert(1)', 'https://user:password@example.com', 'http://example.com'])('rejects an unsafe configured URL', value => {
  expect(() => customerAccountOrigin({ SHOPIFY_CUSTOMER_ACCOUNT_SITE_URL: value })).toThrow()
 })
})
