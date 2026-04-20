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

// Zoom state
let zoomLevel = 1;
const minZoom = 0.5;
const maxZoom = 3;
const zoomStep = 0.2;

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

// Set initial brush properties
ctx.lineJoin = 'round';
ctx.lineCap = 'round';
ctx.lineWidth = brushSize.value;
ctx.strokeStyle = colorPicker.value;

// Update brush size display
brushSize.addEventListener('input', () => {
  brushSizeValue.textContent = brushSize.value;
  ctx.lineWidth = brushSize.value;
});

// Update brush properties when changed
colorPicker.addEventListener('change', () => {
  ctx.strokeStyle = colorPicker.value;
});

// Zoom functions
function setZoom(newZoom) {
  zoomLevel = Math.max(minZoom, Math.min(maxZoom, newZoom));
  zoomLevelDisplay.textContent = Math.round(zoomLevel * 100) + '%';
  
  // Apply zoom transformation
  ctx.setTransform(zoomLevel, 0, 0, zoomLevel, 0, 0);
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

  const x = e.offsetX / zoomLevel;
  const y = e.offsetY / zoomLevel;

  ctx.beginPath();
  ctx.moveTo(lastX, lastY);
  ctx.lineTo(x, y);
  ctx.stroke();

  // Send drawing data to server
  socket.emit('draw', {
    x0: lastX,
    y0: lastY,
    x1: x,
    y1: y,
    color: ctx.strokeStyle,
    size: ctx.lineWidth
  });

  lastX = x;
  lastY = y;
}

// Event listeners for mouse
canvas.addEventListener('mousedown', (e) => {
  isDrawing = true;
  lastX = e.offsetX / zoomLevel;
  lastY = e.offsetY / zoomLevel;
});

canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', () => isDrawing = false);
canvas.addEventListener('mouseout', () => isDrawing = false);

// Touch events for mobile
canvas.addEventListener('touchstart', (e) => {
  e.preventDefault();
  const touch = e.touches[0];
  const rect = canvas.getBoundingClientRect();
  lastX = (touch.clientX - rect.left) / zoomLevel;
  lastY = (touch.clientY - rect.top) / zoomLevel;
  isDrawing = true;
});

canvas.addEventListener('touchmove', (e) => {
  e.preventDefault();
  if (!isDrawing) return;
  const touch = e.touches[0];
  const rect = canvas.getBoundingClientRect();
  const x = (touch.clientX - rect.left) / zoomLevel;
  const y = (touch.clientY - rect.top) / zoomLevel;

  draw({ offsetX: x * zoomLevel, offsetY: y * zoomLevel });
});

canvas.addEventListener('touchend', () => {
  isDrawing = false;
});

// Clear canvas
clearBtn.addEventListener('click', () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
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
  ctx.clearRect(0, 0, canvas.width, canvas.height);
});