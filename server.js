const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');

app.use(express.static(path.join(__dirname)));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

const players = {};
io.on('connection', (socket) => {
    players[socket.id] = { x: 0, y: 0, os: socket.handshake.query.os || 'Unknown' };
    socket.on('move', (data) => { if(players[socket.id]) { players[socket.id].x = data.x; players[socket.id].y = data.y; } });
    socket.on('disconnect', () => delete players[socket.id]);
});
setInterval(() => io.emit('update', players), 1000/60);
http.listen(process.env.PORT || 3000);
