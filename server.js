const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

app.use(express.static(__dirname));

let players = {};

io.on('connection', (socket) => {
    // รอรับค่า OS ตอนเชื่อมต่อครั้งแรก
    socket.on('init', (os) => {
        players[socket.id] = { x: 500, y: 500, os: os };
        // ส่งข้อมูลผู้เล่นใหม่ให้คนอื่นในห้อง
        socket.broadcast.emit('newPlayer', { id: socket.id, os: os, x: 500, y: 500 });
        // ส่งรายชื่อผู้เล่นทั้งหมดที่มีอยู่แล้วให้คนที่เพิ่งเข้ามา
        socket.emit('currentPlayers', players);
    });

    socket.on('move', (pos) => {
        if (players[socket.id]) {
            players[socket.id].x = pos.x;
            players[socket.id].y = pos.y;
            socket.broadcast.emit('move', { id: socket.id, x: pos.x, y: pos.y });
        }
    });

    socket.on('disconnect', () => { delete players[socket.id]; io.emit('remove', socket.id); });
});

server.listen(3000);
