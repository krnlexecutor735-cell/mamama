const socket = io();
const world = document.getElementById('world');
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
    if (players[id]) {
        players[id].el.remove();
        delete players[id];
    }
});

window.addEventListener('touchmove', (e) => {
    if (players[myId]) {
        players[myId].x += (e.touches[0].clientX - window.innerWidth / 2) / 20;
        players[myId].y += (e.touches[0].clientY - window.innerHeight / 2) / 20;
        socket.emit('move', { x: players[myId].x, y: players[myId].y });
    }
});
