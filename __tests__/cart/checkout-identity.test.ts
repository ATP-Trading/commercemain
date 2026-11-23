// @vitest-environment node
import {beforeEach, expect, it, vi} from 'vitest'
const m=vi.hoisted(()=>({getCart:vi.fn(),sync:vi.fn(),token:vi.fn(),consent:vi.fn()}))
vi.mock('@/lib/shopify/server',()=>({getCart:m.getCart,updateCartBuyerIdentity:m.sync,getConsentedCheckoutUrl:m.consent}))
vi.mock('@/lib/shopify/customer-account-oauth',()=>({getValidAccessToken:m.token}))
vi.mock('@/lib/cart/session-cart',()=>({cartForSession:async(c:unknown)=>c}))
vi.mock('next-intl/server',()=>({getLocale:async()=> 'ar'}))
vi.mock('next/cache',()=>({updateTag:vi.fn()}))
vi.mock('next/navigation',()=>({redirect:vi.fn()}))
import {getCheckoutUrl} from '@/components/cart/actions'
const guest={id:'cart',checkoutUrl:'https://example.com/checkout',lines:[]}
beforeEach(()=>{vi.resetAllMocks();m.getCart.mockResolvedValue(guest);m.token.mockResolvedValue('session');})
it.each(['error','missing-cart','missing-buyer','network'])('blocks checkout when identity sync fails: %s',async kind=>{
 if(kind==='network')m.sync.mockRejectedValue(new Error('network'))
 else m.sync.mockResolvedValue({userErrors:kind==='error'?[{message:'invalid'}]:[],cart:kind==='missing-cart'?null:guest})
 await expect(getCheckoutUrl({analytics:false})).rejects.toThrow()
 expect(m.consent).not.toHaveBeenCalled()
})
it('requires sign-in when a customer cart outlives its session',async()=>{
 m.token.mockResolvedValue(null);m.getCart.mockResolvedValue({...guest,buyerIdentity:{customer:{id:'customer'}}})
 await expect(getCheckoutUrl()).rejects.toThrow('verification')
 expect(m.sync).not.toHaveBeenCalled()
})
it('uses Shopify verified customer checkout',async()=>{
 m.sync.mockResolvedValue({userErrors:[],cart:{...guest,checkoutUrl:'https://example.com/verified',buyerIdentity:{customer:{id:'customer'}}}})
 expect(await getCheckoutUrl()).toContain('/verified')
 expect(m.sync).toHaveBeenCalledWith({customerAccessToken:'session'})
})
it('allows ordinary guests',async()=>{
 m.token.mockResolvedValue(null)
 expect(await getCheckoutUrl()).toContain('/checkout')
 expect(m.sync).not.toHaveBeenCalled()
})
