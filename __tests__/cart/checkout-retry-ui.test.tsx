import {cleanup,fireEvent,render,screen} from '@testing-library/react'
import {afterEach,expect,it,vi} from 'vitest'
const m=vi.hoisted(()=>({locale:'en',checkout:vi.fn()}))
vi.mock('next-intl',()=>({useLocale:()=>m.locale}))
vi.mock('@/components/cart/actions',()=>({getCheckoutUrl:m.checkout}))
vi.mock('@/components/cart/cart-context',()=>({useCart:()=>({cart:undefined})}))
vi.mock('@/lib/analytics/cart-measurement',()=>({cartMeasurement:vi.fn()}))
vi.mock('@/lib/analytics/ga4',()=>({trackCheckoutClick:vi.fn()}))
vi.mock('@/lib/analytics/shopify-visits',()=>({shopifyCheckoutConsent:()=>({analytics:false})}))
import {CheckoutForm} from '@/components/cart/checkout-form'
afterEach(cleanup)
it.each(['ar','en'])('shows recovery and preserves cart language: %s',async locale=>{
 m.locale=locale;m.checkout.mockRejectedValue(new Error('blocked'))
 render(<CheckoutForm><button type="submit">Checkout</button></CheckoutForm>)
 fireEvent.click(screen.getByRole('button'))
 expect(await screen.findByRole('alert')).toHaveTextContent(locale==='ar'?'أعد المحاولة':'Retry')
 expect(screen.getByRole('link')).toHaveAttribute('href',`/api/auth/login?returnTo=${encodeURIComponent('/'+locale+'/cart')}`)
 fireEvent.click(screen.getByRole('button'))
 expect(await screen.findByRole('alert')).toBeInTheDocument()
})
