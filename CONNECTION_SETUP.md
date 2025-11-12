# SecureX Backend-Frontend Connection Setup

## Overview
This document explains how the backend and frontend are connected for development and production.

## Development Setup

### Quick Start
```bash
# From the SecureX root directory
./start-dev.sh
```

This will start both backend (port 5000) and frontend (port 3000) with proper proxy configuration.

### Manual Setup

#### Backend (Port 5000)
```bash
cd securex-backend
npm install
npm run dev
```

#### Frontend (Port 3000)
```bash
cd securex-frontend
npm install
npm start
```

## Configuration Details

### API Endpoints
- **Backend API**: `http://localhost:5000/api/v1`
- **Frontend**: `http://localhost:3000`
- **Health Check**: `http://localhost:5000/api/health`

### Environment Variables

#### Frontend (.env.development.local)
```env
REACT_APP_API_BASE_URL=http://localhost:5000/api/v1
REACT_APP_WS_BASE_URL=ws://localhost:5000
REACT_APP_BACKEND_URL=http://localhost:5000
```

#### Backend (.env)
```env
PORT=5000
CLIENT_URL=http://localhost:3000
MONGODB_URI=mongodb://localhost:27017/securex
```

### Proxy Configuration
The frontend `package.json` includes a proxy setting:
```json
{
  "proxy": "http://localhost:5000"
}
```

This allows the frontend to make API calls to `/api/v1/*` which will be automatically proxied to `http://localhost:5000/api/v1/*`.

### API Service Configuration

#### ApiService.js
- Base URL: `/api/v1` (proxied to backend)
- WebSocket: Auto-detects protocol and host
- Authentication: Bearer token from localStorage

#### SecureAPIService.js
- Enhanced error handling and retry logic
- Request/response interceptors
- Caching and batch request support

### Real-time Communication
- **WebSocket**: `ws://localhost:5000` (development)
- **Socket.io**: Configured for real-time updates
- **Fallback**: Polling mechanism if WebSocket unavailable

## API Routes

### Authentication
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/logout`
- `GET /api/v1/auth/me`

### Security Data
- `GET /api/v1/security/stats`
- `GET /api/v1/threats/feed`
- `GET /api/v1/system/health`

### Firewall Management
- `GET /api/v1/firewall/rules`
- `POST /api/v1/firewall/rules`
- `PUT /api/v1/firewall/rules/:id`
- `DELETE /api/v1/firewall/rules/:id`

### Reports
- `POST /api/v1/reports/generate`
- `GET /api/v1/reports/history`

## CORS Configuration
Backend is configured to allow requests from:
- `http://localhost:3000` (development)
- `https://yourdomain.com` (production)

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure backend is running on port 5000
   - Check CLIENT_URL in backend .env

2. **API Connection Failed**
   - Verify proxy configuration in frontend package.json
   - Check REACT_APP_API_BASE_URL in .env.development.local

3. **WebSocket Connection Failed**
   - Ensure backend supports WebSocket connections
   - Check REACT_APP_WS_BASE_URL configuration

4. **Port Already in Use**
   - Backend: Change PORT in backend .env
   - Frontend: Use `PORT=3001 npm start`

### Debug Steps

1. Check backend health: `curl http://localhost:5000/api/health`
2. Check frontend proxy: Open browser dev tools → Network tab
3. Verify environment variables are loaded
4. Check browser console for errors

## Production Deployment

For production, update the following:

1. **Frontend Environment**:
   ```env
   REACT_APP_API_BASE_URL=https://api.yourdomain.com/v1
   REACT_APP_WS_BASE_URL=wss://api.yourdomain.com
   ```

2. **Backend Environment**:
   ```env
   CLIENT_URL=https://yourdomain.com
   NODE_ENV=production
   ```

3. **Remove proxy** from frontend package.json in production builds

## Security Notes

- Development keys are used in .env.development.local
- Use strong, unique keys for production
- Enable HTTPS in production
- Configure proper CORS origins for production domains
