const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const colorPicker = document.getElementById('colorPicker');
const brushSize = document.getElementById('brushSize');
const brushSizeValue = document.getElementById('brushSizeValue');
const toolSelect = document.getElementById('toolSelect');
const clearBtn = document.getElementById('clearBtn');
const zoomInBtn = document.getElementById('zoomIn');
const zoomOutBtn = document.getElementById('zoomOut');
const zoomLevelDisplay = document.getElementById('zoomLevel');

const socket = io();

let currentTool = 'brush';
let currentShape = null;

// Canvas state
let drawingHistory = [];
let zoomLevel = 1;
const minZoom = 0.5;
const maxZoom = 3;
const zoomStep = 0.2;
let panX = 0;
let panY = 0;

// Initialize canvas size
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight - 60; // Account for control bar
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Drawing state
let isDrawing = false;
let lastX = 0;
let lastY = 0;

// Redraw canvas based on zoom and pan
function redrawCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.translate(panX, panY);
  ctx.scale(zoomLevel, zoomLevel);
  
  for (const stroke of drawingHistory) {
    drawStroke(stroke);
  }

  if (currentShape) {
    drawStroke(currentShape);
  }
  
  ctx.restore();
}

// Draw a single stroke (circle)
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
      Math.min(stroke.x0, stroke.x1),
      Math.min(stroke.y0, stroke.y1),
      Math.abs(stroke.x1 - stroke.x0),
      Math.abs(stroke.y1 - stroke.y0)
    );
  }
}

// Update brush size display
brushSize.addEventListener('input', () => {
  brushSizeValue.textContent = brushSize.value;
});

// Tool selection
toolSelect.addEventListener('change', () => {
  currentTool = toolSelect.value;
});

// Update brush properties when changed
colorPicker.addEventListener('change', () => {
  // No special action needed
});

// Zoom functions
function setZoom(newZoom) {
  zoomLevel = Math.max(minZoom, Math.min(maxZoom, newZoom));
  zoomLevelDisplay.textContent = Math.round(zoomLevel * 100) + '%';
  redrawCanvas();
}

zoomInBtn.addEventListener('click', () => {
  setZoom(zoomLevel + zoomStep);
});

zoomOutBtn.addEventListener('click', () => {
  setZoom(zoomLevel - zoomStep);
});

// Drawing functions
function draw(e) {
  if (!isDrawing) return;

  // Convert screen coordinates to canvas coordinates accounting for zoom and pan
  const x = (e.offsetX - panX) / zoomLevel;
  const y = (e.offsetY - panY) / zoomLevel;

  if (currentTool === 'brush') {
    const dx = x - lastX;
    const dy = y - lastY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const steps = Math.ceil(distance) + 1;

    for (let i = 0; i <= steps; i++) {
      const t = steps > 0 ? i / steps : 0;
      const interpX = lastX + dx * t;
      const interpY = lastY + dy * t;

      const stroke = {
        type: 'brush',
        x: interpX,
        y: interpY,
        color: colorPicker.value,
        size: brushSize.value
      };
      drawingHistory.push(stroke);
    }

    redrawCanvas();

    socket.emit('draw', {
      type: 'brush',
      x0: lastX,
      y0: lastY,
      x1: x,
      y1: y,
      color: colorPicker.value,
      size: brushSize.value
    });

    lastX = x;
    lastY = y;
  } else {
    currentShape = {
      type: currentTool,
      x0: lastX,
      y0: lastY,
      x1: x,
      y1: y,
      color: colorPicker.value,
      size: brushSize.value
    };
    redrawCanvas();
  }
}

// Event listeners for mouse
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
    socket.emit('draw', currentShape);
    currentShape = null;
    redrawCanvas();
  }
  isDrawing = false;
});
canvas.addEventListener('mouseout', () => {
  currentShape = null;
  isDrawing = false;
});

// Touch events for mobile
canvas.addEventListener('touchstart', (e) => {
  e.preventDefault();
  const touch = e.touches[0];
  const rect = canvas.getBoundingClientRect();
  lastX = (touch.clientX - rect.left - panX) / zoomLevel;
  lastY = (touch.clientY - rect.top - panY) / zoomLevel;
  isDrawing = true;
});

canvas.addEventListener('touchmove', (e) => {
  e.preventDefault();
  if (!isDrawing) return;
  const touch = e.touches[0];
  const rect = canvas.getBoundingClientRect();
  const offsetX = touch.clientX - rect.left;
  const offsetY = touch.clientY - rect.top;

  draw({ offsetX, offsetY });
});

canvas.addEventListener('touchend', () => {
  isDrawing = false;
});

// Clear canvas
clearBtn.addEventListener('click', () => {
  drawingHistory = [];
  redrawCanvas();
  socket.emit('clear');
});

// Listen for drawing events from other users
socket.on('draw', (data) => {
  if (data.type === 'brush') {
    const dx = data.x1 - data.x0;
    const dy = data.y1 - data.y0;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const steps = Math.ceil(distance) + 1;

    for (let i = 0; i <= steps; i++) {
      const t = steps > 0 ? i / steps : 0;
      const interpX = data.x0 + dx * t;
      const interpY = data.y0 + dy * t;

      const stroke = {
        type: 'brush',
        x: interpX,
        y: interpY,
        color: data.color,
        size: data.size
      };
      drawingHistory.push(stroke);
    }
  } else {
    drawingHistory.push(data);
  }

  redrawCanvas();
});

// Listen for clear events from other users
socket.on('clear', () => {
  drawingHistory = [];
  redrawCanvas();
});