import React from 'react'
import { beforeEach, afterEach, expect, it, vi } from 'vitest'
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react'
vi.mock('next-intl', () => ({ useLocale: () => 'ar' }))
vi.mock('@/src/i18n/navigation', () => ({ Link: ({ children, ...props }: any) => <a {...props}>{children}</a> }))
import { OrdersList } from '@/components/account/orders-list'
import { AddressesManager } from '@/components/account/addresses-manager'
const order = (id: string) => ({ id, name: '#'+id, processedAt: '2026-09-01', financialStatus: 'PAID', fulfillmentStatus: 'UNFULFILLED', statusPageUrl: 'https://example.com/order/'+id, totalPrice: { amount: '100', currencyCode: 'AED' }, lineItems: { nodes: [{ title: 'Coffee', quantity: 1 }], pageInfo: { hasNextPage: false } } })
const respond = (body: any, ok=true) => ({ ok, status: ok ? 200 : 502, json: async () => body })
beforeEach(() => vi.stubGlobal('fetch', vi.fn()))
afterEach(() => { cleanup(); vi.unstubAllGlobals() })
it('loads older orders without losing existing orders and uses actual status links', async () => {
 vi.mocked(fetch).mockResolvedValueOnce(respond({ nodes: [order('2')], pageInfo: { hasNextPage: true, endCursor: 'older' } }) as any).mockResolvedValueOnce(respond({ nodes: [order('1')], pageInfo: { hasNextPage: false } }) as any)
 render(<OrdersList />)
 await screen.findByText('#2')
 fireEvent.click(screen.getByText('عرض طلبات أقدم'))
 await screen.findByText('#1')
 expect(screen.getByText('#2')).toBeInTheDocument()
 expect(fetch).toHaveBeenLastCalledWith('/api/customer/orders?after=older', { cache: 'no-store' })
 expect(screen.getAllByRole('link', { name: 'تفاصيل الطلب ومتابعته' })[0]).toHaveAttribute('href', 'https://example.com/order/2')
})
it('keeps address edits when a save fails, without claiming success', async () => {
 vi.mocked(fetch).mockResolvedValueOnce(respond({ nodes: [], pageInfo: { hasNextPage: false } }) as any).mockResolvedValueOnce(respond({}, false) as any)
 render(<AddressesManager />)
 await screen.findByText('ما عندك عناوين محفوظة حتى الآن.')
 fireEvent.click(screen.getByText('إضافة عنوان'))
 fireEvent.change(screen.getByLabelText('الاسم الأول'), { target: { value: 'سعود' } })
 fireEvent.change(screen.getByLabelText('المبنى والشارع'), { target: { value: 'Building 1' } })
 fireEvent.change(screen.getByLabelText('المدينة / المنطقة'), { target: { value: 'Dubai' } })
 fireEvent.change(screen.getByLabelText('الإمارة / المنطقة'), { target: { value: 'DU' } })
 fireEvent.change(screen.getByLabelText('رقم التواصل مع رمز الدولة (مطلوب)'), { target: { value: '+971501234567' } })
 expect(screen.getByLabelText('رقم التواصل مع رمز الدولة (مطلوب)')).toBeRequired()
 fireEvent.click(screen.getByText('حفظ العنوان'))
 await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('تعذر حفظ'))
 expect(screen.getByLabelText('الاسم الأول')).toHaveValue('سعود')
 expect(screen.queryByText('تم حفظ العنوان في حسابك.')).not.toBeInTheDocument()
})
