const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const colorPicker = document.getElementById('colorPicker');
const brushSize = document.getElementById('brushSize');
const brushSizeValue = document.getElementById('brushSizeValue');
const clearBtn = document.getElementById('clearBtn');

const socket = io();

// Update brush size display
brushSize.addEventListener('input', () => {
  brushSizeValue.textContent = brushSize.value;
});

// Drawing state
let isDrawing = false;
let lastX = 0;
let lastY = 0;
let currentTool = 'brush'; // 'brush' or 'eraser'
let currentShape = 'circle'; // 'circle' or 'square'
let zoom = 1;
let panX = 0;
let panY = 0;

// Set initial brush properties
ctx.lineJoin = 'round';
ctx.lineCap = 'round';
ctx.lineWidth = brushSize.value;
ctx.strokeStyle = colorPicker.value;

// Update brush properties when changed
colorPicker.addEventListener('change', () => {
  ctx.strokeStyle = colorPicker.value;
});

brushSize.addEventListener('input', () => {
  ctx.lineWidth = brushSize.value;
});

// Drawing functions
function drawShape(x, y) {
  const size = parseInt(brushSize.value);
  ctx.save();
  ctx.translate(x, y);

  if (currentShape === 'circle') {
    ctx.beginPath();
    ctx.arc(0, 0, size / 2, 0, 2 * Math.PI);
    ctx.fill();
  } else if (currentShape === 'square') {
    ctx.fillRect(-size / 2, -size / 2, size, size);
  }

  ctx.restore();
}

function draw(e) {
  if (!isDrawing) return;

  ctx.beginPath();
  ctx.moveTo(lastX, lastY);
  ctx.lineTo(e.offsetX, e.offsetY);
  ctx.stroke();

  // Send drawing data to server
  socket.emit('draw', {
    x0: lastX,
    y0: lastY,
    x1: e.offsetX,
    y1: e.offsetY,
    color: ctx.strokeStyle,
    size: ctx.lineWidth
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
  ctx.strokeStyle = data.color;
  ctx.lineWidth = data.size;
  ctx.beginPath();
  ctx.moveTo(data.x0, data.y0);
  ctx.lineTo(data.x1, data.y1);
  ctx.stroke();
  // Reset to current user's settings
  ctx.strokeStyle = colorPicker.value;
  ctx.lineWidth = brushSize.value;
});

// Listen for clear events from other users
socket.on('clear', () => {
  drawingHistory = [];
  redrawCanvas();
});