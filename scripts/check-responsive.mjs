// Drives headless Chrome over the DevTools protocol to check that the layout
// adapts to the viewport instead of forcing the reader to zoom or scroll sideways.
const base = process.argv[2];
const paths = process.argv.slice(3);
const widths = [320, 360, 390, 414, 768, 1024, 1280, 1440];

const res = await fetch('http://127.0.0.1:9222/json/version');
const {webSocketDebuggerUrl} = await res.json();

function connect(url) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(url);
    ws.onopen = () => resolve(ws);
    ws.onerror = reject;
  });
}

let id = 0;
function send(ws, method, params = {}, sessionId) {
  return new Promise((resolve) => {
    const msgId = ++id;
    const onMessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.id === msgId) {
        ws.removeEventListener('message', onMessage);
        resolve(data.result);
      }
    };
    ws.addEventListener('message', onMessage);
    ws.send(JSON.stringify({id: msgId, method, params, sessionId}));
  });
}

const browser = await connect(webSocketDebuggerUrl);
const {targetId} = await send(browser, 'Target.createTarget', {url: 'about:blank'});
const {sessionId} = await send(browser, 'Target.attachToTarget', {targetId, flatten: true});
await send(browser, 'Page.enable', {}, sessionId);
await send(browser, 'Runtime.enable', {}, sessionId);

const failures = [];
for (const path of paths) {
  for (const width of widths) {
    await send(browser, 'Emulation.setDeviceMetricsOverride', {
      width, height: 800, deviceScaleFactor: 2, mobile: width < 768,
    }, sessionId);
    await send(browser, 'Page.navigate', {url: base + path}, sessionId);
    await new Promise((r) => setTimeout(r, 1400));
    const {result} = await send(browser, 'Runtime.evaluate', {
      expression: `(() => {
        const de = document.documentElement;
        const overflow = de.scrollWidth - de.clientWidth;
        const wide = [...document.querySelectorAll('body *')]
          .filter((el) => el.getBoundingClientRect().width > de.clientWidth + 1)
          .slice(0, 3)
          .map((el) => el.tagName.toLowerCase() + '.' + String(el.className).slice(0, 40));
        const hidden = (el) => el.closest('[inert],[aria-hidden="true"],[hidden]') !== null;
        const small = [...document.querySelectorAll('a,button,input,select,summary')]
          .filter((el) => {
            if (hidden(el)) return false;
            const r = el.getBoundingClientRect();
            return r.width > 0 && r.height > 0 && (r.width < 44 || r.height < 44);
          })
          .slice(0, 4)
          .map((el) => el.tagName.toLowerCase() + ':' + (el.getAttribute('aria-label') || el.textContent || '').trim().slice(0, 18) + '@' + (el.getAttribute('href') || '').slice(0, 30));
        const vp = document.querySelector('meta[name=viewport]')?.content || '';
        const rootFont = parseFloat(getComputedStyle(document.body).fontSize);
        return JSON.stringify({overflow, wide, small, zoomLocked: /user-scalable\\s*=\\s*no|maximum-scale\\s*=\\s*1/.test(vp), rootFont});
      })()`,
      returnByValue: true,
    }, sessionId);
    const r = JSON.parse(result.value);
    const bad = r.overflow > 0 || r.zoomLocked || r.small.length > 0;
    if (bad) failures.push({path, width, ...r});
    console.log(
      `${path.padEnd(24)} ${String(width).padStart(4)}px  overflow=${String(r.overflow).padStart(3)}  zoomLocked=${r.zoomLocked}  body=${r.rootFont}px  smallTargets=${r.small.length}${r.small.length ? ' ' + JSON.stringify(r.small) : ''}${r.wide.length ? ' WIDE:' + JSON.stringify(r.wide) : ''}`,
    );
  }
}
console.log(failures.length ? `\nFAILURES: ${failures.length}` : '\nALL WIDTHS PASS: no horizontal overflow, zoom never locked, every target at least 44px');
process.exit(failures.length ? 1 : 0);
