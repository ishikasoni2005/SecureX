import socketService from './socketService';
import speechService from './speechService';

class CallService {
  constructor() {
    this.active = false;
    this.currentRoom = 'global';
    this.listenersBound = false;
    this.onTranscript = null;
    this.onStatus = null;
  }

  connect(room = 'global') {
    this.currentRoom = room;
    const socket = socketService.connect();
    socketService.join(room);
    if (!this.listenersBound) {
      socket.on('call_start', this.handleCallStart);
      socket.on('call_end', this.handleCallEnd);
      this.listenersBound = true;
    }
  }

  setHandlers({ onTranscript, onStatus }) {
    this.onTranscript = onTranscript;
    this.onStatus = onStatus;
  }

  handleCallStart = async () => {
    if (this.active) return;
    this.active = true;
    try {
      this.onStatus && this.onStatus({ status: 'recording' });
      await speechService.startRecording();
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Failed to start recording:', e);
      this.onStatus && this.onStatus({ status: 'error', error: e.message });
      this.active = false;
    }
  };

  handleCallEnd = async () => {
    if (!this.active) return;
    try {
      this.onStatus && this.onStatus({ status: 'transcribing' });
      const text = await speechService.stopAndTranscribe();
      this.onTranscript && this.onTranscript(text || '');
      this.onStatus && this.onStatus({ status: 'idle' });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Failed to transcribe:', e);
      this.onStatus && this.onStatus({ status: 'error', error: e.message });
    } finally {
      this.active = false;
    }
  };
}

const callService = new CallService();
export default callService;


