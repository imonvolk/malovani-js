function initA() {
  const style = document.createElement('style');
  style.textContent = `
    #appWindow {
      font-family: 'MS Sans Serif', Tahoma, sans-serif;
      background-color: #c0c0c0;
      border: 2px outset #c0c0c0;
    }
    .a-title-bar {
      background: linear-gradient(to right, #000080, #1084d0);
      color: white; padding: 2px 4px; font-size: 12px;
      display: flex; justify-content: space-between; align-items: center;
    }
    .a-title-bar .title { font-weight: bold; }
    .a-title-bar .controls { display: flex; gap: 2px; }
    .a-control-btn {
      width: 16px; height: 14px; background: #c0c0c0;
      border: 1px outset #c0c0c0; cursor: pointer; font-size: 8px;
      display: flex; align-items: center; justify-content: center;
    }
    .a-menu-bar {
      background-color: #c0c0c0; border-bottom: 1px solid #808080; padding: 2px;
    }
    .a-menu-item {
      display: inline-block; padding: 2px 8px; background-color: #c0c0c0;
      border: 1px solid transparent; cursor: pointer; font-size: 12px; margin-right: 4px;
    }
    .a-menu-item:hover { background-color: #d0d0d0; border: 1px inset #c0c0c0; }
    .a-toolbar {
      position: absolute; left: 4px; top: 60px; width: 56px;
      background-color: #c0c0c0; border: 2px outset #c0c0c0; padding: 4px;
    }
    .a-tool-btn {
      width: 40px; height: 36px; background-color: #c0c0c0;
      border: 1px outset #c0c0c0; cursor: pointer; margin-bottom: 2px;
      display: flex; flex-direction: column; align-items: center;
      justify-content: center; font-size: 10px;
    }
    .a-tool-btn:hover { background-color: #d0d0d0; }
    .a-tool-btn.active { background-color: #a0a0a0; border: 1px inset #c0c0c0; }
    .a-tool-btn i { font-size: 16px; margin-bottom: 2px; }
    .a-canvas-container {
      position: absolute; left: 72px; top: 60px; right: 4px; bottom: 80px;
      background-color: #c0c0c0; border: 2px inset #c0c0c0; padding: 4px; overflow: auto;
    }
    #a-canvas {
      display: block; background-color: white; border: 1px solid #000;
      cursor: crosshair; max-width: 100%; max-height: 100%;
    }
    .a-color-palette {
      position: absolute; left: 72px; bottom: 4px; height: 64px; right: 4px;
      background-color: #c0c0c0; border: 2px outset #c0c0c0; padding: 4px;
      display: flex; align-items: center; gap: 4px;
    }
    #a-colorPresets { display: flex; flex-wrap: wrap; gap: 2px; max-width: 200px; }
    .a-color-preset {
      width: 24px; height: 24px; border: 1px solid #000; cursor: pointer; flex-shrink: 0;
    }
    .a-color-preset.selected { border: 2px solid #fff; box-shadow: 0 0 0 1px #000; }
    .a-color-picker-container {
      display: flex; flex-direction: column; align-items: center; margin-left: 8px;
    }
    #a-colorPicker { width: 40px; height: 24px; border: 1px solid #000; cursor: pointer; }
    .a-brush-size-container {
      margin-left: 8px; display: flex; flex-direction: column; align-items: center;
    }
    #a-brushSize { width: 120px; height: 20px; }
    #a-brushSizeValue { font-size: 10px; margin-top: 2px; }
    .a-shape-selector { margin-left: 8px; display: flex; gap: 4px; }
    .a-brush-shape {
      width: 24px; height: 24px; border: 1px solid #808080; cursor: pointer;
      background-color: white; display: flex; align-items: center; justify-content: center;
    }
    .a-brush-shape.selected { border: 2px solid #000; }
    .a-brush-shape.circle::before {
      content: ''; width: 12px; height: 12px; background-color: #000; border-radius: 50%;
    }
    .a-brush-shape.square::before {
      content: ''; width: 12px; height: 12px; background-color: #000;
    }
    .a-zoom-controls { margin-left: 8px; display: flex; gap: 2px; }
    .a-zoom-controls button {
      padding: 2px 8px; font-size: 10px; background-color: #c0c0c0;
      border: 1px outset #c0c0c0; cursor: pointer;
    }
    .a-zoom-controls button:hover { background-color: #d0d0d0; }
    #a-zoomLevel { font-size: 10px; align-self: center; margin-left: 4px; }
    .a-status-bar {
      position: absolute; bottom: 72px; left: 72px; right: 4px; height: 20px;
      background-color: #c0c0c0; border: 1px inset #c0c0c0; padding: 2px 4px;
      font-size: 11px; display: flex; align-items: center;
    }
    .a-clear-btn {
      position: absolute; right: 8px; top: 4px; padding: 2px 8px; font-size: 10px;
      background-color: #c0c0c0; border: 1px outset #c0c0c0; cursor: pointer;
    }
    .a-clear-btn:hover { background-color: #d0d0d0; }
  `;
  document.head.appendChild(style);

  appWindow.innerHTML = `
    <div class="a-title-bar">
      <div class="title">Sdílené Malování — ${username}</div>
      <div class="controls">
        <button class="a-control-btn">_</button>
        <button class="a-control-btn">□</button>
        <button class="a-control-btn">×</button>
      </div>
    </div>
    <div class="a-menu-bar">
      <div class="a-menu-item">Soubor</div>
      <div class="a-menu-item">Úpravy</div>
      <div class="a-menu-item">Zobrazení</div>
      <div class="a-menu-item">Obrázek</div>
      <div class="a-menu-item">Možnosti</div>
      <div class="a-menu-item">Nápověda</div>
    </div>
    <div class="a-toolbar">
      <button id="a-brushBtn" class="a-tool-btn active" title="Štětec">
        <i class="fas fa-paint-brush"></i><span>Brush</span>
      </button>
      <button id="a-eraserBtn" class="a-tool-btn" title="Guma">
        <i class="fas fa-eraser"></i><span>Eraser</span>
      </button>
    </div>
    <div class="a-canvas-container">
      <canvas id="a-canvas" width="800" height="600"></canvas>
    </div>
    <div class="a-color-palette">
      <div id="a-colorPresets">
        ${['#000000','#808080','#800000','#808000','#008000','#008080',
           '#000080','#800080','#c0c0c0','#ffffff','#ff0000','#ffff00',
           '#00ff00','#00ffff','#0000ff','#ff00ff','#ff8040','#804000']
          .map(c => `<div class="a-color-preset" style="background:${c}" data-color="${c}"></div>`).join('')}
      </div>
      <div class="a-color-picker-container">
        <label for="a-colorPicker" style="font-size:10px">Barvy</label>
        <input type="color" id="a-colorPicker" value="#000000">
      </div>
      <div class="a-brush-size-container">
        <label for="a-brushSize" style="font-size:10px">Velikost</label>
        <input type="range" id="a-brushSize" min="1" max="50" value="5">
        <span id="a-brushSizeValue">5</span>
      </div>
      <div class="a-shape-selector">
        <div class="a-brush-shape circle selected" data-shape="circle" title="Kruh"></div>
        <div class="a-brush-shape square" data-shape="square" title="Čtverec"></div>
      </div>
      <div class="a-zoom-controls">
        <button id="a-zoomInBtn">+</button>
        <button id="a-zoomOutBtn">-</button>
        <button id="a-resetZoomBtn">1:1</button>
        <span id="a-zoomLevel">100%</span>
      </div>
      <button id="a-clearBtn" class="a-clear-btn">Vymazat</button>
    </div>
    <div class="a-status-bar">
      Připojeno: <span id="a-userCount">1</span> | Přihlášen: ${username}
    </div>
  `;

  const canvas         = document.getElementById('a-canvas');
  const ctx            = canvas.getContext('2d');
  const colorPicker    = document.getElementById('a-colorPicker');
  const brushSize      = document.getElementById('a-brushSize');
  const brushSizeValue = document.getElementById('a-brushSizeValue');
  const clearBtn       = document.getElementById('a-clearBtn');
  const brushBtn       = document.getElementById('a-brushBtn');
  const eraserBtn      = document.getElementById('a-eraserBtn');
  const zoomInBtn      = document.getElementById('a-zoomInBtn');
  const zoomOutBtn     = document.getElementById('a-zoomOutBtn');
  const resetZoomBtn   = document.getElementById('a-resetZoomBtn');
  const zoomLevel      = document.getElementById('a-zoomLevel');
  const colorPresets   = document.querySelectorAll('.a-color-preset');
  const brushShapes    = document.querySelectorAll('.a-brush-shape');
  const userCount      = document.getElementById('a-userCount');

  const socket = io();

  socket.on('userCount', (count) => { userCount.textContent = count; });

  let isDrawing = false;
  let lastX = 0;
  let lastY = 0;
  let currentTool = 'brush';
  let currentShape = 'circle';
  let zoom = 1;
  let panX = 0;
  let panY = 0;

  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.lineWidth = brushSize.value;
  ctx.strokeStyle = colorPicker.value;
  ctx.fillStyle = colorPicker.value;

  colorPicker.addEventListener('change', () => {
    ctx.strokeStyle = colorPicker.value;
    ctx.fillStyle = colorPicker.value;
  });

  brushSize.addEventListener('input', () => {
    ctx.lineWidth = brushSize.value;
    brushSizeValue.textContent = brushSize.value;
  });

  colorPresets.forEach(preset => {
    preset.addEventListener('click', () => {
      const color = preset.dataset.color;
      colorPicker.value = color;
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      colorPresets.forEach(p => p.classList.remove('selected'));
      preset.classList.add('selected');
    });
  });

  brushBtn.addEventListener('click', () => {
    currentTool = 'brush';
    brushBtn.classList.add('active');
    eraserBtn.classList.remove('active');
    ctx.strokeStyle = colorPicker.value;
    ctx.fillStyle = colorPicker.value;
  });

  eraserBtn.addEventListener('click', () => {
    currentTool = 'eraser';
    eraserBtn.classList.add('active');
    brushBtn.classList.remove('active');
    ctx.strokeStyle = 'white';
    ctx.fillStyle = 'white';
  });

  brushShapes.forEach(shape => {
    shape.addEventListener('click', () => {
      currentShape = shape.dataset.shape;
      brushShapes.forEach(s => s.classList.remove('selected'));
      shape.classList.add('selected');
    });
  });

  zoomInBtn.addEventListener('click', () => { zoom *= 1.2; updateZoom(); });
  zoomOutBtn.addEventListener('click', () => { zoom /= 1.2; updateZoom(); });
  resetZoomBtn.addEventListener('click', () => { zoom = 1; panX = 0; panY = 0; updateZoom(); });

  function updateZoom() {
    ctx.setTransform(zoom, 0, 0, zoom, panX, panY);
    zoomLevel.textContent = Math.round(zoom * 100) + '%';
  }

  canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    zoom *= e.deltaY < 0 ? 1.1 : 1 / 1.1;
    updateZoom();
  });

  function drawShape(x, y) {
    const size = parseInt(brushSize.value);
    ctx.save();
    ctx.translate(x, y);
    if (currentShape === 'circle') {
      ctx.beginPath();
      ctx.arc(0, 0, size / 2, 0, 2 * Math.PI);
      ctx.fill();
    } else {
      ctx.fillRect(-size / 2, -size / 2, size, size);
    }
    ctx.restore();
  }

  function draw(e) {
    if (!isDrawing) return;
    const x = e.offsetX;
    const y = e.offsetY;
    drawShape(x, y);
    socket.emit('draw', {
      x, y,
      color: ctx.strokeStyle,
      size: ctx.lineWidth,
      shape: currentShape,
      tool: currentTool,
      username,
      member: selectedMember,
    });
    lastX = x;
    lastY = y;
  }

  canvas.addEventListener('mousedown', (e) => { isDrawing = true; lastX = e.offsetX; lastY = e.offsetY; });
  canvas.addEventListener('mousemove', draw);
  canvas.addEventListener('mouseup', () => isDrawing = false);
  canvas.addEventListener('mouseout', () => isDrawing = false);

  canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    lastX = touch.clientX - rect.left;
    lastY = touch.clientY - rect.top;
    isDrawing = true;
  });
  canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    if (!isDrawing) return;
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    draw({ offsetX: touch.clientX - rect.left, offsetY: touch.clientY - rect.top });
  });
  canvas.addEventListener('touchend', () => { isDrawing = false; });

  clearBtn.addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    socket.emit('clear');
  });

  socket.on('draw', (data) => {
    const savedStroke = ctx.strokeStyle;
    const savedFill   = ctx.fillStyle;
    const savedWidth  = ctx.lineWidth;
    ctx.strokeStyle = data.color;
    ctx.fillStyle   = data.color;
    ctx.lineWidth   = data.size;
    if (data.shape) {
      drawShape(data.x, data.y);
    } else {
      ctx.beginPath();
      ctx.moveTo(data.x0, data.y0);
      ctx.lineTo(data.x1, data.y1);
      ctx.stroke();
    }
    ctx.strokeStyle = savedStroke;
    ctx.fillStyle   = savedFill;
    ctx.lineWidth   = savedWidth;
  });

  socket.on('clear', () => { ctx.clearRect(0, 0, canvas.width, canvas.height); });
}
