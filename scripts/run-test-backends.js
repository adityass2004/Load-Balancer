const { spawn } = require('child_process');
const http = require('http');
const path = require('path');

const ports = [4001, 4002, 4003];
const children = {};

function startServer(port) {
  if (children[port]) return children[port];
  const i = ports.indexOf(port);
  const serverId = `server-${i + 1}`;
  const serverScript = path.resolve(__dirname, '../test-backend/server.js');

  const child = spawn('node', [serverScript], {
    env: {
      ...process.env,
      PORT: String(port),
      SERVER_ID: serverId,
      ENABLE_TEST_FAILURES: 'true',
    },
    stdio: 'inherit',
  });

  children[port] = child;
  console.log(`[TEST-BACKENDS] Started ${serverId} on port ${port} (PID: ${child.pid})`);
  return child;
}

function stopServer(port) {
  if (children[port]) {
    try {
      children[port].kill();
    } catch {}
    delete children[port];
    console.log(`[TEST-BACKENDS] Stopped server on port ${port}`);
  }
}

ports.forEach(startServer);

const controlServer = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost:4000');
  res.setHeader('Content-Type', 'application/json');

  if (url.pathname.startsWith('/stop/')) {
    const port = parseInt(url.pathname.replace('/stop/', ''), 10);
    stopServer(port);
    res.end(JSON.stringify({ ok: true, stopped: port }));
  } else if (url.pathname.startsWith('/start/')) {
    const port = parseInt(url.pathname.replace('/start/', ''), 10);
    startServer(port);
    res.end(JSON.stringify({ ok: true, started: port }));
  } else {
    res.end(JSON.stringify({ running: Object.keys(children).map(Number) }));
  }
});

controlServer.listen(4000, '0.0.0.0', () => {
  console.log('[TEST-BACKENDS] Controller listening on 0.0.0.0:4000');
});

process.on('SIGINT', () => {
  Object.keys(children).forEach((p) => stopServer(Number(p)));
  process.exit(0);
});

process.on('SIGTERM', () => {
  Object.keys(children).forEach((p) => stopServer(Number(p)));
  process.exit(0);
});
