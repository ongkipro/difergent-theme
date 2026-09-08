const base = process.argv[2];
const {webSocketDebuggerUrl} = await (await fetch('http://127.0.0.1:9222/json/version')).json();
const connect=(u)=>new Promise((r,j)=>{const w=new WebSocket(u);w.onopen=()=>r(w);w.onerror=j;});
let id=0; const send=(ws,m,p={},s)=>new Promise((res)=>{const i=++id;const on=(e)=>{const d=JSON.parse(e.data);if(d.id===i){ws.removeEventListener('message',on);res(d.result);}};ws.addEventListener('message',on);ws.send(JSON.stringify({id:i,method:m,params:p,sessionId:s}));});
const b=await connect(webSocketDebuggerUrl);
const {targetId}=await send(b,'Target.createTarget',{url:'about:blank'});
const {sessionId}=await send(b,'Target.attachToTarget',{targetId,flatten:true});
for (const d of ['Page','Runtime']) await send(b,d+'.enable',{},sessionId);
const ev=async(x)=>(await send(b,'Runtime.evaluate',{expression:x,returnByValue:true,awaitPromise:true},sessionId)).result.value;
const results=[]; const check=(n,p,d)=>{results.push(p);console.log(`${p?'PASS':'FAIL'}  ${n}${d?'  — '+d:''}`);};

await send(b,'Page.navigate',{url:base+'/'},sessionId);
await new Promise(r=>setTimeout(r,6000));
const consentState = await ev(`JSON.stringify(window.Shopify?.customerPrivacy?.currentVisitorConsent?.() ?? null)`);
const before = await ev(`document.getElementById('df-tag-probe') ? 'loaded' : 'not loaded'`);
check('tag stays unloaded while the visitor has not decided', before === 'not loaded', `consent=${consentState} tag=${before}`);

// mock.shop cannot persist a real consent decision, so the granted branch is
// proven by making the API report the value a real store returns after the
// visitor accepts. The gate under test is our code, not Shopify's storage.
const granted = await ev(`(() => {
  const cp = window.Shopify?.customerPrivacy;
  if (!cp) return 'api unavailable';
  cp.currentVisitorConsent = () => ({marketing: 'yes', analytics: 'yes', preferences: 'yes', sale_of_data: 'yes'});
  window.dispatchEvent(new Event('visitorConsentCollected'));
  window.scrollBy(0, 1);
  return JSON.stringify(cp.currentVisitorConsent());
})()`);
await new Promise(r=>setTimeout(r,1500));
await ev(`window.dispatchEvent(new Event('resize'))`);
await new Promise(r=>setTimeout(r,3500));
const after = await ev(`document.getElementById('df-tag-probe') ? 'loaded' : 'not loaded'`);
check('tag loads once consent is granted', after === 'loaded', `consent=${granted} tag=${after}`);

console.log('\n'+results.filter(Boolean).length+'/'+results.length+' consent checks passed');
process.exit(results.every(Boolean)?0:1);
