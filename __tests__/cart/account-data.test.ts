import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'
const auth = vi.hoisted(() => ({ token: vi.fn(), query: vi.fn() }))
vi.mock('@/lib/shopify/customer-account-oauth', () => ({ getValidAccessToken: auth.token, queryCustomerAccountApi: auth.query }))
import { GET as orders } from '@/app/api/customer/orders/route'
import { GET as addresses, POST as save } from '@/app/api/customer/addresses/route'
const request = (body: unknown) => new NextRequest('https://example.com/api/customer/addresses', { method: 'POST', body: JSON.stringify(body) })
const address = { firstName: 'Saud', address1: 'Building 1', city: 'Dubai', territoryCode: 'AE', zoneCode: 'DU', phoneNumber: '+971501234567' }
beforeEach(() => { vi.resetAllMocks(); auth.token.mockResolvedValue('customer-session') })
describe('Authenticated account data', () => {
 it('uses only the signed-in session for paginated orders', async () => {
  auth.query.mockResolvedValue({ data: { customer: { orders: { nodes: [{ id: 'own-order' }], pageInfo: { hasNextPage: false } } } } })
  const response = await orders(new NextRequest('https://example.com/api/customer/orders?after=cursor&customerId=someone-else'))
  expect(auth.query.mock.calls[0][0]).toBe('customer-session')
  expect(auth.query.mock.calls[0][2]).toEqual({ after: 'cursor' })
  expect((await response.json()).nodes[0].id).toBe('own-order')
  expect(response.headers.get('Cache-Control')).toContain('no-store')
 })
 it('does not turn failed orders into an empty history', async () => {
  auth.query.mockResolvedValue({ errors: [{ message: 'Unavailable' }] })
  expect((await orders(new NextRequest('https://example.com/api/customer/orders'))).status).toBe(502)
 })
 it('requires authentication for orders and addresses', async () => {
  auth.token.mockResolvedValue(null)
  expect((await orders(new NextRequest('https://example.com/api/customer/orders'))).status).toBe(401)
  expect((await addresses(new NextRequest('https://example.com/api/customer/addresses'))).status).toBe(401)
  expect((await save(request({ address }))).status).toBe(401)
  expect(auth.query).not.toHaveBeenCalled()
 })
 it('saves an address with the signed-in customer and default preference', async () => {
  auth.query.mockResolvedValue({ data: { customerAddressCreate: { customerAddress: { id: 'new' }, userErrors: [] } } })
  expect((await save(request({ address, defaultAddress: true }))).status).toBe(200)
  expect(auth.query.mock.calls[0][2]).toEqual({ address, defaultAddress: true })
 })
 it('updates an existing address without changing its country or company', async () => {
  auth.query.mockResolvedValue({ data: { customerAddressUpdate: { customerAddress: { id: 'existing' }, userErrors: [] } } })
  const input = { addressId: 'existing', address: { ...address, company: 'Office' } }
  expect((await save(request(input))).status).toBe(200)
  expect(auth.query.mock.calls[0][2]).toEqual(input)
 })
 it('does not report success when Shopify rejects an address belonging to another customer', async () => {
  auth.query.mockResolvedValue({ data: { customerAddressUpdate: { customerAddress: null, userErrors: [{ field: ['addressId'], message: 'Not found' }] } } })
  expect((await save(request({ addressId: 'foreign', address }))).status).toBe(400)
 })
 it('requires confirmation from Shopify before reporting a saved address', async () => {
  auth.query.mockResolvedValue({ data: { customerAddressCreate: { customerAddress: null, userErrors: [] } } })
  expect((await save(request({ address }))).status).toBe(502)
 })
 it.each([{ address: { ...address, phoneNumber: '' } }, { address: { ...address, phoneNumber: undefined } }, { address, customerId: 'foreign' }, { address: { ...address, city: '' } }, { address: { ...address, phoneNumber: '0501234567' } }])('rejects invalid address input', async input => {
  expect((await save(request(input))).status).toBe(400)
  expect(auth.query).not.toHaveBeenCalled()
 })
})
