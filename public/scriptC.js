function initC() {
  const style = document.createElement('style');
  style.textContent = `
    #appWindow {
      display: flex; flex-direction: column; height: 100vh;
      background: #f0f0f0; font-family: Arial, sans-serif;
    }
    #c-toolbar {
      background: #333; padding: 8px 14px;
      display: flex; align-items: center; gap: 12px;
      flex-wrap: wrap; flex-shrink: 0;
    }
    #c-toolbar label { color: white; font-size: 13px; display: flex; align-items: center; gap: 6px; }
    #c-colorPicker { width: 40px; height: 32px; border: none; cursor: pointer; border-radius: 4px; }
    #c-brushSize { width: 80px; }
    #c-brushSizeValue { color: white; font-size: 13px; min-width: 24px; }
    #c-toolSelect { padding: 4px 8px; border-radius: 4px; border: none; font-size: 13px; cursor: pointer; }
    .c-zoom-controls { display: flex; gap: 6px; align-items: center; }
    #c-zoomLevel { color: white; font-size: 13px; min-width: 48px; text-align: center; }
    .c-zoom-controls button { padding: 6px 12px; font-size: 13px; cursor: pointer; background: #4CAF50; color: white; border: none; border-radius: 4px; }
    .c-zoom-controls button:hover { background: #45a049; }
    #c-clearBtn { padding: 6px 12px; font-size: 13px; cursor: pointer; background: #e74c3c; color: white; border: none; border-radius: 4px; }
    #c-clearBtn:hover { background: #c0392b; }
    #c-canvas-area { flex: 1; position: relative; overflow: hidden; background: white; }
    #c-canvas { position: absolute; top: 0; left: 0; cursor: crosshair; }
  `;
  document.head.appendChild(style);

  appWindow.innerHTML = `
    <div id="c-toolbar">
      <label>Barva: <input type="color" id="c-colorPicker" value="#000000"></label>
      <label>Štětec: <input type="range" id="c-brushSize" min="1" max="50" value="5"><span id="c-brushSizeValue">5</span></label>
      <label>Nástroj:
        <select id="c-toolSelect">
          <option value="brush">Štětec</option>
          <option value="line">Čára</option>
          <option value="square">Obdélník</option>
        </select>
      </label>
      <div class="c-zoom-controls">
        <button id="c-zoomOut">−</button>
        <span id="c-zoomLevel">100%</span>
        <button id="c-zoomIn">+</button>
      </div>
      <button id="c-clearBtn">Vymazat</button>
    </div>
    <div id="c-canvas-area">
      <canvas id="c-canvas"></canvas>
    </div>
  `;

  const canvasArea     = document.getElementById('c-canvas-area');
  const canvas         = document.getElementById('c-canvas');
  const ctx            = canvas.getContext('2d');
  const colorPicker    = document.getElementById('c-colorPicker');
  const brushSize      = document.getElementById('c-brushSize');
  const brushSizeValue = document.getElementById('c-brushSizeValue');
  const toolSelect     = document.getElementById('c-toolSelect');
  const clearBtn       = document.getElementById('c-clearBtn');
  const zoomInBtn      = document.getElementById('c-zoomIn');
  const zoomOutBtn     = document.getElementById('c-zoomOut');
  const zoomLevelDisplay = document.getElementById('c-zoomLevel');

  const socket = io();

  let currentTool = 'brush';
  let currentShape = null;
  let drawingHistory = [];
  let zoomLevel = 1;
  const minZoom = 0.5;
  const maxZoom = 3;
  const zoomStep = 0.2;
  let panX = 0;
  let panY = 0;
  let isDrawing = false;
  let lastX = 0;
  let lastY = 0;

  function resizeCanvas() {
    const w = canvasArea.offsetWidth;
    const h = canvasArea.offsetHeight;
    if (!w || !h) return;
    const tmp = document.createElement('canvas');
    tmp.width = canvas.width; tmp.height = canvas.height;
    tmp.getContext('2d').drawImage(canvas, 0, 0);
    canvas.width = w; canvas.height = h;
    redrawCanvas();
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  function redrawCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(panX, panY);
    ctx.scale(zoomLevel, zoomLevel);
    for (const stroke of drawingHistory) drawStroke(stroke);
    if (currentShape) drawStroke(currentShape);
    ctx.restore();
  }

  function drawStroke(stroke) {
    if (stroke.type === 'brush') {
      ctx.fillStyle = stroke.color;
      ctx.beginPath();
      ctx.arc(stroke.x, stroke.y, stroke.size / 2, 0, Math.PI * 2);
      ctx.fill();
    } else if (stroke.type === 'line') {
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.size;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(stroke.x0, stroke.y0);
      ctx.lineTo(stroke.x1, stroke.y1);
      ctx.stroke();
    } else if (stroke.type === 'square') {
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.size;
      ctx.strokeRect(
        Math.min(stroke.x0, stroke.x1), Math.min(stroke.y0, stroke.y1),
        Math.abs(stroke.x1 - stroke.x0), Math.abs(stroke.y1 - stroke.y0)
      );
    }
  }

  brushSize.addEventListener('input', () => { brushSizeValue.textContent = brushSize.value; });
  toolSelect.addEventListener('change', () => { currentTool = toolSelect.value; });

  function setZoom(newZoom) {
    zoomLevel = Math.max(minZoom, Math.min(maxZoom, newZoom));
    zoomLevelDisplay.textContent = Math.round(zoomLevel * 100) + '%';
    redrawCanvas();
  }
  zoomInBtn.addEventListener('click', () => setZoom(zoomLevel + zoomStep));
  zoomOutBtn.addEventListener('click', () => setZoom(zoomLevel - zoomStep));

  function draw(e) {
    if (!isDrawing) return;
    const x = (e.offsetX - panX) / zoomLevel;
    const y = (e.offsetY - panY) / zoomLevel;

    if (currentTool === 'brush') {
      const dx = x - lastX;
      const dy = y - lastY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const steps = Math.ceil(distance) + 1;
      for (let i = 0; i <= steps; i++) {
        const t = steps > 0 ? i / steps : 0;
        drawingHistory.push({
          type: 'brush',
          x: lastX + dx * t, y: lastY + dy * t,
          color: colorPicker.value, size: +brushSize.value
        });
      }
      redrawCanvas();
      socket.emit('draw', {
        type: 'brush', x0: lastX, y0: lastY, x1: x, y1: y,
        color: colorPicker.value, size: +brushSize.value,
        username, member: selectedMember,
      });
      lastX = x; lastY = y;
    } else {
      currentShape = {
        type: currentTool, x0: lastX, y0: lastY, x1: x, y1: y,
        color: colorPicker.value, size: +brushSize.value
      };
      redrawCanvas();
    }
  }

  canvas.addEventListener('mousedown', (e) => {
    isDrawing = true;
    lastX = (e.offsetX - panX) / zoomLevel;
    lastY = (e.offsetY - panY) / zoomLevel;
    currentShape = null;
  });
  canvas.addEventListener('mousemove', draw);
  canvas.addEventListener('mouseup', () => {
    if (isDrawing && currentShape && currentTool !== 'brush') {
      drawingHistory.push(currentShape);
      socket.emit('draw', { ...currentShape, username, member: selectedMember });
      currentShape = null;
      redrawCanvas();
    }
    isDrawing = false;
  });
  canvas.addEventListener('mouseout', () => { currentShape = null; isDrawing = false; });

  canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    lastX = (touch.clientX - rect.left - panX) / zoomLevel;
    lastY = (touch.clientY - rect.top - panY) / zoomLevel;
    isDrawing = true;
  }, { passive: false });
  canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    if (!isDrawing) return;
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    draw({ offsetX: touch.clientX - rect.left, offsetY: touch.clientY - rect.top });
  }, { passive: false });
  canvas.addEventListener('touchend', () => { isDrawing = false; });

  clearBtn.addEventListener('click', () => {
    drawingHistory = [];
    redrawCanvas();
    socket.emit('clear');
  });

  socket.on('draw', (data) => {
    if (data.type === 'brush') {
      const dx = data.x1 - data.x0;
      const dy = data.y1 - data.y0;
      const steps = Math.ceil(Math.sqrt(dx * dx + dy * dy)) + 1;
      for (let i = 0; i <= steps; i++) {
        const t = steps > 0 ? i / steps : 0;
        drawingHistory.push({ type: 'brush', x: data.x0 + dx * t, y: data.y0 + dy * t, color: data.color, size: data.size });
      }
    } else {
      drawingHistory.push(data);
    }
    redrawCanvas();
  });

  socket.on('clear', () => { drawingHistory = []; redrawCanvas(); });
}
