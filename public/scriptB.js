function initB() {
  const canvas = document.getElementById('canvas');
  const canvasContainer = document.querySelector('.canvas-container');
  const appWindow = document.getElementById('appWindow');

  const remoteUsers = new Map();

  // Users panel
  const panel = document.createElement('div');
  panel.style.cssText = [
    'position:absolute', 'bottom:96px', 'right:8px',
    'background:rgba(0,0,0,0.75)', 'color:#fff',
    'border:1px solid #555', 'padding:8px 12px',
    'font-size:11px', 'min-width:120px', 'z-index:5',
    'font-family:sans-serif',
  ].join(';');
  panel.innerHTML = '<div style="color:#aaa;margin-bottom:4px;">Online</div><div id="bUsersList"></div>';
  appWindow.appendChild(panel);

  const usersList = document.getElementById('bUsersList');

  function rebuildList() {
    usersList.innerHTML = '';
    remoteUsers.forEach(u => {
      const row = document.createElement('div');
      row.style.cssText = 'display:flex;align-items:center;gap:6px;padding:2px 0';
      row.innerHTML =
        `<div style="width:8px;height:8px;border-radius:50%;background:${u.color};flex-shrink:0"></div>` +
        `<span>${u.username}</span>`;
      usersList.appendChild(row);
    });
  }

  // Remote cursors
  function getOrCreateCursor(id, color, name) {
    if (remoteUsers.has(id)) return remoteUsers.get(id);
    const el = document.createElement('div');
    el.style.cssText = 'position:absolute;pointer-events:none;display:flex;flex-direction:column;align-items:flex-start;gap:3px;z-index:4';
    el.innerHTML =
      `<div style="width:10px;height:10px;border-radius:50%;background:${color};border:2px solid rgba(255,255,255,0.6)"></div>` +
      `<div style="background:rgba(0,0,0,0.65);color:#fff;font-size:10px;padding:2px 6px;border-radius:4px;white-space:nowrap;font-family:sans-serif">${name}</div>`;
    canvasContainer.appendChild(el);
    const user = { username: name, color, el };
    remoteUsers.set(id, user);
    return user;
  }

  function moveCursor(id, x, y) {
    const u = remoteUsers.get(id);
    if (!u) return;
    u.el.style.left = (x * canvas.width) + 'px';
    u.el.style.top  = (y * canvas.height) + 'px';
  }

  function removeCursor(id) {
    const u = remoteUsers.get(id);
    if (u) { u.el.remove(); remoteUsers.delete(id); }
  }

  // Announce join
  socket.emit('join', { username, member: selectedMember });

  // Receive current users
  socket.on('users', (list) => {
    list.forEach(u => getOrCreateCursor(u.id, u.color, u.username));
    rebuildList();
  });

  socket.on('user_join', (data) => {
    getOrCreateCursor(data.id, data.color, data.username);
    rebuildList();
  });

  socket.on('user_leave', (data) => {
    removeCursor(data.id);
    rebuildList();
  });

  socket.on('cursor', (data) => {
    moveCursor(data.id, data.x, data.y);
  });

  // Send cursor position (throttled)
  let lastSend = 0;
  canvas.addEventListener('mousemove', (e) => {
    const now = Date.now();
    if (now - lastSend < 40) return;
    lastSend = now;
    const r = canvas.getBoundingClientRect();
    socket.emit('cursor', {
      x: (e.clientX - r.left) / canvas.width,
      y: (e.clientY - r.top)  / canvas.height,
    });
  });
}
