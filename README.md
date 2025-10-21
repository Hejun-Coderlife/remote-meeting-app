# 远程会议软件

基于WebRTC的实时音视频会议应用，支持多人视频通话、屏幕共享、文字聊天等功能。

## 功能特性

- 🎥 **实时视频通话** - 基于WebRTC的高质量音视频传输
- 🎤 **音频控制** - 支持静音/取消静音
- 📹 **视频控制** - 支持开启/关闭摄像头
- 🖥️ **屏幕共享** - 支持共享桌面或应用程序窗口
- 💬 **实时聊天** - 文字消息实时传输
- 🏠 **房间管理** - 创建房间或通过房间ID加入
- 👥 **用户管理** - 实时显示参与者列表和状态
- 📱 **响应式设计** - 适配不同屏幕尺寸

## 技术栈

### 前端
- React 18 + TypeScript
- Styled Components (CSS-in-JS)
- Socket.io Client (WebSocket通信)
- WebRTC API (音视频传输)

### 后端
- Node.js + Express
- Socket.io (WebSocket服务器)
- 房间和用户管理系统

## 快速开始

### 环境要求
- Node.js 16+ 
- npm 或 yarn
- 现代浏览器（支持WebRTC）

### 安装依赖

```bash
# 安装所有依赖
npm run install-all
```

### 启动开发服务器

```bash
# 同时启动前端和后端服务器
npm run dev
```

或者分别启动：

```bash
# 启动后端服务器 (端口 3001)
npm run server

# 启动前端服务器 (端口 3000)
npm run client
```

### 访问应用

打开浏览器访问：http://localhost:3000

## 使用说明

### 创建房间
1. 在首页输入您的姓名和房间名称
2. 点击"创建房间"按钮
3. 系统会生成唯一的房间ID，可以分享给其他人

### 加入房间
1. 输入您的姓名和房间ID
2. 点击"加入房间"按钮
3. 等待房间创建者同意加入

### 会议功能
- **摄像头控制**：点击摄像头按钮开启/关闭视频
- **麦克风控制**：点击麦克风按钮静音/取消静音
- **屏幕共享**：点击屏幕共享按钮分享桌面
- **文字聊天**：在右侧聊天区域发送消息
- **离开会议**：点击红色电话按钮离开房间

## 项目结构

```
remote-meeting-app/
├── client/                 # React前端应用
│   ├── src/
│   │   ├── components/     # React组件
│   │   ├── hooks/          # 自定义Hooks
│   │   ├── types/          # TypeScript类型定义
│   │   └── App.tsx         # 主应用组件
│   └── package.json
├── server/                 # Node.js后端服务器
│   ├── index.js           # 服务器入口文件
│   └── package.json
├── package.json           # 根项目配置
└── README.md
```

## API接口

### WebSocket事件

#### 客户端发送
- `create-room`: 创建房间
- `join-room`: 加入房间
- `offer`: WebRTC offer
- `answer`: WebRTC answer
- `ice-candidate`: ICE候选
- `toggle-mute`: 切换静音状态
- `toggle-video`: 切换视频状态
- `send-message`: 发送聊天消息

#### 服务器发送
- `room-created`: 房间创建成功
- `room-joined`: 成功加入房间
- `user-joined`: 新用户加入
- `user-left`: 用户离开
- `offer`: 接收WebRTC offer
- `answer`: 接收WebRTC answer
- `ice-candidate`: 接收ICE候选
- `new-message`: 接收新消息

### REST API

- `GET /api/rooms` - 获取所有房间列表
- `GET /api/rooms/:roomId` - 获取指定房间信息

## 部署说明

### 生产环境构建

```bash
# 构建前端
npm run build

# 启动生产服务器
cd server && npm start
```

### 环境变量

```bash
PORT=3001  # 服务器端口
NODE_ENV=production  # 环境模式
```

## 浏览器兼容性

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## 注意事项

1. **HTTPS要求**：生产环境必须使用HTTPS，WebRTC在HTTP下无法正常工作
2. **媒体权限**：首次使用需要授权摄像头和麦克风权限
3. **网络要求**：需要稳定的网络连接以获得最佳体验
4. **STUN服务器**：当前使用Google的免费STUN服务器

## 故障排除

### 无法获取摄像头/麦克风
- 检查浏览器权限设置
- 确保设备摄像头和麦克风正常工作
- 尝试刷新页面重新授权

### 无法连接其他用户
- 检查网络连接
- 确认防火墙设置
- 检查STUN服务器连接

### 音视频质量问题
- 检查网络带宽
- 关闭其他占用带宽的应用
- 调整视频分辨率设置

## 贡献指南

欢迎提交Issue和Pull Request来改进这个项目！

## 许可证

MIT License
