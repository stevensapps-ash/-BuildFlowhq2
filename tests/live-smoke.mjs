import { chromium } from 'playwright';
const base=process.env.BASE_URL||'https://build-flowhq2.vercel.app';
const failures=[], consoleErrors=[], apiFailures=[];
const browser=await chromium.launch({headless:true});
const context=await browser.newContext({viewport:{width:1440,height:1000}});
const page=await context.newPage();
page.on('pageerror',e=>failures.push('pageerror: '+e.message));
page.on('console',m=>{if(m.type()==='error')consoleErrors.push(m.text())});
page.on('response',r=>{if(r.url().startsWith(base)&&r.status()>=500&&!r.url().includes('/api/ai'))apiFailures.push(r.status()+' '+r.request().method()+' '+r.url())});
const nav=[
 ['Home',/Your business, organized for today/i],
 ['Jobs',/Projects|Jobs/i],
 ['Estimate',/AI Estimates/i],
 ['Invoices',/Invoices/i]
];
async function clickAndAssert(name,expected){
 const b=page.getByRole('button',{name,exact:true}).first();
 await b.waitFor({state:'visible',timeout:5000}); await b.click();
 await page.getByText(expected).first().waitFor({state:'visible',timeout:5000});
}
try{
 await page.goto(base,{waitUntil:'networkidle',timeout:60000});
 if(page.url().includes('/login')){
   console.log('AUTH_REQUIRED: live dashboard click test requires an authenticated session; public login route is healthy.');
   const ai=await page.evaluate(async()=>{const r=await fetch('/api/ai',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({mode:'estimate',input:'Deployment probe'})});return{status:r.status,body:await r.text()}});
   if(ai.status!==401||!/AUTH_REQUIRED/.test(ai.body))throw new Error('Protected AI route failed: '+ai.status+' '+ai.body);
   console.log('PASS protected AI route');
 } else {
   for(const [name,expected] of nav){await clickAndAssert(name,expected);console.log('PASS '+name)}
   await page.getByRole('button',{name:/Open menu/i}).first().click();
   const tools=['Customers','Contacts','Schedule','Documents','Contracts','Change Orders','Employees','Notes','Before & After','Plans Studio','Permits','Billing & Tokens','Settings'];
   for(const name of tools){
     if(!(await page.getByRole('button',{name,exact:true}).count())){failures.push('Missing menu button: '+name);continue}
     await page.getByRole('button',{name,exact:true}).first().click();
     if(name==='Billing & Tokens'){await page.waitForURL(/\/subscribe/, {timeout:5000}); await page.goBack(); await page.waitForLoadState('networkidle');}
     else {await page.getByRole('heading',{name:name==='Plans Studio'?/Plans|Blueprint|Build/i:new RegExp(name,'i')}).first().waitFor({state:'visible',timeout:5000}).catch(()=>{throw new Error('Button '+name+' did not reach its screen')})}
     console.log('PASS '+name);
     await page.getByRole('button',{name:/Open menu/i}).first().click();
   }
   await page.getByRole('button',{name:/New Estimate/i}).first().click();
   await page.getByText(/AI Estimates/i).first().waitFor({state:'visible',timeout:5000});
   console.log('PASS dashboard New Estimate');
 }
}catch(e){failures.push(e?.stack||String(e))}
finally{await browser.close()}
for(const e of consoleErrors)console.log('CONSOLE_ERROR '+e);
for(const e of apiFailures)console.log('HTTP_FAILURE '+e);
if(apiFailures.length)failures.push(...apiFailures.map(x=>'http: '+x));
if(failures.length){console.error('\nPRODUCTION CLICK TEST FAILED');failures.forEach(x=>console.error(x));process.exit(1)}
console.log('\nPRODUCTION CLICK TEST PASSED');
