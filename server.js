const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

const PORT = process.env.PORT || 3000;

app.use(express.static('public'));

// เก็บข้อมูลผู้เล่นทั้งหมด
const players = {};

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // เมื่อผู้เล่นเข้ามาใหม่
    socket.on('join', (data) => {
        players[socket.id] = {
            x: 0,
            y: 0,
            color: `hsl(${Math.random() * 360}, 70%, 50%)`, // สุ่มสีให้แต่ละคน
            os: data.os
        };
        // ส่งข้อมูลผู้เล่นทั้งหมดให้คนที่เพิ่งเข้ามา
        socket.emit('currentPlayers', players);
        // แจ้งทุกคนว่ามีคนใหม่เข้ามา
        socket.broadcast.emit('newPlayer', { id: socket.id, player: players[socket.id] });
    });

    // เมื่อมีการขยับตัว
    socket.on('playerMovement', (movementData) => {
        if (players[socket.id]) {
            players[socket.id].x = movementData.x;
            players[socket.id].y = movementData.y;
            // ส่งตำแหน่งใหม่ให้ทุกคน (ยกเว้นตัวเอง)
            socket.broadcast.emit('playerMoved', { id: socket.id, x: movementData.x, y: movementData.y });
        }
    });

    // เมื่อผู้เล่นออก
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        delete players[socket.id];
        io.emit('playerDisconnected', socket.id);
    });
});

http.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
