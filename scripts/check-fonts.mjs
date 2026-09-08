const base=process.argv[2];
const {webSocketDebuggerUrl}=await (await fetch('http://127.0.0.1:9222/json/version')).json();
const connect=(u)=>new Promise((r,j)=>{const s=new WebSocket(u);s.onopen=()=>r(s);s.onerror=j;});
let id=0; const send=(ws,m,p={},s)=>new Promise((res)=>{const i=++id;const on=(e)=>{const d=JSON.parse(e.data);if(d.id===i){ws.removeEventListener('message',on);res(d.result);}};ws.addEventListener('message',on);ws.send(JSON.stringify({id:i,method:m,params:p,sessionId:s}));});
const b=await connect(webSocketDebuggerUrl);
const {targetId}=await send(b,'Target.createTarget',{url:'about:blank'});
const {sessionId}=await send(b,'Target.attachToTarget',{targetId,flatten:true});
for (const d of ['Page','Runtime','Network']) await send(b,d+'.enable',{},sessionId);
const requests=[]; const blocked=[];
b.addEventListener('message',(e)=>{const d=JSON.parse(e.data);
  if(d.method==='Network.requestWillBeSent') requests.push(d.params.request.url);
  if(d.method==='Network.loadingFailed') blocked.push(d.params.blockedReason||d.params.errorText);});
await send(b,'Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:2,mobile:true},sessionId);
await send(b,'Page.navigate',{url:base},sessionId);
await new Promise(r=>setTimeout(r,5000));
const ev=async(x)=>(await send(b,'Runtime.evaluate',{expression:x,returnByValue:true,awaitPromise:true},sessionId)).result.value;

const results=[]; const check=(n,p,d)=>{results.push(p);console.log(`${p?'PASS':'FAIL'}  ${n}${d?'  — '+d:''}`);};

const loaded = JSON.parse(await ev(`(async () => {
  await document.fonts.ready;
  const families=[...document.fonts].map(f=>f.family+' '+f.weight+' '+f.status);
  return JSON.stringify({
    serifLoaded: document.fonts.check('20px "Instrument Serif"'),
    sansLoaded: document.fonts.check('16px "Instrument Sans"'),
    faces: families,
  });
})()`));
check('Instrument Serif is loaded and usable', loaded.serifLoaded, loaded.faces.filter(f=>/Serif/.test(f)).join(', ') || 'no serif face');
check('Instrument Sans is loaded and usable', loaded.sansLoaded, loaded.faces.filter(f=>/Sans/.test(f)).join(', ') || 'no sans face');

// Rendering with the real face, not merely having downloaded it: measure the
// wordmark against the same string in the fallback stack.
const applied = JSON.parse(await ev(`(() => {
  const mark=document.querySelector('a[aria-label$="home"] span');
  const cs=getComputedStyle(mark);
  const probe=document.createElement('span');
  probe.textContent=mark.textContent;
  probe.style.cssText='position:absolute;visibility:hidden;white-space:nowrap;font-size:'+cs.fontSize+';letter-spacing:'+cs.letterSpacing+';';
  document.body.appendChild(probe);
  probe.style.fontFamily='Georgia, "Times New Roman", serif';
  const fallbackWidth=probe.getBoundingClientRect().width;
  probe.style.fontFamily=cs.fontFamily;
  const actualWidth=probe.getBoundingClientRect().width;
  probe.remove();
  return JSON.stringify({family:cs.fontFamily.split(',')[0], fallbackWidth:Math.round(fallbackWidth), actualWidth:Math.round(actualWidth)});
})()`));
check('the wordmark renders in the real face, not the fallback',
  applied.actualWidth !== applied.fallbackWidth,
  `${applied.family}: ${applied.actualWidth}px vs fallback ${applied.fallbackWidth}px`);

const fontReqs = requests.filter(u=>/fonts\.(googleapis|gstatic)/.test(u));
check('font requests were made and none were blocked', fontReqs.length>0 && blocked.filter(x=>/csp|blocked/i.test(String(x))).length===0,
  `${fontReqs.length} requests, ${blocked.length} failures`);

console.log('\n'+results.filter(Boolean).length+'/'+results.length+' font checks passed');
process.exit(results.every(Boolean)?0:1);
