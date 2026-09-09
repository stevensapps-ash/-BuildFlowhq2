import { chromium } from 'playwright';

const base = process.env.BASE_URL || 'https://build-flowhq2.vercel.app';
const stamp = Date.now();
const email = `buildflow.e2e.${stamp}@example.com`;
const password = `BuildFlow!${String(stamp).slice(-8)}`;
const company = `BuildFlow E2E ${stamp}`;
const sections = ['Dashboard','Projects','Customers','AI Estimates','Contracts','Change Orders','Invoices','Receipts','Schedule','Blueprints','Employees','Payroll','Documents','Notes','Settings'];
const failures = [];
const consoleErrors = [];
const apiFailures = [];

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
const page = await context.newPage();

page.on('pageerror', err => failures.push(`pageerror: ${err.message}`));
page.on('console', msg => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
page.on('response', r => {
  if (r.url().startsWith(base) && r.status() >= 400) apiFailures.push(`${r.status()} ${r.request().method()} ${r.url()}`);
});

async function snap(name){
  await page.screenshot({ path: `test-results/${name}.png`, fullPage: true });
}

try {
  console.log(`TEST base=${base}`);
  await page.goto(base, { waitUntil: 'networkidle', timeout: 60000 });
  if (!page.url().includes('/login')) throw new Error(`Expected /login, got ${page.url()}`);
  console.log('PASS unauthenticated redirect -> /login');

  await page.getByRole('button', { name: /New to BuildFlow\? Create a company/i }).click();
  await page.getByLabel('Company name').fill(company);
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: /Create Company/i }).click();
  await page.getByText(/Account created/i).waitFor({ timeout: 30000 });
  console.log('PASS company signup');

  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: /^Sign In$/i }).click();
  await page.waitForURL(url => !url.pathname.includes('/login'), { timeout: 30000 });
  await page.waitForLoadState('networkidle');
  console.log('PASS sign in');

  const bodyText = await page.locator('body').innerText();
  if (/couldn.t load your workspace/i.test(bodyText)) throw new Error('Workspace load error after sign in');
  console.log('PASS workspace loaded');

  for (const section of sections) {
    const nav = page.getByRole('button', { name: new RegExp(`^${section.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}$`, 'i') }).first();
    await nav.click();
    await page.waitForTimeout(250);
    const text = await page.locator('main').innerText();
    const errorish = /application error|something went wrong|couldn.t load your workspace/i.test(text);
    if (errorish) throw new Error(`${section}: error state visible`);
    const buttons = await page.locator('main button:visible').allTextContents();
    const inputs = await page.locator('main input:visible, main textarea:visible, main select:visible').evaluateAll(els => els.map(el => ({tag:el.tagName.toLowerCase(), placeholder:el.getAttribute('placeholder')||'', name:el.getAttribute('name')||'', type:el.getAttribute('type')||''})));
    console.log(`SECTION ${section}`);
    console.log(`  buttons=${JSON.stringify(buttons.map(x=>x.trim()).filter(Boolean))}`);
    console.log(`  fields=${JSON.stringify(inputs)}`);
  }
  console.log('PASS all navigation sections render');

  await page.getByRole('button', { name: /^Customers$/i }).first().click();
  await page.waitForTimeout(200);
  const customerButtons = await page.locator('main button:visible').allTextContents();
  const newCustomer = customerButtons.find(x => /new|add|create/i.test(x) && /customer/i.test(x));
  if (newCustomer) {
    await page.getByRole('button', { name: new RegExp(newCustomer.trim().replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'i') }).last().click();
    await page.waitForTimeout(150);
    const labels = await page.locator('main label:visible').allTextContents();
    console.log(`CUSTOMER_FORM labels=${JSON.stringify(labels.map(x=>x.trim()))}`);
  }

  await snap('production-smoke-final');
} catch (err) {
  failures.push(err?.stack || String(err));
  try { await snap('production-smoke-failure'); } catch {}
} finally {
  await browser.close();
}

for (const e of consoleErrors) console.log(`CONSOLE_ERROR ${e}`);
for (const e of apiFailures) console.log(`HTTP_FAILURE ${e}`);
if (consoleErrors.some(x => !/favicon|hydration/i.test(x))) failures.push(...consoleErrors.map(x=>`console: ${x}`));
if (apiFailures.length) failures.push(...apiFailures.map(x=>`http: ${x}`));

if (failures.length) {
  console.error('\nSMOKE TEST FAILED');
  failures.forEach(x=>console.error(x));
  process.exit(1);
}
console.log('\nSMOKE TEST PASSED');
