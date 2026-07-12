const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
app.use(express.static(__dirname));

let players = {};

io.on('connection', (socket) => {
    players[socket.id] = { x: 0, y: 0, os: socket.handshake.query.os || 'Unknown' };
    socket.on('move', (pos) => {
        if (players[socket.id]) {
            players[socket.id].x = pos.x;
            players[socket.id].y = pos.y;
        }
    });
    socket.on('disconnect', () => delete players[socket.id]);
});

setInterval(() => io.emit('update', players), 1000 / 60);
http.listen(process.env.PORT || 3000);
