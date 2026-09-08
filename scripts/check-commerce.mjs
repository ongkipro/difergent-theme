const base = process.argv[2];
const {webSocketDebuggerUrl} = await (await fetch('http://127.0.0.1:9222/json/version')).json();
const connect = (u) => new Promise((res, rej) => { const ws = new WebSocket(u); ws.onopen = () => res(ws); ws.onerror = rej; });
let id = 0;
const send = (ws, method, params = {}, sessionId) => new Promise((resolve) => {
  const msgId = ++id;
  const on = (e) => { const d = JSON.parse(e.data); if (d.id === msgId) { ws.removeEventListener('message', on); resolve(d.result); } };
  ws.addEventListener('message', on);
  ws.send(JSON.stringify({id: msgId, method, params, sessionId}));
});
const browser = await connect(webSocketDebuggerUrl);
const {browserContextId} = await send(browser, 'Target.createBrowserContext', {});
const {targetId} = await send(browser, 'Target.createTarget', {url: 'about:blank', browserContextId});
const {sessionId} = await send(browser, 'Target.attachToTarget', {targetId, flatten: true});
await send(browser, 'Page.enable', {}, sessionId);
await send(browser, 'Runtime.enable', {}, sessionId);
await send(browser, 'Emulation.setDeviceMetricsOverride', {width: 390, height: 844, deviceScaleFactor: 2, mobile: true}, sessionId);

const evaluate = async (expr) => {
  const {result} = await send(browser, 'Runtime.evaluate', {expression: expr, returnByValue: true, awaitPromise: true}, sessionId);
  return result.value;
};
const goto = async (url) => { await send(browser, 'Page.navigate', {url}, sessionId); await new Promise((r) => setTimeout(r, 2500)); };
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const results = [];
const check = (name, pass, detail) => { results.push({name, pass, detail}); console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? '  — ' + detail : ''}`); };

// Find a product with selectable options.
await goto(base + '/collections/freestyle');
const handles = await evaluate(`JSON.stringify([...document.querySelectorAll('a[href^="/products/"]')].map(a=>a.getAttribute('href')).slice(0,8))`);
let pdp = null, optionCount = 0;
for (const h of JSON.parse(handles)) {
  await goto(base + h);
  const n = await evaluate(`document.querySelectorAll('fieldset button[aria-pressed]').length`);
  if (n >= 2) { pdp = h; optionCount = n; break; }
}
check('product with selectable options found', Boolean(pdp), pdp ? `${pdp} (${optionCount} option buttons)` : 'none on this catalogue');

if (pdp) {
  const before = await evaluate(`JSON.stringify({url: location.href, price: document.querySelector('main, body').innerText.match(/[€$£]\\s?[\\d.,]+/)?.[0] || '', pressed: [...document.querySelectorAll('fieldset button[aria-pressed="true"]')].map(b=>b.textContent.trim()).filter(Boolean).join('|')})`);
  await evaluate(`(() => { const bs=[...document.querySelectorAll('fieldset button[aria-pressed]')]; const target=bs.find(b=>b.getAttribute('aria-pressed')!=='true' && !b.disabled); if(target){target.click(); return true;} return false; })()`);
  await wait(2200);
  const after = await evaluate(`JSON.stringify({url: location.href, pressed: [...document.querySelectorAll('fieldset button[aria-pressed="true"]')].map(b=>b.textContent.trim()).filter(Boolean).join('|')})`);
  const b = JSON.parse(before), a = JSON.parse(after);
  check('variant selection updates the URL without a reload', a.url !== b.url, `${new URL(b.url).search || '(none)'} -> ${new URL(a.url).search}`);
  check('selected variant state moves with the choice', a.pressed !== b.pressed, `${b.pressed || '(none)'} -> ${a.pressed}`);

  // Sticky bar appears only after the purchase action scrolls away.
  const stickyBefore = await evaluate(`(() => { const el=document.querySelector('[class*="fixed"][class*="bottom-0"]'); return el ? el.getAttribute('inert')!==null || el.getAttribute('aria-hidden')==='true' : null; })()`);
  // On a tall viewport the purchase action never leaves the page, and the bar
  // is correct to stay hidden. Shrink the viewport so it genuinely scrolls away.
  await send(browser, 'Emulation.setDeviceMetricsOverride', {width: 390, height: 380, deviceScaleFactor: 2, mobile: true}, sessionId);
  await evaluate(`window.scrollTo(0, document.body.scrollHeight)`);
  await wait(1500);
  const stickyAfter = await evaluate(`(() => { const el=document.querySelector('[class*="fixed"][class*="bottom-0"]'); return el ? el.getAttribute('inert')===null && el.getAttribute('aria-hidden')!=='true' : null; })()`);
  await send(browser, 'Emulation.setDeviceMetricsOverride', {width: 390, height: 844, deviceScaleFactor: 2, mobile: true}, sessionId);
  check('sticky purchase bar is hidden until the real action scrolls away', stickyBefore === true && stickyAfter === true, `hiddenAtTop=${stickyBefore} visibleAfterScroll=${stickyAfter}`);

  await evaluate(`window.scrollTo(0,0)`);
  await wait(600);
  const badgeBefore = await evaluate(`document.querySelector('button[aria-label^="Cart"]')?.getAttribute('aria-label') || ''`);
  let badgeAfter = badgeBefore;
  for (let attempt = 0; attempt < 4 && badgeAfter === badgeBefore; attempt++) {
    // Scoped to the product form: after the first add the cart drawer opens and
    // its own forms would otherwise be clicked instead.
    await evaluate(`(() => { const f=[...document.querySelectorAll('form')].find(f=>f.querySelector('button[type=submit]') && !f.closest('[role=dialog]')); f?.querySelector('button[type=submit]')?.click(); })()`);
    for (let i = 0; i < 10; i++) {
      await wait(1200);
      badgeAfter = await evaluate(`document.querySelector('button[aria-label^="Cart"]')?.getAttribute('aria-label') || ''`);
      if (badgeAfter !== badgeBefore) break;
    }
  }
  check('add to cart updates the cart count', badgeBefore !== badgeAfter, `"${badgeBefore}" -> "${badgeAfter}"`);

  await goto(base + '/');
  const badgeHome = await evaluate(`document.querySelector('button[aria-label^="Cart"]')?.getAttribute('aria-label') || ''`);
  check('cart survives navigation', badgeHome === badgeAfter, `"${badgeHome}"`);

  await send(browser, 'Page.reload', {ignoreCache: true}, sessionId);
  await wait(3000);
  const badgeReload = await evaluate(`document.querySelector('button[aria-label^="Cart"]')?.getAttribute('aria-label') || ''`);
  check('cart survives a full reload', badgeReload === badgeAfter, `"${badgeReload}"`);

  const checkoutHref = await evaluate(`(() => { const el=[...document.querySelectorAll('a')].find(a=>/checkout/i.test(a.href)); return el ? el.href : ''; })()`);
  await goto(base + '/cart');
  const cartCheckout = await evaluate(`(() => { const el=[...document.querySelectorAll('a')].find(a=>/checkout/i.test(a.href)); return el ? el.href : ''; })()`);
  const target = cartCheckout || checkoutHref;
  check('checkout hands off to Shopify', /shopify|checkout/i.test(target), target ? target.slice(0, 70) : 'no checkout link found');
}

console.log('\n' + results.filter(r=>r.pass).length + '/' + results.length + ' checks passed');
process.exit(results.every(r=>r.pass) ? 0 : 1);
