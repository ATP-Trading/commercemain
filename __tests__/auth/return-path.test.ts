import { describe, it, expect } from 'vitest'
import { safeReturnPath, localizedReturnPath } from '@/lib/auth/return-path'

describe('storefront return paths', () => {
  it.each(['https://outside.example', '//outside.example', '/\\outside.example', 'javascript:alert(1)', '\n//outside.example', '/a/..//outside.example', '/\t/outside.example', null, {}, 12])('rejects external or malformed destination %j', value => {
    expect(safeReturnPath(value)).toBe('/account')
  })
  it('preserves a valid path, query and fragment', () => {
    expect(safeReturnPath('/ar/account/orders?sort=recent#latest')).toBe('/ar/account/orders?sort=recent#latest')
  })
  it.each(['en', 'ar'])('uses %s for missing and unlocalized destinations', locale => {
    expect(localizedReturnPath(null, locale)).toBe(`/${locale}/account`)
    expect(localizedReturnPath('/account/orders?tab=1', locale)).toBe(`/${locale}/account/orders?tab=1`)
    expect(localizedReturnPath('https://outside.example', locale)).toBe(`/${locale}/account`)
  })
  it('keeps an explicitly selected supported language', () => {
    expect(localizedReturnPath('/ar/account', 'en')).toBe('/ar/account')
  })
})
