const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(express.static(__dirname));

let players = {};

io.on('connection', (socket) => {
    // ให้ทุกคนเริ่มจากพิกัดโลกจุดเดียวกันที่ (0, 0)
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

    socket.on('disconnect', () => {
        delete players[socket.id];
        io.emit('playerDisconnected', socket.id);
    });
});

// เปลี่ยนไปใช้พอร์ตของ Render หรือระบบโฮสติ้งอื่นๆ
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
