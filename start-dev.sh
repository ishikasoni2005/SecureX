#!/bin/bash

# SecureX Development Startup Script
# This script starts both backend and frontend for development

echo "🚀 Starting SecureX Development Environment..."

# Check if we're in the right directory
if [ ! -d "securex-backend" ] || [ ! -d "securex-frontend" ]; then
    echo "❌ Error: Please run this script from the SecureX root directory"
    exit 1
fi

# Function to check if a port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        return 0
    else
        return 1
    fi
}

# Check if ports are available
if check_port 5000; then
    echo "⚠️  Port 5000 is already in use. Backend may already be running."
fi

if check_port 3000; then
    echo "⚠️  Port 3000 is already in use. Frontend may already be running."
fi

# Start backend
echo "🔧 Starting Backend Server..."
cd securex-backend
if [ ! -f "package.json" ]; then
    echo "❌ Backend package.json not found. Please check your setup."
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    npm install
fi

# Start backend in background
npm run dev &
BACKEND_PID=$!
echo "✅ Backend started with PID: $BACKEND_PID"

# Wait a moment for backend to start
sleep 3

# Start frontend
echo "🎨 Starting Frontend Server..."
cd ../securex-frontend
if [ ! -f "package.json" ]; then
    echo "❌ Frontend package.json not found. Please check your setup."
    kill $BACKEND_PID
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    npm install
fi

# Start frontend
echo "🌐 Frontend will be available at: http://localhost:3000"
echo "🔗 Backend API will be available at: http://localhost:5000"
echo "📊 API Health Check: http://localhost:5000/api/health"
echo ""
echo "Press Ctrl+C to stop both servers"

npm start

# Cleanup function
cleanup() {
    echo ""
    echo "🛑 Stopping servers..."
    kill $BACKEND_PID 2>/dev/null
    echo "✅ Development servers stopped"
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup SIGINT SIGTERM
