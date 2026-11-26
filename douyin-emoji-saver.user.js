// ==UserScript==
// @name         抖音表情包提取助手
// @name:zh-CN   抖音表情包提取助手
// @name:en      Douyin Emoji Saver
// @namespace    local.douyin.gif
// @version      5.1.0
// @description  从抖音评论和私信提取表情，自动去重和转换，保存至专用目录
// @description:zh-CN 从抖音评论和私信提取表情，自动去重和转换，保存至专用目录
// @description:en Save stickers from Douyin comments and direct messages with deduplication and local image conversion.
// @match        https://*.douyin.com/*
// @noframes
// @run-at       document-start
// @grant        GM_xmlhttpRequest
// @grant        GM_registerMenuCommand
// @connect      douyin.com
// @connect      douyinpic.com
// @connect      douyincdn.com
// @connect      byteimg.com
// @connect      bytedance.com
// @connect      snssdk.com
// @connect      ibytedtos.com
// ==/UserScript==

(() => {
  'use strict';


  const id = 'douyin-emoji-helper-v5';
  if (document.getElementById(id)) return;
  const make = (tag, text = '', cssClass = '') => {
    const el = document.createElement(tag);
    if (text) el.textContent = text;
    if (cssClass) el.className = cssClass;
    if (tag === 'button') el.type = 'button';
    return el;
  };
  const action = (text, label, cssClass = '') => {
    const el = make('button', text, cssClass);
    el.setAttribute('aria-label', label);
    el.title = label;
    return el;
  };
  const host = make('div');
  host.id = id;
  host.dataset.version = '5.1.0';
  host.style.cssText = 'all:initial!important;display:block!important;position:fixed!important;inset:0!important;z-index:2147483647!important;visibility:visible!important;pointer-events:none!important';
  const ui = host.attachShadow({mode: 'open'});
  ui.append(make('style', `
    *{box-sizing:border-box}
    .shell{font:13px/1.45 -apple-system,BlinkMacSystemFont,system-ui,sans-serif;
      color:#20232a;--sub:#505765;--muted:#22263310;--fill:#22263317;--accent:#2458bb;
      --glass:#f4f6fbe6;--thin:#eef1f9b8;--rim:#ffffffd9;--edge:#17223e14;
      --glaze:#ffffff38;--lower-rim:#202a460c;
      --shadow:0 14px 36px #10142130,0 2px 8px #12152619;
      --corner-panel:28px;--corner-group:14px;--corner-segment:calc(var(--corner-group) - 3px);
      --corner-tile:15px;--corner-image:calc(var(--corner-tile) - 5px);--corner-preview:13px}
    button{appearance:none;pointer-events:auto;color:inherit;background:transparent;font:inherit;
      cursor:pointer;border:0;border-radius:999px;padding:7px 11px;white-space:nowrap}
    button:hover{background:var(--muted)}button:active{transform:scale(.97)}
    button:focus-visible{outline:2px solid #4387f5;outline-offset:2px}
    button:disabled{opacity:.45;cursor:default;transform:none}
    [hidden]{display:none!important}
    .glass{background:linear-gradient(150deg,var(--glaze),transparent 58%),var(--glass);
      box-shadow:var(--shadow),inset 0 1px 0 var(--rim),inset 0 -1px 0 var(--lower-rim);
      border:1px solid var(--edge);backdrop-filter:blur(22px) saturate(1.42)}
    .ball{position:fixed;width:46px;height:46px;border-radius:50%;display:grid;place-items:center;padding:0;
      touch-action:none;user-select:none;background:linear-gradient(135deg,#ffffff60,transparent 64%),var(--thin);
      transition:left .28s cubic-bezier(.2,.85,.25,1.12),top .24s ease,scale .18s,background .2s}
    .ball:hover,.ball[aria-expanded=true]{background:var(--glass)}
    .ball[data-drag]{transition:none;cursor:grabbing;scale:1.08}
    .ball:active{transform:none;scale:.94}.ball[data-drag]:active{scale:1.08}
    .mark{display:block;width:22px;height:22px;border:1.8px solid currentColor;border-radius:8px;position:relative}
    .mark::before{content:'';position:absolute;left:5px;top:5px;width:2px;height:2px;border-radius:50%;
      background:currentColor;box-shadow:7px 0 currentColor}
    .mark::after{content:'';position:absolute;left:5px;top:9px;width:9px;height:5px;
      border-bottom:1.7px solid currentColor;border-radius:0 0 8px 8px}
    .badge{position:absolute;right:-3px;top:-4px;padding:0 4px;min-width:17px;height:17px;
      border-radius:30px;background:#2864cf;color:white;font-size:10px;font-weight:700;line-height:17px}
    .panel{pointer-events:auto;position:fixed;width:min(326px,calc(100vw - 24px));max-height:calc(100dvh - 24px);
      border-radius:var(--corner-panel);padding:13px;display:flex;flex-direction:column;overflow:hidden;
      animation:appear .18s cubic-bezier(.2,.7,.3,1)}
    @keyframes appear{from{opacity:0;transform:translateX(var(--enter,0px)) scale(.97)}to{opacity:1;transform:none}}
    header,footer,.row{display:flex;align-items:center;gap:7px}header,footer{justify-content:space-between}
    header{margin-bottom:9px;padding-left:2px}header strong{font-size:15px;letter-spacing:.02em}
    .icon{font-size:17px;width:33px;height:33px;padding:0;display:grid;place-items:center}
    .segments{display:flex;background:var(--muted);border-radius:var(--corner-group);padding:3px;gap:2px}
    .segments button{flex:1;padding:5px 4px;border-radius:var(--corner-segment);font-weight:550}
    .segments button[aria-pressed=true]{background:var(--glass);
      box-shadow:0 1px 4px #19243b19,inset 0 1px 0 var(--rim);font-weight:680}
    .grid{min-height:85px;max-height:min(52vh,380px);overflow:auto;overscroll-behavior:contain;
      margin:10px 0;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));align-content:start;gap:6px;
      scrollbar-width:thin}
    .cell{position:relative;min-width:0;aspect-ratio:1;overflow:hidden;border-radius:var(--corner-tile);background:var(--muted)}
    .thumb{display:block;border-radius:inherit;width:100%;height:100%;padding:5px}
    .thumb img{display:block;width:100%;height:100%;object-fit:contain;border-radius:var(--corner-image)}
    .cell[data-pick]{box-shadow:inset 0 0 0 2px var(--accent)}
    .pick{position:absolute;right:3px;top:3px;padding:0;width:25px;height:25px;color:white;
      background:#24272eaa;opacity:0;font-size:15px;line-height:1}
    .cell:hover .pick,.cell:focus-within .pick,.cell[data-pick] .pick,.pick:focus-visible{opacity:1}
    .pick:hover,.cell[data-pick] .pick{background:#2864cf}
    .saved{position:absolute;bottom:3px;left:4px;height:17px;min-width:17px;text-align:center;
      border-radius:12px;background:#25352bcf;color:#f2fff5;font-size:11px;pointer-events:none}
    .status{color:var(--sub);font-size:12px;overflow-wrap:anywhere;margin:0;min-height:17px}
    .empty{grid-column:1/-1;align-self:center;margin:18px 5px;color:var(--sub);text-align:center}
    .primary{background:#2864cf;color:white;font-weight:650}.primary:hover{background:#1e55bb}
    footer .primary{box-shadow:inset 0 1px 0 #ffffff36,inset 0 -1px 0 #17357130}
    .preview,.settings{padding:6px 2px 4px}.preview img{width:100%;height:min(38vh,245px);
      display:block;object-fit:contain;border-radius:var(--corner-preview);background:var(--muted);margin:5px 0 9px}
    .settings p{margin:7px 0 12px;color:var(--sub)}
    .settings .row{flex-wrap:wrap}.secondary{background:var(--muted)}
    .hover,.toast{position:fixed;pointer-events:auto;border-radius:999px}
    .hover{padding:5px 11px;font-size:12px}.hover:hover{background:var(--glass)}
    .toast{pointer-events:none;max-width:min(310px,calc(100vw - 22px));padding:7px 12px;
      border-radius:var(--corner-group);overflow-wrap:anywhere}
    @supports (corner-shape:squircle){
      .panel,.mark,.segments,.segments button,.cell,.thumb,.thumb img,.preview img,.toast{corner-shape:squircle}
    }
    @media (hover:none){.pick{opacity:1}}
    @media (prefers-color-scheme:dark){
      .shell{color:#f3f5fa;--sub:#c8cdd7;--accent:#9abcff;--muted:#eef2ff17;--fill:#eef2ff24;
        --glass:#252a36ed;--thin:#333b4ac9;--rim:#ffffff40;--edge:#ffffff22;
        --glaze:#ffffff14;--lower-rim:#0003;--shadow:0 14px 36px #0007,0 2px 8px #0005}
      .ball{background:linear-gradient(135deg,#ffffff2b,transparent 64%),var(--thin)}
    }
    @media (prefers-reduced-motion:reduce){*,*::after,*::before{animation:none!important;transition:none!important}}
    @media (prefers-reduced-transparency:reduce),(prefers-contrast:more){
      .glass{backdrop-filter:none;background:var(--glass)}
      .shell{--glass:#f7f8fd;--thin:#f7f8fd}
      @media (prefers-color-scheme:dark){.shell{--glass:#252a36;--thin:#252a36}}
    }
  `));
  const shell = make('div', '', 'shell');
  const toggle = action('', '表情包提取', 'ball glass');
  const badge = make('span', '', 'badge');
  const mark = make('span', '', 'mark');
  mark.setAttribute('aria-hidden', 'true');
  toggle.append(mark, badge);
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-controls', 'emoji-panel');
  const hover = action('保存表情', '保存表情', 'hover glass');
  const panel = make('section', '', 'panel glass');
  panel.id = 'emoji-panel';
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-label', '抖音表情包');
  const header = make('header');
  const title = make('strong', '表情包');
  const settingsButton = action('⚙', '设置', 'icon');
  const backButton = action('‹', '返回列表', 'icon');
  const leading = make('div', '', 'row');
  leading.append(backButton, title);
  header.append(leading, settingsButton);
  const tabs = make('nav', '', 'segments');
  tabs.setAttribute('aria-label', '表情类型');
  const grid = make('div', '', 'grid');
  const footer = make('footer');
  const status = make('p', '', 'status');
  status.setAttribute('role', 'status');
  const batch = action('批量保存', '批量保存', 'primary');
  footer.append(status, batch);
  const preview = make('div', '', 'preview');
  const settings = make('div', '', 'settings');
  const toast = make('div', '', 'toast glass');
  toast.setAttribute('role', 'status');
  panel.append(header, tabs, grid, preview, settings, footer);
  shell.append(toggle, panel, hover, toast);
  ui.append(shell);
  panel.hidden = hover.hidden = toast.hidden = preview.hidden = settings.hidden = badge.hidden = true;

  function mount() {
    const root = document.documentElement;
    if (root && host.parentNode !== root) root.append(host);
  }
  const rootObserver = new MutationObserver(mount);
  function watchRoot() {
    rootObserver.disconnect();
    mount();
    if (document.documentElement) rootObserver.observe(document.documentElement, {childList:true});
  }
  new MutationObserver(watchRoot).observe(document, {childList:true});
  watchRoot();

  function loadPosition() {
    try {
      const p = JSON.parse(localStorage.getItem(id + '-position'));
      if (p && ['left','right'].includes(p.side) && Number.isFinite(p.fraction)) return p;
    } catch {}
    return {side:'left', fraction:.68};
  }
  let position = loadPosition();
  let drag;
  let suppressClick = false;
  let anchor = {x: 12, y: 12};
  const clamp = (n, lo, hi) => Math.min(Math.max(lo, hi), Math.max(lo, n));
  function arrange(x, y) {
    const height = Math.max(0, innerHeight - 74);
    anchor = {x: x ?? (position.side === 'left' ? 12 : innerWidth - 58), y: y ?? 12 + clamp(position.fraction,0,1) * height};
    toggle.style.left = anchor.x + 'px';
    toggle.style.top = anchor.y + 'px';
    alignPanel();
  }
  function alignPanel() {
    if (!panel.hidden) {
      const right = anchor.x > innerWidth / 2;
      const left = right ? anchor.x - panel.offsetWidth - 10 : anchor.x + 56;
      panel.style.left = clamp(left, 12, innerWidth - panel.offsetWidth - 12) + 'px';
      panel.style.top = clamp(anchor.y - panel.offsetHeight / 2 + 23, 12, innerHeight - panel.offsetHeight - 12) + 'px';
      panel.style.setProperty('--enter', right ? '5px' : '-5px');
    }
    toast.style.left = clamp(anchor.x - (position.side === 'right' ? 250 : 0), 12, innerWidth - 320) + 'px';
    toast.style.top = clamp(anchor.y - 43, 10, innerHeight - 55) + 'px';
  }
  new ResizeObserver(alignPanel).observe(panel);
  arrange();
  window.addEventListener('resize', () => arrange());
  toggle.addEventListener('pointerdown', event => {
    if (!event.isPrimary || event.button !== 0) return;
    drag = {pointer:event.pointerId, x:event.clientX, y:event.clientY, origin:anchor, moved:false};
    suppressClick = false;
    toggle.setPointerCapture(event.pointerId);
  });
  toggle.addEventListener('pointermove', event => {
    if (!drag || event.pointerId !== drag.pointer) return;
    const dx = event.clientX - drag.x;
    const dy = event.clientY - drag.y;
    if (!drag.moved && Math.hypot(dx,dy) < 6) return;
    drag.moved = true;
    toggle.dataset.drag = '';
    arrange(clamp(drag.origin.x + dx, 8, innerWidth - 54), clamp(drag.origin.y + dy, 12, innerHeight - 62));
  });
  function endDrag(event) {
    if (!drag || event.pointerId !== drag.pointer) return;
    if (drag.moved) {
      position = {side: anchor.x + 23 < innerWidth / 2 ? 'left' : 'right',
        fraction:clamp((anchor.y - 12) / Math.max(1, innerHeight - 74),0,1)};
      try { localStorage.setItem(id + '-position', JSON.stringify(position)); } catch {}
      suppressClick = true;
    }
    drag = null;
    delete toggle.dataset.drag;
    arrange();
  }
  for (const type of ['pointerup','pointercancel','lostpointercapture']) toggle.addEventListener(type,endDrag);

  const mediaSelector = 'img,[style*="url("]';
  const contentName = /comment|评论|reply|私信|聊天|会话|im[-_](?:panel|dialog|message|chat)|chat[-_ ]?(?:window|panel|message|content|list|item|bubble)|message[-_ ]?(?:window|panel|content|list|item|bubble)/i;
  const stickerName = /emoji|emoticon|sticker|表情包|表情贴纸|大表情/i;
  const excluded = /avatar|headshot|头像|cover|封面|(?:^|[-_\s])icon(?:$|[-_\s])|图标|emoji[-_ ]?(?:picker|panel|toolbar)|表情选择|badge|二维码/i;
  const label = (el) => ['class', 'id', 'data-e2e', 'data-testid', 'aria-label', 'title', 'alt']
    .map(attr => el.getAttribute(attr) || '').join(' ');

  function candidate(el) {
    if (!(el instanceof HTMLElement) || !el.matches(mediaSelector) || !el.isConnected) return null;
    const src = el instanceof HTMLImageElement
      ? (el.currentSrc || el.getAttribute('src') || el.getAttribute('data-src'))
      : /url\(\s*(?:"([^"]*)"|'([^']*)'|([^)]*))\s*\)/i.exec(el.style.backgroundImage)?.slice(1).find(Boolean);
    if (!src) return null;
    let url;
    try { url = new URL(src, location.href); } catch { return null; }
    if (!['https:', 'blob:', 'data:'].includes(url.protocol) || /aweme-avatar|avatar[-_/]|\.(?:svg|ico)$/i.test(url.pathname)) return null;
    url.hash = '';
    const area = el.getBoundingClientRect();
    if (area.width < 15 || area.height < 15 || area.width > 520 || area.height > 520) return null;
    let isSticker = stickerName.test(url.protocol === 'https:' ? url.pathname : '');
    let scope = '';
    for (let node = el, depth = 0; node && node !== document.body && depth < 19; node = node.parentElement, depth++) {
      const name = label(node);
      if (excluded.test(name)) return null;
      if (depth < 5 && stickerName.test(name)) isSticker = true;
      if (!scope && contentName.test(name)) scope = /comment|评论|reply/i.test(name) ? '评论' : '私信';
    }
    if (!scope) return null;
    if (isSticker) return {url: url.href, scope, explicit: true};
    // Unlabelled media is checked only inside conversation content, and only
    // sufficiently large animated images are accepted in this fallback.
    if (area.width < 48 || area.height < 48 || area.width > 320 || area.height > 320) return null;
    return {url: url.href, scope, explicit: false};
  }

  function imageFormat(buffer) {
    const b = new Uint8Array(buffer);
    const v = new DataView(buffer);
    const ascii = (start, count) => String.fromCharCode(...b.subarray(start, start + count));
    if (/^GIF8[79]a$/.test(ascii(0, 6)) && b.length >= 13) {
      let pos = 13 + (b[10] & 128 ? 3 * (2 << (b[10] & 7)) : 0);
      let frames = 0;
      while (pos < b.length && frames < 2) {
        const code = b[pos++];
        if (code === 0x2c) {
          if (pos + 9 >= b.length) break;
          if (b[pos + 8] & 128) pos += 3 * (2 << (b[pos + 8] & 7));
          pos += 10;
          frames++;
        } else if (code === 0x21) pos++;
        else break;
        while (pos < b.length && b[pos]) pos += b[pos] + 1;
        pos++;
      }
      return {ext: 'gif', mime: 'image/gif', animated: frames > 1};
    }
    if (b.length >= 12 && ascii(0, 4) === 'RIFF' && ascii(8, 4) === 'WEBP') {
      let animated = false;
      for (let pos = 12; pos + 8 <= b.length;) {
        const size = v.getUint32(pos + 4, true);
        if (pos + 8 + size > b.length) break;
        if (ascii(pos, 4) === 'ANMF') animated = true;
        pos += 8 + size + (size & 1);
      }
      return {ext: 'webp', mime: 'image/webp', animated};
    }
    if (b.length >= 8 && v.getUint32(0) === 0x89504e47 && v.getUint32(4) === 0x0d0a1a0a) {
      let animated = false;
      for (let pos = 8; pos + 12 <= b.length;) {
        if (ascii(pos + 4, 4) === 'acTL') animated = true;
        pos += 12 + v.getUint32(pos);
      }
      return {ext: 'png', mime: 'image/png', animated};
    }
    if (b[0] === 255 && b[1] === 216 && b[2] === 255) return {ext: 'jpg', mime: 'image/jpeg', animated: false};
    if (ascii(0, 2) === 'BM') return {ext: 'bmp', mime: 'image/bmp', animated: false};
    if (ascii(4, 8) === 'ftypavif' || ascii(4, 8) === 'ftypavis') {
      return {ext: 'avif', mime: 'image/avif', animated: ascii(8, 4) === 'avis'};
    }
    return null;
  }

  const byteLimit = 20 * 1024 * 1024;
  async function read(url) {
    try {
      const response = await fetch(url, {signal: AbortSignal.timeout(12000)});
      if (response.ok) {
        if (Number(response.headers.get('content-length')) > byteLimit) throw new RangeError('图片超过 20 MB');
        const buffer = await response.arrayBuffer();
        if (buffer.byteLength > byteLimit) throw new RangeError('图片超过 20 MB');
        if (imageFormat(buffer)) return buffer;
      }
    } catch (error) {
      if (error instanceof RangeError) throw error;
    }
    if (!url.startsWith('https:') || typeof GM_xmlhttpRequest !== 'function') throw new Error('读取图片失败');
    return new Promise((resolve, reject) => {
      const fail = (message) => reject(new Error(message));
      let request;
      request = GM_xmlhttpRequest({
        method: 'GET', url, anonymous: true, responseType: 'arraybuffer', timeout: 15000,
        onprogress: event => { if (event.loaded > byteLimit) request?.abort(); },
        onload: result => {
          if (result.status < 200 || result.status >= 300 || !result.response) fail('图片请求失败');
          else if (result.response.byteLength > byteLimit) fail('图片超过 20 MB');
          else resolve(result.response);
        },
        onerror: () => fail('图片读取失败，请重试'),
        ontimeout: () => fail('图片请求超时'),
        onabort: () => fail('图片超过 20 MB')
      });
    });
  }


  const items = new Map();
  const requests = new Map();
  const hashes = new Map();
  const queue = [];
  let active = 0;
  let nextItem = 0;
  let bytesHeld = 0;
  let route = location.href;
  let generation = 0;
  let errors = 0;
  let scanTimer;
  let hovered;
  let hideTimer;
  const mutations = new Set();
  const changed = new Set();
  const maxItems = 120;
  const maxBytes = 96*1024*1024;
  let fingerprintTail = Promise.resolve();

  function resourceId(url) {
    if (!url.startsWith('https:')) return '';
    const path = new URL(url).pathname;
    const key = path.split('/').at(-1).split('~')[0].replace(/\.(gif|jpg|jpeg|png|webp|avif)$/i,'');
    return /^[\w-]{12,}$/.test(key) ? key : '';
  }

  function lookup(source, retry = false, priority = false) {
    let job = requests.get(source.url);
    if (job) {
      const promote = source.explicit && !job.explicit && job.done && job.format && !job.item;
      job.explicit ||= source.explicit;
      job.scopes.add(source.scope);
      job.item?.scopes.add(source.scope);
      if (!promote && (!retry || !job.failed)) return job;
    }
    if (requests.size >= 700) {
      for (const [url,prior] of requests) {
        if (prior.done && !prior.item) requests.delete(url);
        if (requests.size < 500) break;
      }
    }
    if (queue.length >= 150 && !priority) return {promise:Promise.resolve(null)};
    job = {...source,scopes:new Set([source.scope]),generation};
    job.promise = new Promise(resolve => {job.resolve=resolve;});
    requests.set(source.url,job);
    if (priority) queue.unshift(job);
    else queue.push(job);
    pump();
    return job;
  }

  const original = asset => asset.ext==='gif' || asset.ext==='jpg' || (asset.ext==='png' && !asset.animated);
  function better(a,b) {
    if (original(a)!==original(b)) return original(a);
    return (a.features?.width || 0)*(a.features?.height || 0) >
      (b.features?.width || 0)*(b.features?.height || 0);
  }

  function releaseItem(item) {
    bytesHeld -= item.best.blob.size;
    URL.revokeObjectURL(item.preview);
    if (item.poster!==item.preview) URL.revokeObjectURL(item.poster);
  }
  function updateBest(item,asset) {
    if (item.best) releaseItem(item);
    item.best = asset;
    item.preview = URL.createObjectURL(asset.blob);
    item.poster = asset.features?.poster ? URL.createObjectURL(asset.features.poster) : item.preview;
    bytesHeld += asset.blob.size;
  }
  function capItems(keep) {
    while (items.size>maxItems || bytesHeld>maxBytes) {
      const victim = [...items.values()].find(item => item!==keep && item!==focused && !selection.has(item.id));
      if (!victim) break;
      releaseItem(victim);
      items.delete(victim.id);
      for (const hash of victim.hashes) hashes.delete(hash);
      for (const [url,job] of requests) if (job.item===victim) requests.delete(url);
    }
  }

  async function prepare(job) {
    const buffer = await read(job.url);
    const format = imageFormat(buffer);
    if (!format || job.generation!==generation) return null;
    job.format = format;
    if (!format.animated && !job.explicit) return null;
    const hash = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',buffer)),
      value => value.toString(16).padStart(2,'0')).join('');
    const process = fingerprintTail.then(async () => {
      if (job.generation!==generation) return null;
      let item = hashes.get(hash);
      if (!item) {
        const asset = {...format,hash,resource:resourceId(job.url),blob:new Blob([buffer],{type:format.mime})};
        try {asset.features=await inspectAsset(asset,()=>job.generation===generation);}
        catch (error) {
          // Keep decodable-by-HTML originals if the optional fingerprint API is unavailable.
          if (!await canPreview(asset.blob)) throw error;
        }
        if (job.generation!==generation) return null;
        item = [...items.values()].find(other => sameVisual(asset,other.best));
        if (!item) {
          item = {id:++nextItem,hashes:new Set(),scopes:new Set(),saved:false};
          updateBest(item,asset);
          items.set(item.id,item);
        } else if (better(asset,item.best)) updateBest(item,asset);
        item.hashes.add(hash);
        hashes.set(hash,item);
        if (item.saved) await putLocal([['saved:'+hash,true]]).catch(()=>{});
        else item.saved=await wasSaved(hash).catch(()=>false);
      }
      job.scopes.forEach(scope=>item.scopes.add(scope));
      if (job.generation!==generation) return null;
      capItems(item);
      return item;
    });
    fingerprintTail = process.catch(()=>{});
    return process;
  }

  async function canPreview(blob) {
    const url = URL.createObjectURL(blob);
    try {
      const image = make('img');
      image.src = url;
      await image.decode();
      return true;
    } catch {return false;}
    finally {URL.revokeObjectURL(url);}
  }

  function pump() {
    while (active<3 && queue.length) {
      const job = queue.shift();
      active++;
      prepare(job).then(item => {
        job.item=item;
        job.resolve(item);
      }).catch(() => {
        if (job.generation===generation) errors++;
        job.failed=true;
        job.resolve(null);
      }).finally(() => {
        job.done=true;
        active--;
        scheduleRender();
        pump();
      });
    }
  }

  function scanRoot(root, retry=false) {
    if (root===host || (root instanceof Element && !root.isConnected)) return;
    if (root instanceof Element && root.matches(mediaSelector)) {
      const source = candidate(root);
      if (source) lookup(source,retry);
    }
    for (const el of root.querySelectorAll(mediaSelector)) {
      const source = candidate(el);
      if (source) lookup(source,retry);
    }
  }

  function syncRoute() {
    if (route===location.href) return false;
    route=location.href;
    generation++;
    requests.clear();
    for (const job of queue.splice(0)) job.resolve(null);
    for (const item of items.values()) releaseItem(item);
    items.clear();
    hashes.clear();
    selection.clear();
    errors=0;
    hideHover();
    if (view==='preview') switchView('list');
    scheduleRender();
    return true;
  }

  function scheduleScan() {
    if (panel.hidden || scanTimer) return;
    scanTimer=setTimeout(() => {
      scanTimer=null;
      if (panel.hidden) return;
      if (syncRoute()) scanRoot(document);
      else {
        for (const root of mutations) scanRoot(root);
        for (const el of changed) {
          const source=candidate(el);
          if (source) lookup(source);
        }
      }
      mutations.clear();
      changed.clear();
      scheduleRender();
    },250);
  }
  const pageObserver = new MutationObserver(records => {
    for (const record of records) {
      if (record.target===host) continue;
      if (record.type==='attributes') {
        if (record.target.matches(mediaSelector)) changed.add(record.target);
      } else for (const node of record.addedNodes) if (node instanceof Element && node!==host) mutations.add(node);
    }
    if (changed.size || mutations.size || location.href!==route) scheduleScan();
  });
  function observePage() {
    pageObserver.disconnect();
    if (document.documentElement) pageObserver.observe(document.documentElement,{
      subtree:true,childList:true,attributes:true,attributeFilter:['src','srcset','data-src','style']
    });
    document.addEventListener('load',onImageLoad,true);
  }
  function onImageLoad(event) {
    if (event.target instanceof HTMLImageElement) {
      changed.add(event.target);
      scheduleScan();
    }
  }
  function stopObserving() {
    pageObserver.disconnect();
    document.removeEventListener('load',onImageLoad,true);
    clearTimeout(scanTimer);
    scanTimer=null;
    changed.clear();
    mutations.clear();
    // Leave only the small number of jobs already in flight.
    for (const job of queue.splice(0)) {
      if (requests.get(job.url)===job) requests.delete(job.url);
      job.resolve(null);
    }
  }

  function onNavigation() {
    if (syncRoute() && !panel.hidden) scanRoot(document);
  }
  window.addEventListener('popstate',onNavigation);
  window.addEventListener('hashchange',onNavigation);
  window.navigation?.addEventListener('currententrychange',onNavigation);

  function hideHover() {
    clearTimeout(hideTimer);
    hovered = null;
    hover.hidden = true;
  }
  function hideSoon() {
    clearTimeout(hideTimer);
    hideTimer = setTimeout(hideHover, 450);
  }
  function showHover(el) {
    clearTimeout(hideTimer);
    const rect = el.getBoundingClientRect();
    hover.hidden = false;
    const width = hover.offsetWidth;
    const left = rect.right + width + 8 < innerWidth ? rect.right + 3 : Math.max(3, rect.left - width - 3);
    hover.style.left = left + 'px';
    hover.style.top = Math.max(3, Math.min(innerHeight - hover.offsetHeight - 3, rect.top)) + 'px';
  }
  document.addEventListener('pointerover', event => {
    if (!(event.target instanceof Element) || event.target === host) return;
    const el = event.target.closest(mediaSelector);
    if (!el || hovered?.el === el) return;
    const source = candidate(el);
    if (!source) return;
    syncRoute();
    const current = {el, scope:source.scope, job: lookup(source, true, true)};
    hovered = current;
    if (source.explicit || current.job.item) showHover(el);
    else current.job.promise.then(item => {
      if (item && hovered === current && el.matches(':hover')) showHover(el);
    });
  }, true);
  document.addEventListener('pointerout', event => {
    if (hovered?.el.contains(event.target) && !hovered.el.contains(event.relatedTarget)) hideSoon();
  }, true);
  hover.onpointerenter = () => clearTimeout(hideTimer);
  hover.onpointerleave = hideSoon;
  hover.onclick = async () => {
    const current = hovered;
    if (!current) return;
    message('正在读取表情…');
    const item = await current.job.promise;
    if (item) await saveItems([item], false, current.scope);
    else message('无法读取此表情，请重试。');
  };
  window.addEventListener('scroll', hideHover, true);
  window.addEventListener('resize', hideHover);


  const yieldToPage = () => new Promise(resolve => setTimeout(resolve, 0));
  async function openDecoder(asset) {
    if (typeof ImageDecoder !== 'function' || !await ImageDecoder.isTypeSupported(asset.mime)) {
      throw new Error('当前浏览器无法逐帧解码该图片');
    }
    return new ImageDecoder({type:asset.mime, data:await asset.blob.arrayBuffer(), preferAnimation:true});
  }

  function frameSignature(context, image) {
    context.clearRect(0,0,16,16);
    context.drawImage(image,0,0,16,16);
    const rgba = context.getImageData(0,0,16,16).data;
    const pixels = new Uint8Array(rgba.length);
    const lightness = new Uint8Array(256);
    const gradient = new Uint8Array(240);
    for (let i=0;i<256;i++) {
      const p = i*4;
      const alpha = rgba[p+3];
      pixels[p+3] = alpha;
      for (let c=0;c<3;c++) pixels[p+c] = Math.round(rgba[p+c] * alpha / 255);
      lightness[i] = (pixels[p]*3 + pixels[p+1]*6 + pixels[p+2]) / 10 + Math.round((255-alpha)/3);
      if (i%16) gradient[i-Math.floor(i/16)-1] = Math.sign(lightness[i]-lightness[i-1])+1;
    }
    return {pixels,gradient};
  }

  async function inspectAsset(asset, alive) {
    const canvas = make('canvas');
    canvas.width = canvas.height = 16;
    const context = canvas.getContext('2d',{willReadFrequently:true});
    if (!asset.animated) {
      const image = await createImageBitmap(asset.blob);
      try {
        return {width:image.width,height:image.height,frames:[frameSignature(context,image)],loops:0};
      } finally {image.close();}
    }
    const decoder = await openDecoder(asset);
    try {
      await decoder.tracks.ready;
      const track = decoder.tracks.selectedTrack;
      if (!track?.frameCount) throw new Error('无法读取动画');
      const frames = [];
      let width, height, poster;
      // Long animations require byte equality. Sampling alone can miss an edited frame.
      const limit = track.frameCount <= 240 ? track.frameCount : 1;
      for (let i=0;i<limit;i++) {
        if (!alive()) return null;
        const {image} = await decoder.decode({frameIndex:i});
        try {
          if (i===0) {
            width = image.displayWidth;
            height = image.displayHeight;
            const thumb = make('canvas');
            const factor = Math.min(1,100 / Math.max(width,height));
            thumb.width = Math.max(1,Math.round(width*factor));
            thumb.height = Math.max(1,Math.round(height*factor));
            thumb.getContext('2d').drawImage(image,0,0,thumb.width,thumb.height);
            poster = await new Promise(resolve => thumb.toBlob(resolve,'image/png'));
          }
          frames.push({...frameSignature(context,image), duration: (image.duration ?? 0) / 1000});
        } finally {image.close();}
        if (i%6===5) await yieldToPage();
      }
      return {width,height,poster,frames:limit===track.frameCount ? frames : null,loops:track.repetitionCount};
    } finally {decoder.close();}
  }

  function frameMatches(a,b,sameResource) {
    let difference = 0;
    let heavilyChanged = 0;
    let gradients = 0;
    for (let i=0;i<a.pixels.length;i++) {
      const delta = Math.abs(a.pixels[i]-b.pixels[i]);
      difference += delta;
      if (delta > 40) heavilyChanged++;
    }
    for (let i=0;i<a.gradient.length;i++) {
      if (Math.abs(a.gradient[i]-b.gradient[i])===2) gradients++;
    }
    return difference / a.pixels.length <= (sameResource ? 7 : 5)
      && heavilyChanged <= (sameResource ? 43 : 29)
      && gradients <= (sameResource ? 53 : 40);
  }

  function sameVisual(a,b) {
    const f = a.features;
    const g = b.features;
    if (!f?.frames || !g?.frames || a.animated!==b.animated || f.frames.length!==g.frames.length
        || Math.abs(Math.log((f.width/f.height)/(g.width/g.height))) > .045) return false;
    if (a.animated && f.frames.length<2) return false;
    const sameResource = !!a.resource && a.resource===b.resource;
    let elapsedA = 0;
    let elapsedB = 0;
    for (let i=0;i<f.frames.length;i++) {
      const left = f.frames[i];
      const right = g.frames[i];
      if (!frameMatches(left,right,sameResource)) return false;
      if (a.animated) {
        elapsedA += left.duration;
        elapsedB += right.duration;
        if (Math.abs(left.duration-right.duration)>16 || Math.abs(elapsedA-elapsedB)>24) return false;
      }
    }
    return true;
  }

  async function toGif(asset) {
    const decoder = await openDecoder(asset);
    try {
      await decoder.tracks.ready;
      const track = decoder.tracks.selectedTrack;
      const count = track?.frameCount || 0;
      if (count < 2) throw new Error('无法读取全部动画帧');
      if (count > 1500) throw new Error('帧数超过转换上限');
      const encoder = gifenc.GIFEncoder();
      const canvas = make('canvas');
      const ctx = canvas.getContext('2d',{willReadFrequently:true});
      const loop = track.repetitionCount;
      const repeat = loop===Infinity ? 0 : loop>0 ? Math.min(loop,65535) : -1;
      let elapsedMs = 0;
      let writtenMs = 0;
      for (let frameIndex=0;frameIndex<count;frameIndex++) {
        const {image} = await decoder.decode({frameIndex});
        try {
          if (!frameIndex) {
            const scale = Math.min(1,1024/Math.max(image.displayWidth,image.displayHeight));
            canvas.width = Math.max(1,Math.round(image.displayWidth*scale));
            canvas.height = Math.max(1,Math.round(image.displayHeight*scale));
          }
          ctx.clearRect(0,0,canvas.width,canvas.height);
          ctx.drawImage(image,0,0,canvas.width,canvas.height);
          const rgba = ctx.getImageData(0,0,canvas.width,canvas.height).data;
          const format = 'rgba4444';
          for (let p=0;p<rgba.length;p+=4) {
            if (rgba[p+3]<=127) rgba.fill(0,p,p+4);
            else rgba[p+3] = 255;
          }
          const palette = gifenc.quantize(rgba,255,{format,oneBitAlpha:true}).filter(color => color[3]!==0);
          palette.unshift([0,0,0,0]);
          const indexed = gifenc.applyPalette(rgba,palette,format);
          for (let p=0;p<indexed.length;p++) if (!rgba[4*p+3]) indexed[p]=0;
          elapsedMs += (image.duration ?? 100000)/1000;
          const delay = Math.max(0,Math.round((elapsedMs-writtenMs)/10)*10);
          if (delay > 655350) throw new Error('动画帧间隔超过 GIF 上限');
          writtenMs += delay;
          encoder.writeFrame(indexed,canvas.width,canvas.height,{palette,transparent:true,transparentIndex:0,repeat,delay,dispose:2});
        } finally {image.close();}
        await yieldToPage();
      }
      encoder.finish();
      return new Blob([encoder.bytes()],{type:'image/gif'});
    } finally {decoder.close();}
  }

  async function toPng(blob) {
    const image = await createImageBitmap(blob);
    try {
      const canvas = make('canvas');
      canvas.width = image.width;
      canvas.height = image.height;
      canvas.getContext('2d').drawImage(image,0,0);
      return await new Promise((resolve,reject) => canvas.toBlob(result => {
        if (result) resolve(result);
        else reject(new Error('无法创建 PNG'));
      },'image/png'));
    } finally {image.close();}
  }

  async function exportAsset(asset) {
    if (asset.ext==='gif' || asset.ext==='jpg' || (asset.ext==='png' && !asset.animated)) {
      return {ext:asset.ext,blob:asset.blob};
    }
    return asset.animated
      ? {ext:'gif',blob:await toGif(asset)}
      : {ext:'png',blob:await toPng(asset.blob)};
  }

  // A single ZIP download avoids Chrome's multiple-download permission prompt.
  const crcTable = Uint32Array.from({length: 256}, (_, index) => {
    for (let bit = 0; bit < 8; bit++) index = (index >>> 1) ^ ((index & 1) ? 0xedb88320 : 0);
    return index;
  });
  async function zip(files) {
    const entries = [];
    const directory = [];
    const encoder = new TextEncoder();
    let offset = 0;
    let centralSize = 0;
    for (const file of files) {
      const name = encoder.encode(file.name);
      const data = new Uint8Array(await file.blob.arrayBuffer());
      let crc = 0xffffffff;
      for (const byte of data) crc = (crc >>> 8) ^ crcTable[(crc ^ byte) & 255];
      crc ^= 0xffffffff;
      const local = new DataView(new ArrayBuffer(30));
      local.setUint32(0, 0x04034b50, true);
      local.setUint16(4, 20, true);
      local.setUint16(6, 0x800, true);
      local.setUint16(12, 33, true);
      local.setUint32(14, crc, true);
      local.setUint32(18, data.length, true);
      local.setUint32(22, data.length, true);
      local.setUint16(26, name.length, true);
      const central = new DataView(new ArrayBuffer(46));
      central.setUint32(0, 0x02014b50, true);
      central.setUint16(4, 20, true);
      new Uint8Array(central.buffer, 6, 26).set(new Uint8Array(local.buffer, 4, 26));
      central.setUint32(42, offset, true);
      entries.push(local.buffer, name, data);
      directory.push(central.buffer, name);
      offset += 30 + name.length + data.length;
      centralSize += 46 + name.length;
    }
    const end = new DataView(new ArrayBuffer(22));
    end.setUint32(0, 0x06054b50, true);
    end.setUint16(8, files.length, true);
    end.setUint16(10, files.length, true);
    end.setUint32(12, centralSize, true);
    end.setUint32(16, offset, true);
    return new Blob([...entries, ...directory, end.buffer], {type: 'application/zip'});
  }


  const albumName = '抖音表情包';
  const writePermission = {mode:'readwrite'};
  let database;
  let directory;
  let saving = false;
  let toastTimer;
  let activity = '';
  let activityUntil = 0;

  function message(text, duration=4500) {
    activity = text;
    activityUntil = Date.now()+duration;
    toast.textContent = text;
    toast.hidden = !panel.hidden;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.hidden=true;
      scheduleRender();
    },duration);
    scheduleRender();
  }

  function openDatabase() {
    database ||= new Promise((resolve,reject) => {
      const request = indexedDB.open('douyin-emoji-helper-v5',1);
      request.onupgradeneeded=()=>request.result.createObjectStore('local');
      request.onsuccess=()=>resolve(request.result);
      request.onerror=()=>reject(request.error);
      request.onblocked=()=>reject(new Error('存储被其他标签页占用'));
    }).catch(error => {database=null;throw error;});
    return database;
  }

  async function getLocal(key) {
    const db = await openDatabase();
    return new Promise((resolve,reject) => {
      const request = db.transaction('local').objectStore('local').get(key);
      request.onsuccess=()=>resolve(request.result);
      request.onerror=()=>reject(request.error);
    });
  }

  async function putLocal(entries) {
    const db = await openDatabase();
    return new Promise((resolve,reject) => {
      const tx = db.transaction('local','readwrite');
      const store = tx.objectStore('local');
      for (const [key,value] of entries) store.put(value,key);
      tx.oncomplete=()=>resolve();
      tx.onabort=()=>reject(tx.error);
    });
  }
  const wasSaved = async hash => !!await getLocal('saved:'+hash);
  const rememberSaved = item => putLocal([...item.hashes].map(hash => ['saved:'+hash, true]));

  async function reserveNumber(date) {
    const db = await openDatabase();
    return new Promise((resolve,reject) => {
      const tx = db.transaction('local','readwrite');
      const store = tx.objectStore('local');
      const key = 'sequence:'+date;
      const request = store.get(key);
      let number;
      request.onsuccess=()=>{
        number=(request.result || 0)+1;
        store.put(number,key);
      };
      tx.oncomplete=()=>resolve(number);
      tx.onabort=()=>reject(tx.error);
    });
  }

  const directoryLoaded = getLocal('directory').then(handle => {
    if (!directory && handle) directory=handle;
    refreshDirectoryLabel();
  }).catch(()=>{});
  function refreshDirectoryLabel() {
    directoryLabel.textContent=directory
      ? `已选择「${directory.name}」，按动态和静态分类保存。`
      : '默认位于“下载/抖音表情包”。你也可以选择其他文件夹。';
  }

  async function chooseDirectory() {
    if (typeof window.showDirectoryPicker!=='function') throw new Error('此浏览器无法授权目录，可改用 ZIP');
    const chosen = await window.showDirectoryPicker({id:'douyin-emoji-album',startIn:'downloads',mode:'readwrite'});
    directory = /^(downloads|下载)$/i.test(chosen.name)
      ? await chosen.getDirectoryHandle(albumName,{create:true})
      : chosen;
    refreshDirectoryLabel();
    try {await putLocal([['directory',directory]]);}
    catch {message('本次可用，下次打开时需重新选择目录');}
    return directory;
  }

  async function writeDirectory() {
    await directoryLoaded;
    if (!directory) return chooseDirectory();
    if (await directory.queryPermission(writePermission)!=='granted' &&
        await directory.requestPermission(writePermission)!=='granted') throw new Error('目录未授权，可在设置中重新选择');
    return directory;
  }

  function dayStamp() {
    const date=new Date();
    return [date.getFullYear(),date.getMonth()+1,date.getDate()].map(value=>String(value).padStart(2,'0')).join('');
  }
  const category = asset => asset.animated ? '动态表情' : '静态表情';

  async function nextName(source,ext,date,subfolder) {
    for (;;) {
      const number=await reserveNumber(date);
      const name=`${source}_${date}_${String(number).padStart(3,'0')}.${ext}`;
      if (!subfolder) return name;
      try {await subfolder.getFileHandle(name);}
      catch (error) {
        if (error.name==='NotFoundError') return name;
        if (error.name!=='TypeMismatchError') throw error;
      }
    }
  }

  function browserDownload(name,blob) {
    const url=URL.createObjectURL(blob);
    const link=make('a');
    link.href=url;
    link.download=name;
    ui.append(link);
    link.click();
    link.remove();
    setTimeout(()=>URL.revokeObjectURL(url),30000);
  }

  const activeConversion = new Map();
  function getExport(asset) {
    if (!activeConversion.has(asset.hash)) {
      activeConversion.set(asset.hash,exportAsset(asset).catch(() => {
        throw new Error('图片转换失败');
      }).finally(()=>activeConversion.delete(asset.hash)));
    }
    return activeConversion.get(asset.hash);
  }

  function errorMessage(error) {
    if (error.name==='AbortError') return '已取消，可再次保存';
    if (error.name==='NotAllowedError') return '目录未授权，请在设置中重试';
    if (error.name==='SecurityError') return 'Chrome 拒绝目录访问，请重新选择目录';
    if (error.name==='QuotaExceededError') return '存储空间不足';
    return error.message || '保存失败，请重试';
  }

  async function saveItems(list, zipMode=false, sourceOverride) {
    if (saving || !list.length) return;
    saving=true;
    scheduleRender();
    const snapshot=list.map(item=>({item,asset:item.best,source:sourceOverride || (item.scopes.has('私信') ? '私信' : '评论')}));
    const date=dayStamp();
    const files=[];
    let failures=0;
    let written=0;
    let failedReason='';
    try {
      const root = zipMode ? null : await writeDirectory();
      const folders=new Map();
      for (const [index,{item,asset,source}] of snapshot.entries()) {
        message(`正在保存 ${index+1} / ${snapshot.length}`,60000);
        try {
          const file=await getExport(asset);
          const folderName=category(asset);
          if (root && !folders.has(folderName)) folders.set(folderName,await root.getDirectoryHandle(folderName,{create:true}));
          const folder=folders.get(folderName);
          const name=await nextName(source,file.ext,date,folder);
          if (zipMode) files.push({name:`${albumName}/${folderName}/${name}`,blob:file.blob});
          else {
            const handle=await folder.getFileHandle(name,{create:true});
            const writable=await handle.createWritable();
            try {await writable.write(file.blob);await writable.close();}
            catch (error) {await writable.abort().catch(()=>{});throw error;}
            item.saved=true;
            await rememberSaved(item).catch(()=>{});
            selection.delete(item.id);
            written++;
          }
        } catch (error) {
          failures++;
          failedReason=errorMessage(error);
          if (!zipMode && items.has(item.id)) selection.add(item.id);
        }
      }
      if (zipMode && files.length) {
        browserDownload(`抖音表情包_${date}.zip`,await zip(files));
        message(failures ? `已发起下载，${failures} 项失败，可重试` : '已发起 ZIP 下载');
      } else if (failures) {
        message(written ? `已保存 ${written} 项，${failures} 项失败，可重试` : `${failedReason}，可重试`,6500);
      } else message(written===1 ? '已保存' : `已保存 ${written} 项`);
    } catch (error) {
      message(errorMessage(error),6500);
      if (!zipMode && !panel.hidden && error.name!=='AbortError') switchView('settings');
    } finally {
      saving=false;
      scheduleRender();
    }
  }

  const selection=new Set();
  let focused;
  let focusAsset;
  let view='list';
  let filter='all';
  let renderFrame;
  const cards=new Map();
  const filters=[['all','全部'],['animated','动态'],['static','静态']];
  for (const [key,label] of filters) {
    const button=make('button',label);
    button.dataset.filter=key;
    button.setAttribute('aria-pressed',String(filter===key));
    button.onclick=()=>{
      filter=key;
      for (const tab of tabs.children) tab.setAttribute('aria-pressed',String(tab===button));
      scheduleRender();
    };
    tabs.append(button);
  }

  const directoryLabel=make('p');
  const choose=make('button','选择保存目录','primary');
  const exportZip=make('button','下载 ZIP','secondary');
  const settingsActions=make('div','','row');
  settingsActions.append(choose,exportZip);
  settings.append(make('strong','保存位置'),directoryLabel,settingsActions);
  refreshDirectoryLabel();
  choose.onclick=async()=>{
    try {
      await chooseDirectory();
      message('保存目录已设置');
    } catch (error) {message(errorMessage(error),6500);}
  };
  exportZip.onclick=()=>saveItems(currentBatch(true),true);

  const empty=make('p','打开评论或私信查看表情。','empty');
  const enlarged=make('img');
  enlarged.alt='表情预览';
  const saveOne=make('button','保存','primary');
  const selectOne=make('button','加入多选','secondary');
  const previewActions=make('div','','row');
  previewActions.append(saveOne,selectOne);
  preview.append(enlarged,previewActions);
  saveOne.onclick=()=>{if (focused) saveItems([focused]);};
  selectOne.onclick=()=>{if (focused) toggleSelection(focused);};

  function visibleItems() {
    return [...items.values()].filter(item => filter==='all' || (filter==='animated')===item.best.animated);
  }
  function currentBatch(includeSaved=false) {
    return selection.size ? [...items.values()].filter(item=>selection.has(item.id)) : visibleItems().filter(item=>includeSaved || !item.saved);
  }
  function toggleSelection(item) {
    if (selection.has(item.id)) selection.delete(item.id);
    else selection.add(item.id);
    scheduleRender();
  }

  function addCard(item) {
    const holder=make('div','','cell');
    const thumb=action('','放大预览','thumb');
    const img=make('img');
    img.alt='';
    img.loading='lazy';
    img.decoding='async';
    thumb.append(img);
    const select=action('+','选择表情','pick');
    const saved=make('span','✓','saved');
    saved.title='已保存';
    saved.setAttribute('aria-label','已保存');
    holder.append(thumb,select,saved);
    thumb.onclick=()=>{focused=item;switchView('preview');};
    select.onclick=()=>toggleSelection(item);
    thumb.onpointerenter=thumb.onfocus=()=>{img.src=item.preview;};
    thumb.onpointerleave=thumb.onblur=()=>{img.src=item.poster;};
    const card={holder,thumb,img,select,saved,asset:null};
    cards.set(item.id,card);
    return card;
  }

  function scheduleRender() {
    if (renderFrame) return;
    renderFrame=requestAnimationFrame(()=>{
      renderFrame=null;
      const n=items.size;
      badge.hidden=!n;
      badge.textContent=n>99?'99+':String(n);
      toggle.setAttribute('aria-label',n ? `表情包提取，${n} 项` : '表情包提取');
      if (panel.hidden) return;
      const visible=visibleItems();
      const count=currentBatch().length;
      batch.textContent=selection.size ? `保存 ${selection.size} 项` : '批量保存';
      batch.disabled=saving || !count;
      exportZip.disabled=saving || !currentBatch(true).length;
      saveOne.disabled=saving || !focused;
      saveOne.textContent=focused?.saved ? '再次保存' : '保存';
      selectOne.textContent=selection.has(focused?.id) ? '取消选择' : '加入多选';
      selectOne.setAttribute('aria-pressed',String(selection.has(focused?.id)));
      if (view==='preview' && focused && focused.best!==focusAsset) {
        focusAsset=focused.best;
        enlarged.src=focused.preview;
      }
      status.textContent=activityUntil>Date.now() ? activity : selection.size
        ? `已选 ${selection.size} 项` : active || queue.length ? '正在查找表情…' : errors ? `${errors} 项读取失败` : visible.length && !count ? '已全部保存' : '';
      if (view!=='list') return;
      for (const [id,card] of cards) {
        if (!items.has(id)) {card.holder.remove();cards.delete(id);}
      }
      let cursor=grid.firstChild;
      for (const item of visible) {
        const card=cards.get(item.id) || addCard(item);
        if (card.asset!==item.best) {card.asset=item.best;card.img.src=item.poster;}
        if (selection.has(item.id)) card.holder.dataset.pick='';
        else delete card.holder.dataset.pick;
        card.select.textContent=selection.has(item.id)?'✓':'+';
        card.select.setAttribute('aria-pressed',String(selection.has(item.id)));
        card.saved.hidden=!item.saved;
        if (card.holder===cursor) cursor=cursor.nextSibling;
        else grid.insertBefore(card.holder,cursor);
      }
      while (cursor) {
        const next=cursor.nextSibling;
        cursor.remove();
        cursor=next;
      }
      if (!visible.length) {
        empty.textContent=active || queue.length ? '正在查找表情…' : filter==='all' ? '打开评论或私信查看表情。' : '暂无此类表情';
        grid.append(empty);
      }
    });
  }

  function switchView(next) {
    view=next;
    const listing=next==='list';
    if (next!=='preview') {
      focused=null;
      focusAsset=null;
      enlarged.removeAttribute('src');
    }
    title.textContent=next==='settings' ? '设置' : next==='preview' ? '预览' : '表情包';
    backButton.hidden=listing;
    settingsButton.hidden=!listing;
    grid.hidden=tabs.hidden=batch.hidden=!listing;
    settings.hidden=next!=='settings';
    preview.hidden=next!=='preview';
    scheduleRender();
    alignPanel();
  }

  function showPanel(open, restoreFocus=false) {
    mount();
    panel.hidden=!open;
    toggle.setAttribute('aria-expanded',String(open));
    if (open) {
      toast.hidden=true;
      syncRoute();
      switchView('list');
      observePage();
      scanRoot(document,true);
      scheduleRender();
    } else {
      stopObserving();
      switchView('list');
      grid.replaceChildren();
      cards.clear();
      if (restoreFocus) toggle.focus({preventScroll:true});
    }
  }
  settingsButton.onclick=()=>{switchView('settings');choose.focus();};
  backButton.onclick=()=>{switchView('list');settingsButton.focus();};
  batch.onclick=()=>saveItems(currentBatch());
  toggle.addEventListener('click',event=>{
    if (suppressClick && event.detail!==0) {
      suppressClick=false;
      event.preventDefault();
      return;
    }
    showPanel(panel.hidden);
    if (!panel.hidden && event.detail===0) settingsButton.focus();
  });
  document.addEventListener('pointerdown',event=>{
    if (!panel.hidden && !event.composedPath().includes(host)) showPanel(false);
  },true);
  document.addEventListener('keydown',event=>{
    if (event.key!=='Escape' || panel.hidden) return;
    event.stopPropagation();
    event.preventDefault();
    showPanel(false,true);
  },true);
  if (typeof GM_registerMenuCommand==='function') GM_registerMenuCommand('打开表情包提取',()=>showPanel(true));
  switchView('list');

  const gifenc = (() => {
    /*
gifenc 1.0.3 (npm dist/gifenc.js, unminified)
https://www.npmjs.com/package/gifenc/v/1.0.3
https://github.com/mattdesl/gifenc
Embedded so GIF encoding remains self-contained and has no external script request.

The MIT License (MIT)
Copyright (c) 2017 Matt DesLauriers

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE
OR OTHER DEALINGS IN THE SOFTWARE.

PnnQuant.js-derived quantizer (src/pnnquant2.js)
Copyright (C) 2004-2019 Mark Tyler and Dmitry Groshev
Copyright (c) 2018-2021 Miller Cy Chan
Source: https://github.com/mcychan/PnnQuant.js
Corresponding source: gifenc 1.0.3 npm archive (package/src/pnnquant2.js)
https://registry.npmjs.org/gifenc/-/gifenc-1.0.3.tgz
The release repository also includes vendor/gifenc-1.0.3/src.

The PnnQuant.js-derived Source Code Form is subject to the terms of the Mozilla
Public License, v. 2.0. If a copy of the MPL was not distributed with this
file, you can obtain one at https://mozilla.org/MPL/2.0/.

GIF.js upstream notice
https://github.com/jnordberg/gif.js

The MIT License (MIT)

Copyright (c) 2013-2018 Johan Nordberg

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

gif-codec upstream notice
https://github.com/potomak/gif-codec

The MIT License (MIT)

Copyright (c) 2018 Giovanni Cappellotto

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

    */
    // Modified from:
    // https://github.com/mcychan/PnnQuant.js/blob/master/src/pnnquant.js
    
    /* Fast pairwise nearest neighbor based algorithm for multilevel thresholding
    Copyright (C) 2004-2019 Mark Tyler and Dmitry Groshev
    Copyright (c) 2018-2021 Miller Cy Chan
    * error measure; time used is proportional to number of bins squared - WJ */
    
    /*
      LZWEncoder.js
      Authors
      Kevin Weiner
      Thibault Imbert (AS3 version - bytearray.org)
      Johan Nordberg
      Acknowledgements
      GIFCOMPR.C - GIF Image compression routines
      Lempel-Ziv compression based on 'compress'. GIF modifications by
      David Rowley
      GIF Image compression - modified 'compress'
      Based on: compress.c - File compression ala IEEE Computer, June 1984.
      By Authors: Spencer W. Thomas (decvax!harpo!utah-cs!utah-gr!thomas)
      Jim McKie (decvax!mcvax!jim)
      Steve Davies (decvax!vax135!petsd!peora!srd)
      Ken Turkowski (decvax!decwrl!turtlevax!ken)
      James A. Woods (decvax!ihnp4!ames!jaw)
      Joe Orost (decvax!vax135!petsd!joe)
      Matt DesLauriers
      Mathieu Henri
    */

    const exports = {};

    var __defProp = Object.defineProperty;
    var __markAsModule = (target) => __defProp(target, "__esModule", {value: true});
    var __export = (target, all) => {
      for (var name in all)
        __defProp(target, name, {get: all[name], enumerable: true});
    };

    // src/index.js
    __markAsModule(exports);
    __export(exports, {
      GIFEncoder: () => GIFEncoder,
      applyPalette: () => applyPalette,
      default: () => src_default,
      nearestColor: () => nearestColor,
      nearestColorIndex: () => nearestColorIndex,
      nearestColorIndexWithDistance: () => nearestColorIndexWithDistance,
      prequantize: () => prequantize,
      quantize: () => quantize,
      snapColorsToPalette: () => snapColorsToPalette
    });

    // src/constants.js
    var constants_default = {
      signature: "GIF",
      version: "89a",
      trailer: 59,
      extensionIntroducer: 33,
      applicationExtensionLabel: 255,
      graphicControlExtensionLabel: 249,
      imageSeparator: 44,
      signatureSize: 3,
      versionSize: 3,
      globalColorTableFlagMask: 128,
      colorResolutionMask: 112,
      sortFlagMask: 8,
      globalColorTableSizeMask: 7,
      applicationIdentifierSize: 8,
      applicationAuthCodeSize: 3,
      disposalMethodMask: 28,
      userInputFlagMask: 2,
      transparentColorFlagMask: 1,
      localColorTableFlagMask: 128,
      interlaceFlagMask: 64,
      idSortFlagMask: 32,
      localColorTableSizeMask: 7
    };

    // src/stream.js
    function createStream(initialCapacity = 256) {
      let cursor = 0;
      let contents = new Uint8Array(initialCapacity);
      return {
        get buffer() {
          return contents.buffer;
        },
        reset() {
          cursor = 0;
        },
        bytesView() {
          return contents.subarray(0, cursor);
        },
        bytes() {
          return contents.slice(0, cursor);
        },
        writeByte(byte) {
          expand(cursor + 1);
          contents[cursor] = byte;
          cursor++;
        },
        writeBytes(data, offset = 0, byteLength = data.length) {
          expand(cursor + byteLength);
          for (let i = 0; i < byteLength; i++) {
            contents[cursor++] = data[i + offset];
          }
        },
        writeBytesView(data, offset = 0, byteLength = data.byteLength) {
          expand(cursor + byteLength);
          contents.set(data.subarray(offset, offset + byteLength), cursor);
          cursor += byteLength;
        }
      };
      function expand(newCapacity) {
        var prevCapacity = contents.length;
        if (prevCapacity >= newCapacity)
          return;
        var CAPACITY_DOUBLING_MAX = 1024 * 1024;
        newCapacity = Math.max(newCapacity, prevCapacity * (prevCapacity < CAPACITY_DOUBLING_MAX ? 2 : 1.125) >>> 0);
        if (prevCapacity != 0)
          newCapacity = Math.max(newCapacity, 256);
        const oldContents = contents;
        contents = new Uint8Array(newCapacity);
        if (cursor > 0)
          contents.set(oldContents.subarray(0, cursor), 0);
      }
    }

    // src/lzwEncode.js
    var BITS = 12;
    var DEFAULT_HSIZE = 5003;
    var MASKS = [
      0,
      1,
      3,
      7,
      15,
      31,
      63,
      127,
      255,
      511,
      1023,
      2047,
      4095,
      8191,
      16383,
      32767,
      65535
    ];
    function lzwEncode(width, height, pixels, colorDepth, outStream = createStream(512), accum = new Uint8Array(256), htab = new Int32Array(DEFAULT_HSIZE), codetab = new Int32Array(DEFAULT_HSIZE)) {
      const hsize = htab.length;
      const initCodeSize = Math.max(2, colorDepth);
      accum.fill(0);
      codetab.fill(0);
      htab.fill(-1);
      let cur_accum = 0;
      let cur_bits = 0;
      const init_bits = initCodeSize + 1;
      const g_init_bits = init_bits;
      let clear_flg = false;
      let n_bits = g_init_bits;
      let maxcode = (1 << n_bits) - 1;
      const ClearCode = 1 << init_bits - 1;
      const EOFCode = ClearCode + 1;
      let free_ent = ClearCode + 2;
      let a_count = 0;
      let ent = pixels[0];
      let hshift = 0;
      for (let fcode = hsize; fcode < 65536; fcode *= 2) {
        ++hshift;
      }
      hshift = 8 - hshift;
      outStream.writeByte(initCodeSize);
      output(ClearCode);
      const length = pixels.length;
      for (let idx = 1; idx < length; idx++) {
        next_block: {
          const c = pixels[idx];
          const fcode = (c << BITS) + ent;
          let i = c << hshift ^ ent;
          if (htab[i] === fcode) {
            ent = codetab[i];
            break next_block;
          }
          const disp = i === 0 ? 1 : hsize - i;
          while (htab[i] >= 0) {
            i -= disp;
            if (i < 0)
              i += hsize;
            if (htab[i] === fcode) {
              ent = codetab[i];
              break next_block;
            }
          }
          output(ent);
          ent = c;
          if (free_ent < 1 << BITS) {
            codetab[i] = free_ent++;
            htab[i] = fcode;
          } else {
            htab.fill(-1);
            free_ent = ClearCode + 2;
            clear_flg = true;
            output(ClearCode);
          }
        }
      }
      output(ent);
      output(EOFCode);
      outStream.writeByte(0);
      return outStream.bytesView();
      function output(code) {
        cur_accum &= MASKS[cur_bits];
        if (cur_bits > 0)
          cur_accum |= code << cur_bits;
        else
          cur_accum = code;
        cur_bits += n_bits;
        while (cur_bits >= 8) {
          accum[a_count++] = cur_accum & 255;
          if (a_count >= 254) {
            outStream.writeByte(a_count);
            outStream.writeBytesView(accum, 0, a_count);
            a_count = 0;
          }
          cur_accum >>= 8;
          cur_bits -= 8;
        }
        if (free_ent > maxcode || clear_flg) {
          if (clear_flg) {
            n_bits = g_init_bits;
            maxcode = (1 << n_bits) - 1;
            clear_flg = false;
          } else {
            ++n_bits;
            maxcode = n_bits === BITS ? 1 << n_bits : (1 << n_bits) - 1;
          }
        }
        if (code == EOFCode) {
          while (cur_bits > 0) {
            accum[a_count++] = cur_accum & 255;
            if (a_count >= 254) {
              outStream.writeByte(a_count);
              outStream.writeBytesView(accum, 0, a_count);
              a_count = 0;
            }
            cur_accum >>= 8;
            cur_bits -= 8;
          }
          if (a_count > 0) {
            outStream.writeByte(a_count);
            outStream.writeBytesView(accum, 0, a_count);
            a_count = 0;
          }
        }
      }
    }
    var lzwEncode_default = lzwEncode;

    // src/rgb-packing.js
    function rgb888_to_rgb565(r, g, b) {
      return r << 8 & 63488 | g << 2 & 992 | b >> 3;
    }
    function rgba8888_to_rgba4444(r, g, b, a) {
      return r >> 4 | g & 240 | (b & 240) << 4 | (a & 240) << 8;
    }
    function rgb888_to_rgb444(r, g, b) {
      return r >> 4 << 8 | g & 240 | b >> 4;
    }

    // src/pnnquant2.js
    function clamp(value, min, max) {
      return value < min ? min : value > max ? max : value;
    }
    function sqr(value) {
      return value * value;
    }
    function find_nn(bins, idx, hasAlpha) {
      var nn = 0;
      var err = 1e100;
      const bin1 = bins[idx];
      const n1 = bin1.cnt;
      const wa = bin1.ac;
      const wr = bin1.rc;
      const wg = bin1.gc;
      const wb = bin1.bc;
      for (var i = bin1.fw; i != 0; i = bins[i].fw) {
        const bin = bins[i];
        const n2 = bin.cnt;
        const nerr2 = n1 * n2 / (n1 + n2);
        if (nerr2 >= err)
          continue;
        var nerr = 0;
        if (hasAlpha) {
          nerr += nerr2 * sqr(bin.ac - wa);
          if (nerr >= err)
            continue;
        }
        nerr += nerr2 * sqr(bin.rc - wr);
        if (nerr >= err)
          continue;
        nerr += nerr2 * sqr(bin.gc - wg);
        if (nerr >= err)
          continue;
        nerr += nerr2 * sqr(bin.bc - wb);
        if (nerr >= err)
          continue;
        err = nerr;
        nn = i;
      }
      bin1.err = err;
      bin1.nn = nn;
    }
    function create_bin() {
      return {
        ac: 0,
        rc: 0,
        gc: 0,
        bc: 0,
        cnt: 0,
        nn: 0,
        fw: 0,
        bk: 0,
        tm: 0,
        mtm: 0,
        err: 0
      };
    }
    function create_bin_list(data, format) {
      const bincount = format === "rgb444" ? 4096 : 65536;
      const bins = new Array(bincount);
      const size = data.length;
      if (format === "rgba4444") {
        for (let i = 0; i < size; ++i) {
          const color = data[i];
          const a = color >> 24 & 255;
          const b = color >> 16 & 255;
          const g = color >> 8 & 255;
          const r = color & 255;
          const index = rgba8888_to_rgba4444(r, g, b, a);
          let bin = index in bins ? bins[index] : bins[index] = create_bin();
          bin.rc += r;
          bin.gc += g;
          bin.bc += b;
          bin.ac += a;
          bin.cnt++;
        }
      } else if (format === "rgb444") {
        for (let i = 0; i < size; ++i) {
          const color = data[i];
          const b = color >> 16 & 255;
          const g = color >> 8 & 255;
          const r = color & 255;
          const index = rgb888_to_rgb444(r, g, b);
          let bin = index in bins ? bins[index] : bins[index] = create_bin();
          bin.rc += r;
          bin.gc += g;
          bin.bc += b;
          bin.cnt++;
        }
      } else {
        for (let i = 0; i < size; ++i) {
          const color = data[i];
          const b = color >> 16 & 255;
          const g = color >> 8 & 255;
          const r = color & 255;
          const index = rgb888_to_rgb565(r, g, b);
          let bin = index in bins ? bins[index] : bins[index] = create_bin();
          bin.rc += r;
          bin.gc += g;
          bin.bc += b;
          bin.cnt++;
        }
      }
      return bins;
    }
    function quantize(rgba, maxColors, opts = {}) {
      const {
        format = "rgb565",
        clearAlpha = true,
        clearAlphaColor = 0,
        clearAlphaThreshold = 0,
        oneBitAlpha = false
      } = opts;
      if (!rgba || !rgba.buffer) {
        throw new Error("quantize() expected RGBA Uint8Array data");
      }
      if (!(rgba instanceof Uint8Array) && !(rgba instanceof Uint8ClampedArray)) {
        throw new Error("quantize() expected RGBA Uint8Array data");
      }
      const data = new Uint32Array(rgba.buffer);
      let useSqrt = opts.useSqrt !== false;
      const hasAlpha = format === "rgba4444";
      const bins = create_bin_list(data, format);
      const bincount = bins.length;
      const bincountMinusOne = bincount - 1;
      const heap = new Uint32Array(bincount + 1);
      var maxbins = 0;
      for (var i = 0; i < bincount; ++i) {
        const bin = bins[i];
        if (bin != null) {
          var d = 1 / bin.cnt;
          if (hasAlpha)
            bin.ac *= d;
          bin.rc *= d;
          bin.gc *= d;
          bin.bc *= d;
          bins[maxbins++] = bin;
        }
      }
      if (sqr(maxColors) / maxbins < 0.022) {
        useSqrt = false;
      }
      var i = 0;
      for (; i < maxbins - 1; ++i) {
        bins[i].fw = i + 1;
        bins[i + 1].bk = i;
        if (useSqrt)
          bins[i].cnt = Math.sqrt(bins[i].cnt);
      }
      if (useSqrt)
        bins[i].cnt = Math.sqrt(bins[i].cnt);
      var h, l, l2;
      for (i = 0; i < maxbins; ++i) {
        find_nn(bins, i, false);
        var err = bins[i].err;
        for (l = ++heap[0]; l > 1; l = l2) {
          l2 = l >> 1;
          if (bins[h = heap[l2]].err <= err)
            break;
          heap[l] = h;
        }
        heap[l] = i;
      }
      var extbins = maxbins - maxColors;
      for (i = 0; i < extbins; ) {
        var tb;
        for (; ; ) {
          var b1 = heap[1];
          tb = bins[b1];
          if (tb.tm >= tb.mtm && bins[tb.nn].mtm <= tb.tm)
            break;
          if (tb.mtm == bincountMinusOne)
            b1 = heap[1] = heap[heap[0]--];
          else {
            find_nn(bins, b1, false);
            tb.tm = i;
          }
          var err = bins[b1].err;
          for (l = 1; (l2 = l + l) <= heap[0]; l = l2) {
            if (l2 < heap[0] && bins[heap[l2]].err > bins[heap[l2 + 1]].err)
              l2++;
            if (err <= bins[h = heap[l2]].err)
              break;
            heap[l] = h;
          }
          heap[l] = b1;
        }
        var nb = bins[tb.nn];
        var n1 = tb.cnt;
        var n2 = nb.cnt;
        var d = 1 / (n1 + n2);
        if (hasAlpha)
          tb.ac = d * (n1 * tb.ac + n2 * nb.ac);
        tb.rc = d * (n1 * tb.rc + n2 * nb.rc);
        tb.gc = d * (n1 * tb.gc + n2 * nb.gc);
        tb.bc = d * (n1 * tb.bc + n2 * nb.bc);
        tb.cnt += nb.cnt;
        tb.mtm = ++i;
        bins[nb.bk].fw = nb.fw;
        bins[nb.fw].bk = nb.bk;
        nb.mtm = bincountMinusOne;
      }
      let palette = [];
      var k = 0;
      for (i = 0; ; ++k) {
        let r = clamp(Math.round(bins[i].rc), 0, 255);
        let g = clamp(Math.round(bins[i].gc), 0, 255);
        let b = clamp(Math.round(bins[i].bc), 0, 255);
        let a = 255;
        if (hasAlpha) {
          a = clamp(Math.round(bins[i].ac), 0, 255);
          if (oneBitAlpha) {
            const threshold = typeof oneBitAlpha === "number" ? oneBitAlpha : 127;
            a = a <= threshold ? 0 : 255;
          }
          if (clearAlpha && a <= clearAlphaThreshold) {
            r = g = b = clearAlphaColor;
            a = 0;
          }
        }
        const color = hasAlpha ? [r, g, b, a] : [r, g, b];
        const exists = existsInPalette(palette, color);
        if (!exists)
          palette.push(color);
        if ((i = bins[i].fw) == 0)
          break;
      }
      return palette;
    }
    function existsInPalette(palette, color) {
      for (let i = 0; i < palette.length; i++) {
        const p = palette[i];
        let matchesRGB = p[0] === color[0] && p[1] === color[1] && p[2] === color[2];
        let matchesAlpha = p.length >= 4 && color.length >= 4 ? p[3] === color[3] : true;
        if (matchesRGB && matchesAlpha)
          return true;
      }
      return false;
    }

    // src/color.js
    function euclideanDistanceSquared(a, b) {
      var sum = 0;
      var n;
      for (n = 0; n < a.length; n++) {
        const dx = a[n] - b[n];
        sum += dx * dx;
      }
      return sum;
    }

    // src/palettize.js
    function roundStep(byte, step) {
      return step > 1 ? Math.round(byte / step) * step : byte;
    }
    function prequantize(rgba, {roundRGB = 5, roundAlpha = 10, oneBitAlpha = null} = {}) {
      const data = new Uint32Array(rgba.buffer);
      for (let i = 0; i < data.length; i++) {
        const color = data[i];
        let a = color >> 24 & 255;
        let b = color >> 16 & 255;
        let g = color >> 8 & 255;
        let r = color & 255;
        a = roundStep(a, roundAlpha);
        if (oneBitAlpha) {
          const threshold = typeof oneBitAlpha === "number" ? oneBitAlpha : 127;
          a = a <= threshold ? 0 : 255;
        }
        r = roundStep(r, roundRGB);
        g = roundStep(g, roundRGB);
        b = roundStep(b, roundRGB);
        data[i] = a << 24 | b << 16 | g << 8 | r << 0;
      }
    }
    function applyPalette(rgba, palette, format = "rgb565") {
      if (!rgba || !rgba.buffer) {
        throw new Error("quantize() expected RGBA Uint8Array data");
      }
      if (!(rgba instanceof Uint8Array) && !(rgba instanceof Uint8ClampedArray)) {
        throw new Error("quantize() expected RGBA Uint8Array data");
      }
      if (palette.length > 256) {
        throw new Error("applyPalette() only works with 256 colors or less");
      }
      const data = new Uint32Array(rgba.buffer);
      const length = data.length;
      const bincount = format === "rgb444" ? 4096 : 65536;
      const index = new Uint8Array(length);
      const cache = new Array(bincount);
      const hasAlpha = format === "rgba4444";
      if (format === "rgba4444") {
        for (let i = 0; i < length; i++) {
          const color = data[i];
          const a = color >> 24 & 255;
          const b = color >> 16 & 255;
          const g = color >> 8 & 255;
          const r = color & 255;
          const key = rgba8888_to_rgba4444(r, g, b, a);
          const idx = key in cache ? cache[key] : cache[key] = nearestColorIndexRGBA(r, g, b, a, palette);
          index[i] = idx;
        }
      } else {
        const rgb888_to_key = format === "rgb444" ? rgb888_to_rgb444 : rgb888_to_rgb565;
        for (let i = 0; i < length; i++) {
          const color = data[i];
          const b = color >> 16 & 255;
          const g = color >> 8 & 255;
          const r = color & 255;
          const key = rgb888_to_key(r, g, b);
          const idx = key in cache ? cache[key] : cache[key] = nearestColorIndexRGB(r, g, b, palette);
          index[i] = idx;
        }
      }
      return index;
    }
    function nearestColorIndexRGBA(r, g, b, a, palette) {
      let k = 0;
      let mindist = 1e100;
      for (let i = 0; i < palette.length; i++) {
        const px2 = palette[i];
        const a2 = px2[3];
        let curdist = sqr2(a2 - a);
        if (curdist > mindist)
          continue;
        const r2 = px2[0];
        curdist += sqr2(r2 - r);
        if (curdist > mindist)
          continue;
        const g2 = px2[1];
        curdist += sqr2(g2 - g);
        if (curdist > mindist)
          continue;
        const b2 = px2[2];
        curdist += sqr2(b2 - b);
        if (curdist > mindist)
          continue;
        mindist = curdist;
        k = i;
      }
      return k;
    }
    function nearestColorIndexRGB(r, g, b, palette) {
      let k = 0;
      let mindist = 1e100;
      for (let i = 0; i < palette.length; i++) {
        const px2 = palette[i];
        const r2 = px2[0];
        let curdist = sqr2(r2 - r);
        if (curdist > mindist)
          continue;
        const g2 = px2[1];
        curdist += sqr2(g2 - g);
        if (curdist > mindist)
          continue;
        const b2 = px2[2];
        curdist += sqr2(b2 - b);
        if (curdist > mindist)
          continue;
        mindist = curdist;
        k = i;
      }
      return k;
    }
    function snapColorsToPalette(palette, knownColors, threshold = 5) {
      if (!palette.length || !knownColors.length)
        return;
      const paletteRGB = palette.map((p) => p.slice(0, 3));
      const thresholdSq = threshold * threshold;
      const dim = palette[0].length;
      for (let i = 0; i < knownColors.length; i++) {
        let color = knownColors[i];
        if (color.length < dim) {
          color = [color[0], color[1], color[2], 255];
        } else if (color.length > dim) {
          color = color.slice(0, 3);
        } else {
          color = color.slice();
        }
        const r = nearestColorIndexWithDistance(paletteRGB, color.slice(0, 3), euclideanDistanceSquared);
        const idx = r[0];
        const distanceSq = r[1];
        if (distanceSq > 0 && distanceSq <= thresholdSq) {
          palette[idx] = color;
        }
      }
    }
    function sqr2(a) {
      return a * a;
    }
    function nearestColorIndex(colors, pixel, distanceFn = euclideanDistanceSquared) {
      let minDist = Infinity;
      let minDistIndex = -1;
      for (let j = 0; j < colors.length; j++) {
        const paletteColor = colors[j];
        const dist = distanceFn(pixel, paletteColor);
        if (dist < minDist) {
          minDist = dist;
          minDistIndex = j;
        }
      }
      return minDistIndex;
    }
    function nearestColorIndexWithDistance(colors, pixel, distanceFn = euclideanDistanceSquared) {
      let minDist = Infinity;
      let minDistIndex = -1;
      for (let j = 0; j < colors.length; j++) {
        const paletteColor = colors[j];
        const dist = distanceFn(pixel, paletteColor);
        if (dist < minDist) {
          minDist = dist;
          minDistIndex = j;
        }
      }
      return [minDistIndex, minDist];
    }
    function nearestColor(colors, pixel, distanceFn = euclideanDistanceSquared) {
      return colors[nearestColorIndex(colors, pixel, distanceFn)];
    }

    // src/index.js
    function GIFEncoder(opt = {}) {
      const {initialCapacity = 4096, auto = true} = opt;
      const stream = createStream(initialCapacity);
      const HSIZE = 5003;
      const accum = new Uint8Array(256);
      const htab = new Int32Array(HSIZE);
      const codetab = new Int32Array(HSIZE);
      let hasInit = false;
      return {
        reset() {
          stream.reset();
          hasInit = false;
        },
        finish() {
          stream.writeByte(constants_default.trailer);
        },
        bytes() {
          return stream.bytes();
        },
        bytesView() {
          return stream.bytesView();
        },
        get buffer() {
          return stream.buffer;
        },
        get stream() {
          return stream;
        },
        writeHeader,
        writeFrame(index, width, height, opts = {}) {
          const {
            transparent = false,
            transparentIndex = 0,
            delay = 0,
            palette = null,
            repeat = 0,
            colorDepth = 8,
            dispose = -1
          } = opts;
          let first = false;
          if (auto) {
            if (!hasInit) {
              first = true;
              writeHeader();
              hasInit = true;
            }
          } else {
            first = Boolean(opts.first);
          }
          width = Math.max(0, Math.floor(width));
          height = Math.max(0, Math.floor(height));
          if (first) {
            if (!palette) {
              throw new Error("First frame must include a { palette } option");
            }
            encodeLogicalScreenDescriptor(stream, width, height, palette, colorDepth);
            encodeColorTable(stream, palette);
            if (repeat >= 0) {
              encodeNetscapeExt(stream, repeat);
            }
          }
          const delayTime = Math.round(delay / 10);
          encodeGraphicControlExt(stream, dispose, delayTime, transparent, transparentIndex);
          const useLocalColorTable = Boolean(palette) && !first;
          encodeImageDescriptor(stream, width, height, useLocalColorTable ? palette : null);
          if (useLocalColorTable)
            encodeColorTable(stream, palette);
          encodePixels(stream, index, width, height, colorDepth, accum, htab, codetab);
        }
      };
      function writeHeader() {
        writeUTFBytes(stream, "GIF89a");
      }
    }
    function encodeGraphicControlExt(stream, dispose, delay, transparent, transparentIndex) {
      stream.writeByte(33);
      stream.writeByte(249);
      stream.writeByte(4);
      if (transparentIndex < 0) {
        transparentIndex = 0;
        transparent = false;
      }
      var transp, disp;
      if (!transparent) {
        transp = 0;
        disp = 0;
      } else {
        transp = 1;
        disp = 2;
      }
      if (dispose >= 0) {
        disp = dispose & 7;
      }
      disp <<= 2;
      const userInput = 0;
      stream.writeByte(0 | disp | userInput | transp);
      writeUInt16(stream, delay);
      stream.writeByte(transparentIndex || 0);
      stream.writeByte(0);
    }
    function encodeLogicalScreenDescriptor(stream, width, height, palette, colorDepth = 8) {
      const globalColorTableFlag = 1;
      const sortFlag = 0;
      const globalColorTableSize = colorTableSize(palette.length) - 1;
      const fields = globalColorTableFlag << 7 | colorDepth - 1 << 4 | sortFlag << 3 | globalColorTableSize;
      const backgroundColorIndex = 0;
      const pixelAspectRatio = 0;
      writeUInt16(stream, width);
      writeUInt16(stream, height);
      stream.writeBytes([fields, backgroundColorIndex, pixelAspectRatio]);
    }
    function encodeNetscapeExt(stream, repeat) {
      stream.writeByte(33);
      stream.writeByte(255);
      stream.writeByte(11);
      writeUTFBytes(stream, "NETSCAPE2.0");
      stream.writeByte(3);
      stream.writeByte(1);
      writeUInt16(stream, repeat);
      stream.writeByte(0);
    }
    function encodeColorTable(stream, palette) {
      const colorTableLength = 1 << colorTableSize(palette.length);
      for (let i = 0; i < colorTableLength; i++) {
        let color = [0, 0, 0];
        if (i < palette.length) {
          color = palette[i];
        }
        stream.writeByte(color[0]);
        stream.writeByte(color[1]);
        stream.writeByte(color[2]);
      }
    }
    function encodeImageDescriptor(stream, width, height, localPalette) {
      stream.writeByte(44);
      writeUInt16(stream, 0);
      writeUInt16(stream, 0);
      writeUInt16(stream, width);
      writeUInt16(stream, height);
      if (localPalette) {
        const interlace = 0;
        const sorted = 0;
        const palSize = colorTableSize(localPalette.length) - 1;
        stream.writeByte(128 | interlace | sorted | 0 | palSize);
      } else {
        stream.writeByte(0);
      }
    }
    function encodePixels(stream, index, width, height, colorDepth = 8, accum, htab, codetab) {
      lzwEncode_default(width, height, index, colorDepth, stream, accum, htab, codetab);
    }
    function writeUInt16(stream, short) {
      stream.writeByte(short & 255);
      stream.writeByte(short >> 8 & 255);
    }
    function writeUTFBytes(stream, text) {
      for (var i = 0; i < text.length; i++) {
        stream.writeByte(text.charCodeAt(i));
      }
    }
    function colorTableSize(length) {
      return Math.max(Math.ceil(Math.log2(length)), 1);
    }
    var src_default = GIFEncoder;

    return { GIFEncoder: exports.GIFEncoder, applyPalette: exports.applyPalette, quantize: exports.quantize };
  })();

})();
