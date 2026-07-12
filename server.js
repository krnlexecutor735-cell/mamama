const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');

app.use(express.static(__dirname));

let players = {};

io.on('connection', (socket) => {
    // กำหนดตำแหน่งเริ่มต้น
    players[socket.id] = { x: 400, y: 300, os: socket.handshake.query.os || 'Unknown' };

    // รับคำสั่งเคลื่อนที่ (รับมาแค่ทิศทาง dx, dy)
    socket.on('move', (data) => {
        if (players[socket.id]) {
            players[socket.id].x += data.dx;
            players[socket.id].y += data.dy;
        }
    });

    socket.on('disconnect', () => {
        delete players[socket.id];
    });
});

// ส่งสถานะให้ทุกคน 60 ครั้งต่อวินาที
setInterval(() => {
    io.emit('update', players);
}, 1000 / 60);

http.listen(process.env.PORT || 3000);
