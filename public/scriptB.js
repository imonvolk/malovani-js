function initB() {
  /* ── Styles ──────────────────────────────────────────────────────── */
  const style = document.createElement('style');
  style.textContent = `
    #appWindow { background:#0f0f0f; color:#e0e0e0; font-family:system-ui,sans-serif; display:flex; flex-direction:column; height:100%; }
    #b-toolbar { background:#1a1a1a; border-bottom:1px solid #2a2a2a; padding:6px 10px; display:flex; align-items:center; gap:6px; flex-wrap:wrap; flex-shrink:0; user-select:none; }
    .b-sep { width:1px; height:24px; background:#2a2a2a; margin:0 2px; flex-shrink:0; }
    .b-label { font-size:.68rem; color:#555; }
    #b-tools { display:flex; gap:2px; flex-wrap:wrap; }
    .b-tool { background:none; border:1px solid transparent; border-radius:6px; color:#e0e0e0; width:28px; height:26px; font-size:.85rem; cursor:pointer; display:flex; align-items:center; justify-content:center; }
    .b-tool:hover { background:#222; }
    .b-tool.active { background:#222; border-color:#3a8ef6; }
    #b-palette { display:flex; gap:4px; flex-wrap:wrap; }
    .b-swatch { width:20px; height:20px; border-radius:50%; border:2px solid transparent; cursor:pointer; transition:transform .1s; }
    .b-swatch:hover { transform:scale(1.2); }
    .b-swatch.active { border-color:#fff; transform:scale(1.2); }
    #b-custom-color { width:20px; height:20px; border-radius:50%; border:2px solid #2a2a2a; cursor:pointer; padding:0; background:none; }
    #b-size-slider,#b-opacity-slider { accent-color:#3a8ef6; width:70px; }
    #b-size-val,#b-opacity-val { font-size:.68rem; color:#555; min-width:26px; }
    #b-font-select { background:#222; color:#e0e0e0; border:1px solid #2a2a2a; border-radius:5px; font-size:.72rem; padding:2px 4px; display:none; }
    .b-btn { background:#222; color:#e0e0e0; border:1px solid #2a2a2a; border-radius:6px; padding:3px 8px; font-size:.72rem; cursor:pointer; white-space:nowrap; }
    .b-btn:hover { background:#2e2e2e; }
    .b-btn.danger { color:#e74c3c; border-color:#e74c3c44; }
    .b-toggle { background:#222; color:#555; border:1px solid #2a2a2a; border-radius:6px; padding:3px 7px; font-size:.72rem; cursor:pointer; white-space:nowrap; }
    .b-toggle.on { color:#3a8ef6; border-color:#3a8ef6; }
    #b-chip { margin-left:auto; display:flex; align-items:center; gap:6px; font-size:.75rem; color:#555; }
    #b-main { flex:1; display:flex; min-height:0; }
    #b-canvas-area { flex:1; position:relative; overflow:hidden; background:#fff; cursor:crosshair; min-width:0; }
    #b-canvas,#b-preview,#b-grid { position:absolute; top:0; left:0; }
    #b-preview { pointer-events:none; }
    #b-grid { pointer-events:none; opacity:.3; display:none; }
    #b-text-overlay { position:absolute; display:none; background:transparent; border:1px dashed #3a8ef6; outline:none; color:#000; min-width:60px; padding:2px 4px; z-index:50; resize:none; overflow:hidden; white-space:pre; }
    .b-cursor { position:absolute; pointer-events:none; transform:translate(-4px,-4px); display:flex; flex-direction:column; gap:3px; }
    .b-cursor-dot { width:10px; height:10px; border-radius:50%; border:2px solid rgba(255,255,255,.5); }
    .b-cursor-label { background:rgba(0,0,0,.7); color:#fff; font-size:.65rem; padding:2px 6px; border-radius:4px; white-space:nowrap; }
    #b-users-panel { position:absolute; bottom:12px; right:232px; background:rgba(15,15,15,.85); border:1px solid #2a2a2a; border-radius:10px; padding:8px 12px; font-size:.72rem; backdrop-filter:blur(6px); z-index:10; }
    #b-users-panel h3 { font-size:.62rem; color:#555; margin-bottom:5px; text-transform:uppercase; letter-spacing:.07em; }
    .b-user-row { display:flex; align-items:center; gap:5px; padding:1px 0; }
    .b-user-dot { width:7px; height:7px; border-radius:50%; flex-shrink:0; }
    #b-chat { width:220px; flex-shrink:0; background:#1a1a1a; border-left:1px solid #2a2a2a; display:flex; flex-direction:column; }
    #b-chat h3 { font-size:.68rem; color:#555; text-transform:uppercase; letter-spacing:.07em; padding:7px 10px 5px; border-bottom:1px solid #2a2a2a; }
    #b-chat-msgs { flex:1; overflow-y:auto; padding:8px; display:flex; flex-direction:column; gap:4px; }
    #b-chat-msgs::-webkit-scrollbar { width:4px; }
    #b-chat-msgs::-webkit-scrollbar-thumb { background:#2a2a2a; border-radius:4px; }
    .b-chat-msg { font-size:.73rem; line-height:1.4; word-break:break-word; }
    .b-chat-name { font-weight:600; }
    .b-chat-sys { font-size:.68rem; color:#555; text-align:center; font-style:italic; }
    #b-chat-form { display:flex; border-top:1px solid #2a2a2a; }
    #b-chat-input { flex:1; background:transparent; border:none; outline:none; color:#e0e0e0; font-size:.78rem; padding:7px 10px; }
    #b-chat-send { background:none; border:none; color:#3a8ef6; font-size:.9rem; padding:0 10px; cursor:pointer; }
  `;
  document.head.appendChild(style);

  const PALETTE = ['#1a1a1a','#ffffff','#e74c3c','#e67e22','#f1c40f','#2ecc71','#3498db','#9b59b6','#00bcd4','#ff5722','#795548','#607d8b'];

  /* ── HTML ────────────────────────────────────────────────────────── */
  appWindow.innerHTML = `
    <div id="b-toolbar">
      <div id="b-tools">
        <button class="b-tool active" data-tool="pen"          title="Pero (P)">✏️</button>
        <button class="b-tool"        data-tool="eraser"       title="Guma (E)">🧽</button>
        <button class="b-tool"        data-tool="spray"        title="Sprej (A)">💨</button>
        <button class="b-tool"        data-tool="line"         title="Čára (L)">╱</button>
        <button class="b-tool"        data-tool="rect"         title="Obdélník (R)">▢</button>
        <button class="b-tool"        data-tool="rect-fill"    title="Vyplněný obdélník">▣</button>
        <button class="b-tool"        data-tool="ellipse"      title="Elipsa (O)">◯</button>
        <button class="b-tool"        data-tool="ellipse-fill" title="Vyplněná elipsa">⬤</button>
        <button class="b-tool"        data-tool="fill"         title="Výplň (B)">🪣</button>
        <button class="b-tool"        data-tool="text"         title="Text (T)">🔤</button>
        <button class="b-tool"        data-tool="picker"       title="Kapátko (K)">🔍</button>
      </div>
      <div class="b-sep"></div>
      <div id="b-palette">${PALETTE.map((c,i) => `<div class="b-swatch${i===2?' active':''}" style="background:${c}" data-c="${c}"></div>`).join('')}</div>
      <input type="color" id="b-custom-color" />
      <div class="b-sep"></div>
      <span class="b-label">Vel.</span>
      <input type="range" id="b-size-slider" min="1" max="80" value="5" />
      <span id="b-size-val">5</span>
      <div class="b-sep"></div>
      <span class="b-label">Kryt.</span>
      <input type="range" id="b-opacity-slider" min="5" max="100" value="100" />
      <span id="b-opacity-val">100%</span>
      <select id="b-font-select"><option value="sans-serif">Sans</option><option value="serif">Serif</option><option value="monospace">Mono</option><option value="cursive">Cursive</option></select>
      <div class="b-sep"></div>
      <button class="b-toggle" id="b-sym">Sym</button>
      <button class="b-toggle" id="b-grid-btn">Mřížka</button>
      <div class="b-sep"></div>
      <button class="b-btn" id="b-undo">↩ Zpět</button>
      <button class="b-btn" id="b-export">⬇ PNG</button>
      <button class="b-btn danger" id="b-clear">✕ Smazat vše</button>
      <div id="b-chip"><span>${username}</span></div>
    </div>
    <div id="b-main">
      <div id="b-canvas-area">
        <canvas id="b-canvas"></canvas>
        <canvas id="b-preview"></canvas>
        <canvas id="b-grid"></canvas>
        <textarea id="b-text-overlay" rows="1" spellcheck="false"></textarea>
        <div id="b-users-panel"><h3>Online</h3><div id="b-users-list"></div></div>
      </div>
      <div id="b-chat">
        <h3>Chat</h3>
        <div id="b-chat-msgs"></div>
        <form id="b-chat-form">
          <input id="b-chat-input" placeholder="Zpráva…" maxlength="300" autocomplete="off" />
          <button type="submit" id="b-chat-send">↵</button>
        </form>
      </div>
    </div>
  `;

  /* ── Elements ────────────────────────────────────────────────────── */
  const canvasArea  = document.getElementById('b-canvas-area');
  const canvas      = document.getElementById('b-canvas');
  const previewCv   = document.getElementById('b-preview');
  const gridCv      = document.getElementById('b-grid');
  const textOverlay = document.getElementById('b-text-overlay');
  const ctx         = canvas.getContext('2d');
  const pCtx        = previewCv.getContext('2d');
  const gCtx        = gridCv.getContext('2d');
  const usersList   = document.getElementById('b-users-list');
  const chatMsgs    = document.getElementById('b-chat-msgs');
  const chatInput   = document.getElementById('b-chat-input');
  const fontSelect  = document.getElementById('b-font-select');
  const sizeSlider  = document.getElementById('b-size-slider');
  const sizeVal     = document.getElementById('b-size-val');
  const opSlider    = document.getElementById('b-opacity-slider');
  const opVal       = document.getElementById('b-opacity-val');
  const customColor = document.getElementById('b-custom-color');

  /* ── State ───────────────────────────────────────────────────────── */
  let brushColor = '#e74c3c', brushSize = 5, opacity = 1, activeFont = 'sans-serif';
  let activeTool = 'pen', symmetry = false, showGrid = false;
  let drawing = false, shapeStart = null, lastPt = null;
  let currentPoints = [], sprayBuffer = [], sprayInterval = null;
  let allOps = [], myOpIndices = [], textPos = null;
  const remoteUsers = new Map();

  /* ── Socket ──────────────────────────────────────────────────────── */
  const socket = io();
  socket.emit('join', { username, member: selectedMember });

  /* ── Canvas resize ───────────────────────────────────────────────── */
  function resizeCanvas() {
    const w = canvasArea.offsetWidth, h = canvasArea.offsetHeight;
    if (!w || !h) return;
    const tmp = document.createElement('canvas');
    tmp.width = canvas.width || w; tmp.height = canvas.height || h;
    tmp.getContext('2d').drawImage(canvas, 0, 0);
    [canvas, previewCv, gridCv].forEach(c => { c.width = w; c.height = h; });
    ctx.drawImage(tmp, 0, 0);
    if (showGrid) drawGrid();
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  /* ── Grid ────────────────────────────────────────────────────────── */
  function drawGrid() {
    const W = gridCv.width, H = gridCv.height, s = 40;
    gCtx.clearRect(0, 0, W, H); gCtx.strokeStyle = '#666'; gCtx.lineWidth = 0.5;
    for (let x = 0; x <= W; x += s) { gCtx.beginPath(); gCtx.moveTo(x,0); gCtx.lineTo(x,H); gCtx.stroke(); }
    for (let y = 0; y <= H; y += s) { gCtx.beginPath(); gCtx.moveTo(0,y); gCtx.lineTo(W,y); gCtx.stroke(); }
  }
  document.getElementById('b-grid-btn').addEventListener('click', function() {
    showGrid = !showGrid; this.classList.toggle('on', showGrid);
    gridCv.style.display = showGrid ? 'block' : 'none'; if (showGrid) drawGrid();
  });
  document.getElementById('b-sym').addEventListener('click', function() {
    symmetry = !symmetry; this.classList.toggle('on', symmetry);
  });

  /* ── Apply operation ─────────────────────────────────────────────── */
  function applyOp(op, tc) {
    const c = tc || ctx, W = canvas.width, H = canvas.height;
    c.save(); c.globalAlpha = op.alpha != null ? op.alpha : 1;
    if (op.type === 'stroke') {
      const pts = op.points; if (pts.length < 2) { c.restore(); return; }
      c.beginPath(); c.strokeStyle = op.color; c.lineWidth = op.size; c.lineCap = 'round'; c.lineJoin = 'round';
      c.moveTo(pts[0].x*W, pts[0].y*H);
      for (let i = 1; i < pts.length; i++) c.lineTo(pts[i].x*W, pts[i].y*H);
      c.stroke();
    }
    if (op.type === 'spray') {
      c.fillStyle = op.color;
      op.points.forEach(p => c.fillRect(p.x*W, p.y*H, 1.5, 1.5));
    }
    if (op.type === 'shape') {
      const x1=op.x1*W, y1=op.y1*H, x2=op.x2*W, y2=op.y2*H;
      c.strokeStyle = op.color; c.fillStyle = op.color; c.lineWidth = op.size; c.lineCap = 'round'; c.lineJoin = 'round';
      if (op.kind === 'line')              { c.beginPath(); c.moveTo(x1,y1); c.lineTo(x2,y2); c.stroke(); }
      else if (op.kind === 'rect')         { c.strokeRect(x1,y1,x2-x1,y2-y1); }
      else if (op.kind === 'rect-fill')    { c.fillRect(x1,y1,x2-x1,y2-y1); }
      else if (op.kind === 'ellipse')      { c.beginPath(); c.ellipse((x1+x2)/2,(y1+y2)/2,Math.abs(x2-x1)/2,Math.abs(y2-y1)/2,0,0,Math.PI*2); c.stroke(); }
      else if (op.kind === 'ellipse-fill') { c.beginPath(); c.ellipse((x1+x2)/2,(y1+y2)/2,Math.abs(x2-x1)/2,Math.abs(y2-y1)/2,0,0,Math.PI*2); c.fill(); }
    }
    if (op.type === 'fill') floodFill(c === ctx ? ctx : c, Math.round(op.x*W), Math.round(op.y*H), op.color);
    if (op.type === 'text') {
      c.fillStyle = op.color; c.font = op.size + 'px ' + (op.font || 'sans-serif'); c.textBaseline = 'top';
      op.text.split('\n').forEach((line, i) => c.fillText(line, op.x*W, op.y*H + i*op.size*1.2));
    }
    c.restore();
  }

  /* ── Flood fill ──────────────────────────────────────────────────── */
  function floodFill(tc, sx, sy, fh) {
    const W = canvas.width, H = canvas.height;
    if (sx < 0 || sy < 0 || sx >= W || sy >= H) return;
    const id = tc.getImageData(0,0,W,H), d = id.data;
    const fr=parseInt(fh.slice(1,3),16), fg=parseInt(fh.slice(3,5),16), fb=parseInt(fh.slice(5,7),16);
    const i0=(sy*W+sx)*4, sr=d[i0], sg=d[i0+1], sb=d[i0+2], sa=d[i0+3];
    if (sr===fr && sg===fg && sb===fb && sa===255) return;
    const stack=[sy*W+sx], vis=new Uint8Array(W*H);
    while (stack.length) {
      const pos=stack.pop(); if (vis[pos]) continue;
      const px=pos%W, py=(pos/W)|0, i=pos*4;
      if (d[i]!==sr||d[i+1]!==sg||d[i+2]!==sb||d[i+3]!==sa) continue;
      vis[pos]=1; d[i]=fr; d[i+1]=fg; d[i+2]=fb; d[i+3]=255;
      if (px>0) stack.push(pos-1); if (px<W-1) stack.push(pos+1);
      if (py>0) stack.push(pos-W); if (py<H-1) stack.push(pos+W);
    }
    tc.putImageData(id,0,0);
  }

  /* ── Undo ────────────────────────────────────────────────────────── */
  function reRender() { ctx.clearRect(0,0,canvas.width,canvas.height); allOps.forEach(op => applyOp(op)); }
  function localUndo() {
    if (!myOpIndices.length) return;
    const idx = myOpIndices.pop(); allOps.splice(idx,1);
    myOpIndices.forEach((v,i) => { if (myOpIndices[i] > idx) myOpIndices[i]--; });
    reRender();
  }
  function recordOp(op) { allOps.push(op); myOpIndices.push(allOps.length-1); }

  /* ── Send helpers ────────────────────────────────────────────────── */
  function sendOp(op) { socket.emit('draw', { bOp: op }); }
  function mirrorPt(p) { return { x: 1-p.x, y: p.y }; }
  function mirrorOp(op) {
    const m = Object.assign({}, op);
    if (op.points)               m.points = op.points.map(mirrorPt);
    else if (op.x != null)       { m.x = 1-op.x; }
    else if (op.x1 != null)      { m.x1 = 1-op.x1; m.x2 = 1-op.x2; }
    return m;
  }
  function commitOp(op) { recordOp(op); applyOp(op); sendOp(op); if (symmetry) { const m=mirrorOp(op); recordOp(m); applyOp(m); sendOp(m); } }

  /* ── Controls ────────────────────────────────────────────────────── */
  function setColor(hex) {
    brushColor = hex;
    document.querySelectorAll('.b-swatch').forEach(s => s.classList.toggle('active', s.dataset.c === hex));
    customColor.value = hex;
  }
  document.querySelectorAll('.b-swatch').forEach(sw => sw.addEventListener('click', () => setColor(sw.dataset.c)));
  customColor.addEventListener('input',  e => setColor(e.target.value));
  fontSelect.addEventListener('change',  e => activeFont = e.target.value);
  sizeSlider.addEventListener('input',   e => { brushSize = +e.target.value; sizeVal.textContent = brushSize; });
  opSlider.addEventListener('input',     e => { opacity = +e.target.value/100; opVal.textContent = e.target.value+'%'; });

  document.getElementById('b-undo').addEventListener('click', localUndo);
  document.getElementById('b-export').addEventListener('click', () => {
    const a = document.createElement('a'); a.download = 'malovani.png'; a.href = canvas.toDataURL(); a.click();
  });
  document.getElementById('b-clear').addEventListener('click', () => {
    if (!confirm('Smazat vše pro všechny?')) return;
    allOps.length = 0; myOpIndices.length = 0;
    ctx.clearRect(0,0,canvas.width,canvas.height);
    socket.emit('clear');
  });

  document.querySelectorAll('.b-tool').forEach(btn => {
    btn.addEventListener('click', () => {
      commitTextIfActive();
      activeTool = btn.dataset.tool;
      document.querySelectorAll('.b-tool').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      fontSelect.style.display = activeTool === 'text' ? 'inline-block' : 'none';
    });
  });

  document.addEventListener('keydown', e => {
    if (e.target === chatInput || e.target === textOverlay) return;
    if ((e.ctrlKey||e.metaKey) && e.key === 'z') { e.preventDefault(); localUndo(); return; }
    const map = { p:'pen',e:'eraser',l:'line',r:'rect',b:'fill',k:'picker',o:'ellipse',t:'text',a:'spray' };
    if (!e.ctrlKey && !e.metaKey && map[e.key]) document.querySelector('.b-tool[data-tool="'+map[e.key]+'"]').click();
  });

  /* ── Text ────────────────────────────────────────────────────────── */
  function commitTextIfActive() {
    if (textOverlay.style.display === 'none' || !textPos) return;
    const text = textOverlay.value; textOverlay.style.display = 'none'; textOverlay.value = '';
    if (!text.trim()) return;
    const sz = brushSize < 8 ? 20 : brushSize;
    commitOp({ type:'text', color:brushColor, size:sz, font:activeFont, text, x:textPos.x, y:textPos.y });
    textPos = null;
  }
  textOverlay.addEventListener('keydown', e => {
    if (e.key === 'Escape') { textOverlay.style.display='none'; textOverlay.value=''; textPos=null; }
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); commitTextIfActive(); }
    setTimeout(() => { textOverlay.style.height='auto'; textOverlay.style.height=textOverlay.scrollHeight+'px'; }, 0);
  });

  /* ── Spray ───────────────────────────────────────────────────────── */
  function sprayAt(pt) {
    const r = brushSize*1.5, count = Math.ceil(brushSize*0.8);
    ctx.save(); ctx.globalAlpha = opacity; ctx.fillStyle = brushColor;
    for (let i = 0; i < count; i++) {
      const angle = Math.random()*Math.PI*2, dist = Math.random()*r/canvas.width;
      const px = pt.x+Math.cos(angle)*dist, py = pt.y+Math.sin(angle)*dist;
      ctx.fillRect(px*canvas.width, py*canvas.height, 1.5, 1.5);
      sprayBuffer.push({ x:px, y:py });
      if (symmetry) ctx.fillRect((1-px)*canvas.width, py*canvas.height, 1.5, 1.5);
    }
    ctx.restore();
  }

  /* ── Pointer ─────────────────────────────────────────────────────── */
  function getPos(e) {
    const r = canvas.getBoundingClientRect(), src = e.touches ? e.touches[0] : e;
    return { x:(src.clientX-r.left)/canvas.width, y:(src.clientY-r.top)/canvas.height };
  }
  let lastCursorSend = 0;
  function sendCursor(pt) {
    const n = Date.now(); if (n-lastCursorSend < 40) return; lastCursorSend = n;
    socket.emit('cursor', { x:pt.x, y:pt.y });
  }

  /* ── Drawing events ──────────────────────────────────────────────── */
  canvas.addEventListener('mousedown', e => {
    if (e.button !== 0) return;
    const pt = getPos(e);
    if (activeTool === 'picker') { const d=ctx.getImageData(Math.round(pt.x*canvas.width),Math.round(pt.y*canvas.height),1,1).data; setColor('#'+[d[0],d[1],d[2]].map(v=>v.toString(16).padStart(2,'0')).join('')); return; }
    if (activeTool === 'text') {
      commitTextIfActive(); textPos = pt;
      const sz = brushSize < 8 ? 20 : brushSize;
      Object.assign(textOverlay.style, { display:'block', left:(pt.x*canvas.width)+'px', top:(pt.y*canvas.height)+'px', fontSize:sz+'px', color:brushColor, fontFamily:activeFont, height:'auto' });
      setTimeout(() => textOverlay.focus(), 0); return;
    }
    if (activeTool === 'fill') {
      commitOp({ type:'fill', color:brushColor, x:pt.x, y:pt.y });
      floodFill(ctx, Math.round(pt.x*canvas.width), Math.round(pt.y*canvas.height), brushColor);
      return;
    }
    drawing = true; shapeStart = pt; lastPt = pt; currentPoints = [pt];
    if (activeTool === 'spray') { sprayBuffer = []; sprayAt(pt); sprayInterval = setInterval(() => sprayAt(lastPt), 30); }
  });

  canvas.addEventListener('mousemove', e => {
    const pt = getPos(e); sendCursor(pt); if (!drawing) return; lastPt = pt;
    if (activeTool === 'pen' || activeTool === 'eraser') {
      const prev = currentPoints[currentPoints.length-1]; currentPoints.push(pt);
      const col = activeTool === 'eraser' ? '#ffffff' : brushColor;
      ctx.save(); ctx.globalAlpha=opacity; ctx.strokeStyle=col; ctx.lineWidth=brushSize; ctx.lineCap='round'; ctx.lineJoin='round';
      ctx.beginPath(); ctx.moveTo(prev.x*canvas.width,prev.y*canvas.height); ctx.lineTo(pt.x*canvas.width,pt.y*canvas.height); ctx.stroke();
      if (symmetry) { const mp=mirrorPt(prev),mt=mirrorPt(pt); ctx.beginPath(); ctx.moveTo(mp.x*canvas.width,mp.y*canvas.height); ctx.lineTo(mt.x*canvas.width,mt.y*canvas.height); ctx.stroke(); }
      ctx.restore();
    } else if (activeTool === 'spray') {
      sprayAt(pt);
    } else {
      pCtx.clearRect(0,0,previewCv.width,previewCv.height);
      const po = { type:'shape', kind:activeTool, color:brushColor, size:brushSize, alpha:opacity, x1:shapeStart.x, y1:shapeStart.y, x2:pt.x, y2:pt.y };
      applyOp(po, pCtx);
      if (symmetry) applyOp(Object.assign({},po,{x1:1-shapeStart.x,x2:1-pt.x}), pCtx);
    }
  });

  canvas.addEventListener('mouseup', e => {
    if (!drawing) return; drawing = false;
    pCtx.clearRect(0,0,previewCv.width,previewCv.height);
    clearInterval(sprayInterval); sprayInterval = null;
    const pt = getPos(e);
    if (activeTool === 'pen' || activeTool === 'eraser') {
      if (currentPoints.length >= 2) {
        const col = activeTool === 'eraser' ? '#ffffff' : brushColor;
        commitOp({ type:'stroke', color:col, size:brushSize, alpha:opacity, points:currentPoints });
      }
    } else if (activeTool === 'spray') {
      if (sprayBuffer.length) { commitOp({ type:'spray', color:brushColor, size:brushSize, alpha:opacity, points:sprayBuffer.slice() }); sprayBuffer = []; }
    } else if (['line','rect','rect-fill','ellipse','ellipse-fill'].includes(activeTool)) {
      commitOp({ type:'shape', kind:activeTool, color:brushColor, size:brushSize, alpha:opacity, x1:shapeStart.x, y1:shapeStart.y, x2:pt.x, y2:pt.y });
    }
    currentPoints = []; shapeStart = null;
  });

  canvas.addEventListener('mouseleave', () => { if (drawing) canvas.dispatchEvent(new MouseEvent('mouseup',{button:0})); });

  /* ── Receive remote ops ──────────────────────────────────────────── */
  socket.on('draw', data => {
    if (data.bOp)   { allOps.push(data.bOp); applyOp(data.bOp); }
    if (data.bChat) addChatMsg(data.bChat.username, '#aaa', data.bChat.text);
  });
  socket.on('clear', () => { allOps.length=0; myOpIndices.length=0; ctx.clearRect(0,0,canvas.width,canvas.height); });

  /* ── Users & cursors ─────────────────────────────────────────────── */
  function addUser(id, color, name) {
    if (remoteUsers.has(id)) return;
    const el = document.createElement('div'); el.className = 'b-cursor';
    el.innerHTML = `<div class="b-cursor-dot" style="background:${color}"></div><div class="b-cursor-label" style="border-left:3px solid ${color};padding-left:4px">${name}</div>`;
    canvasArea.appendChild(el);
    remoteUsers.set(id, { color, username:name, el }); rebuildList();
  }
  function removeUser(id) { const u=remoteUsers.get(id); if (u) { u.el.remove(); remoteUsers.delete(id); rebuildList(); } }
  function rebuildList() {
    usersList.innerHTML = '';
    remoteUsers.forEach(u => {
      const row = document.createElement('div'); row.className = 'b-user-row';
      row.innerHTML = `<div class="b-user-dot" style="background:${u.color}"></div><span>${u.username}</span>`;
      usersList.appendChild(row);
    });
  }
  socket.on('users',      list => list.forEach(u => addUser(u.id, u.color, u.username)));
  socket.on('user_join',  data => { addUser(data.id, data.color, data.username); addSysMsg(data.username+' se připojil/a'); });
  socket.on('user_leave', data => { const u=remoteUsers.get(data.id); if(u) addSysMsg(u.username+' se odpojil/a'); removeUser(data.id); });
  socket.on('cursor', data => {
    const u = remoteUsers.get(data.id); if (!u) return;
    u.el.style.left = (data.x*canvasArea.offsetWidth)+'px';
    u.el.style.top  = (data.y*canvasArea.offsetHeight)+'px';
  });

  /* ── Chat ────────────────────────────────────────────────────────── */
  function addChatMsg(name, color, text) {
    const div = document.createElement('div'); div.className = 'b-chat-msg';
    div.innerHTML = `<span class="b-chat-name" style="color:${color}">${name}: </span>${text.replace(/</g,'&lt;')}`;
    chatMsgs.appendChild(div); chatMsgs.scrollTop = chatMsgs.scrollHeight;
  }
  function addSysMsg(text) {
    const div = document.createElement('div'); div.className = 'b-chat-sys'; div.textContent = text;
    chatMsgs.appendChild(div); chatMsgs.scrollTop = chatMsgs.scrollHeight;
  }
  document.getElementById('b-chat-form').addEventListener('submit', e => {
    e.preventDefault();
    const text = chatInput.value.trim(); if (!text) return;
    chatInput.value = ''; addChatMsg(username, '#3a8ef6', text);
    socket.emit('draw', { bChat: { username, text } });
  });
}
