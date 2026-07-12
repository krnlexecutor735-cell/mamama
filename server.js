const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

app.use(express.static(__dirname));

io.on('connection', (socket) => {
    console.log('User connected: ' + socket.id);
});

server.listen(process.env.PORT || 3000);
