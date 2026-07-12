const socket = io();
const world = document.getElementById('world');
const joystick = document.getElementById('joystick');
let players = {};
let myId = null;

socket.on('connect', () => {
    myId = socket.id;
    socket.emit('init', { os: navigator.platform });
});

socket.on('update', (data) => {
    for (let id in data) {
        if (!players[id]) {
            let el = document.createElement('div');
            el.className = 'player ' + (id === myId ? '' : 'remote');
            el.innerHTML = `<div class="os-label">${data[id].os}</div>`;
            world.appendChild(el);
            players[id] = { el: el, x: data[id].x, y: data[id].y };
        }
    }
});

socket.on('move', (d) => {
    if (players[d.id]) {
        players[d.id].x = d.x;
        players[d.id].y = d.y;
        players[d.id].el.style.left = d.x + 'px';
        players[d.id].el.style.top = d.y + 'px';
    }
});

socket.on('remove', (id) => {
    if (players[id]) { players[id].el.remove(); delete players[id]; }
});

// ระบบควบคุม
joystick.addEventListener('touchmove', (e) => {
    if (!myId || !players[myId]) return;
    let touch = e.touches[0];
    let rect = joystick.getBoundingClientRect();
    let dx = (touch.clientX - (rect.left + rect.width / 2)) * 0.1;
    let dy = (touch.clientY - (rect.top + rect.height / 2)) * 0.1;
    
    players[myId].x += dx;
    players[myId].y += dy;
    players[myId].el.style.left = players[myId].x + 'px';
    players[myId].el.style.top = players[myId].y + 'px';
    
    socket.emit('move', { x: players[myId].x, y: players[myId].y });
});

// WASD สำหรับคอมพิวเตอร์
window.addEventListener('keydown', (e) => {
    if (!players[myId]) return;
    if (e.key === 'w') players[myId].y -= 10;
    if (e.key === 's') players[myId].y += 10;
    if (e.key === 'a') players[myId].x -= 10;
    if (e.key === 'd') players[myId].x += 10;
    socket.emit('move', { x: players[myId].x, y: players[myId].y });
});
