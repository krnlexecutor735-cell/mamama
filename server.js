const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    maxHttpBufferSize: 1e7
});

const PORT = process.env.PORT || 3000;

const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

app.use('/uploads', express.static(uploadDir));

app.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    res.json({ 
        name: req.file.originalname,
        type: req.file.mimetype,
        url: `/uploads/${req.file.filename}` 
    });
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

const activeUsers = new Set();
const chatHistory = [];

io.on('connection', (socket) => {
    let currentUsername = null;

    socket.on('check-username', (username, callback) => {
        const trimmedName = username.trim();
        if (!trimmedName) {
            callback({ success: false, error: 'Empty username' });
        } else if (activeUsers.has(trimmedName)) {
            callback({ success: false, error: 'Username taken' });
        } else {
            currentUsername = trimmedName;
            activeUsers.add(currentUsername);
            callback({ success: true });
            socket.emit('chat-history', chatHistory);
            io.emit('user-joined', currentUsername);
        }
    });

    socket.on('send-message', (data) => {
        if (!currentUsername) return;
        const messageData = {
            id: Date.now() + Math.random().toString(36).substr(2, 9),
            sender: currentUsername,
            text: data.text || '',
            file: data.file || null,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        chatHistory.push(messageData);
        if (chatHistory.length > 150) chatHistory.shift();
        io.emit('new-message', messageData);
    });

    socket.on('disconnect', () => {
        if (currentUsername) {
            activeUsers.delete(currentUsername);
            io.emit('user-left', currentUsername);
        }
    });
});

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
