const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// 存储房间信息
const rooms = new Map();
const users = new Map();

// 房间管理类
class Room {
  constructor(id, name) {
    this.id = id;
    this.name = name;
    this.users = new Map();
    this.createdAt = new Date();
  }

  addUser(userId, userInfo) {
    this.users.set(userId, userInfo);
  }

  removeUser(userId) {
    this.users.delete(userId);
  }

  getUserCount() {
    return this.users.size;
  }

  getUsers() {
    return Array.from(this.users.values());
  }
}

// 用户管理类
class User {
  constructor(id, socketId, name, roomId) {
    this.id = id;
    this.socketId = socketId;
    this.name = name;
    this.roomId = roomId;
    this.isMuted = false;
    this.isVideoOff = false;
    this.isScreenSharing = false;
  }
}

// Socket.io 连接处理
io.on('connection', (socket) => {
  console.log('用户连接:', socket.id);

  // 创建房间
  socket.on('create-room', ({ roomName, userName }) => {
    const roomId = uuidv4();
    const userId = uuidv4();
    
    const room = new Room(roomId, roomName);
    const user = new User(userId, socket.id, userName, roomId);
    
    room.addUser(userId, user);
    rooms.set(roomId, room);
    users.set(userId, user);
    
    socket.join(roomId);
    socket.userId = userId;
    socket.roomId = roomId;
    
    socket.emit('room-created', { roomId, userId, roomName });
    console.log(`房间创建: ${roomName} (${roomId})`);
  });

  // 加入房间
  socket.on('join-room', ({ roomId, userName }) => {
    const room = rooms.get(roomId);
    
    if (!room) {
      socket.emit('error', { message: '房间不存在' });
      return;
    }
    
    const userId = uuidv4();
    const user = new User(userId, socket.id, userName, roomId);
    
    room.addUser(userId, user);
    users.set(userId, user);
    
    socket.join(roomId);
    socket.userId = userId;
    socket.roomId = roomId;
    
    // 通知房间内其他用户有新用户加入
    socket.to(roomId).emit('user-joined', {
      userId,
      userName,
      isMuted: user.isMuted,
      isVideoOff: user.isVideoOff
    });
    
    // 发送房间信息给新用户
    socket.emit('room-joined', {
      roomId,
      userId,
      roomName: room.name,
      users: room.getUsers().filter(u => u.id !== userId)
    });
    
    console.log(`${userName} 加入房间: ${room.name} (${roomId})`);
  });

  // WebRTC 信令处理
  socket.on('offer', ({ targetUserId, offer }) => {
    const user = users.get(socket.userId);
    if (user) {
      const targetUser = users.get(targetUserId);
      if (targetUser) {
        io.to(targetUser.socketId).emit('offer', {
          userId: socket.userId,
          userName: user.name,
          offer
        });
      }
    }
  });

  socket.on('answer', ({ targetUserId, answer }) => {
    const user = users.get(socket.userId);
    if (user) {
      const targetUser = users.get(targetUserId);
      if (targetUser) {
        io.to(targetUser.socketId).emit('answer', {
          userId: socket.userId,
          userName: user.name,
          answer
        });
      }
    }
  });

  socket.on('ice-candidate', ({ targetUserId, candidate }) => {
    const user = users.get(socket.userId);
    if (user) {
      const targetUser = users.get(targetUserId);
      if (targetUser) {
        io.to(targetUser.socketId).emit('ice-candidate', {
          userId: socket.userId,
          candidate
        });
      }
    }
  });

  // 用户状态更新
  socket.on('toggle-mute', ({ isMuted }) => {
    const user = users.get(socket.userId);
    if (user) {
      user.isMuted = isMuted;
      socket.to(user.roomId).emit('user-mute-changed', {
        userId: socket.userId,
        isMuted
      });
    }
  });

  socket.on('toggle-video', ({ isVideoOff }) => {
    const user = users.get(socket.userId);
    if (user) {
      user.isVideoOff = isVideoOff;
      socket.to(user.roomId).emit('user-video-changed', {
        userId: socket.userId,
        isVideoOff
      });
    }
  });

  socket.on('toggle-screen-share', ({ isScreenSharing }) => {
    const user = users.get(socket.userId);
    if (user) {
      user.isScreenSharing = isScreenSharing;
      socket.to(user.roomId).emit('user-screen-share-changed', {
        userId: socket.userId,
        isScreenSharing
      });
    }
  });

  // 聊天消息
  socket.on('send-message', ({ message }) => {
    const user = users.get(socket.userId);
    if (user) {
      socket.to(user.roomId).emit('new-message', {
        userId: socket.userId,
        userName: user.name,
        message,
        timestamp: new Date()
      });
    }
  });

  // 用户断开连接
  socket.on('disconnect', () => {
    const user = users.get(socket.userId);
    if (user) {
      const room = rooms.get(user.roomId);
      if (room) {
        room.removeUser(socket.userId);
        socket.to(user.roomId).emit('user-left', { userId: socket.userId });
        
        // 如果房间为空，删除房间
        if (room.getUserCount() === 0) {
          rooms.delete(user.roomId);
          console.log(`房间删除: ${room.name} (${user.roomId})`);
        }
      }
      users.delete(socket.userId);
    }
    console.log('用户断开连接:', socket.id);
  });
});

// API 路由
app.get('/api/rooms', (req, res) => {
  const roomList = Array.from(rooms.values()).map(room => ({
    id: room.id,
    name: room.name,
    userCount: room.getUserCount(),
    createdAt: room.createdAt
  }));
  res.json(roomList);
});

app.get('/api/rooms/:roomId', (req, res) => {
  const room = rooms.get(req.params.roomId);
  if (room) {
    res.json({
      id: room.id,
      name: room.name,
      userCount: room.getUserCount(),
      users: room.getUsers().map(user => ({
        id: user.id,
        name: user.name,
        isMuted: user.isMuted,
        isVideoOff: user.isVideoOff,
        isScreenSharing: user.isScreenSharing
      })),
      createdAt: room.createdAt
    });
  } else {
    res.status(404).json({ error: '房间不存在' });
  }
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`信令服务器运行在端口 ${PORT}`);
});
