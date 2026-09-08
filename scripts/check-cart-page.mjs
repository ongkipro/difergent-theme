const base = process.argv[2];
const {webSocketDebuggerUrl} = await (await fetch('http://127.0.0.1:9222/json/version')).json();
const connect=(u)=>new Promise((r,j)=>{const w=new WebSocket(u);w.onopen=()=>r(w);w.onerror=j;});
let id=0; const send=(ws,m,p={},s)=>new Promise((res)=>{const i=++id;const on=(e)=>{const d=JSON.parse(e.data);if(d.id===i){ws.removeEventListener('message',on);res(d.result);}};ws.addEventListener('message',on);ws.send(JSON.stringify({id:i,method:m,params:p,sessionId:s}));});
const b=await connect(webSocketDebuggerUrl);
const {browserContextId}=await send(b,'Target.createBrowserContext',{});
const {targetId}=await send(b,'Target.createTarget',{url:'about:blank',browserContextId});
const {sessionId}=await send(b,'Target.attachToTarget',{targetId,flatten:true});
for (const d of ['Page','Runtime']) await send(b,d+'.enable',{},sessionId);
const ev=async(x)=>(await send(b,'Runtime.evaluate',{expression:x,returnByValue:true,awaitPromise:true},sessionId)).result.value;
const go=async(u)=>{await send(b,'Page.navigate',{url:u},sessionId);await new Promise(r=>setTimeout(r,2600));};
const results=[]; const check=(n,p,d)=>{results.push(p);console.log(`${p?'PASS':'FAIL'}  ${n}${d?'  — '+d:''}`);};

await send(b,'Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:2,mobile:true},sessionId);
await go(base+'/products/v2-snowboard');
let badge='';
for (let a=0;a<4 && !/[1-9]/.test(badge);a++){
  await ev(`(() => { const f=[...document.querySelectorAll('form')].find(f=>f.querySelector('button[type=submit]') && !f.closest('[role=dialog]')); f?.querySelector('button[type=submit]')?.click(); })()`);
  for (let i=0;i<10;i++){await new Promise(r=>setTimeout(r,1200)); badge=await ev(`document.querySelector('button[aria-label^="Cart"]')?.getAttribute('aria-label')||''`); if(/[1-9]/.test(badge)) break;}
}
check('a line was added', /[1-9]/.test(badge), badge);

await go(base+'/cart');
const state = await ev(`(() => {
  const de=document.documentElement;
  const lines=document.querySelectorAll('main li, li').length;
  const checkout=[...document.querySelectorAll('a')].find(a=>/checkout/i.test(a.href));
  const qtyButtons=[...document.querySelectorAll('button[aria-label*="quantity" i]')];
  const remove=[...document.querySelectorAll('button')].find(b=>/remove/i.test(b.textContent));
  const subtotal=[...document.querySelectorAll('dt')].find(d=>/subtotal/i.test(d.textContent));
  const small=[...document.querySelectorAll('a,button,input')].filter(el=>{
    if (el.closest('[inert],[aria-hidden="true"]')) return false;
    const r=el.getBoundingClientRect();
    return r.width>0 && r.height>0 && (r.width<44 || r.height<44);
  }).map(el=>(el.getAttribute('aria-label')||el.textContent||'').trim().slice(0,20));
  return JSON.stringify({
    overflow: de.scrollWidth-de.clientWidth,
    lines, hasCheckout: Boolean(checkout), qtyButtons: qtyButtons.length,
    hasRemove: Boolean(remove), hasSubtotal: Boolean(subtotal), small,
    checkoutWidth: checkout ? Math.round(checkout.getBoundingClientRect().width) : 0,
  });
})()`);
const r = JSON.parse(state);
check('cart page has no horizontal overflow at 390px', r.overflow===0, `overflow=${r.overflow}`);
check('cart shows lines, subtotal and checkout', r.lines>0 && r.hasSubtotal && r.hasCheckout, `lines=${r.lines} subtotal=${r.hasSubtotal} checkout=${r.hasCheckout}`);
check('quantity and remove controls are present', r.qtyButtons>=2 && r.hasRemove, `qtyButtons=${r.qtyButtons} remove=${r.hasRemove}`);
check('checkout action spans the decision region', r.checkoutWidth>200, `${r.checkoutWidth}px wide`);
check('every cart control meets the 44px floor', r.small.length===0, r.small.length ? JSON.stringify(r.small) : 'none under 44px');

console.log('\n'+results.filter(Boolean).length+'/'+results.length+' cart page checks passed');
process.exit(results.every(Boolean)?0:1);
