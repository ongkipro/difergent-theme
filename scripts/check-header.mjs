const base=process.argv[2];
const {webSocketDebuggerUrl}=await (await fetch('http://127.0.0.1:9222/json/version')).json();
const connect=(u)=>new Promise((r,j)=>{const s=new WebSocket(u);s.onopen=()=>r(s);s.onerror=j;});
let id=0; const send=(ws,m,p={},s)=>new Promise((res)=>{const i=++id;const on=(e)=>{const d=JSON.parse(e.data);if(d.id===i){ws.removeEventListener('message',on);res(d.result);}};ws.addEventListener('message',on);ws.send(JSON.stringify({id:i,method:m,params:p,sessionId:s}));});
const b=await connect(webSocketDebuggerUrl);
const {targetId}=await send(b,'Target.createTarget',{url:'about:blank'});
const {sessionId}=await send(b,'Target.attachToTarget',{targetId,flatten:true});
for (const d of ['Page','Runtime']) await send(b,d+'.enable',{},sessionId);
const ev=async(x)=>(await send(b,'Runtime.evaluate',{expression:x,returnByValue:true},sessionId)).result.value;
const results=[];

for (const w of [320, 360, 390, 430, 768, 1024, 1440]) {
  await send(b,'Emulation.setDeviceMetricsOverride',{width:w,height:800,deviceScaleFactor:2,mobile:w<768},sessionId);
  await send(b,'Page.navigate',{url:base+'/'},sessionId);
  await new Promise(r=>setTimeout(r,1800));
  const r = JSON.parse(await ev(`(() => {
    // The cart drawer also renders a <header>; find the one holding the wordmark.
    const mark=document.querySelector('a[aria-label$="home"] span');
    if (!mark) return JSON.stringify({error:'wordmark not found'});
    const header=mark.closest('header');
    const hb=header.getBoundingClientRect();
    const mb=mark.getBoundingClientRect();
    const controls=[...header.querySelectorAll('a,button')];
    const small=controls.filter(el=>{const r=el.getBoundingClientRect();return r.width>0&&(r.width<44||r.height<44);}).length;
    // Wrapping shows up as a header taller than one row, not as differing tops:
    // controls have different heights, so their top edges legitimately differ.
    const wrapped = hb.height > 80;
    return JSON.stringify({
      headerHeight: Math.round(hb.height),
      markCentreOffset: Math.round((mb.left+mb.width/2) - (hb.left+hb.width/2)),
      markClipped: mark.scrollWidth > mark.clientWidth + 1,
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      smallControls: small,
      // The wordmark must keep visible air between itself and the nearest control.
      minGap: Math.round(Math.min(...controls
        .filter(el=>!el.contains(mark))
        .map(el=>{const r=el.getBoundingClientRect();
          return r.left >= mb.right ? r.left - mb.right : (mb.left >= r.right ? mb.left - r.right : 0);}))),
      wrapped,
      // truncate hides overflow in both axes: a line box shorter than the
      // font's own height silently clips descenders.
      descenderClipped: mark.scrollHeight > mark.clientHeight,
    });
  })()`));
  const centred = w >= 768 ? true : Math.abs(r.markCentreOffset) <= 3;
    // Truncation below 390px is the designed fallback for a long shop name; a
  // collision is not. From 390px up, the common phone width, it must not clip.
  const clipOk = w < 390 ? true : r.markClipped === false;
  const ok = r.overflow===0 && r.smallControls===0 && r.wrapped===false && centred && r.minGap >= 8 && clipOk && r.descenderClipped === false;
  results.push(ok);
  console.log(`${ok?'PASS':'FAIL'}  ${String(w).padStart(4)}px  height=${r.headerHeight}  centreOffset=${r.markCentreOffset}  clipped=${r.markClipped}  overflow=${r.overflow}  small=${r.smallControls}  minGap=${r.minGap}  wrapped=${r.wrapped}  descenderClipped=${r.descenderClipped}`);
}
console.log('\n'+results.filter(Boolean).length+'/'+results.length+' header checks passed');
process.exit(results.every(Boolean)?0:1);
