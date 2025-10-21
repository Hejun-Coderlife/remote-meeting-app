#!/bin/bash

echo "🚀 启动远程会议软件..."

# 检查Node.js是否安装
if ! command -v node &> /dev/null; then
    echo "❌ 错误: 未找到Node.js，请先安装Node.js 16+"
    exit 1
fi

# 检查npm是否安装
if ! command -v npm &> /dev/null; then
    echo "❌ 错误: 未找到npm，请先安装npm"
    exit 1
fi

echo "📦 安装依赖..."
npm run install-all

echo "🔧 启动开发服务器..."
echo "前端地址: http://localhost:3000"
echo "后端地址: http://localhost:3001"
echo ""
echo "按 Ctrl+C 停止服务器"
echo ""

# 启动开发服务器
npm run dev
