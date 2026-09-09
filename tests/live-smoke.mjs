import { chromium } from 'playwright';

const base = process.env.BASE_URL || 'https://build-flowhq2.vercel.app';
const stamp = Date.now();
const marker = `E2E-${stamp}`;
const email = `buildflow.e2e.${stamp}@example.com`;
const password = `BuildFlow!${String(stamp).slice(-8)}`;
const company = `BuildFlow E2E ${stamp}`;
const failures = [];
const consoleErrors = [];
const apiFailures = [];

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
const page = await context.newPage();
page.on('pageerror', err => failures.push(`pageerror: ${err.message}`));
page.on('console', msg => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
page.on('response', r => { if (r.url().startsWith(base) && r.status() >= 400 && !r.url().includes('/api/ai')) apiFailures.push(`${r.status()} ${r.request().method()} ${r.url()}`); });

async function snap(name){ await page.screenshot({ path:`test-results/${name}.png`, fullPage:true }); }
async function nav(name){ await page.getByRole('button',{name:new RegExp(`^${name.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}$`,'i')}).first().click(); await page.waitForTimeout(180); }
async function clickButton(rx){ const b=page.getByRole('button',{name:rx}).last(); await b.waitFor({state:'visible',timeout:5000}); await b.click(); await page.waitForTimeout(120); }
async function fillLabel(rx,value){ const label=page.getByLabel(rx).last(); await label.waitFor({state:'visible',timeout:5000}); const tag=await label.evaluate(el=>el.tagName.toLowerCase()); if(tag==='select'){const opts=await label.locator('option').allTextContents(); const wanted=opts.find(x=>x.trim()&&x.toLowerCase()!=='select'); if(wanted) await label.selectOption({label:wanted});} else await label.fill(value); }
async function waitSaved(){ await page.waitForTimeout(900); const txt=await page.locator('.sidefoot').innerText().catch(()=> ''); if(/save failed/i.test(txt)) throw new Error('Workspace autosave failed'); }
async function expectText(text){ await page.getByText(text,{exact:false}).first().waitFor({state:'visible',timeout:7000}); }

try{
 console.log(`TEST base=${base}`);
 await page.goto(base,{waitUntil:'networkidle',timeout:60000});
 if(!page.url().includes('/login')) throw new Error(`Expected /login, got ${page.url()}`);
 console.log('PASS unauthenticated redirect');

 await clickButton(/New to BuildFlow\? Create a company/i);
 await fillLabel(/Company name/i,company); await fillLabel(/^Email$/i,email); await fillLabel(/^Password$/i,password);
 await clickButton(/Create Company/i); await expectText('Account created'); console.log('PASS signup');
 await fillLabel(/^Email$/i,email); await fillLabel(/^Password$/i,password); await clickButton(/^Sign In$/i);
 await page.waitForURL(url=>!url.pathname.includes('/login'),{timeout:30000}); await page.waitForLoadState('networkidle');
 await expectText('BuildFlow'); console.log('PASS sign in/workspace');

 // Customer create
 await nav('Customers'); await clickButton(/Add Customer/i);
 await fillLabel(/^Name$/i,`${marker} Customer`); await fillLabel(/Phone/i,'9895550101'); await fillLabel(/Email/i,`customer.${stamp}@example.com`); await fillLabel(/Address/i,'123 Test Street');
 await clickButton(/Save Customer|Add Customer|Create Customer/i); await expectText(`${marker} Customer`); await waitSaved(); console.log('PASS customer create/save');

 // Project create
 await nav('Projects'); await clickButton(/New Project/i);
 const projectLabels=(await page.locator('main label:visible').allTextContents()).map(x=>x.trim()); console.log(`PROJECT labels=${JSON.stringify(projectLabels)}`);
 await fillLabel(/Customer/i,`${marker} Customer`); await fillLabel(/Project|Name/i,`${marker} Remodel`);
 const amountField=page.getByLabel(/Amount|Value|Price/i).last(); if(await amountField.count()) await amountField.fill('12500');
 const statusField=page.getByLabel(/Status/i).last(); if(await statusField.count()){const opts=await statusField.locator('option').allTextContents(); if(opts.includes('In Progress')) await statusField.selectOption({label:'In Progress'});}
 await clickButton(/Save Project|Add Project|Create Project/i); await expectText(`${marker} Remodel`); await waitSaved(); console.log('PASS project create/save');

 // Invoice create + status update
 await nav('Invoices'); await clickButton(/New Invoice/i);
 const invoiceLabels=(await page.locator('main label:visible').allTextContents()).map(x=>x.trim()); console.log(`INVOICE labels=${JSON.stringify(invoiceLabels)}`);
 await fillLabel(/Customer/i,`${marker} Customer`); await fillLabel(/Project/i,`${marker} Remodel`); await fillLabel(/Amount/i,'3200');
 await clickButton(/Save Invoice|Add Invoice|Create Invoice/i); await expectText(`${marker} Customer`); await clickButton(/Mark Paid/i); await waitSaved(); console.log('PASS invoice create/status/save');

 // Receipt create
 await nav('Receipts'); await clickButton(/Add Receipt/i);
 const receiptLabels=(await page.locator('main label:visible').allTextContents()).map(x=>x.trim()); console.log(`RECEIPT labels=${JSON.stringify(receiptLabels)}`);
 await fillLabel(/Merchant|Vendor/i,`${marker} Supply`); await fillLabel(/Amount/i,'425.75');
 const receiptProject=page.getByLabel(/Project/i).last(); if(await receiptProject.count()) await receiptProject.fill(`${marker} Remodel`);
 const category=page.getByLabel(/Category/i).last(); if(await category.count()) await category.fill('Materials');
 const receiptDate=page.getByLabel(/Date/i).last(); if(await receiptDate.count()) await receiptDate.fill('2026-09-09');
 await clickButton(/Save Receipt|Add Receipt|Create Receipt/i); await expectText(`${marker} Supply`); await waitSaved(); console.log('PASS receipt create/save');

 // Schedule create
 await nav('Schedule'); await clickButton(/Add Schedule Item/i);
 const scheduleLabels=(await page.locator('main label:visible').allTextContents()).map(x=>x.trim()); console.log(`SCHEDULE labels=${JSON.stringify(scheduleLabels)}`);
 await fillLabel(/Title|Job|Project/i,`${marker} Site Visit`);
 const scCustomer=page.getByLabel(/Customer/i).last(); if(await scCustomer.count()) await scCustomer.fill(`${marker} Customer`);
 const scDate=page.getByLabel(/Date/i).last(); if(await scDate.count()) await scDate.fill('2026-09-10');
 const scTime=page.getByLabel(/Time/i).last(); if(await scTime.count()) await scTime.fill('09:00');
 const scCrew=page.getByLabel(/Crew/i).last(); if(await scCrew.count()) await scCrew.fill('Crew A');
 await clickButton(/Save Schedule|Save Item|Add Schedule|Create/i); await expectText(`${marker} Site Visit`); await waitSaved(); console.log('PASS schedule create/save');

 // Employee create
 await nav('Employees'); await clickButton(/Add Employee/i);
 await fillLabel(/^Name$/i,`${marker} Worker`); const role=page.getByLabel(/Role/i).last(); if(await role.count()) await role.fill('Carpenter'); const empPhone=page.getByLabel(/Phone/i).last(); if(await empPhone.count()) await empPhone.fill('9895550102'); const rate=page.getByLabel(/Rate/i).last(); if(await rate.count()) await rate.fill('28');
 await clickButton(/Save Employee|Add Employee|Create Employee/i); await expectText(`${marker} Worker`); await waitSaved(); console.log('PASS employee create/save');

 // Payroll create
 await nav('Payroll'); await clickButton(/New Pay Record/i);
 const payrollLabels=(await page.locator('main label:visible').allTextContents()).map(x=>x.trim()); console.log(`PAYROLL labels=${JSON.stringify(payrollLabels)}`);
 const employee=page.getByLabel(/Employee/i).last(); if(await employee.count()){const tag=await employee.evaluate(el=>el.tagName.toLowerCase()); if(tag==='select'){const opts=await employee.locator('option').allTextContents(); const opt=opts.find(x=>x.includes(marker)); if(opt) await employee.selectOption({label:opt});} else await employee.fill(`${marker} Worker`);}
 const hours=page.getByLabel(/Hours/i).last(); if(await hours.count()) await hours.fill('40'); const payRate=page.getByLabel(/Rate/i).last(); if(await payRate.count()) await payRate.fill('28');
 await clickButton(/Save Pay|Add Pay|Create Pay|Record Payroll/i); await expectText(`${marker} Worker`); await waitSaved(); console.log('PASS payroll record/save');

 // Document record
 await nav('Documents'); await clickButton(/Add Document Record/i);
 const docLabels=(await page.locator('main label:visible').allTextContents()).map(x=>x.trim()); console.log(`DOCUMENT labels=${JSON.stringify(docLabels)}`);
 await fillLabel(/Name|Document/i,`${marker} Scope Notes`); const cat=page.getByLabel(/Category|Type/i).last(); if(await cat.count()) await cat.fill('Project'); const docProject=page.getByLabel(/Project/i).last(); if(await docProject.count()) await docProject.fill(`${marker} Remodel`); const notes=page.getByLabel(/Notes/i).last(); if(await notes.count()) await notes.fill('Launch readiness test document');
 await clickButton(/Save Document|Add Document|Create Document/i); await expectText(`${marker} Scope Notes`); await waitSaved(); console.log('PASS document create/save');

 // Notes
 await nav('Notes'); const note=page.getByPlaceholder('Add a note...'); await note.fill(`${marker} Owner note`); await note.press('Enter'); await expectText(`${marker} Owner note`); await waitSaved(); console.log('PASS note create/save');

 // Settings
 await nav('Settings'); const settingsLabels=(await page.locator('main label:visible').allTextContents()).map(x=>x.trim()); console.log(`SETTINGS labels=${JSON.stringify(settingsLabels)}`);
 const business=page.getByLabel(/Business|Company.*Name/i).last(); if(await business.count()) await business.fill(`${marker} Construction`); const settingsPhone=page.getByLabel(/Phone/i).last(); if(await settingsPhone.count()) await settingsPhone.fill('9895550199');
 await clickButton(/Save Company Settings/i); await waitSaved(); console.log('PASS settings save');

 // AI endpoint must at least return a structured response or explicit configuration error; live configured AI is preferred.
 const aiResult=await page.evaluate(async()=>{const r=await fetch('/api/ai',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({mode:'estimate',input:'Customer: E2E\nProject: Test repair\nDescription: Replace 8 feet of damaged baseboard and paint to match.'})}); return {status:r.status,body:await r.text()};});
 console.log(`AI status=${aiResult.status} body=${aiResult.body.slice(0,300)}`);
 if(aiResult.status!==200) throw new Error(`Live AI endpoint failed with ${aiResult.status}: ${aiResult.body.slice(0,200)}`);
 console.log('PASS live AI endpoint');

 // Reload and verify cloud persistence of multiple records
 await page.reload({waitUntil:'networkidle'}); await expectText(`${marker} Construction`);
 await nav('Customers'); await expectText(`${marker} Customer`); await nav('Projects'); await expectText(`${marker} Remodel`); await nav('Employees'); await expectText(`${marker} Worker`); await nav('Documents'); await expectText(`${marker} Scope Notes`);
 console.log('PASS persistence after reload');

 await snap('production-deep-final');
}catch(err){ failures.push(err?.stack||String(err)); try{await snap('production-deep-failure')}catch{} }
finally{ await browser.close(); }

for(const e of consoleErrors) console.log(`CONSOLE_ERROR ${e}`);
for(const e of apiFailures) console.log(`HTTP_FAILURE ${e}`);
if(consoleErrors.some(x=>!/favicon|hydration/i.test(x))) failures.push(...consoleErrors.map(x=>`console: ${x}`));
if(apiFailures.length) failures.push(...apiFailures.map(x=>`http: ${x}`));
if(failures.length){console.error('\nDEEP TEST FAILED'); failures.forEach(x=>console.error(x)); process.exit(1);}
console.log('\nDEEP TEST PASSED');
