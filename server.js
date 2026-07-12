const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

app.use(express.static(__dirname));

let players = {};

io.on('connection', (socket) => {
    socket.on('init', (data) => {
        players[socket.id] = { x: 500, y: 500, os: data.os };
        io.emit('update', players);
    });

    socket.on('move', (pos) => {
        if (players[socket.id]) {
            players[socket.id].x = pos.x;
            players[socket.id].y = pos.y;
            socket.broadcast.emit('move', { id: socket.id, x: pos.x, y: pos.y });
        }
    });

    socket.on('disconnect', () => {
        delete players[socket.id];
        io.emit('remove', socket.id);
    });
});

server.listen(process.env.PORT || 3000);
