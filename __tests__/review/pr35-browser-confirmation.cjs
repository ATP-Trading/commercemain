'use strict';
const fs=require('node:fs'), path=require('node:path'), crypto=require('node:crypto'), assert=require('node:assert/strict'), ts=require('typescript');
const {chromium}=require('@playwright/test');
const previewHost='commercemain-8cm9dnt1d-atp-trading.vercel.app';
const keyPath=path.join(process.env.RUNNER_TEMP,'pr35-preview-private.pem');
const out=path.resolve('confirmation-evidence');fs.mkdirSync(out,{recursive:true});
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const clean=value=>{try{const u=new URL(value);return u.origin+u.pathname;}catch{return 'unknown';}};
let secret='';
const redact=value=>String(value).replaceAll(secret||'UNUSED_SECRET_SENTINEL','[REDACTED]').replace(/([?&](?:_vercel_share|nonce|token|code|state)=)[^\s&"']+/gi,'$1[REDACTED]').slice(0,2500);
async function receive(){
 const own=JSON.parse(fs.readFileSync('preview-public-handshake.json','utf8'));
 for(let i=0;i<48;i++){
  try{
   const r=await fetch(`https://raw.githubusercontent.com/ATP-Trading/commercemain/test/pr30-isolated-validation/__tests__/review/pr35-preview-envelope.json?run=${own.runId}&t=${Date.now()}`,{signal:AbortSignal.timeout(15000),cache:'no-store'});
   if(r.ok){const d=await r.json();if(d.runId===own.runId&&d.fingerprint===own.fingerprint){
    const raw=crypto.privateDecrypt({key:fs.readFileSync(keyPath),padding:crypto.constants.RSA_PKCS1_OAEP_PADDING,oaepHash:'sha256'},Buffer.from(d.ciphertext,'base64')).toString();
    const u=new URL(raw);assert.equal(u.hostname,previewHost);assert.equal(u.pathname,'/en/auth/login');secret=u.searchParams.get('_vercel_share');assert.ok(secret);
    console.log(`::add-mask::${secret}`);console.log(`::add-mask::${raw}`);fs.rmSync(keyPath,{force:true});return raw;
   }}
  }catch{}
  await sleep(10000);
 }
 throw new Error('No matching authorization envelope');
}
async function inspect(browser,label,origin,startUrl){
 const result={label,origin,checks:[],pageErrors:[],blockedRequests:[],emptyGuestCartInitializations:0,screenshots:[]};
 const context=await browser.newContext({viewport:{width:390,height:844},serviceWorkers:'block'});
 const page=await context.newPage();const actionIds=new Set(),pending=[];
 // Recognize only the public client reference to the audited empty-cart action.
 // No product is added, no customer identity is supplied, and no checkout is called.
 page.on('response',response=>{
  const u=new URL(response.url());
  if(u.origin!==origin||!u.pathname.endsWith('.js')||!u.pathname.includes('/_next/'))return;
  pending.push((async()=>{
   const text=await response.text().catch(()=> '');if(!text.includes('createCartAndSetCookie'))return;
   const source=ts.createSourceFile('chunk.js',text,ts.ScriptTarget.Latest,true,ts.ScriptKind.JS);
   function visit(n){
    if(ts.isCallExpression(n)&&n.arguments.length>=2&&ts.isStringLiteralLike(n.arguments[0])&&n.arguments.some(a=>ts.isStringLiteralLike(a)&&a.text==='createCartAndSetCookie'))actionIds.add(n.arguments[0].text);
    ts.forEachChild(n,visit);
   }visit(source);
  })());
 });
 await context.route('**/*',async route=>{
  const req=route.request(),u=new URL(req.url());
  if(!['GET','HEAD','OPTIONS'].includes(req.method())){
   const action=req.headers()['next-action'];
   if(req.method()==='POST'&&u.origin===origin&&action){
    await Promise.allSettled(pending);
    if(actionIds.has(action)&&req.postData()?.trim()==='[]'&&result.emptyGuestCartInitializations<4){
     result.emptyGuestCartInitializations++;return route.continue();
    }
   }
   result.blockedRequests.push({method:req.method(),url:clean(req.url()),serverAction:!!action});return route.abort();
  }
  if(u.origin===origin&&/^\/api\/auth\/(login|logout|callback)$/.test(u.pathname))return route.abort();
  if(req.isNavigationRequest()&&![new URL(origin).hostname,'vercel.com'].includes(u.hostname))return route.abort();
  return route.continue();
 });
 page.on('pageerror',e=>result.pageErrors.push({page:clean(page.url()),message:redact(e.message),stack:redact(e.stack)}));
 const check=async(name,fn)=>{try{result.checks.push({name,status:'passed',details:await fn()});}catch(e){result.checks.push({name,status:'failed',error:redact(e.message)});}};
 try{
  await page.goto(startUrl,{waitUntil:'domcontentloaded',timeout:45000});
  await page.locator('main#main-content').waitFor({state:'visible',timeout:15000});await page.waitForTimeout(1200);
  const catalogs=Object.fromEntries(['en','ar'].map(l=>[l,JSON.parse(fs.readFileSync(`messages/${l}.json`,'utf8'))]));
  for(const locale of ['en','ar']){
   await check(`${locale} mobile menu opens, shows guest login and closes`,async()=>{
    await page.goto(`${origin}/${locale}`,{waitUntil:'domcontentloaded',timeout:45000});
    await page.getByRole('button',{name:catalogs[locale].navbar.openMenu,exact:true}).click({timeout:15000});
    const close=page.getByRole('button',{name:locale==='ar'?'إغلاق القائمة':'Close menu',exact:true});
    await close.waitFor({state:'visible',timeout:10000});
    assert.ok(await page.locator(`[role="dialog"] a[href="/${locale}/login"]`).isVisible());
    const file=`${label}-${locale}-menu.png`;await page.screenshot({path:path.join(out,file)});result.screenshots.push(file);
    await close.click();await close.waitFor({state:'hidden',timeout:10000});
    const file2=`${label}-${locale}-home.png`;await page.screenshot({path:path.join(out,file2)});result.screenshots.push(file2);
    return {viewport:'390x844',open:true,guestLogin:true,closed:true};
   });
   for(const suffix of ['/atp-membership','/product/atp-membership'])await check(`${locale}${suffix} navigation`,async()=>{
    const before=result.pageErrors.length;
    const response=await page.goto(`${origin}/${locale}${suffix}`,{waitUntil:'domcontentloaded',timeout:45000});
    await page.waitForURL(`${origin}/${locale}/product/atp-membership`,{timeout:20000});
    await page.locator('main h1').first().waitFor({state:'visible',timeout:15000});await page.waitForTimeout(1200);
    return {http:response?.status(),finalPath:new URL(page.url()).pathname,heading:await page.locator('main h1').first().innerText(),newErrors:result.pageErrors.slice(before).map(e=>e.message)};
   });
  }
 }catch(e){result.harnessError=redact(e.message);}finally{await context.close();}
 result.passed=result.checks.filter(c=>c.status==='passed').length;result.failed=result.checks.filter(c=>c.status==='failed').length;
 return result;
}
(async()=>{
 let browser;const report={scope:'Guest browser confirmation. Allows only the verified zero-argument empty-cart initializer that the storefront invokes automatically. No items added, customer credentials, checkout, purchase or deployment.',results:[]};
 try{
  const url=await receive();browser=await chromium.launch({headless:true});
  report.results.push(await inspect(browser,'preview',`https://${previewHost}`,url));
  report.results.push(await inspect(browser,'production','https://www.atpgroupservices.ae','https://www.atpgroupservices.ae/en/auth/login'));
 }catch(e){report.harnessError=redact(e.message);process.exitCode=1;}finally{
  if(browser)await browser.close();fs.rmSync(keyPath,{force:true});
  fs.writeFileSync(path.join(out,'confirmation-report.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
  if(report.results.some(r=>r.failed||r.pageErrors.length||r.harnessError))process.exitCode=1;
 }
})().catch(()=>{console.error('Confirmation harness failed');process.exitCode=1;});
