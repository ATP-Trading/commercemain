import {beforeEach, expect, it, vi} from 'vitest';
import {act, fireEvent, render, screen, waitFor} from '@testing-library/react';
import {CheckoutForm} from '@/components/cart/checkout-form';
import {CartAnalytics} from '@/components/analytics/cart-analytics';
import {cartMeasurement} from '@/lib/analytics/cart-measurement';
import type {Cart} from '@/lib/shopify/types';
const mocks=vi.hoisted(()=>({getUrl:vi.fn(),track:vi.fn(),view:vi.fn(),allowed:vi.fn(()=>true)}));
vi.mock('@/components/cart/actions',()=>({getCheckoutUrl:mocks.getUrl}));
vi.mock('@/components/cart/cart-context',()=>({useCart:()=>({cart})}));
vi.mock('next-intl',()=>({useLocale:()=> 'en'}));
vi.mock('@/lib/analytics/shopify-visits',()=>({shopifyCheckoutConsent:()=>({analytics:false,marketing:false,preferences:false,saleOfData:false})}));
vi.mock('@/lib/analytics/ga4',()=>({trackCheckoutClick:mocks.track,trackCart:mocks.view,trackPage:vi.fn(),analyticsAllowed:mocks.allowed,CONSENT_EVENT:'atp-analytics-consent-changed'}));
const cart={lines:[{quantity:2,cost:{totalAmount:{amount:'300',currencyCode:'AED'}},merchandise:{product:{id:'gid://shopify/Product/1',title:'Sunscreen'}}}],cost:{subtotalAmount:{amount:'300',currencyCode:'AED'}}} as Cart;
beforeEach(()=>{vi.clearAllMocks();mocks.allowed.mockReturnValue(true);mocks.getUrl.mockResolvedValue('https://checkout.atpgroupservices.ae/checkouts/test');mocks.track.mockResolvedValue(undefined);});
it('uses the actual discounted cart subtotal and per-unit price',()=>{
 expect(cartMeasurement(cart)).toMatchObject({value:300,currency:'AED',items:[{price:150,quantity:2}]});
});
it('counts a cart view once, after consent, not on quantity rerenders',async()=>{
 mocks.allowed.mockReturnValue(false);
 const view=render(<CartAnalytics cart={cart}/>);
 await act(async()=>{await new Promise(r=>setTimeout(r,5));});expect(mocks.view).not.toHaveBeenCalled();
 mocks.allowed.mockReturnValue(true);
 act(()=>window.dispatchEvent(new Event('atp-analytics-consent-changed')));
 await waitFor(()=>expect(mocks.view).toHaveBeenCalledOnce());
 view.rerender(<CartAnalytics cart={{...cart,totalQuantity:3}}/>);
 await act(async()=>{await new Promise(r=>setTimeout(r,5));});expect(mocks.view).toHaveBeenCalledOnce();
});
it('does not count a failed checkout request and offers retry',async()=>{
 mocks.getUrl.mockRejectedValue(new Error('checkout unavailable'));
 render(<CheckoutForm><button type="submit">Checkout</button></CheckoutForm>);
 fireEvent.click(screen.getByRole('button',{name:'Checkout'}));
 expect(await screen.findByRole('alert')).toHaveTextContent('Could not open checkout');
 expect(mocks.track).not.toHaveBeenCalled();
});
it('navigates even when analytics fails',async()=>{
 const assign=vi.fn();Object.defineProperty(window,'location',{configurable:true,value:{assign}});
 mocks.track.mockRejectedValue(new Error('blocked analytics'));
 render(<CheckoutForm><button type="submit">Checkout</button></CheckoutForm>);
 fireEvent.click(screen.getByRole('button',{name:'Checkout'}));
 await waitFor(()=>expect(assign).toHaveBeenCalledWith('https://checkout.atpgroupservices.ae/checkouts/test'));
 expect(mocks.track).toHaveBeenCalledWith([{item_id:'gid://shopify/Product/1',item_name:'Sunscreen',price:150,quantity:2}],'AED',300);
});
