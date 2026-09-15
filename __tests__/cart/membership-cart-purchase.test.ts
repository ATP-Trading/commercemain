// @vitest-environment node
import { afterEach, expect, it, vi } from 'vitest'
const state=vi.hoisted(()=>({cartId:undefined as string|undefined,set:vi.fn()}))
vi.mock('server-only',()=>({}))
vi.mock('next-intl/server',()=>({getLocale:async()=> 'ar'}))
vi.mock('next/headers',()=>({cookies:async()=>({get:()=>state.cartId?{value:state.cartId}:undefined,set:state.set}),headers:async()=>new Headers()}))
afterEach(()=>{vi.unstubAllGlobals();vi.unstubAllEnvs();vi.restoreAllMocks();vi.resetModules();state.set.mockClear()})
for(const existing of [false,true]) it(`sends the allocated plan when ${existing?'adding to':'creating'} a cart`,async()=>{
 state.cartId=existing?'existing-cart':undefined
 vi.stubEnv('SHOPIFY_STORE_DOMAIN','test.myshopify.com');vi.stubEnv('SHOPIFY_STOREFRONT_ACCESS_TOKEN','test-only')
 vi.spyOn(console,'log').mockImplementation(()=>{})
 const requests:any[]=[]
 const cart={id:'saved-cart',checkoutUrl:'https://example.com/checkout',lines:{edges:[{node:{id:'line',quantity:1,merchandise:{id:'gid://shopify/ProductVariant/46301020094702',product:{id:'membership',handle:'atp-membership',title:'Membership'}},cost:{totalAmount:{amount:'99',currencyCode:'AED'}}}}]},cost:{totalAmount:{amount:'99',currencyCode:'AED'},subtotalAmount:{amount:'99',currencyCode:'AED'}},totalQuantity:1}
 vi.stubGlobal('fetch',vi.fn(async(_url,options)=>{
  const request=JSON.parse(options.body);requests.push(request)
  const data=request.query.includes('query VariantStock')?{node:{availableForSale:true,quantityAvailable:null,currentlyNotInStock:false}}:request.query.includes('query getCart')?{cart:{...cart,lines:{edges:[]}}}:request.query.includes('query VariantPlan')?{node:{product:{requiresSellingPlan:true},sellingPlanAllocations:{nodes:[{sellingPlan:{id:'gid://shopify/SellingPlan/123',name:'Annual'}}]}}}:existing?{cartLinesAdd:{cart,userErrors:[]}}:{cartCreate:{cart,userErrors:[]}}
  return {ok:true,status:200,headers:new Headers({'content-type':'application/json'}),json:async()=>({data})}
 }))
 const {addToCart}=await import('@/lib/shopify/server')
 await addToCart([{merchandiseId:'gid://shopify/ProductVariant/46301020094702',quantity:1}])
 const expected=[{merchandiseId:'gid://shopify/ProductVariant/46301020094702',quantity:1,sellingPlanId:'gid://shopify/SellingPlan/123'}]
 const mutation=requests.find(request=>request.query.includes(existing?'mutation cartLinesAdd':'mutation cartCreate'))
 expect(existing?mutation.variables.lines:mutation.variables.input.lines).toEqual(expected)
 expect(mutation.variables.language).toBe('AR')
 if(!existing)expect(state.set).toHaveBeenCalledWith('cartId','saved-cart')
})
