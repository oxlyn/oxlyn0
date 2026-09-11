
"use strict";
/* =========================================================
   0. 基础工具
   ========================================================= */
const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const ENC = new TextEncoder();
const DEC = new TextDecoder();
const hasSubtle = typeof crypto !== 'undefined' && crypto.subtle;

function esc(s){
  return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
let toastTimer;
function toast(msg){
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('on');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('on'), 1700);
}
async function copyText(txt){
  if (!txt) return toast('没有可复制的内容');
  try { await navigator.clipboard.writeText(txt); }
  catch {
    const ta = document.createElement('textarea');
    ta.value = txt; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); } catch {}
    ta.remove();
  }
  toast('已复制到剪贴板');
}
function downloadFile(name, content, type = 'text/plain'){
  const blob = content instanceof Blob ? content : new Blob([content], {type});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 3000);
}
function fmtBytes(n){
  if (n < 1024) return n + ' B';
  const u = ['KB','MB','GB','TB'];
  let i = -1;
  do { n /= 1024; i++; } while (n >= 1024 && i < u.length - 1);
  return n.toFixed(2) + ' ' + u[i];
}
function randInt(max){
  if (window.crypto && crypto.getRandomValues){
    const a = new Uint32Array(1);
    const lim = Math.floor(4294967296 / max) * max;
    let v;
    do { crypto.getRandomValues(a); v = a[0]; } while (v >= lim);
    return v % max;
  }
  return Math.floor(Math.random() * max);
}
function setMsg(id, text, err){
  const e = $('#' + id);
  if (!e) return;
  e.className = 'msg' + (err ? ' err' : '');
  e.textContent = text || '';
}
function pane(label, id, ph, cls = ''){
  return `<div class="pane">
    <div class="pane-head"><span>${label}</span><span class="sp"></span>
      <button class="mini" data-copy="${id}">复制</button>
      <button class="mini" data-clear="${id}">清空</button>
    </div>
    <textarea class="ta ${cls}" id="${id}" placeholder="${ph}" spellcheck="false"></textarea>
  </div>`;
}
function paneOut(label, id, ph = '结果将显示在这里…', cls = ''){
  return `<div class="pane">
    <div class="pane-head"><span>${label}</span><span class="sp"></span>
      <button class="mini" data-copy="${id}">复制</button>
      <button class="mini" data-clear="${id}">清空</button>
    </div>
    <textarea class="ta ${cls}" id="${id}" placeholder="${ph}" spellcheck="false" readonly></textarea>
  </div>`;
}
function mount(html){ const v = $('#view'); v.innerHTML = html; return v; }

/* =========================================================
   1. 编解码底层
   ========================================================= */
function strToBytes(s){ return ENC.encode(s); }
function bytesToStr(b){ return DEC.decode(b); }

function b64encode(str, urlSafe){
  const bytes = strToBytes(str);
  let bin = '';
  const CH = 0x8000;
  for (let i = 0; i < bytes.length; i += CH)
    bin += String.fromCharCode.apply(null, bytes.subarray(i, i + CH));
  let r = btoa(bin);
  if (urlSafe) r = r.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  return r;
}
function b64decode(str, urlSafe){
  let s = String(str).replace(/\s+/g, '');
  if (urlSafe !== false) s = s.replace(/-/g, '+').replace(/_/g, '/');
  while (s.length % 4) s += '=';
  const bin = atob(s);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytesToStr(bytes);
}
const pad2 = n => String(n).padStart(2, '0');
const hx = n => n.toString(16).padStart(2, '0');

/* =========================================================
   2. MD5
   ========================================================= */
const MD5_S = [7,12,17,22,7,12,17,22,7,12,17,22,7,12,17,22,
               5,9,14,20,5,9,14,20,5,9,14,20,5,9,14,20,
               4,11,16,23,4,11,16,23,4,11,16,23,4,11,16,23,
               6,10,15,21,6,10,15,21,6,10,15,21,6,10,15,21];
const MD5_K = (() => {
  const k = new Uint32Array(64);
  for (let i = 0; i < 64; i++) k[i] = Math.floor(Math.abs(Math.sin(i + 1)) * 4294967296);
  return k;
})();
function md5(input){
  const bytes = typeof input === 'string' ? strToBytes(input) : input;
  const len = bytes.length;
  const total = ((len + 8) >> 6 << 6) + 64;
  const buf = new Uint8Array(total);
  buf.set(bytes);
  buf[len] = 0x80;
  const dv = new DataView(buf.buffer);
  const bits = len * 8;
  dv.setUint32(total - 8, bits >>> 0, true);
  dv.setUint32(total - 4, Math.floor(bits / 4294967296), true);
  let a0 = 0x67452301, b0 = 0xefcdab89, c0 = 0x98badcfe, d0 = 0x10325476;
  const M = new Uint32Array(16);
  for (let off = 0; off < total; off += 64){
    for (let i = 0; i < 16; i++) M[i] = dv.getUint32(off + i * 4, true);
    let A = a0, B = b0, C = c0, D = d0;
    for (let i = 0; i < 64; i++){
      let F, g;
      if (i < 16){ F = (B & C) | (~B & D); g = i; }
      else if (i < 32){ F = (D & B) | (~D & C); g = (5 * i + 1) % 16; }
      else if (i < 48){ F = B ^ C ^ D; g = (3 * i + 5) % 16; }
      else { F = C ^ (B | ~D); g = (7 * i) % 16; }
      F = (F + A + MD5_K[i] + M[g]) >>> 0;
      A = D; D = C; C = B;
      B = (B + ((F << MD5_S[i]) | (F >>> (32 - MD5_S[i])))) >>> 0;
    }
    a0 = (a0 + A) >>> 0; b0 = (b0 + B) >>> 0;
    c0 = (c0 + C) >>> 0; d0 = (d0 + D) >>> 0;
  }
  const le = x => hx(x & 0xff) + hx((x >>> 8) & 0xff) + hx((x >>> 16) & 0xff) + hx((x >>> 24) & 0xff);
  return le(a0) + le(b0) + le(c0) + le(d0);
}
async function sha(algo, data){
  if (!hasSubtle) throw new Error('当前环境不支持 WebCrypto（请用 https 或 localhost 打开）');
  const buf = typeof data === 'string' ? strToBytes(data) : data;
  const h = await crypto.subtle.digest(algo, buf);
  return Array.from(new Uint8Array(h), b => hx(b)).join('');
}

/* =========================================================
   3. QR 码生成（版本 1–9，纠错等级 L，掩码 0）
   ========================================================= */
const QR = (function(){
  const EXP = new Uint8Array(512), LOG = new Uint8Array(256);
  (function(){
    let x = 1;
    for (let i = 0; i < 255; i++){ EXP[i] = x; LOG[x] = i; x <<= 1; if (x & 0x100) x ^= 0x11d; }
    for (let i = 255; i < 512; i++) EXP[i] = EXP[i - 255];
  })();
  const mul = (a, b) => (a === 0 || b === 0) ? 0 : EXP[LOG[a] + LOG[b]];

  // 纠错等级 L 的 RS 分块表：[块数, 每块总码字, 每块数据码字]
  const RS_BLOCK = {
    1:  [[1, 26, 19]],
    2:  [[1, 44, 34]],
    3:  [[1, 70, 55]],
    4:  [[1, 100, 80]],
    5:  [[1, 134, 108]],
    6:  [[2, 86, 68]],
    7:  [[2, 98, 78]],
    8:  [[2, 121, 97]],
    9:  [[2, 146, 116]]
  };
  const ALIGN = {
    1: [], 2: [6,18], 3: [6,22], 4: [6,26], 5: [6,30],
    6: [6,34], 7: [6,22,38], 8: [6,24,42], 9: [6,26,46]
  };
  const VERSION_INFO = { 7: 0x07C94, 8: 0x085BC, 9: 0x09A99 };

  function rsDivisor(degree){
    const result = new Uint8Array(degree);
    result[degree - 1] = 1;
    let root = 1;
    for (let i = 0; i < degree; i++){
      for (let j = 0; j < degree; j++){
        result[j] = mul(result[j], root);
        if (j + 1 < degree) result[j] ^= result[j + 1];
      }
      root = mul(root, 2);
    }
    return result;
  }
  function rsRemainder(data, divisor){
    const result = new Uint8Array(divisor.length);
    for (const b of data){
      const factor = b ^ result[0];
      result.copyWithin(0, 1);
      result[result.length - 1] = 0;
      for (let i = 0; i < result.length; i++) result[i] ^= mul(divisor[i], factor);
    }
    return result;
  }

  function encode(text){
    const bytes = strToBytes(text);
    let version = 0, dataCap = 0;
    for (let v = 1; v <= 9; v++){
      let cap = 0;
      for (const [num, , d] of RS_BLOCK[v]) cap += num * d;
      const need = 4 + 8 + bytes.length * 8;
      if (need <= cap * 8){ version = v; dataCap = cap; break; }
    }
    if (!version) throw new Error('内容过长，最多约 230 字节');

    const bits = [];
    const push = (val, len) => { for (let i = len - 1; i >= 0; i--) bits.push((val >>> i) & 1); };
    push(4, 4);                          // 字节模式
    push(bytes.length, 8);               // 字符计数（版本 1-9 为 8 位）
    for (const b of bytes) push(b, 8);
    const capBits = dataCap * 8;
    for (let i = 0; i < Math.min(4, capBits - bits.length); i++) bits.push(0);
    while (bits.length % 8) bits.push(0);
    const PAD = [0xEC, 0x11];
    let pi = 0;
    while (bits.length < capBits) push(PAD[pi++ % 2], 8);

    const cw = [];
    for (let i = 0; i < bits.length; i += 8){
      let b = 0;
      for (let j = 0; j < 8; j++) b = (b << 1) | bits[i + j];
      cw.push(b);
    }

    const dataBlocks = [], ecBlocks = [];
    let pos = 0;
    for (const [num, total, dlen] of RS_BLOCK[version]){
      for (let i = 0; i < num; i++){
        const d = cw.slice(pos, pos + dlen); pos += dlen;
        dataBlocks.push(d);
        ecBlocks.push(Array.from(rsRemainder(d, rsDivisor(total - dlen))));
      }
    }
    const out = [];
    const maxD = Math.max(...dataBlocks.map(b => b.length));
    for (let i = 0; i < maxD; i++)
      for (const b of dataBlocks) if (i < b.length) out.push(b[i]);
    const ecLen = ecBlocks[0].length;
    for (let i = 0; i < ecLen; i++)
      for (const b of ecBlocks) out.push(b[i]);

    return { version, codewords: out };
  }

  function buildMatrix(version, codewords){
    const size = version * 4 + 17;
    const mod = Array.from({length: size}, () => new Array(size).fill(false));
    const fn  = Array.from({length: size}, () => new Array(size).fill(false));
    const set = (x, y, v) => {
      if (x < 0 || y < 0 || x >= size || y >= size) return;
      mod[y][x] = v; fn[y][x] = true;
    };
    const bit = (v, i) => ((v >>> i) & 1) !== 0;

    // 时序图案
    for (let i = 0; i < size; i++){ set(6, i, i % 2 === 0); set(i, 6, i % 2 === 0); }
    // 定位图案
    const finder = (cx, cy) => {
      for (let dy = -4; dy <= 4; dy++) for (let dx = -4; dx <= 4; dx++){
        const d = Math.max(Math.abs(dx), Math.abs(dy));
        set(cx + dx, cy + dy, d !== 2 && d !== 4);
      }
    };
    finder(3, 3); finder(size - 4, 3); finder(3, size - 4);
    // 校正图案
    const ap = ALIGN[version];
    for (let i = 0; i < ap.length; i++) for (let j = 0; j < ap.length; j++){
      if ((i === 0 && j === 0) || (i === 0 && j === ap.length - 1) || (i === ap.length - 1 && j === 0)) continue;
      for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++)
        set(ap[i] + dx, ap[j] + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
    }

    // 格式信息：纠错等级 L(01) + 掩码 0
    const data = (1 << 3) | 0;
    let rem = data;
    for (let i = 0; i < 10; i++) rem = (rem << 1) ^ ((rem >>> 9) * 0x537);
    const fmt = ((data << 10) | rem) ^ 0x5412;
    for (let i = 0; i <= 5; i++) set(8, i, bit(fmt, i));
    set(8, 7, bit(fmt, 6));
    set(8, 8, bit(fmt, 7));
    set(7, 8, bit(fmt, 8));
    for (let i = 9; i < 15; i++) set(14 - i, 8, bit(fmt, i));
    for (let i = 0; i < 7; i++) set(size - 1 - i, 8, bit(fmt, i));
    for (let i = 7; i < 15; i++) set(8, size - 15 + i, bit(fmt, i));
    set(size - 8, 8, true); // 固定暗模块

    // 版本信息
    if (version >= 7){
      const vb = VERSION_INFO[version];
      for (let i = 0; i < 18; i++){
        const b = bit(vb, i);
        const a = size - 11 + (i % 3), c = Math.floor(i / 3);
        set(a, c, b); set(c, a, b);
      }
    }

    // 数据填充
    let bi = 0;
    const totalBits = codewords.length * 8;
    let upward = true;
    let col = size - 1;
    while (col > 0){
      if (col === 6) col = 5;
      for (let k = 0; k < size; k++){
        const row = upward ? size - 1 - k : k;
        for (let j = 0; j < 2; j++){
          const x = col - j;
          if (fn[row][x]) continue;
          let v = false;
          if (bi < totalBits) v = bit(codewords[bi >>> 3], 7 - (bi & 7));
          if ((x + row) % 2 === 0) v = !v;  // 掩码 0
          mod[row][x] = v;
          bi++;
        }
      }
      upward = !upward;
      col -= 2;
    }
    return { size, mod };
  }

  function toCanvas(text, canvas, scale){
    const { version, codewords } = encode(text);
    const { size, mod } = buildMatrix(version, codewords);
    const quiet = 4;
    const px = (size + quiet * 2) * scale;
    canvas.width = px; canvas.height = px;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, px, px);
    ctx.fillStyle = '#000';
    for (let y = 0; y < size; y++) for (let x = 0; x < size; x++)
      if (mod[y][x]) ctx.fillRect((x + quiet) * scale, (y + quiet) * scale, scale, scale);
    return version;
  }
  return { encode, buildMatrix, toCanvas };
})();

/* =========================================================
   4. Markdown 渲染（轻量）
   ========================================================= */
function mdRender(src){
  const lines = String(src).replace(/\r\n?/g, '\n').split('\n');
  const inline = t => esc(t)
    .replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, '<img alt="$1" src="$2">')
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<em>$2</em>')
    .replace(/~~([^~]+)~~/g, '<del>$1</del>');
  const out = [];
  let i = 0;
  while (i < lines.length){
    let l = lines[i];
    // 代码块
    if (/^```/.test(l)){
      const lang = l.slice(3).trim();
      const buf = [];
      i++;
      while (i < lines.length && !/^```/.test(lines[i])) buf.push(lines[i++]);
      i++;
      out.push(`<pre><code data-lang="${esc(lang)}">${esc(buf.join('\n'))}</code></pre>`);
      continue;
    }
    // 标题
    const h = l.match(/^(#{1,6})\s+(.*)$/);
    if (h){ out.push(`<h${h[1].length}>${inline(h[2])}</h${h[1].length}>`); i++; continue; }
    // 分隔线
    if (/^\s*([-*_])\s*\1\s*\1[\s\S]*$/.test(l) && l.replace(/[\s\-*_]/g,'') === ''){
      out.push('<hr>'); i++; continue;
    }
    // 引用
    if (/^\s*>\s?/.test(l)){
      const buf = [];
      while (i < lines.length && /^\s*>\s?/.test(lines[i]))
        buf.push(lines[i++].replace(/^\s*>\s?/, ''));
      out.push(`<blockquote>${mdRender(buf.join('\n'))}</blockquote>`);
      continue;
    }
    // 表格
    if (/\|/.test(l) && i + 1 < lines.length && /^\s*\|?[\s:|-]+\|[\s:|-]*$/.test(lines[i+1])){
      const cells = r => r.replace(/^\s*\|/, '').replace(/\|\s*$/, '').split('|').map(s => s.trim());
      const head = cells(l); i += 2;
      let t = '<table><thead><tr>' + head.map(c => `<th>${inline(c)}</th>`).join('') + '</tr></thead><tbody>';
      while (i < lines.length && /\|/.test(lines[i])){
        t += '<tr>' + cells(lines[i++]).map(c => `<td>${inline(c)}</td>`).join('') + '</tr>';
      }
      out.push(t + '</tbody></table>');
      continue;
    }
    // 无序列表
    if (/^\s*[-*+]\s+/.test(l)){
      const buf = [];
      while (i < lines.length && /^\s*[-*+]\s+/.test(lines[i]))
        buf.push(lines[i++].replace(/^\s*[-*+]\s+/, ''));
      out.push('<ul>' + buf.map(x => `<li>${inline(x)}</li>`).join('') + '</ul>');
      continue;
    }
    // 有序列表
    if (/^\s*\d+\.\s+/.test(l)){
      const buf = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i]))
        buf.push(lines[i++].replace(/^\s*\d+\.\s+/, ''));
      out.push('<ol>' + buf.map(x => `<li>${inline(x)}</li>`).join('') + '</ol>');
      continue;
    }
    // 空行
    if (!l.trim()){ i++; continue; }
    // 段落
    const buf = [];
    while (i < lines.length && lines[i].trim() &&
           !/^(#{1,6}\s|```|\s*>|\s*[-*+]\s|\s*\d+\.\s)/.test(lines[i])){
      buf.push(lines[i++]);
    }
    if (buf.length) out.push(`<p>${inline(buf.join('\n')).replace(/\n/g, '<br>')}</p>`);
  }
  return out.join('\n');
}

/* =========================================================
   5. 工具集（15 个 MVP）
   ========================================================= */
const tools = [

/* ---------- 1. Base64 ---------- */
{
  id:'base64', name:'Base64 编解码', icon:'🔤', cat:'编码解码',
  desc:'文本与 Base64 互转，支持中文与 URL Safe 变体',
  render(){
    return `<div class="io">
        ${pane('输入', 'b64-in', '输入要编码或解码的文本…')}
        ${paneOut('输出', 'b64-out')}
      </div>
      <div class="bar">
        <button class="btn primary" id="b64-enc">编码 →</button>
        <button class="btn" id="b64-dec">← 解码</button>
        <label class="chk"><input type="checkbox" id="b64-url"> URL Safe (-_ 且无 =)</label>
        <span class="sp"></span>
        <span id="b64-msg" class="msg"></span>
      </div>
      <div class="panel" style="margin-top:16px"><div class="panel-body">
        <div class="hint">中文会被 UTF-8 编码后处理；解码时若内容不是有效 Base64 会给出提示。</div>
      </div></div>`;
  },
  init(){
    const run = d => {
      const v = $('#b64-in').value;
      if (!v) return setMsg('b64-msg', '请先输入内容', true);
      try {
        const url = $('#b64-url').checked;
        $('#b64-out').value = d === 'e' ? b64encode(v, url) : b64decode(v, url);
        setMsg('b64-msg', d === 'e' ? '✓ 编码完成' : '✓ 解码完成');
      } catch(e){
        $('#b64-out').value = '';
        setMsg('b64-msg', '✗ ' + e.message, true);
      }
    };
    $('#b64-enc').onclick = () => run('e');
    $('#b64-dec').onclick = () => run('d');
    $('#b64-in').addEventListener('input', () => { if ($('#b64-in').value) run('e'); });
  }
},

/* ---------- 2. URL 编解码 ---------- */
{
  id:'url', name:'URL 编解码', icon:'🔗', cat:'编码解码',
  desc:'URL 百分号编码与解码，可切换保留字符范围',
  render(){
    return `<div class="io">
        ${pane('输入', 'url-in', 'https://example.com/搜索?q=你好&lang=中文')}
        ${paneOut('输出', 'url-out')}
      </div>
      <div class="bar">
        <button class="btn primary" id="url-enc">编码 →</button>
        <button class="btn" id="url-dec">← 解码</button>
        <label class="chk"><input type="checkbox" id="url-comp" checked> encodeURIComponent（更彻底）</label>
        <span class="sp"></span>
        <span id="url-msg" class="msg"></span>
      </div>
      <div class="panel" style="margin-top:16px"><div class="panel-body">
        <div class="hint">
          <b>encodeURI</b>：保留 <code>:/?#[]@!$&'()*+,;=</code>，适合整条 URL。<br>
          <b>encodeURIComponent</b>：只保留 <code>A-Za-z0-9-_.!~*'()</code>，适合参数值。
        </div>
      </div></div>`;
  },
  init(){
    const run = d => {
      const v = $('#url-in').value;
      if (!v) return setMsg('url-msg', '请先输入内容', true);
      try {
        const comp = $('#url-comp').checked;
        $('#url-out').value = d === 'e'
          ? (comp ? encodeURIComponent(v) : encodeURI(v))
          : (comp ? decodeURIComponent(v) : decodeURI(v));
        setMsg('url-msg', '✓ 完成');
      } catch(e){
        $('#url-out').value = '';
        setMsg('url-msg', '✗ ' + e.message, true);
      }
    };
    $('#url-enc').onclick = () => run('e');
    $('#url-dec').onclick = () => run('d');
  }
},

/* ---------- 3. JSON ---------- */
{
  id:'json', name:'JSON 格式化', icon:'{}', cat:'格式化',
  desc:'格式化、压缩、校验 JSON，并生成 TypeScript 接口',
  render(){
    return `<div class="io">
        ${pane('输入 JSON', 'json-in', '{"name":"devkit","version":1,"tags":["tool","dev"]}', 'lg')}
        ${paneOut('输出', 'json-out', '结果…', 'lg')}
      </div>
      <div class="bar">
        <button class="btn primary" id="json-fmt">格式化</button>
        <button class="btn" id="json-min">压缩</button>
        <button class="btn" id="json-ts">转 TypeScript</button>
        <button class="btn" id="json-sample">示例</button>
        <label class="chk"><input type="checkbox" id="json-sort"> 键名排序</label>
        <span class="sp"></span>
        <span id="json-msg" class="msg"></span>
      </div>`;
  },
  init(){
    const parse = () => {
      const v = $('#json-in').value.trim();
      if (!v) throw new Error('请输入 JSON');
      let o = JSON.parse(v);
      if ($('#json-sort').checked) o = sortKeys(o);
      return o;
    };
    const run = fn => {
      try { const o = parse(); $('#json-out').value = fn(o); setMsg('json-msg', '✓ 合法 JSON'); }
      catch(e){ $('#json-out').value = ''; setMsg('json-msg', '✗ ' + e.message, true); }
    };
    $('#json-fmt').onclick = () => run(o => JSON.stringify(o, null, 2));
    $('#json-min').onclick = () => run(o => JSON.stringify(o));
    $('#json-ts').onclick = () => run(o => jsonToTS(o));
    $('#json-sample').onclick = () => {
      $('#json-in').value = JSON.stringify({
        name:'devkit', version:1, active:true, tags:['tool','dev'],
        author:{ name:'me', email:'me@example.com' },
        items:[{ id:1, title:'hello' }, { id:2, title:'world' }]
      }, null, 2);
      $('#json-fmt').click();
    };
    // 实时校验
    $('#json-in').addEventListener('input', () => {
      const v = $('#json-in').value.trim();
      if (!v) return setMsg('json-msg', '');
      try { JSON.parse(v); setMsg('json-msg', '✓ 合法 JSON'); }
      catch(e){ setMsg('json-msg', '✗ ' + e.message, true); }
    });
  }
},

/* ---------- 4. 时间戳 ---------- */
{
  id:'timestamp', name:'时间戳转换', icon:'⏱', cat:'转换',
  desc:'Unix 时间戳与日期时间互转，显示多种时间格式',
  render(){
    return `<div class="panel"><div class="panel-body">
        <div class="row">
          <div class="field"><label>时间戳（自动识别秒 / 毫秒）</label>
            <input class="inp" id="ts-in" placeholder="1735689600 或 1735689600000"></div>
          <div class="field noflex"><label>&nbsp;</label>
            <button class="btn primary" id="ts-to-date">→ 转日期</button></div>
        </div>
        <div class="row" style="margin-top:12px">
          <div class="field"><label>日期时间（本地时区）</label>
            <input class="inp" id="ts-date" type="datetime-local" step="1"></div>
          <div class="field noflex"><label>&nbsp;</label>
            <button class="btn primary" id="ts-to-ts">→ 转时间戳</button></div>
        </div>
        <div style="margin-top:10px"><span id="ts-msg" class="msg"></span></div>
      </div></div>

      <div class="panel">
        <div class="panel-head">当前时间</div>
        <div class="panel-body">
          <div class="kv"><span class="k">秒级时间戳</span><span class="v" id="ts-now-s">–</span></div>
          <div class="kv"><span class="k">毫秒级时间戳</span><span class="v" id="ts-now-ms">–</span></div>
          <div class="kv"><span class="k">本地时间</span><span class="v" id="ts-now-local">–</span></div>
          <div class="kv"><span class="k">UTC 时间</span><span class="v" id="ts-now-utc">–</span></div>
          <div class="kv"><span class="k">ISO 8601</span><span class="v" id="ts-now-iso">–</span></div>
          <div class="kv"><span class="k">时区偏移</span><span class="v" id="ts-now-tz">–</span></div>
          <div class="kv"><span class="k">相对现在</span><span class="v" id="ts-now-rel">–</span></div>
        </div>
        <div class="panel-body" style="padding-top:0;display:flex;gap:8px;flex-wrap:wrap">
          <button class="btn sm" id="ts-copy-s">复制秒级</button>
          <button class="btn sm" id="ts-copy-ms">复制毫秒级</button>
          <button class="btn sm" id="ts-copy-iso">复制 ISO</button>
        </div>
      </div>`;
  },
  init(){
    const toLocalInput = d =>
      `${d.getFullYear()}-${pad2(d.getMonth()+1)}-${pad2(d.getDate())}T${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`;

    const tick = () => {
      const now = new Date();
      $('#ts-now-s').textContent = Math.floor(now.getTime() / 1000);
      $('#ts-now-ms').textContent = now.getTime();
      $('#ts-now-local').textContent = now.toLocaleString('zh-CN', {hour12:false});
      $('#ts-now-utc').textContent = now.toUTCString();
      $('#ts-now-iso').textContent = now.toISOString();
      const off = -now.getTimezoneOffset();
      $('#ts-now-tz').textContent = 'UTC' + (off >= 0 ? '+' : '-') +
        pad2(Math.floor(Math.abs(off)/60)) + ':' + pad2(Math.abs(off) % 60);
      $('#ts-now-rel').textContent = relTime(now.getTime());
    };
    tick();
    const timer = setInterval(() => {
      if (!document.getElementById('ts-now-s')) { clearInterval(timer); return; }
      tick();
    }, 1000);

    $('#ts-copy-s').onclick = () => copyText($('#ts-now-s').textContent);
    $('#ts-copy-ms').onclick = () => copyText($('#ts-now-ms').textContent);
    $('#ts-copy-iso').onclick = () => copyText($('#ts-now-iso').textContent);

    $('#ts-to-date').onclick = () => {
      const raw = $('#ts-in').value.trim();
      if (!/^-?\d+$/.test(raw)) return setMsg('ts-msg', '请输入纯数字时间戳', true);
      let n = parseInt(raw, 10);
      if (raw.replace('-','').length <= 10) n *= 1000;
      const d = new Date(n);
      if (isNaN(d.getTime())) return setMsg('ts-msg', '无效时间戳', true);
      $('#ts-date').value = toLocalInput(d);
      setMsg('ts-msg', '✓ ' + d.toLocaleString('zh-CN', {hour12:false}));
    };
    $('#ts-to-ts').onclick = () => {
      const v = $('#ts-date').value;
      if (!v) return setMsg('ts-msg', '请先选择日期时间', true);
      const d = new Date(v);
      if (isNaN(d.getTime())) return setMsg('ts-msg', '无效日期', true);
      $('#ts-in').value = Math.floor(d.getTime() / 1000);
      setMsg('ts-msg', '✓ 秒: ' + Math.floor(d.getTime()/1000) + '  毫秒: ' + d.getTime());
    };
    // 默认填充当前时间
    $('#ts-in').value = Math.floor(Date.now() / 1000);
    $('#ts-date').value = toLocalInput(new Date());
  }
},

/* ---------- 5. UUID ---------- */
{
  id:'uuid', name:'UUID 生成', icon:'🆔', cat:'生成',
  desc:'批量生成 UUID v4、短 ID、ULID 风格 ID',
  render(){
    return `<div class="panel"><div class="panel-body">
        <div class="row">
          <div class="field"><label>类型</label>
            <select class="inp" id="uid-type">
              <option value="uuid">UUID v4（标准 36 位）</option>
              <option value="uuid-nodash">UUID v4（无连字符 32 位）</option>
              <option value="upper">UUID v4（大写）</option>
              <option value="short">短 ID（21 位 nanoid 风格）</option>
              <option value="short10">短 ID（10 位）</option>
              <option value="hex">随机 Hex（32 位）</option>
            </select>
          </div>
          <div class="field"><label>数量（1–500）</label>
            <input class="inp" id="uid-count" type="number" value="10" min="1" max="500"></div>
          <div class="field noflex"><label>&nbsp;</label>
            <button class="btn primary" id="uid-gen">生成</button></div>
        </div>
      </div></div>
      ${paneOut('结果', 'uid-out', '点击「生成」…', 'lg')}
      <div class="bar">
        <button class="btn" id="uid-dl">下载为 .txt</button>
        <button class="btn" id="uid-copyall">复制全部</button>
      </div>`;
  },
  init(){
    const gen = () => {
      const t = $('#uid-type').value;
      let n = parseInt($('#uid-count').value, 10) || 1;
      n = Math.max(1, Math.min(500, n));
      const out = [];
      for (let i = 0; i < n; i++) out.push(genId(t));
      $('#uid-out').value = out.join('\n');
    };
    $('#uid-gen').onclick = gen;
    $('#uid-copyall').onclick = () => copyText($('#uid-out').value);
    $('#uid-dl').onclick = () => {
      if (!$('#uid-out').value) return toast('还没有生成内容');
      downloadFile('uuid.txt', $('#uid-out').value);
    };
    gen();
  }
},

/* ---------- 6. Hash ---------- */
{
  id:'hash', name:'Hash 计算', icon:'#️⃣', cat:'生成',
  desc:'MD5 / SHA-1 / SHA-256 / SHA-384 / SHA-512，支持文本与文件',
  render(){
    return `<div class="io">
        ${pane('输入文本', 'hash-in', '输入要计算哈希的文本…', 'lg')}
        <div class="pane"><div class="pane-head">结果</div>
          <div class="panel-body" style="padding:12px">
            <div class="kv"><span class="k">MD5</span><span class="v" id="h-md5">–</span></div>
            <div class="kv"><span class="k">SHA-1</span><span class="v" id="h-sha1">–</span></div>
            <div class="kv"><span class="k">SHA-256</span><span class="v" id="h-sha256">–</span></div>
            <div class="kv"><span class="k">SHA-384</span><span class="v" id="h-sha384">–</span></div>
            <div class="kv"><span class="k">SHA-512</span><span class="v" id="h-sha512">–</span></div>
          </div>
        </div>
      </div>
      <div class="bar">
        <button class="btn primary" id="hash-run">计算全部</button>
        <button class="btn" id="hash-copyall">复制全部</button>
        <label class="chk"><input type="checkbox" id="hash-upper"> 大写输出</label>
        <span class="sp"></span>
        <label class="btn" style="cursor:pointer">
          选择文件计算 <input type="file" id="hash-file" hidden>
        </label>
        <span id="hash-msg" class="msg"></span>
      </div>`;
  },
  init(){
    const set = (id, v) => { $('#' + id).textContent = v; };
    const run = async data => {
      try {
        setMsg('hash-msg', '计算中…');
        const up = $('#hash-upper').checked;
        const upf = s => up ? s.toUpperCase() : s;
        let md5v = md5(data);
        const [s1, s256, s384, s512] = await Promise.all([
          sha('SHA-1', data), sha('SHA-256', data),
          sha('SHA-384', data), sha('SHA-512', data)
        ]);
        set('h-md5', upf(md5v));
        set('h-sha1', upf(s1));
        set('h-sha256', upf(s256));
        set('h-sha384', upf(s384));
        set('h-sha512', upf(s512));
        setMsg('hash-msg', '✓ 完成');
      } catch(e){
        setMsg('hash-msg', '✗ ' + e.message, true);
      }
    };
    $('#hash-run').onclick = () => run($('#hash-in').value);
    $('#hash-copyall').onclick = () => {
      const t = ['MD5','SHA-1','SHA-256','SHA-384','SHA-512']
        .map(k => k + ': ' + $('#h-' + k.toLowerCase().replace('-','')).textContent)
        .join('\n');
      copyText(t);
    };
    $('#hash-file').onchange = e => {
      const f = e.target.files[0];
      if (!f) return;
      const r = new FileReader();
      r.onload = () => { $('#hash-in').value = '（文件：' + f.name + '，' + fmtBytes(f.size) + '）'; run(new Uint8Array(r.result)); };
      r.readAsArrayBuffer(f);
    };
    $('#hash-in').addEventListener('input', () => {
      if ($('#hash-in').value && !$('#hash-in').value.startsWith('（文件：')) run($('#hash-in').value);
    });
  }
},

/* ---------- 7. 密码生成 ---------- */
{
  id:'password', name:'密码生成', icon:'🔐', cat:'生成',
  desc:'可配置字符集与长度的强随机密码生成器',
  render(){
    return `<div class="panel"><div class="panel-body">
        <div class="row">
          <div class="field"><label>长度：<b id="pw-len-val">20</b></label>
            <input type="range" id="pw-len" min="4" max="128" value="20" style="width:100%"></div>
          <div class="field"><label>数量（1–100）</label>
            <input class="inp" id="pw-count" type="number" value="5" min="1" max="100"></div>
          <div class="field noflex"><label>&nbsp;</label>
            <button class="btn primary" id="pw-gen">生成</button></div>
        </div>
        <div class="bar" style="margin-top:12px">
          <label class="chk"><input type="checkbox" id="pw-upper" checked> 大写 A-Z</label>
          <label class="chk"><input type="checkbox" id="pw-lower" checked> 小写 a-z</label>
          <label class="chk"><input type="checkbox" id="pw-digit" checked> 数字 0-9</label>
          <label class="chk"><input type="checkbox" id="pw-symbol" checked> 符号 !@#$…</label>
          <label class="chk"><input type="checkbox" id="pw-nosim" checked> 排除易混淆 (0O1lI|)</label>
        </div>
        <div style="margin-top:10px">
          <span id="pw-strength" class="badge">–</span>
          <span id="pw-msg" class="msg" style="margin-left:10px"></span>
        </div>
      </div></div>
      ${paneOut('结果', 'pw-out', '点击「生成」…', 'lg')}
      <div class="bar"><button class="btn" id="pw-copyall">复制全部</button></div>`;
  },
  init(){
    $('#pw-len').oninput = e => { $('#pw-len-val').textContent = e.target.value; };
    const gen = () => {
      const len = parseInt($('#pw-len').value, 10);
      let n = parseInt($('#pw-count').value, 10) || 1;
      n = Math.max(1, Math.min(100, n));
      const nosim = $('#pw-nosim').checked;
      let U = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      let L = 'abcdefghijklmnopqrstuvwxyz';
      let D = '0123456789';
      let S = '!@#$%^&*()-_=+[]{};:,.<>?/~';
      if (nosim){
        U = U.replace(/[OI]/g, '');
        L = L.replace(/[l]/g, '');
        D = D.replace(/[01]/g, '');
        S = S.replace(/[|]/g, '');
      }
      let pool = '';
      if ($('#pw-upper').checked) pool += U;
      if ($('#pw-lower').checked) pool += L;
      if ($('#pw-digit').checked) pool += D;
      if ($('#pw-symbol').checked) pool += S;
      if (!pool) return setMsg('pw-msg', '请至少选择一种字符类型', true);
      const out = [];
      for (let i = 0; i < n; i++){
        let s = '';
        for (let j = 0; j < len; j++) s += pool[randInt(pool.length)];
        out.push(s);
      }
      $('#pw-out').value = out.join('\n');
      // 强度估算
      const bits = Math.round(len * Math.log2(pool.length));
      const el = $('#pw-strength');
      el.textContent = bits + ' bit 熵';
      el.className = 'badge ' + (bits >= 100 ? 'ok' : bits >= 60 ? 'warn' : 'err');
      setMsg('pw-msg', '✓ 已生成 ' + n + ' 个');
    };
    $('#pw-gen').onclick = gen;
    $('#pw-copyall').onclick = () => copyText($('#pw-out').value);
    gen();
  }
},

/* ---------- 8. 颜色转换 ---------- */
{
  id:'color', name:'颜色转换', icon:'🎨', cat:'转换',
  desc:'HEX / RGB / HSL / HSV 互转，附带预览与调色板',
  render(){
    return `<div class="panel"><div class="panel-body">
        <div class="row">
          <div class="field"><label>颜色输入（HEX / rgb() / hsl()）</label>
            <input class="inp" id="col-in" value="#4f46e5" placeholder="#4f46e5 或 rgb(79,70,229)"></div>
          <div class="field noflex" style="width:80px"><label>取色</label>
            <input type="color" id="col-pick" class="inp" style="padding:2px;height:34px" value="#4f46e5"></div>
        </div>
      </div></div>
      <div class="panel"><div class="panel-body">
        <div class="swatch" id="col-preview"></div>
      </div></div>
      <div class="panel">
        <div class="panel-head">转换结果</div>
        <div class="panel-body">
          <div class="kv"><span class="k">HEX</span><span class="v" id="c-hex" data-copy-val>–</span></div>
          <div class="kv"><span class="k">HEX（含透明度）</span><span class="v" id="c-hex8">–</span></div>
          <div class="kv"><span class="k">RGB</span><span class="v" id="c-rgb">–</span></div>
          <div class="kv"><span class="k">HSL</span><span class="v" id="c-hsl">–</span></div>
          <div class="kv"><span class="k">HSV</span><span class="v" id="c-hsv">–</span></div>
          <div class="kv"><span class="k">CMYK</span><span class="v" id="c-cmyk">–</span></div>
          <div class="kv"><span class="k">相对亮度</span><span class="v" id="c-lum">–</span></div>
          <div class="kv"><span class="k">推荐文字色</span><span class="v" id="c-fg">–</span></div>
        </div>
      </div>
      <div class="panel">
        <div class="panel-head">调色板</div>
        <div class="panel-body"><div class="pal" id="col-pal"></div></div>
      </div>`;
  },
  init(){
    const update = () => {
      const raw = $('#col-in').value.trim();
      let rgb;
      try { rgb = parseColor(raw); }
      catch(e){ return; }
      const { r, g, b } = rgb;
      const hsl = rgbToHsl(r, g, b);
      const hsv = rgbToHsv(r, g, b);
      const cmyk = rgbToCmyk(r, g, b);
      const hexv = '#' + hx(r) + hx(g) + hx(b);
      $('#col-pick').value = hexv;
      $('#col-preview').style.background = hexv;
      $('#c-hex').textContent = hexv.toUpperCase();
      $('#c-hex8').textContent = (hexv + hx(Math.round((rgb.a ?? 1) * 255))).toUpperCase();
      $('#c-rgb').textContent = rgb.a != null && rgb.a < 1
        ? `rgba(${r}, ${g}, ${b}, ${rgb.a})` : `rgb(${r}, ${g}, ${b})`;
      $('#c-hsl').textContent = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
      $('#c-hsv').textContent = `hsv(${hsv.h}, ${hsv.s}%, ${hsv.v}%)`;
      $('#c-cmyk').textContent = `cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)`;
      const lum = (0.2126 * srgb(r) + 0.7152 * srgb(g) + 0.0722 * srgb(b));
      $('#c-lum').textContent = lum.toFixed(4);
      $('#c-fg').textContent = lum > 0.5 ? '黑色 #000000（对比度更好）' : '白色 #FFFFFF（对比度更好）';
      // 调色板
      const shades = [];
      for (let i = 9; i >= 1; i--){
        const l = i * 10;
        shades.push(`hsl(${hsl.h}, ${hsl.s}%, ${l}%)`);
      }
      $('#col-pal').innerHTML = shades.map((c, i) =>
        `<div style="background:${c}" title="${c}">${(i+1)*10}%</div>`).join('');
    };
    $('#col-in').addEventListener('input', update);
    $('#col-pick').addEventListener('input', e => { $('#col-in').value = e.target.value; update(); });
    update();
  }
},

/* ---------- 9. 正则测试 ---------- */
{
  id:'regex', name:'正则测试', icon:'🔍', cat:'文本',
  desc:'实时匹配、高亮显示、分组捕获与替换',
  render(){
    return `<div class="panel"><div class="panel-body">
        <div class="row">
          <div class="field" style="flex:3"><label>正则表达式</label>
            <input class="inp" id="re-pat" value="(\\w+)@(\\w+)\\.com" spellcheck="false"
              style="font-family:var(--mono)"></div>
          <div class="field" style="flex:0 0 160px"><label>标志</label>
            <input class="inp" id="re-flags" value="gi" spellcheck="false"
              style="font-family:var(--mono)"></div>
        </div>
        <div class="row" style="margin-top:10px">
          <div class="field"><label>测试文本</label>
            <textarea class="inp" id="re-text" rows="6" spellcheck="false">联系方式：alice@example.com，bob@test.com
备用：carol@demo.com</textarea></div>
        </div>
        <div class="row" style="margin-top:10px">
          <div class="field"><label>替换为（支持 $1 $2 等）</label>
            <input class="inp" id="re-repl" placeholder="例如：[$1]"></div>
        </div>
      </div></div>
      <div class="panel">
        <div class="panel-head"><span>匹配结果</span><span class="sp"></span>
          <span id="re-count" class="badge">0 处匹配</span></div>
        <div class="panel-body">
          <div class="out-box" id="re-hl" style="min-height:80px"></div>
        </div>
      </div>
      <div class="panel" id="re-groups-wrap" style="display:none">
        <div class="panel-head">捕获分组</div>
        <div class="panel-body" style="padding:0"><div class="scroll-y"><table class="tbl" id="re-groups"></table></div></div>
      </div>
      <div class="panel" id="re-repl-wrap" style="display:none">
        <div class="panel-head">替换结果</div>
        <div class="panel-body"><div class="out-box" id="re-repl-out"></div></div>
      </div>`;
  },
  init(){
    const run = () => {
      const pat = $('#re-pat').value;
      const flags = $('#re-flags').value;
      const text = $('#re-text').value;
      const hl = $('#re-hl');
      if (!pat){ hl.textContent = ''; $('#re-count').textContent = '0 处匹配'; return; }
      let re;
      try { re = new RegExp(pat, flags); }
      catch(e){
        hl.innerHTML = `<span style="color:var(--err)">正则错误：${esc(e.message)}</span>`;
        $('#re-count').textContent = '语法错误';
        $('#re-count').className = 'badge err';
        $('#re-groups-wrap').style.display = 'none';
        $('#re-repl-wrap').style.display = 'none';
        return;
      }
      const global = flags.includes('g');
      let out = '', last = 0, count = 0;
      const groups = [];
      if (global){
        let m;
        re.lastIndex = 0;
        while ((m = re.exec(text)) !== null){
          if (m.index === re.lastIndex) re.lastIndex++;
          count++;
          out += esc(text.slice(last, m.index));
          out += `<span class="hl">${esc(m[0]) || '(空)'}</span>`;
          last = m.index + m[0].length;
          groups.push(m);
          if (count > 5000) break;
        }
        out += esc(text.slice(last));
      } else {
        const m = re.exec(text);
        if (m){
          count = 1;
          out = esc(text.slice(0, m.index)) + `<span class="hl">${esc(m[0]) || '(空)'}</span>` +
                esc(text.slice(m.index + m[0].length));
          groups.push(m);
        } else {
          out = esc(text);
        }
      }
      hl.innerHTML = out || '<span style="color:var(--muted)">（无内容）</span>';
      const cnt = $('#re-count');
      cnt.textContent = count + ' 处匹配';
      cnt.className = 'badge ' + (count ? 'ok' : '');

      // 分组
      if (groups.length && groups[0].length > 1){
        let html = '<thead><tr><th>#</th><th>匹配位置</th>';
        for (let i = 1; i < groups[0].length; i++) html += `<th>分组 ${i}</th>`;
        html += '</tr></thead><tbody>';
        groups.slice(0, 100).forEach((m, idx) => {
          html += `<tr><td>${idx+1}</td><td><code>${m.index}</code></td>`;
          for (let i = 1; i < m.length; i++)
            html += `<td><code>${m[i] === undefined ? '—' : esc(m[i])}</code></td>`;
          html += '</tr>';
        });
        html += '</tbody>';
        $('#re-groups').innerHTML = html;
        $('#re-groups-wrap').style.display = '';
      } else {
        $('#re-groups-wrap').style.display = 'none';
      }

      // 替换
      const repl = $('#re-repl').value;
      if (repl && count){
        try {
          $('#re-repl-out').textContent = text.replace(new RegExp(pat, flags.includes('g') ? flags : flags + 'g'), repl);
          $('#re-repl-wrap').style.display = '';
        } catch { $('#re-repl-wrap').style.display = 'none'; }
      } else {
        $('#re-repl-wrap').style.display = 'none';
      }
    };
    ['re-pat','re-flags','re-text','re-repl'].forEach(id =>
      $('#' + id).addEventListener('input', run));
    run();
  }
},

/* ---------- 10. 文本处理 ---------- */
{
  id:'text', name:'文本统计与转换', icon:'📝', cat:'文本',
  desc:'字数统计 + 大小写 / 去重 / 排序 / 行号等常用转换',
  render(){
    return `<div class="io">
        ${pane('输入文本', 'txt-in', '在这里粘贴或输入文本…', 'lg')}
        ${paneOut('输出', 'txt-out', '转换结果…', 'lg')}
      </div>
      <div class="panel" style="margin-top:14px">
        <div class="panel-head">统计</div>
        <div class="panel-body">
          <div class="grid3">
            <div class="kv"><span class="k">总字符数</span><span class="v" id="s-chars">0</span></div>
            <div class="kv"><span class="k">不含空白</span><span class="v" id="s-noSpace">0</span></div>
            <div class="kv"><span class="k">字节数 (UTF-8)</span><span class="v" id="s-bytes">0</span></div>
            <div class="kv"><span class="k">行数</span><span class="v" id="s-lines">0</span></div>
            <div class="kv"><span class="k">单词数</span><span class="v" id="s-words">0</span></div>
            <div class="kv"><span class="k">中文字数</span><span class="v" id="s-cjk">0</span></div>
          </div>
        </div>
      </div>
      <div class="panel">
        <div class="panel-head">转换操作</div>
        <div class="panel-body">
          <div class="bar" style="margin-top:0">
            <button class="btn sm" data-txt="upper">全部大写</button>
            <button class="btn sm" data-txt="lower">全部小写</button>
            <button class="btn sm" data-txt="title">首字母大写</button>
            <button class="btn sm" data-txt="reverse">反转字符串</button>
            <button class="btn sm" data-txt="trim">去除首尾空白</button>
            <button class="btn sm" data-txt="trimLines">去除每行首尾空白</button>
            <button class="btn sm" data-txt="noEmpty">删除空行</button>
            <button class="btn sm" data-txt="unique">行去重</button>
            <button class="btn sm" data-txt="sortAsc">行升序</button>
            <button class="btn sm" data-txt="sortDesc">行降序</button>
            <button class="btn sm" data-txt="sortLen">按长度排序</button>
            <button class="btn sm" data-txt="shuffle">随机打乱行</button>
            <button class="btn sm" data-txt="number">加行号</button>
            <button class="btn sm" data-txt="camel">转 camelCase</button>
            <button class="btn sm" data-txt="snake">转 snake_case</button>
            <button class="btn sm" data-txt="kebab">转 kebab-case</button>
            <button class="btn sm" data-txt="join">合并为一行</button>
            <button class="btn sm" data-txt="split">按标点拆行</button>
            <button class="btn sm" data-txt="quote">每行加引号</button>
            <button class="btn sm" data-txt="jsonArr">转为 JSON 数组</button>
          </div>
        </div>
      </div>`;
  },
  init(){
    const stat = () => {
      const v = $('#txt-in').value;
      $('#s-chars').textContent = v.length;
      $('#s-noSpace').textContent = v.replace(/\s/g, '').length;
      $('#s-bytes').textContent = strToBytes(v).length;
      $('#s-lines').textContent = v ? v.split('\n').length : 0;
      $('#s-words').textContent = (v.match(/[A-Za-z0-9_'\u4e00-\u9fa5]+/g) || []).length;
      $('#s-cjk').textContent = (v.match(/[\u4e00-\u9fa5]/g) || []).length;
    };
    const ops = {
      upper: s => s.toUpperCase(),
      lower: s => s.toLowerCase(),
      title: s => s.replace(/\b\w/g, c => c.toUpperCase()),
      reverse: s => [...s].reverse().join(''),
      trim: s => s.trim(),
      trimLines: s => s.split('\n').map(l => l.trim()).join('\n'),
      noEmpty: s => s.split('\n').filter(l => l.trim()).join('\n'),
      unique: s => [...new Set(s.split('\n'))].join('\n'),
      sortAsc: s => s.split('\n').sort((a,b) => a.localeCompare(b, 'zh')).join('\n'),
      sortDesc: s => s.split('\n').sort((a,b) => b.localeCompare(a, 'zh')).join('\n'),
      sortLen: s => s.split('\n').sort((a,b) => a.length - b.length).join('\n'),
      shuffle: s => {
        const a = s.split('\n');
        for (let i = a.length - 1; i > 0; i--){
          const j = randInt(i + 1);
          [a[i], a[j]] = [a[j], a[i]];
        }
        return a.join('\n');
      },
      number: s => s.split('\n').map((l, i) => `${i + 1}. ${l}`).join('\n'),
      camel: s => s.trim().split(/[\s_\-]+/).map((w, i) =>
        i ? w[0].toUpperCase() + w.slice(1) : w.toLowerCase()).join(''),
      snake: s => s.trim().replace(/[\s\-]+/g, '_').replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase(),
      kebab: s => s.trim().replace(/[\s_]+/g, '-').replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase(),
      join: s => s.split('\n').map(l => l.trim()).filter(Boolean).join(' '),
      split: s => s.replace(/[。！？；，、]/g, m => m + '\n').split('\n').filter(Boolean).join('\n'),
      quote: s => s.split('\n').map(l => `"${l.replace(/"/g, '\\"')}"`).join(',\n'),
      jsonArr: s => JSON.stringify(s.split('\n'), null, 2)
    };
    document.addEventListener('click', e => {
      const b = e.target.closest('[data-txt]');
      if (!b) return;
      const k = b.dataset.txt;
      if (ops[k]) $('#txt-out').value = ops[k]($('#txt-in').value);
    });
    $('#txt-in').addEventListener('input', stat);
    stat();
  }
},

/* ---------- 11. 进制转换 ---------- */
{
  id:'radix', name:'进制转换', icon:'🔢', cat:'转换',
  desc:'2 / 8 / 10 / 16 进制及任意进制（2–36）互转',
  render(){
    return `<div class="panel"><div class="panel-body">
        <div class="row">
          <div class="field" style="flex:2"><label>数值</label>
            <input class="inp" id="rx-val" value="255" spellcheck="false" style="font-family:var(--mono)"></div>
          <div class="field noflex" style="width:150px"><label>源进制</label>
            <select class="inp" id="rx-from">
              <option value="2">2 二进制</option><option value="8">8 八进制</option>
              <option value="10" selected>10 十进制</option><option value="16">16 十六进制</option>
              <option value="36">36 三十六进制</option><option value="custom">自定义…</option>
            </select></div>
          <div class="field noflex" style="width:110px;display:none" id="rx-custom-wrap">
            <label>自定义</label><input class="inp" id="rx-custom" type="number" value="10" min="2" max="36"></div>
        </div>
      </div></div>
      <div class="panel">
        <div class="panel-head"><span>转换结果</span><span class="sp"></span>
          <span id="rx-msg" class="msg"></span></div>
        <div class="panel-body">
          <div class="kv"><span class="k">二进制 (2)</span><span class="v" id="rx-2">–</span></div>
          <div class="kv"><span class="k">八进制 (8)</span><span class="v" id="rx-8">–</span></div>
          <div class="kv"><span class="k">十进制 (10)</span><span class="v" id="rx-10">–</span></div>
          <div class="kv"><span class="k">十六进制 (16)</span><span class="v" id="rx-16">–</span></div>
          <div class="kv"><span class="k">Base36</span><span class="v" id="rx-36">–</span></div>
          <div class="kv"><span class="k">字节表示</span><span class="v" id="rx-bytes">–</span></div>
          <div class="kv"><span class="k">带前缀</span><span class="v" id="rx-prefix">–</span></div>
        </div>
      </div>
      <div class="panel">
        <div class="panel-head">目标进制转换</div>
        <div class="panel-body">
          <div class="row">
            <div class="field noflex" style="width:140px"><label>目标进制</label>
              <input class="inp" id="rx-to" type="number" value="7" min="2" max="36"></div>
            <div class="field noflex"><label>&nbsp;</label>
              <button class="btn primary" id="rx-do">转换</button></div>
          </div>
          <div class="out-box" id="rx-out" style="margin-top:12px;min-height:50px">–</div>
        </div>
      </div>
      <div class="bar">
        <button class="btn sm" data-rand="hex">随机 Hex</button>
        <button class="btn sm" data-rand="bin">随机二进制</button>
        <button class="btn sm" data-rand="dec">随机十进制</button>
      </div>`;
  },
  init(){
    $('#rx-from').onchange = () => {
      $('#rx-custom-wrap').style.display = $('#rx-from').value === 'custom' ? '' : 'none';
      run();
    };
    const getFrom = () => $('#rx-from').value === 'custom'
      ? Math.max(2, Math.min(36, parseInt($('#rx-custom').value, 10) || 10))
      : parseInt($('#rx-from').value, 10);
    const run = () => {
      const raw = $('#rx-val').value.trim().replace(/\s+/g, '').replace(/^0[bxo]/i, '');
      if (!raw) return setMsg('rx-msg', '');
      const from = getFrom();
      let n;
      try {
        if (!/^[0-9a-zA-Z]+$/.test(raw)) throw new Error('含非法字符');
        n = BigInt(parseIntSafe(raw, from));
        if (n < 0n) throw new Error('负数');
      } catch(e){
        setMsg('rx-msg', '✗ ' + e.message, true);
        ['2','8','10','16','36'].forEach(k => $('#rx-' + k).textContent = '–');
        $('#rx-bytes').textContent = '–';
        $('#rx-prefix').textContent = '–';
        return;
      }
      setMsg('rx-msg', '✓');
      const big = n.toString();
      $('#rx-2').textContent = big.toString(2);
      $('#rx-8').textContent = big.toString(8);
      $('#rx-10').textContent = big.toString(10);
      $('#rx-16').textContent = big.toString(16).toUpperCase();
      $('#rx-36').textContent = big.toString(36).toUpperCase();
      // 字节表示
      try {
        const hexs = big.toString(16).padStart(Math.ceil(big.toString(16).length / 2) * 2, '0');
        const bytes = hexs.match(/.{2}/g) || [];
        $('#rx-bytes').textContent = bytes.join(' ');
      } catch { $('#rx-bytes').textContent = '–'; }
      $('#rx-prefix').textContent =
        `0b${big.toString(2)}  0o${big.toString(8)}  0x${big.toString(16).toUpperCase()}`;
    };
    $('#rx-do').onclick = () => {
      const raw = $('#rx-val').value.trim().replace(/\s+/g, '');
      if (!raw) return;
      try {
        const from = getFrom();
        const to = Math.max(2, Math.min(36, parseInt($('#rx-to').value, 10) || 10));
        const n = BigInt(parseIntSafe(raw, from));
        $('#rx-out').textContent = n.toString(to).toUpperCase();
      } catch(e){
        $('#rx-out').textContent = '错误：' + e.message;
      }
    };
    $('#rx-val').addEventListener('input', run);
    $('#rx-custom').addEventListener('input', run);
    document.addEventListener('click', e => {
      const b = e.target.closest('[data-rand]');
      if (!b) return;
      const t = b.dataset.rand;
      const n = randInt(0xFFFFFF);
      if (t === 'hex'){ $('#rx-from').value = '16'; $('#rx-val').value = n.toString(16).toUpperCase(); }
      if (t === 'bin'){ $('#rx-from').value = '2'; $('#rx-val').value = n.toString(2); }
      if (t === 'dec'){ $('#rx-from').value = '10'; $('#rx-val').value = n; }
      $('#rx-custom-wrap').style.display = 'none';
      run();
    });
    run();
  }
},

/* ---------- 12. 二维码生成 ---------- */
{
  id:'qrcode', name:'二维码生成', icon:'⬛', cat:'编码解码',
  desc:'把文本 / 网址转成二维码，支持尺寸调整与下载',
  render(){
    return `<div class="panel"><div class="panel-body">
        <div class="row">
          <div class="field" style="flex:3"><label>内容</label>
            <textarea class="inp" id="qr-text" rows="3" spellcheck="false">https://developer.mozilla.org</textarea></div>
        </div>
        <div class="row" style="margin-top:12px">
          <div class="field"><label>尺寸（像素/模块）</label>
            <input type="range" id="qr-scale" min="2" max="16" value="6" style="width:100%">
            <div class="hint">当前：<b id="qr-scale-val">6</b> px</div></div>
          <div class="field"><label>容错等级</label>
            <select class="inp" id="qr-level" disabled>
              <option>L（低，容量最大）</option>
            </select></div>
          <div class="field noflex"><label>&nbsp;</label>
            <button class="btn primary" id="qr-gen">生成</button></div>
        </div>
        <div style="margin-top:10px"><span id="qr-msg" class="msg"></span></div>
      </div></div>
      <div class="panel">
        <div class="panel-head"><span>预览</span><span class="sp"></span>
          <span id="qr-ver" class="badge">–</span></div>
        <div class="panel-body">
          <div id="qrout"><canvas id="qr-canvas"></canvas></div>
        </div>
      </div>
      <div class="bar">
        <button class="btn" id="qr-dl">下载 PNG</button>
        <button class="btn" id="qr-copy">复制内容</button>
      </div>
      <div class="panel"><div class="panel-body">
        <div class="hint">采用纠错等级 L，支持版本 1–9（约 230 字节以内）。内容越长，二维码越密集。</div>
      </div></div>`;
  },
  init(){
    const gen = () => {
      const text = $('#qr-text').value;
      const scale = parseInt($('#qr-scale').value, 10);
      if (!text){ setMsg('qr-msg', '请输入内容', true); return; }
      try {
        const ver = QR.toCanvas(text, $('#qr-canvas'), scale);
        $('#qr-ver').textContent = '版本 ' + ver;
        $('#qr-ver').className = 'badge ok';
        setMsg('qr-msg', '✓ 生成成功');
      } catch(e){
        const c = $('#qr-canvas');
        c.width = c.height = 0;
        $('#qr-ver').textContent = '生成失败';
        $('#qr-ver').className = 'badge err';
        setMsg('qr-msg', '✗ ' + e.message, true);
      }
    };
    $('#qr-scale').oninput = e => {
      $('#qr-scale-val').textContent = e.target.value;
      gen();
    };
    $('#qr-gen').onclick = gen;
    $('#qr-text').addEventListener('input', () => {
      clearTimeout(gen._t);
      gen._t = setTimeout(gen, 250);
    });
    $('#qr-dl').onclick = () => {
      const c = $('#qr-canvas');
      if (!c.width) return toast('请先生成二维码');
      c.toBlob(b => downloadFile('qrcode.png', b), 'image/png');
    };
    $('#qr-copy').onclick = () => copyText($('#qr-text').value);
    gen();
  }
},

/* ---------- 13. JWT 解码 ---------- */
{
  id:'jwt', name:'JWT 解码', icon:'🔑', cat:'编码解码',
  desc:'解析 JWT 的 Header、Payload，并检查过期时间',
  render(){
    return `<div class="panel"><div class="panel-body">
        <div class="field"><label>JWT Token</label>
          <textarea class="inp" id="jwt-in" rows="4" spellcheck="false"
            placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"></textarea></div>
        <div class="bar">
          <button class="btn primary" id="jwt-run">解码</button>
          <button class="btn" id="jwt-sample">示例</button>
          <span class="sp"></span>
          <span id="jwt-msg" class="msg"></span>
        </div>
      </div></div>
      <div class="panel" id="jwt-status-wrap" style="display:none">
        <div class="panel-body"><div id="jwt-status"></div></div>
      </div>
      <div class="grid2">
        <div class="panel"><div class="panel-head">Header</div>
          <div class="panel-body"><div class="out-box" id="jwt-header">–</div></div></div>
        <div class="panel"><div class="panel-head">Payload</div>
          <div class="panel-body"><div class="out-box" id="jwt-payload">–</div></div></div>
      </div>
      <div class="panel"><div class="panel-head">Signature</div>
        <div class="panel-body"><div class="out-box" id="jwt-sig" style="max-height:100px">–</div></div></div>
      <div class="panel"><div class="panel-head">声明字段说明</div>
        <div class="panel-body" style="padding:0"><div class="scroll-y">
          <table class="tbl" id="jwt-claims"></table>
        </div></div></div>`;
  },
  init(){
    const CLAIM_DESC = {
      iss:'签发者 Issuer', sub:'主题 Subject', aud:'受众 Audience',
      exp:'过期时间 Expiration', nbf:'生效时间 Not Before', iat:'签发时间 Issued At',
      jti:'JWT ID', name:'名称', email:'邮箱', role:'角色', scope:'权限范围'
    };
    const run = () => {
      const t = $('#jwt-in').value.trim();
      if (!t) return setMsg('jwt-msg', '请输入 JWT', true);
      try {
        const parts = t.split('.');
        if (parts.length !== 3) throw new Error('JWT 必须由 3 段组成（以 . 分隔）');
        const header = JSON.parse(b64decode(parts[0]));
        const payload = JSON.parse(b64decode(parts[1]));
        $('#jwt-header').textContent = JSON.stringify(header, null, 2);
        $('#jwt-payload').textContent = JSON.stringify(payload, null, 2);
        $('#jwt-sig').textContent = parts[2];
        setMsg('jwt-msg', '✓ 解析成功（未验证签名）');

        // 状态
        const now = Math.floor(Date.now() / 1000);
        let st = '';
        if (payload.exp){
          const diff = payload.exp - now;
          if (diff > 0){
            const d = Math.floor(diff / 86400), h = Math.floor(diff % 86400 / 3600),
                  m = Math.floor(diff % 3600 / 60);
            st += `<span class="badge ok">✓ 未过期</span> 还有 ${d} 天 ${h} 小时 ${m} 分钟过期`;
          } else {
            st += `<span class="badge err">✗ 已过期</span> 过期于 ${new Date(payload.exp * 1000).toLocaleString('zh-CN')}`;
          }
        } else {
          st += `<span class="badge warn">无 exp 字段</span>`;
        }
        if (payload.nbf && payload.nbf > now){
          st += ` &nbsp;<span class="badge warn">尚未生效</span>`;
        }
        $('#jwt-status').innerHTML = st;
        $('#jwt-status-wrap').style.display = '';

        // 声明表
        const keys = Object.keys(payload);
        let html = '<thead><tr><th>字段</th><th>说明</th><th>值</th></tr></thead><tbody>';
        for (const k of keys){
          let v = payload[k];
          if ((k === 'exp' || k === 'iat' || k === 'nbf') && typeof v === 'number'){
            v = v + '  →  ' + new Date(v * 1000).toLocaleString('zh-CN', {hour12:false});
          } else if (typeof v === 'object'){
            v = JSON.stringify(v);
          }
          html += `<tr><td><code>${esc(k)}</code></td><td>${esc(CLAIM_DESC[k] || '—')}</td>
            <td><code>${esc(String(v))}</code></td></tr>`;
        }
        html += '</tbody>';
        $('#jwt-claims').innerHTML = html;
      } catch(e){
        setMsg('jwt-msg', '✗ ' + e.message, true);
        ['jwt-header','jwt-payload','jwt-sig'].forEach(id => $('#' + id).textContent = '–');
        $('#jwt-status-wrap').style.display = 'none';
        $('#jwt-claims').innerHTML = '';
      }
    };
    $('#jwt-run').onclick = run;
    $('#jwt-sample').onclick = () => {
      $('#jwt-in').value = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' +
        'eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE5MDAwMDAwMDB9.' +
        'SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
      run();
    };
    $('#jwt-in').addEventListener('input', () => { if ($('#jwt-in').value.trim()) run(); });
  }
},

/* ---------- 14. Markdown 预览 ---------- */
{
  id:'markdown', name:'Markdown 预览', icon:'📄', cat:'格式化',
  desc:'实时渲染 Markdown，支持表格、代码块、引用等语法',
  render(){
    return `<div class="io">
        ${pane('Markdown 源文本', 'md-in', '# 标题\n\n在这里输入 Markdown…', 'lg')}
        <div class="pane">
          <div class="pane-head">预览<span class="sp"></span>
            <button class="mini" id="md-copyhtml">复制 HTML</button></div>
          <div class="panel-body" style="overflow:auto;max-height:520px">
            <div class="md" id="md-out"></div>
          </div>
        </div>
      </div>
      <div class="bar">
        <button class="btn" id="md-sample">载入示例</button>
        <button class="btn" id="md-dlhtml">下载 HTML</button>
        <span class="sp"></span>
        <span id="md-msg" class="msg"></span>
      </div>`;
  },
  init(){
    const render = () => {
      const src = $('#md-in').value;
      $('#md-out').innerHTML = mdRender(src);
    };
    $('#md-in').addEventListener('input', render);
    $('#md-copyhtml').onclick = () => copyText($('#md-out').innerHTML);
    $('#md-dlhtml').onclick = () => {
      const html = `<!DOCTYPE html><html><head><meta charset="utf-8">
<title>Markdown 导出</title>
<style>body{max-width:800px;margin:40px auto;padding:0 20px;font:16px/1.7 -apple-system,"PingFang SC","Microsoft YaHei",sans-serif;color:#222}
pre{background:#f6f8fa;padding:14px;border-radius:8px;overflow:auto}code{background:#f6f8fa;padding:2px 5px;border-radius:4px;font-family:ui-monospace,Menlo,monospace;font-size:.9em}
pre code{background:none;padding:0}blockquote{border-left:4px solid #ddd;margin:0;padding:0 16px;color:#666}
table{border-collapse:collapse;width:100%}th,td{border:1px solid #ddd;padding:8px 12px}th{background:#f6f8fa}
img{max-width:100%}</style></head><body>${$('#md-out').innerHTML}</body></html>`;
      downloadFile('markdown.html', html, 'text/html');
    };
    $('#md-sample').onclick = () => {
      $('#md-in').value = `# DevKit 工具集

一个**纯前端**的开发者工具箱，所有计算都在本地完成。

## 功能列表

- [x] Base64 编解码
- [x] JSON 格式化
- [x] 二维码生成
- [ ] 更多工具...

## 代码示例

\`\`\`js
const result = btoa("hello");
console.log(result);
\`\`\`

## 表格

| 工具 | 分类 | 状态 |
|------|------|------|
| Base64 | 编码解码 | ✅ |
| Hash | 生成 | ✅ |
| 正则测试 | 文本 | ✅ |

> 提示：所有数据都留在你的浏览器里，不会上传到任何服务器。

---

访问 [MDN](https://developer.mozilla.org) 了解更多。`;
      render();
    };
    render();
  }
},

/* ---------- 15. 图片转 Base64 / 压缩 ---------- */
{
  id:'image', name:'图片转 Base64 / 压缩', icon:'🖼', cat:'图片',
  desc:'图片转 Data URL、压缩、缩放与格式转换，支持拖拽',
  render(){
    return `<div class="panel"><div class="panel-body">
        <div class="drop" id="img-drop">点击选择，或把图片拖到这里</div>
        <input type="file" id="img-file" accept="image/*" hidden>
        <div class="row" style="margin-top:14px">
          <div class="field"><label>输出格式</label>
            <select class="inp" id="img-fmt">
              <option value="image/jpeg">JPEG</option>
              <option value="image/png">PNG（无损）</option>
              <option value="image/webp">WebP</option>
            </select></div>
          <div class="field"><label>质量：<b id="img-qv">0.85</b></label>
            <input type="range" id="img-q" min="0.1" max="1" step="0.05" value="0.85" style="width:100%"></div>
          <div class="field"><label>最大宽度 px（0 = 不缩放）</label>
            <input class="inp" id="img-maxw" type="number" value="0" min="0"></div>
          <div class="field noflex"><label>&nbsp;</label>
            <button class="btn primary" id="img-run">处理</button></div>
        </div>
        <div class="bar">
          <button class="btn" id="img-dl">下载图片</button>
          <button class="btn" id="img-copydata">复制 Data URL</button>
          <span class="sp"></span><span id="img-msg" class="msg"></span>
        </div>
      </div></div>
      <div class="grid2" style="margin-top:14px">
        <div class="pane"><div class="pane-head">预览</div>
          <div style="padding:12px"><img class="imgprev" id="img-prev" alt=""></div></div>
        <div class="pane"><div class="pane-head">Data URL<span class="sp"></span>
            <button class="mini" data-copy="img-out">复制</button></div>
          <textarea class="ta" id="img-out" readonly placeholder="处理后的 Data URL…"
            style="min-height:220px;font-size:11px"></textarea></div>
      </div>
      <div class="panel"><div class="panel-body">
        <div class="kv"><span class="k">原始大小</span><span class="v" id="img-size0">–</span></div>
        <div class="kv"><span class="k">输出大小</span><span class="v" id="img-size1">–</span></div>
        <div class="kv"><span class="k">压缩率</span><span class="v" id="img-ratio">–</span></div>
        <div class="kv"><span class="k">图片尺寸</span><span class="v" id="img-dim">–</span></div>
      </div></div>`;
  },
  init(){
    let srcImg = null, outBlob = null, origSize = 0;
    const drop = $('#img-drop'), file = $('#img-file');
    drop.onclick = () => file.click();
    drop.ondragover = e => { e.preventDefault(); drop.classList.add('on'); };
    drop.ondragleave = () => drop.classList.remove('on');
    drop.ondrop = e => {
      e.preventDefault(); drop.classList.remove('on');
      const f = e.dataTransfer.files[0];
      if (f) load(f);
    };
    file.onchange = () => { if (file.files[0]) load(file.files[0]); };
    $('#img-q').oninput = e => $('#img-qv').textContent = e.target.value;

    function load(f){
      if (!f.type.startsWith('image/')) return setMsg('img-msg', '请选择图片文件', true);
      origSize = f.size;
      const r = new FileReader();
      r.onload = ev => {
        const img = new Image();
        img.onload = () => {
          srcImg = img;
          $('#img-prev').src = ev.target.result;
          $('#img-size0').textContent = fmtBytes(f.size);
          $('#img-size1').textContent = '–';
          $('#img-ratio').textContent = '–';
          $('#img-dim').textContent = img.naturalWidth + ' × ' + img.naturalHeight;
          drop.textContent = '已加载：' + f.name + '（' + fmtBytes(f.size) + '）';
          setMsg('img-msg', '✓ 已加载，点击「处理」');
        };
        img.onerror = () => setMsg('img-msg', '✗ 图片解析失败', true);
        img.src = ev.target.result;
      };
      r.readAsDataURL(f);
    }

    $('#img-run').onclick = () => {
      if (!srcImg) return setMsg('img-msg', '请先选择图片', true);
      const fmt = $('#img-fmt').value;
      const q = parseFloat($('#img-q').value);
      const maxw = parseInt($('#img-maxw').value, 10) || 0;
      let w = srcImg.naturalWidth, h = srcImg.naturalHeight;
      if (maxw > 0 && w > maxw){ h = Math.round(h * maxw / w); w = maxw; }
      const c = document.createElement('canvas');
      c.width = w; c.height = h;
      const ctx = c.getContext('2d');
      if (fmt === 'image/jpeg'){ ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, w, h); }
      ctx.drawImage(srcImg, 0, 0, w, h);
      c.toBlob(blob => {
        if (!blob) return setMsg('img-msg', '✗ 处理失败（可能是格式不支持）', true);
        outBlob = blob;
        const fr = new FileReader();
        fr.onload = () => {
          $('#img-out').value = fr.result;
          $('#img-prev').src = fr.result;
          $('#img-size1').textContent = fmtBytes(blob.size);
          const ratio = origSize ? (1 - blob.size / origSize) * 100 : 0;
          $('#img-ratio').textContent = (ratio >= 0 ? '↓ ' : '↑ ') + Math.abs(ratio).toFixed(1) + '%';
          $('#img-dim').textContent = w + ' × ' + h;
          setMsg('img-msg', '✓ 处理完成');
        };
        fr.readAsDataURL(blob);
      }, fmt, q);
    };
    $('#img-dl').onclick = () => {
      if (!outBlob) return toast('请先处理图片');
      const ext = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' }[$('#img-fmt').value] || 'png';
      downloadFile('output.' + ext, outBlob);
    };
    $('#img-copydata').onclick = () => copyText($('#img-out').value);
  }
}

]; // end tools

/* =========================================================
   6. 辅助函数（供工具使用）
   ========================================================= */
function sortKeys(o){
  if (Array.isArray(o)) return o.map(sortKeys);
  if (o && typeof o === 'object'){
    const r = {};
    for (const k of Object.keys(o).sort()) r[k] = sortKeys(o[k]);
    return r;
  }
  return o;
}

function jsonToTS(root){
  const out = [];
  const seen = new Set();
  const cap = s => s ? s[0].toUpperCase() + s.slice(1) : s;
  function walk(v, name){
    if (v === null) return 'null';
    if (Array.isArray(v)){
      if (!v.length) return 'any[]';
      const types = [...new Set(v.map(x => walk(x, name + 'Item')))];
      const u = types.join(' | ');
      return types.length > 1 ? `(${u})[]` : `${u}[]`;
    }
    if (typeof v === 'object'){
      const ifaceName = name || 'Root';
      if (seen.has(ifaceName)) return ifaceName;
      seen.add(ifaceName);
      const lines = [];
      for (const k of Object.keys(v)){
        const childName = cap(k) || 'Field';
        const t = walk(v[k], childName);
        const key = /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(k) ? k : JSON.stringify(k);
        lines.push(`  ${key}: ${t};`);
      }
      out.push(`export interface ${ifaceName} {\n${lines.join('\n')}\n}`);
      return ifaceName;
    }
    return typeof v === 'string' ? 'string'
         : typeof v === 'number' ? 'number'
         : typeof v === 'boolean' ? 'boolean' : 'any';
  }
  walk(root, 'Root');
  return out.reverse().join('\n\n');
}

function genId(type){
  switch (type){
    case 'uuid': case 'upper': {
      let u;
      if (typeof crypto !== 'undefined' && crypto.randomUUID) u = crypto.randomUUID();
      else {
        const b = new Uint8Array(16);
        (crypto.getRandomValues ? crypto : {getRandomValues: a => a.forEach((_, i) => a[i] = randInt(256))}).getRandomValues(b);
        b[6] = (b[6] & 0x0f) | 0x40;
        b[8] = (b[8] & 0x3f) | 0x80;
        const h = [...b].map(x => hx(x)).join('');
        u = `${h.slice(0,8)}-${h.slice(8,12)}-${h.slice(12,16)}-${h.slice(16,20)}-${h.slice(20)}`;
      }
      return type === 'upper' ? u.toUpperCase() : u;
    }
    case 'uuid-nodash': return genId('uuid').replace(/-/g, '');
    case 'short': return nanoid(21);
    case 'short10': return nanoid(10);
    case 'hex': {
      const b = new Uint8Array(16);
      if (crypto.getRandomValues) crypto.getRandomValues(b);
      else for (let i = 0; i < 16; i++) b[i] = randInt(256);
      return [...b].map(x => hx(x)).join('');
    }
  }
  return '';
}
function nanoid(n){
  const A = 'useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict';
  let s = '';
  if (crypto.getRandomValues){
    const b = new Uint8Array(n);
    crypto.getRandomValues(b);
    for (let i = 0; i < n; i++) s += A[b[i] & 63];
  } else {
    for (let i = 0; i < n; i++) s += A[randInt(64)];
  }
  return s;
}

function relTime(ts){
  const diff = Date.now() - ts;
  const abs = Math.abs(diff);
  const units = [
    ['年', 31536000000], ['个月', 2592000000], ['天', 86400000],
    ['小时', 3600000], ['分钟', 60000], ['秒', 1000]
  ];
  for (const [n, ms] of units){
    if (abs >= ms){
      const v = Math.floor(abs / ms);
      return diff >= 0 ? `${v} ${n}前` : `${v} ${n}后`;
    }
  }
  return '刚刚';
}

/* 颜色解析与转换 */
function parseColor(str){
  str = str.trim();
  let m;
  if ((m = str.match(/^#?([0-9a-f]{3,8})$/i))){
    let h = m[1];
    if (h.length === 3) h = h.split('').map(c => c + c).join('');
    if (h.length === 4) h = h.split('').map(c => c + c).join('');
    if (h.length === 6 || h.length === 8){
      const r = parseInt(h.slice(0,2), 16), g = parseInt(h.slice(2,4), 16), b = parseInt(h.slice(4,6), 16);
      const a = h.length === 8 ? parseInt(h.slice(6,8), 16) / 255 : undefined;
      return a === undefined ? {r,g,b} : {r,g,b,a:+a.toFixed(3)};
    }
  }
  if ((m = str.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+)\s*)?\)$/i)))
    return { r:+m[1], g:+m[2], b:+m[3], a: m[4] != null ? +m[4] : undefined };
  if ((m = str.match(/^hsla?\(\s*([\d.]+)\s*,\s*([\d.]+)%\s*,\s*([\d.]+)%\s*(?:,\s*([\d.]+)\s*)?\)$/i))){
    const c = hslToRgb(+m[1], +m[2], +m[3]);
    return { ...c, a: m[4] != null ? +m[4] : undefined };
  }
  throw new Error('无法识别的颜色格式');
}
function rgbToHsl(r, g, b){
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r,g,b), min = Math.min(r,g,b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  const d = max - min;
  if (d){
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max){
      case r: h = ((g - b) / d + (g < b ? 6 : 0)); break;
      case g: h = ((b - r) / d + 2); break;
      case b: h = ((r - g) / d + 4); break;
    }
    h *= 60;
  }
  return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) };
}
function rgbToHsv(r, g, b){
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r,g,b), min = Math.min(r,g,b), d = max - min;
  let h = 0;
  if (d){
    switch (max){
      case r: h = ((g - b) / d + (g < b ? 6 : 0)); break;
      case g: h = ((b - r) / d + 2); break;
      case b: h = ((r - g) / d + 4); break;
    }
    h *= 60;
  }
  return { h: Math.round(h), s: Math.round((max ? d / max : 0) * 100), v: Math.round(max * 100) };
}
function rgbToCmyk(r, g, b){
  const rr = r/255, gg = g/255, bb = b/255;
  const k = 1 - Math.max(rr,gg,bb);
  if (k === 1) return { c:0, m:0, y:0, k:100 };
  return {
    c: Math.round((1-rr-k)/(1-k)*100),
    m: Math.round((1-gg-k)/(1-k)*100),
    y: Math.round((1-bb-k)/(1-k)*100),
    k: Math.round(k*100)
  };
}
function hslToRgb(h, s, l){
  h = ((h % 360) + 360) % 360; s /= 100; l /= 100;
  const c = (1 - Math.abs(2*l - 1)) * s;
  const x = c * (1 - Math.abs((h/60) % 2 - 1));
  const m = l - c/2;
  let r=0, g=0, b=0;
  if (h < 60){ r=c; g=x; }
  else if (h < 120){ r=x; g=c; }
  else if (h < 180){ g=c; b=x; }
  else if (h < 240){ g=x; b=c; }
  else if (h < 300){ r=x; b=c; }
  else { r=c; b=x; }
  return {
    r: Math.round((r+m)*255),
    g: Math.round((g+m)*255),
    b: Math.round((b+m)*255)
  };
}
function srgb(c){
  c /= 255;
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}
function parseIntSafe(str, base){
  const A = '0123456789abcdefghijklmnopqrstuvwxyz'.slice(0, base);
  const s = str.toLowerCase();
  let n = 0n;
  for (const c of s){
    const i = A.indexOf(c);
    if (i < 0) throw new Error('字符 "' + c + '" 不属于 ' + base + ' 进制');
    n = n * BigInt(base) + BigInt(i);
  }
  return n.toString();
}

/* =========================================================
   7. 路由 / 导航 / 搜索
   ========================================================= */
const FAV_KEY = 'dk-favs';
function getFavs(){
  try { return JSON.parse(localStorage.getItem(FAV_KEY)) || []; }
  catch { return []; }
}
function isFav(id){ return getFavs().includes(id); }
function toggleFav(id){
  const f = getFavs();
  const i = f.indexOf(id);
  if (i >= 0) f.splice(i, 1); else f.push(id);
  localStorage.setItem(FAV_KEY, JSON.stringify(f));
  return i < 0;
}

function renderNav(){
  const cats = [...new Set(tools.map(t => t.cat))];
  let html = `<div class="nav-group">
    <div class="nav-item" data-go=""><span class="ic">🏠</span>首页</div>
  </div>`;
  for (const c of cats){
    html += `<div class="nav-group"><div class="nav-title">${esc(c)}</div>`;
    for (const t of tools.filter(x => x.cat === c)){
      html += `<div class="nav-item" data-go="${t.id}">
        <span class="ic">${t.icon}</span><span>${esc(t.name)}</span>
        <span class="star ${isFav(t.id) ? 'on' : ''}">★</span>
      </div>`;
    }
    html += '</div>';
  }
  $('#nav').innerHTML = html;
  updateNav();
}
function updateNav(){
  const cur = location.hash.replace(/^#\/?/, '');
  $$('#nav .nav-item').forEach(el => {
    el.classList.toggle('on', (el.dataset.go || '') === cur);
  });
}
function closeSidebar(){
  $('#sidebar').classList.remove('on');
  $('#scrim').classList.remove('on');
}

function cardHTML(t){
  return `<div class="card" data-go="${t.id}">
    <div class="ic">${t.icon}</div>
    <div style="min-width:0">
      <div class="nm">${esc(t.name)}</div>
      <div class="ds">${esc(t.desc)}</div>
    </div>
  </div>`;
}
function renderHome(){
  const favs = getFavs();
  const cats = [...new Set(tools.map(t => t.cat))];
  let html = `<div class="hero">
    <h1>开发者工具箱</h1>
    <p>${tools.length} 个常用工具 · 纯本地运行 · 数据不会上传 ·
       按 <kbd>Ctrl</kbd>/<kbd>⌘</kbd>+<kbd>K</kbd> 快速搜索</p>
  </div>`;
  if (favs.length){
    html += `<div class="sec-title">★ 我的收藏</div><div class="cards">`;
    for (const id of favs){
      const t = tools.find(x => x.id === id);
      if (t) html += cardHTML(t);
    }
    html += `</div>`;
  }
  for (const c of cats){
    html += `<div class="sec-title">${esc(c)}</div><div class="cards">`;
    for (const t of tools.filter(x => x.cat === c)) html += cardHTML(t);
    html += `</div>`;
  }
  mount(html);
}
function renderTool(t){
  mount(`<div class="tool-head">
      <div class="ic">${t.icon}</div>
      <div style="min-width:0">
        <h2>${esc(t.name)}</h2>
        <p>${esc(t.desc)}</p>
      </div>
      <button class="fav ${isFav(t.id) ? 'on' : ''}" title="收藏">★</button>
    </div>
    <div id="tool-body">${t.render()}</div>`);
  $('.tool-head .fav').onclick = e => {
    toggleFav(t.id);
    e.currentTarget.classList.toggle('on');
    renderNav();
    toast(isFav(t.id) ? '已加入收藏' : '已取消收藏');
  };
  if (t.init) t.init();
  window.scrollTo(0, 0);
}
function route(){
  closeSidebar();
  const h = location.hash.replace(/^#\/?/, '');
  if (!h) return renderHome();
  const t = tools.find(x => x.id === h);
  if (t) renderTool(t); else renderHome();
  updateNav();
}

/* =========================================================
   8. 全局事件绑定
   ========================================================= */
// 点击 data-go / data-copy / data-clear
document.addEventListener('click', e => {
  const g = e.target.closest('[data-go]');
  if (g){
    const id = g.dataset.go;
    location.hash = id ? '#/' + id : '#/';
    $('#globalSearch').value = '';
    $('#searchResults').classList.remove('on');
    return;
  }
  const c = e.target.closest('[data-copy]');
  if (c){
    const el = document.getElementById(c.dataset.copy);
    if (el) copyText(el.value !== undefined ? el.value : el.textContent);
    return;
  }
  const cl = e.target.closest('[data-clear]');
  if (cl){
    const el = document.getElementById(cl.dataset.clear);
    if (el){ if (el.value !== undefined) el.value = ''; else el.textContent = ''; }
    return;
  }
});

// 侧边栏开关
$('#menuBtn').onclick = () => {
  $('#sidebar').classList.toggle('on');
  $('#scrim').classList.toggle('on');
};
$('#scrim').onclick = closeSidebar;

// 主题
const themeBtn = $('#themeBtn');
function applyTheme(t){
  document.documentElement.dataset.theme = t;
  themeBtn.textContent = t === 'dark' ? '☀️' : '🌙';
  localStorage.setItem('dk-theme', t);
}
applyTheme(localStorage.getItem('dk-theme') ||
  (window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));
themeBtn.onclick = () =>
  applyTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark');

// 搜索
const searchInput = $('#globalSearch');
const searchResults = $('#searchResults');
searchInput.addEventListener('input', () => {
  const q = searchInput.value.trim().toLowerCase();
  if (!q){ searchResults.classList.remove('on'); return; }
  const res = tools.filter(t =>
    t.name.toLowerCase().includes(q) ||
    t.desc.toLowerCase().includes(q) ||
    t.id.includes(q) ||
    t.cat.toLowerCase().includes(q)
  );
  if (!res.length){
    searchResults.innerHTML = '<div class="sr-empty">没有找到匹配的工具</div>';
  } else {
    searchResults.innerHTML = res.map(t =>
      `<div class="sr-item" data-go="${t.id}">
        <span class="ic">${t.icon}</span>
        <span class="nm">${esc(t.name)}</span>
        <span class="ct">${esc(t.cat)}</span>
      </div>`).join('');
  }
  searchResults.classList.add('on');
});
searchInput.addEventListener('blur', () => {
  setTimeout(() => searchResults.classList.remove('on'), 180);
});
searchInput.addEventListener('focus', () => {
  if (searchInput.value.trim()) searchResults.classList.add('on');
});
document.addEventListener('keydown', e => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k'){
    e.preventDefault();
    searchInput.focus();
    searchInput.select();
  }
  if (e.key === 'Escape' && document.activeElement === searchInput){
    searchInput.value = '';
    searchResults.classList.remove('on');
    searchInput.blur();
  }
});

// 启动
window.addEventListener('hashchange', route);
renderNav();
route();
