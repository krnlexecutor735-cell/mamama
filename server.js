const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(express.static(__dirname));

let players = {};

io.on('connection', (socket) => {
    players[socket.id] = {
        x: 0,
        y: 0,
        os: 'Detecting...'
    };

    socket.on('initOS', (os) => {
        if (players[socket.id]) players[socket.id].os = os;
        io.emit('updatePlayers', players);
    });

    socket.on('move', (data) => {
        if (players[socket.id]) {
            players[socket.id].x = data.x;
            players[socket.id].y = data.y;
            socket.broadcast.emit('playerMoved', { id: socket.id, x: data.x, y: data.y });
        }
    });

    // ดักฟังข้อความแชทที่ถูกส่งมาจากฝั่งผู้เล่น
    socket.on('sendMessage', (text) => {
        if (players[socket.id]) {
            // แพร่กระจายข้อความที่พิมพ์ ไปยังทุกคนที่เชื่อมต่ออยู่
            io.emit('newMessage', {
                id: socket.id,
                os: players[socket.id].os,
                text: text
            });
        }
    });

    socket.on('disconnect', () => {
        delete players[socket.id];
        io.emit('playerDisconnected', socket.id);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
