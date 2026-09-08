const base = process.argv[2];
const {webSocketDebuggerUrl} = await (await fetch('http://127.0.0.1:9222/json/version')).json();
const connect=(u)=>new Promise((r,j)=>{const w=new WebSocket(u);w.onopen=()=>r(w);w.onerror=j;});
let id=0; const send=(ws,m,p={},s)=>new Promise((res)=>{const i=++id;const on=(e)=>{const d=JSON.parse(e.data);if(d.id===i){ws.removeEventListener('message',on);res(d.result);}};ws.addEventListener('message',on);ws.send(JSON.stringify({id:i,method:m,params:p,sessionId:s}));});
const b=await connect(webSocketDebuggerUrl);
const {targetId}=await send(b,'Target.createTarget',{url:'about:blank'});
const {sessionId}=await send(b,'Target.attachToTarget',{targetId,flatten:true});
for (const d of ['Page','Runtime','Network']) await send(b,d+'.enable',{},sessionId);
// An in-app browser: narrow, mobile, and a webview-style user agent.
await send(b,'Emulation.setDeviceMetricsOverride',{width:390,height:720,deviceScaleFactor:3,mobile:true},sessionId);
await send(b,'Emulation.setUserAgentOverride',{userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram 300.0.0.0'},sessionId);
const ev=async(e)=>(await send(b,'Runtime.evaluate',{expression:e,returnByValue:true,awaitPromise:true},sessionId)).result.value;
const go=async(u)=>{await send(b,'Page.navigate',{url:u},sessionId);await new Promise(r=>setTimeout(r,2600));};
const results=[]; const check=(n,p,d)=>{results.push(p);console.log(`${p?'PASS':'FAIL'}  ${n}${d?'  — '+d:''}`);};

await go(base+'/products/v2-snowboard');
// Wait for hydration before clicking, then wait for the cart to actually
// report the line. Clicking a button that is not yet interactive silently
// does nothing, which would make every later check meaningless.
let added = '';
for (let attempt = 0; attempt < 4 && !/[1-9]/.test(added); attempt++) {
  await ev(`document.querySelector('form button[type=submit]')?.click()`);
  for (let i = 0; i < 10; i++) {
    await new Promise(r=>setTimeout(r,1200));
    added = await ev(`document.querySelector('button[aria-label^="Cart"]')?.getAttribute('aria-label')||''`);
    if (/[1-9]/.test(added)) break;
  }
}
check('add to cart succeeded before the webview checks', /[1-9]/.test(added), added || '(empty)');

const {cookies} = await send(b,'Network.getCookies',{urls:[base]},sessionId);
const cartCookie = cookies.find(c=>/cart/i.test(c.name));
check('cart identifier is a first-party cookie', Boolean(cartCookie), cartCookie ? `${cartCookie.name} domain=${cartCookie.domain} httpOnly=${cartCookie.httpOnly} sameSite=${cartCookie.sameSite||'unset'}` : 'no cart cookie found');

// The real property: wiping browser storage must not lose the cart, because a
// restricted webview may clear it between visits.
const wiped = await ev(`(() => { const keys=[...Object.keys(localStorage),...Object.keys(sessionStorage)]; localStorage.clear(); sessionStorage.clear(); return JSON.stringify(keys); })()`);
await send(b,'Page.reload',{ignoreCache:true},sessionId);
await new Promise(r=>setTimeout(r,3200));
const afterWipe = await ev(`document.querySelector('button[aria-label^="Cart"]')?.getAttribute('aria-label')||''`);
check('cart survives browser storage being wiped', /[1-9]/.test(afterWipe), `cleared ${wiped} -> ${afterWipe}`);

// Host chrome expanding and collapsing changes the viewport height mid-session.
const before = await ev(`JSON.stringify({overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth})`);
await send(b,'Emulation.setDeviceMetricsOverride',{width:390,height:560,deviceScaleFactor:3,mobile:true},sessionId);
await new Promise(r=>setTimeout(r,900));
const after = await ev(`JSON.stringify({overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth})`);
check('layout survives the host chrome resizing', JSON.parse(before).overflow===0 && JSON.parse(after).overflow===0, `overflow ${JSON.parse(before).overflow} -> ${JSON.parse(after).overflow}`);

// Bottom-fixed elements must clear the host toolbar.
// Only elements that actually hold controls at the bottom edge matter: the
// container the buyer can tap must clear the host toolbar.
const insets = await ev(`(() => {
  const fixed=[...document.querySelectorAll('*')].filter(el=>{const s=getComputedStyle(el);return s.position==='fixed' && s.bottom==='0px';});
  const out=[];
  for (const el of fixed) {
    const controls=[...el.querySelectorAll('a,button,input')];
    if (!controls.length) continue;
    const last=controls[controls.length-1];
    let node=last, reserved=0;
    while (node && node!==el.parentElement) { reserved=Math.max(reserved, parseFloat(getComputedStyle(node).paddingBottom)||0); node=node.parentElement; }
    out.push({tag:el.tagName.toLowerCase(), controls:controls.length, reservedBottomPx:reserved});
  }
  return JSON.stringify(out);
})()`);
const parsed = JSON.parse(insets);
check('every bottom-fixed control region clears the host toolbar', parsed.length>0 && parsed.every(e=>e.reservedBottomPx>0), insets);

// The checkout handoff must navigate in this context, not open a new window.
await go(base+'/cart');
const handoff = await ev(`(() => { const a=[...document.querySelectorAll('a')].find(a=>/checkout/i.test(a.href)); return a ? JSON.stringify({href:a.href.slice(0,60), target:a.target||'(same context)', rel:a.rel||''}) : 'none'; })()`);
check('checkout stays in the same browsing context', handoff!=='none' && !/_blank/.test(handoff), handoff);

// Cart survives a reload, which is where restricted webview storage usually breaks.
await send(b,'Page.reload',{ignoreCache:true},sessionId);
await new Promise(r=>setTimeout(r,3000));
const lines = await ev(`document.querySelector('button[aria-label^="Cart"]')?.getAttribute('aria-label')||''`);
check('cart survives a reload in the webview', /[1-9]/.test(lines), lines);

console.log('\n'+results.filter(Boolean).length+'/'+results.length+' in-app browser invariants hold');
process.exit(results.every(Boolean)?0:1);
