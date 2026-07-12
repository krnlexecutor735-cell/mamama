const socket = io();
const world = document.getElementById('world');
const joystick = document.getElementById('joystick');
let players = {};
let myId = null;
let joy = { active: false, x: 0, y: 0 };

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
    if (players[id]) {
        players[id].el.remove();
        delete players[id];
    }
});

joystick.addEventListener('touchstart', (e) => joy.active = true);
joystick.addEventListener('touchmove', (e) => {
    if (joy.active && players[myId]) {
        let touch = e.touches[0];
        let rect = joystick.getBoundingClientRect();
        let dx = touch.clientX - (rect.left + rect.width / 2);
        let dy = touch.clientY - (rect.top + rect.height / 2);
        players[myId].x += dx * 0.1;
        players[myId].y += dy * 0.1;
        socket.emit('move', { x: players[myId].x, y: players[myId].y });
    }
});
joystick.addEventListener('touchend', () => joy.active = false);
