const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const colorPicker = document.getElementById('colorPicker');
const brushSize = document.getElementById('brushSize');
const brushSizeValue = document.getElementById('brushSizeValue');
const clearBtn = document.getElementById('clearBtn');
const brushBtn = document.getElementById('brushBtn');
const eraserBtn = document.getElementById('eraserBtn');
const zoomInBtn = document.getElementById('zoomInBtn');
const zoomOutBtn = document.getElementById('zoomOutBtn');
const resetZoomBtn = document.getElementById('resetZoomBtn');
const zoomLevel = document.getElementById('zoomLevel');
const colorPresets = document.querySelectorAll('.color-preset');
const brushShapes = document.querySelectorAll('.brush-shape');

const userCount = document.getElementById('userCount');
const loginScreen = document.getElementById('loginScreen');
const appWindow = document.getElementById('appWindow');
const usernameInput = document.getElementById('usernameInput');
const userSelectButtons = document.querySelectorAll('.user-select-btn');
const startBtn = document.getElementById('startBtn');
const currentUserInfo = document.getElementById('currentUserInfo');

let username = '';
let selectedMember = '';

const socket = io();

// Login flow
userSelectButtons.forEach((button) => {
  button.addEventListener('click', () => {
    selectedMember = button.dataset.member;
    userSelectButtons.forEach((btn) => btn.classList.toggle('selected', btn === button));
  });
});

startBtn.addEventListener('click', () => {
  const enteredName = usernameInput.value.trim();
  if (!enteredName || !selectedMember) {
    alert('Vyplňte prosím uživatelské jméno a vyberte profil.');
    return;
  }

  username = enteredName;
  loginScreen.classList.add('hidden');
  appWindow.classList.remove('hidden');
  currentUserInfo.textContent = `${username} (${selectedMember})`;
  document.title = `Malování | ${username}`;
});

// Update user count
socket.on('userCount', (count) => {
  userCount.textContent = count;
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
ctx.fillStyle = colorPicker.value;

// Update brush properties when changed
colorPicker.addEventListener('change', () => {
  ctx.strokeStyle = colorPicker.value;
  ctx.fillStyle = colorPicker.value;
});

brushSize.addEventListener('input', () => {
  ctx.lineWidth = brushSize.value;
  brushSizeValue.textContent = brushSize.value;
});

// Color presets
colorPresets.forEach(preset => {
  preset.addEventListener('click', () => {
    const color = preset.dataset.color;
    colorPicker.value = color;
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    // Remove selected class from all presets
    colorPresets.forEach(p => p.classList.remove('selected'));
    // Add selected class to clicked preset
    preset.classList.add('selected');
  });
});

// Tool selection
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

// Brush shapes
brushShapes.forEach(shape => {
  shape.addEventListener('click', () => {
    currentShape = shape.dataset.shape;
    brushShapes.forEach(s => s.classList.remove('selected'));
    shape.classList.add('selected');
  });
});

// Zoom controls
zoomInBtn.addEventListener('click', () => {
  zoom *= 1.2;
  updateZoom();
});

zoomOutBtn.addEventListener('click', () => {
  zoom /= 1.2;
  updateZoom();
});

resetZoomBtn.addEventListener('click', () => {
  zoom = 1;
  panX = 0;
  panY = 0;
  updateZoom();
});

function updateZoom() {
  ctx.setTransform(zoom, 0, 0, zoom, panX, panY);
  zoomLevel.textContent = Math.round(zoom * 100) + '%';
  // Re-draw canvas content if needed (for now, just update display)
}

// Mouse wheel zoom
canvas.addEventListener('wheel', (e) => {
  e.preventDefault();
  if (e.deltaY < 0) {
    zoom *= 1.1;
  } else {
    zoom /= 1.1;
  }
  updateZoom();
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

  const x = e.offsetX;
  const y = e.offsetY;

  drawShape(x, y);

  // Send drawing data to server
  socket.emit('draw', {
    x: x,
    y: y,
    color: ctx.strokeStyle,
    size: ctx.lineWidth,
    shape: currentShape,
    tool: currentTool,
    username,
    member: selectedMember
  });

  lastX = x;
  lastY = y;
}

// Event listeners for mouse
canvas.addEventListener('mousedown', (e) => {
  isDrawing = true;
  lastX = e.offsetX;
  lastY = e.offsetY;
});

canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', () => isDrawing = false);
canvas.addEventListener('mouseout', () => isDrawing = false);

// Touch events for mobile
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
  const x = touch.clientX - rect.left;
  const y = touch.clientY - rect.top;

  draw({ offsetX: x, offsetY: y });
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
  // Save current context
  const savedStrokeStyle = ctx.strokeStyle;
  const savedFillStyle = ctx.fillStyle;
  const savedLineWidth = ctx.lineWidth;

  // Set received properties
  ctx.strokeStyle = data.color;
  ctx.fillStyle = data.color;
  ctx.lineWidth = data.size;

  // Draw the shape
  if (data.shape) {
    drawShape(data.x, data.y);
  } else {
    // Fallback for old line-based drawing
    ctx.beginPath();
    ctx.moveTo(data.x0, data.y0);
    ctx.lineTo(data.x1, data.y1);
    ctx.stroke();
  }

  // Reset to current user's settings
  ctx.strokeStyle = savedStrokeStyle;
  ctx.fillStyle = savedFillStyle;
  ctx.lineWidth = savedLineWidth;
});

// Listen for clear events from other users
socket.on('clear', () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
});