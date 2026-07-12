const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

app.use(express.static(__dirname));

let players = {};

io.on('connection', (socket) => {
    // เมื่อมีคนเข้า ให้สร้างข้อมูลผู้เล่นเริ่มต้นทันที
    players[socket.id] = { x: 500, y: 500, os: 'Unknown' };
    
    socket.on('init', (os) => {
        players[socket.id].os = os;
        // ส่งสถานะปัจจุบันให้ทุกคนเห็น
        io.emit('updatePlayers', players);
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
