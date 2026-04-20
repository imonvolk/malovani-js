const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const colorPicker = document.getElementById('colorPicker');
const brushSize = document.getElementById('brushSize');
const brushSizeValue = document.getElementById('brushSizeValue');
const clearBtn = document.getElementById('clearBtn');
const zoomInBtn = document.getElementById('zoomIn');
const zoomOutBtn = document.getElementById('zoomOut');
const zoomLevelDisplay = document.getElementById('zoomLevel');

const socket = io();

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
  
  ctx.restore();
}

// Draw a single stroke (circle)
function drawStroke(stroke) {
  ctx.fillStyle = stroke.color;
  ctx.beginPath();
  ctx.arc(stroke.x, stroke.y, stroke.size / 2, 0, Math.PI * 2);
  ctx.fill();
}

// Update brush size display
brushSize.addEventListener('input', () => {
  brushSizeValue.textContent = brushSize.value;
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

  // Interpolate points between last position and current position
  const dx = x - lastX;
  const dy = y - lastY;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const steps = Math.ceil(distance) + 1;

  for (let i = 0; i <= steps; i++) {
    const t = steps > 0 ? i / steps : 0;
    const interpX = lastX + dx * t;
    const interpY = lastY + dy * t;

    const stroke = {
      x: interpX,
      y: interpY,
      color: colorPicker.value,
      size: brushSize.value
    };
    
    drawingHistory.push(stroke);
  }

  redrawCanvas();

  // Send drawing data to server
  socket.emit('draw', {
    x0: lastX,
    y0: lastY,
    x1: x,
    y1: y,
    color: colorPicker.value,
    size: brushSize.value
  });

  lastX = x;
  lastY = y;
}

// Event listeners for mouse
canvas.addEventListener('mousedown', (e) => {
  isDrawing = true;
  lastX = (e.offsetX - panX) / zoomLevel;
  lastY = (e.offsetY - panY) / zoomLevel;
});

canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', () => isDrawing = false);
canvas.addEventListener('mouseout', () => isDrawing = false);

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
  // Interpolate points between start and end
  const dx = data.x1 - data.x0;
  const dy = data.y1 - data.y0;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const steps = Math.ceil(distance) + 1;

  for (let i = 0; i <= steps; i++) {
    const t = steps > 0 ? i / steps : 0;
    const interpX = data.x0 + dx * t;
    const interpY = data.y0 + dy * t;

    const stroke = {
      x: interpX,
      y: interpY,
      color: data.color,
      size: data.size
    };
    
    drawingHistory.push(stroke);
  }

  redrawCanvas();
});

// Listen for clear events from other users
socket.on('clear', () => {
  drawingHistory = [];
  redrawCanvas();
});