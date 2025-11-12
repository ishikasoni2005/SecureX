import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
  }

  connect() {
    if (this.socket?.connected) return this.socket;

    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const base = process.env.REACT_APP_WS_BASE_URL || `${protocol}://${window.location.host}`;
    const token = localStorage.getItem('securex_token');

    this.socket = io(base, {
      transports: ['websocket'],
      auth: token ? { token } : undefined,
      withCredentials: true
    });

    this.socket.on('connect', () => {
      // eslint-disable-next-line no-console
      console.log('[socket] connected', this.socket.id);
    });

    this.socket.on('disconnect', (reason) => {
      // eslint-disable-next-line no-console
      console.log('[socket] disconnected', reason);
    });

    return this.socket;
  }

  join(room) {
    if (!this.socket) this.connect();
    this.socket.emit('join-room', room);
  }

  on(event, handler) {
    if (!this.socket) this.connect();
    this.socket.on(event, handler);
  }

  off(event, handler) {
    this.socket?.off(event, handler);
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
  }
}

const socketService = new SocketService();
export default socketService;


