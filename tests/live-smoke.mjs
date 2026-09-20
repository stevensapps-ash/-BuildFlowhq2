import { chromium } from 'playwright';
const base=process.env.BASE_URL||'https://build-flowhq2.vercel.app';
const stamp=Date.now(),email=`buildflow.e2e.${stamp}@example.com`,password=`BuildFlow!${String(stamp).slice(-8)}`,company=`BuildFlow E2E ${stamp}`;
const failures=[],consoleErrors=[],apiFailures=[];
const browser=await chromium.launch({headless:true});const context=await browser.newContext({viewport:{width:1440,height:1000}});const page=await context.newPage();
page.on('pageerror',e=>failures.push(`pageerror: ${e.message}`));
page.on('console',m=>{if(m.type()==='error')consoleErrors.push(m.text())});
page.on('response',r=>{if(r.url().startsWith(base)&&r.status()>=500&&!r.url().includes('/api/ai'))apiFailures.push(`${r.status()} ${r.request().method()} ${r.url()}`)});
async function snap(n){await page.screenshot({path:`test-results/${n}.png`,fullPage:true})}
async function click(rx){const b=page.getByRole('button',{name:rx}).last();await b.waitFor({state:'visible',timeout:5000});await b.click()}
async function fill(rx,v){const x=page.getByLabel(rx).last();await x.waitFor({state:'visible',timeout:5000});await x.fill(v)}
try{
 await page.goto(base,{waitUntil:'networkidle',timeout:60000});
 if(!page.url().includes('/login'))throw new Error(`Expected login redirect, got ${page.url()}`);
 console.log('PASS login redirect');
 const ai=await page.evaluate(async()=>{const r=await fetch('/api/ai',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({mode:'estimate',input:'Deployment probe'})});return{status:r.status,body:await r.text()}});
 if(ai.status!==401||!/AUTH_REQUIRED/.test(ai.body))throw new Error(`Protected AI route failed: ${ai.status} ${ai.body}`);
 console.log('PASS protected AI route');
 await click(/New to Construction HQ\? Create a company/i);await fill(/Company name/i,company);await fill(/^Email$/i,email);await fill(/^Password$/i,password);await click(/Create Company/i);
 await page.waitForFunction(()=>!document.body.innerText.toLowerCase().includes('creating...'),null,{timeout:30000});
 const body=(await page.locator('body').innerText()).toLowerCase();
 if(!(/confirm|verification|check.*email|email.*sent|sign in|too many requests/.test(body)||page.url().includes('/subscribe')))throw new Error(`Signup did not reach a valid production onboarding state: ${body.slice(0,400)}`);
 console.log('PASS signup/onboarding response');
 await snap('production-smoke');
}catch(e){failures.push(e?.stack||String(e));try{await snap('production-smoke-failure')}catch{}}
finally{await browser.close()}
for(const e of consoleErrors)console.log('CONSOLE_ERROR '+e);
for(const e of apiFailures)console.log('HTTP_FAILURE '+e);
if(consoleErrors.some(x=>!/favicon|hydration|401|400|429/i.test(x)))failures.push(...consoleErrors.filter(x=>!/favicon|hydration|401|400|429/i.test(x)).map(x=>'console: '+x));
if(apiFailures.length)failures.push(...apiFailures.map(x=>'http: '+x));
if(failures.length){console.error('\nPRODUCTION SMOKE FAILED');failures.forEach(x=>console.error(x));process.exit(1)}
console.log('\nPRODUCTION SMOKE PASSED');
