// 测试远程会议软件连接
const io = require('socket.io-client');

console.log('🔍 测试远程会议软件连接...');

const socket = io('http://localhost:3001');

socket.on('connect', () => {
  console.log('✅ 成功连接到信令服务器');
  
  // 测试创建房间
  console.log('🏠 测试创建房间...');
  socket.emit('create-room', { 
    roomName: '测试房间', 
    userName: '测试用户' 
  });
});

socket.on('room-created', (data) => {
  console.log('✅ 房间创建成功:', {
    roomId: data.roomId,
    userId: data.userId,
    roomName: data.roomName
  });
  
  console.log('🎉 远程会议软件测试完成！');
  console.log('📱 请访问 http://localhost:3000 开始使用');
  process.exit(0);
});

socket.on('disconnect', () => {
  console.log('❌ 与服务器断开连接');
});

socket.on('error', (error) => {
  console.log('❌ 连接错误:', error);
});

// 5秒超时
setTimeout(() => {
  console.log('⏰ 测试超时');
  process.exit(1);
}, 5000);
