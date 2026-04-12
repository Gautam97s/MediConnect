const REALTIME_PATH = '/ws/updates';

let socket = null;
let reconnectTimer = null;
const listeners = new Set();

function resolveRealtimeUrl() {
  const explicitBaseUrl = (process.env.NEXT_PUBLIC_WS_BASE_URL || '').trim();
  if (explicitBaseUrl) {
    return `${explicitBaseUrl.replace(/\/$/, '')}${REALTIME_PATH}`;
  }

  const apiBaseUrl = (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api').trim();
  const realtimeBaseUrl = apiBaseUrl
    .replace(/\/api\/?$/, '')
    .replace(/^http:/i, 'ws:')
    .replace(/^https:/i, 'wss:');

  return `${realtimeBaseUrl.replace(/\/$/, '')}${REALTIME_PATH}`;
}

function notifyListeners(message) {
  listeners.forEach((listener) => {
    try {
      listener(message);
    } catch {
      // Keep one broken listener from affecting the rest of the realtime subscribers.
    }
  });
}

function scheduleReconnect() {
  if (reconnectTimer || listeners.size === 0 || typeof window === 'undefined') {
    return;
  }

  reconnectTimer = window.setTimeout(() => {
    reconnectTimer = null;
    connect();
  }, 1500);
}

function connect() {
  if (typeof window === 'undefined' || socket) {
    return;
  }

  socket = new window.WebSocket(resolveRealtimeUrl());

  socket.addEventListener('message', (event) => {
    try {
      notifyListeners(JSON.parse(event.data));
    } catch {
      // Ignore malformed events rather than breaking the realtime connection.
    }
  });

  socket.addEventListener('close', () => {
    socket = null;
    scheduleReconnect();
  });

  socket.addEventListener('error', () => {
    if (socket && socket.readyState !== window.WebSocket.CLOSED) {
      socket.close();
    }
  });
}

function disconnectIfIdle() {
  if (listeners.size > 0) {
    return;
  }

  if (reconnectTimer && typeof window !== 'undefined') {
    window.clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }

  if (socket) {
    socket.close();
    socket = null;
  }
}

export function subscribeToRealtimeEvents(listener) {
  if (typeof listener !== 'function') {
    return () => {};
  }

  listeners.add(listener);
  connect();

  return () => {
    listeners.delete(listener);
    disconnectIfIdle();
  };
}
