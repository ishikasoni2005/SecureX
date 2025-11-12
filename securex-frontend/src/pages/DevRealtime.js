import React, { useEffect, useState } from 'react';
import socketService from '../services/socketService';

function DevRealtime() {
  const [socketId, setSocketId] = useState('');
  const [connected, setConnected] = useState(false);
  const [room, setRoom] = useState('global');
  const [log, setLog] = useState([]);

  useEffect(() => {
    const socket = socketService.connect();
    const onConnect = () => {
      setConnected(true);
      setSocketId(socket.id);
      appendLog(`Connected: ${socket.id}`);
    };
    const onDisconnect = (reason) => {
      setConnected(false);
      appendLog(`Disconnected: ${reason}`);
    };
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    const onThreatAlert = (payload) => appendLog(`threat_alert: ${payload?.title || 'Alert'} - ${payload?.message || ''}`);
    const onCallStart = (payload) => appendLog(`call_start: room=${payload?.room}`);
    const onCallEnd = (payload) => appendLog(`call_end: room=${payload?.room}`);
    socket.on('threat_alert', onThreatAlert);
    socket.on('call_start', onCallStart);
    socket.on('call_end', onCallEnd);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('threat_alert', onThreatAlert);
      socket.off('call_start', onCallStart);
      socket.off('call_end', onCallEnd);
    };
  }, []);

  const appendLog = (entry) => setLog((prev) => [
    `${new Date().toLocaleTimeString()} - ${entry}`,
    ...prev.slice(0, 99)
  ]);

  const joinRoom = () => {
    socketService.join(room || 'global');
    appendLog(`Joined room: ${room || 'global'}`);
  };

  const emitLocalAlert = () => {
    const socket = socketService.connect();
    socket.emit('threat_alert', { title: 'Test Alert (local)', message: 'This is a local emit' });
    appendLog('Emitted local threat_alert');
  };

  const authedFetch = async (path, body) => {
    const token = localStorage.getItem('securex_token');
    const res = await fetch(path, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify(body || {})
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text);
    }
    return res.json();
  };

  const startCall = async () => {
    await authedFetch('/api/v1/call/start', { room });
    appendLog('Requested call_start');
  };

  const endCall = async () => {
    await authedFetch('/api/v1/call/end', { room });
    appendLog('Requested call_end');
  };

  return (
    <div style={{ padding: 16 }}>
      <h1>Realtime Dev Tools</h1>
      <div style={{ marginBottom: 12 }}>
        <div>Connected: <strong>{connected ? 'Yes' : 'No'}</strong></div>
        <div>Socket ID: <code>{socketId || '-'}</code></div>
      </div>

      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
        <input
          value={room}
          onChange={(e) => setRoom(e.target.value)}
          placeholder="room (default: global)"
          style={{ padding: 6, minWidth: 220 }}
        />
        <button className="btn-primary" onClick={joinRoom}>Join Room</button>
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
        <button className="btn-secondary" onClick={emitLocalAlert}>Emit Local Threat Alert</button>
        <button className="btn-success" onClick={startCall}>Call Start (backend)</button>
        <button className="btn-warning" onClick={endCall}>Call End (backend)</button>
      </div>

      <div>
        <h3>Event Log</h3>
        <div style={{ border: '1px solid #ddd', borderRadius: 6, padding: 8, maxHeight: 300, overflow: 'auto' }}>
          {log.length === 0 ? (
            <div style={{ color: '#777' }}>No events yet</div>
          ) : (
            <ul style={{ margin: 0, paddingLeft: 16 }}>
              {log.map((l, idx) => (
                <li key={idx} style={{ fontFamily: 'monospace' }}>{l}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default DevRealtime;


