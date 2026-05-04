function initB() {
  const style = document.createElement('style');
  style.textContent = `
    #appWindow {
      background: #0f0f0f; color: #e0e0e0;
      font-family: system-ui, sans-serif;
      display: flex; flex-direction: column;
    }
    #b-toolbar {
      background: #1a1a1a; border-bottom: 1px solid #2a2a2a;
      padding: 8px 14px; display: flex; align-items: center; gap: 10px;
      flex-wrap: wrap; flex-shrink: 0;
    }
    .b-label { font-size: .75rem; color: #666; }
    #b-palette { display: flex; gap: 5px; }
    .b-swatch {
      width: 24px; height: 24px; border-radius: 50%;
      border: 2px solid transparent; cursor: pointer;
      transition: transform .1s, border-color .1s;
    }
    .b-swatch:hover { transform: scale(1.15); }
    .b-swatch.active { border-color: #fff; transform: scale(1.2); }
    #b-custom-color {
      width: 24px; height: 24px; border-radius: 50%;
      border: 2px solid #2a2a2a; cursor: pointer; padding: 0; background: none;
    }
    .b-sep { width: 1px; height: 24px; background: #2a2a2a; margin: 0 4px; }
    #b-size-slider { accent-color: #e0e0e0; width: 90px; }
    #b-eraser-btn, #b-clear-btn {
      background: #0f0f0f; color: #e0e0e0; border: 1px solid #2a2a2a;
      border-radius: 6px; padding: 4px 10px; font-size: .8rem; cursor: pointer;
    }
    #b-eraser-btn:hover, #b-clear-btn:hover { background: #2a2a2a; }
    #b-eraser-btn.active { border-color: #888; background: #2a2a2a; }
    #b-clear-btn { color: #e74c3c; border-color: #e74c3c44; }
    #b-chip {
      margin-left: auto; display: flex; align-items: center; gap: 6px;
      font-size: .8rem; color: #666;
    }
    #b-canvas-area {
      flex: 1; position: relative; overflow: hidden;
      background: #fff; cursor: crosshair;
    }
    #b-canvas { position: absolute; top: 0; left: 0; }
    .b-remote-cursor {
      position: absolute; pointer-events: none;
      display: flex; flex-direction: column; align-items: flex-start; gap: 3px;
    }
    .b-cursor-dot {
      width: 10px; height: 10px; border-radius: 50%;
      border: 2px solid rgba(255,255,255,.6);
    }
    .b-cursor-label {
      background: rgba(0,0,0,.65); color: #fff; font-size: .7rem;
      padding: 2px 6px; border-radius: 4px; white-space: nowrap;
    }
    #b-users-panel {
      position: absolute; bottom: 12px; right: 12px;
      background: rgba(15,15,15,.85); border: 1px solid #2a2a2a;
      border-radius: 10px; padding: 10px 14px; font-size: .75rem;
      backdrop-filter: blur(6px); min-width: 120px;
    }
    #b-users-panel h3 {
      font-size: .7rem; color: #666; margin-bottom: 6px;
      text-transform: uppercase; letter-spacing: .05em;
    }
    .b-user-row { display: flex; align-items: center; gap: 6px; padding: 2px 0; }
    .b-user-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
  `;
  document.head.appendChild(style);

  const PALETTE = ['#1a1a1a','#ffffff','#e74c3c','#e67e22','#f1c40f','#2ecc71','#3498db','#9b59b6'];

  appWindow.innerHTML = `
    <div id="b-toolbar">
      <span class="b-label">Barva</span>
      <div id="b-palette">
        ${PALETTE.map(c => `<div class="b-swatch${c === '#e74c3c' ? ' active' : ''}" style="background:${c}" data-c="${c}"></div>`).join('')}
      </div>
      <input type="color" id="b-custom-color" title="Vlastní barva" />
      <div class="b-sep"></div>
      <span class="b-label">Velikost</span>
      <input type="range" id="b-size-slider" min="1" max="40" value="5" />
      <div class="b-sep"></div>
      <button id="b-eraser-btn">Guma</button>
      <button id="b-clear-btn">Smazat vše</button>
      <div id="b-chip"><span>${username}</span></div>
    </div>
    <div id="b-canvas-area">
      <canvas id="b-canvas"></canvas>
      <div id="b-users-panel">
        <h3>Online</h3>
        <div id="b-users-list"></div>
      </div>
    </div>
  `;

  const canvasArea  = document.getElementById('b-canvas-area');
  const canvas      = document.getElementById('b-canvas');
  const ctx         = canvas.getContext('2d');
  const sizeSlider  = document.getElementById('b-size-slider');
  const eraserBtn   = document.getElementById('b-eraser-btn');
  const clearBtn    = document.getElementById('b-clear-btn');
  const customColor = document.getElementById('b-custom-color');
  const usersList   = document.getElementById('b-users-list');
  const swatches    = document.querySelectorAll('.b-swatch');

  function resizeCanvas() {
    const w = canvasArea.offsetWidth;
    const h = canvasArea.offsetHeight;
    if (!w || !h) return;
    const tmp = document.createElement('canvas');
    tmp.width = canvas.width; tmp.height = canvas.height;
    tmp.getContext('2d').drawImage(canvas, 0, 0);
    canvas.width = w; canvas.height = h;
    ctx.drawImage(tmp, 0, 0);
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  const socket = io();
  const remoteUsers = new Map();

  let brushColor = '#e74c3c';
  let brushSize = 5;
  let erasing = false;
  let isDrawing = false;
  let lastX = 0;
  let lastY = 0;

  function setColor(hex) {
    brushColor = hex;
    erasing = false;
    eraserBtn.classList.remove('active');
    swatches.forEach(s => s.classList.toggle('active', s.dataset.c === hex));
  }

  swatches.forEach(sw => sw.addEventListener('click', () => setColor(sw.dataset.c)));
  customColor.addEventListener('input', e => setColor(e.target.value));
  sizeSlider.addEventListener('input', e => brushSize = +e.target.value);

  eraserBtn.addEventListener('click', () => {
    erasing = !erasing;
    eraserBtn.classList.toggle('active', erasing);
  });

  clearBtn.addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    socket.emit('clear');
  });

  function getPos(e) {
    const r = canvas.getBoundingClientRect();
    const src = e.touches ? e.touches[0] : e;
    return { x: src.clientX - r.left, y: src.clientY - r.top };
  }

  function drawDot(x, y, color, size) {
    ctx.beginPath();
    ctx.arc(x, y, size / 2, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.fill();
  }

  canvas.addEventListener('mousedown', (e) => {
    isDrawing = true;
    const p = getPos(e); lastX = p.x; lastY = p.y;
  });
  canvas.addEventListener('mousemove', (e) => {
    const p = getPos(e);
    socket.emit('cursor', { x: p.x / canvas.width, y: p.y / canvas.height });
    if (!isDrawing) return;
    const color = erasing ? '#ffffff' : brushColor;
    drawDot(p.x, p.y, color, brushSize);
    socket.emit('draw', { x: p.x, y: p.y, color, size: brushSize, shape: 'circle', tool: erasing ? 'eraser' : 'brush', username, member: selectedMember });
    lastX = p.x; lastY = p.y;
  });
  canvas.addEventListener('mouseup', () => isDrawing = false);
  canvas.addEventListener('mouseleave', () => isDrawing = false);

  canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    isDrawing = true;
    const p = getPos(e); lastX = p.x; lastY = p.y;
  }, { passive: false });
  canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    if (!isDrawing) return;
    const p = getPos(e);
    const color = erasing ? '#ffffff' : brushColor;
    drawDot(p.x, p.y, color, brushSize);
    socket.emit('draw', { x: p.x, y: p.y, color, size: brushSize, shape: 'circle', tool: erasing ? 'eraser' : 'brush', username, member: selectedMember });
  }, { passive: false });
  canvas.addEventListener('touchend', () => isDrawing = false);

  socket.on('draw', (data) => {
    drawDot(data.x, data.y, data.color, data.size);
  });

  socket.on('clear', () => { ctx.clearRect(0, 0, canvas.width, canvas.height); });

  // Cursor tracking & user list
  socket.emit('join', { username, member: selectedMember });

  function addUser(id, color, name) {
    if (remoteUsers.has(id)) return;
    const cursorEl = document.createElement('div');
    cursorEl.className = 'b-remote-cursor';
    cursorEl.innerHTML =
      `<div class="b-cursor-dot" style="background:${color}"></div>` +
      `<div class="b-cursor-label">${name}</div>`;
    canvasArea.appendChild(cursorEl);
    remoteUsers.set(id, { color, username: name, el: cursorEl });
    rebuildList();
  }

  function removeUser(id) {
    const u = remoteUsers.get(id);
    if (u) { u.el.remove(); remoteUsers.delete(id); rebuildList(); }
  }

  function rebuildList() {
    usersList.innerHTML = '';
    remoteUsers.forEach(u => {
      const row = document.createElement('div');
      row.className = 'b-user-row';
      row.innerHTML = `<div class="b-user-dot" style="background:${u.color}"></div><span>${u.username}</span>`;
      usersList.appendChild(row);
    });
  }

  socket.on('users', (list) => list.forEach(u => addUser(u.id, u.color, u.username)));
  socket.on('user_join', (data) => addUser(data.id, data.color, data.username));
  socket.on('user_leave', (data) => removeUser(data.id));
  socket.on('cursor', (data) => {
    const u = remoteUsers.get(data.id);
    if (!u) return;
    u.el.style.left = (data.x * canvasArea.offsetWidth) + 'px';
    u.el.style.top  = (data.y * canvasArea.offsetHeight) + 'px';
  });
}
