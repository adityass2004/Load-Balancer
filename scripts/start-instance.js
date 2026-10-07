const port = process.env.PORT || '3000';
const { spawn } = require('child_process');
const npx = process.platform === 'win32' ? 'npx.cmd' : 'npx';

const child = spawn('npx', ['next', 'start', '-p', port], {
  shell: true,
  env: {
    ...process.env,
    PORT: port,
    RATE_LIMIT_PROXY_IP_MAX: process.env.RATE_LIMIT_PROXY_IP_MAX || '20',
    REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
  },
  stdio: 'inherit',
});

child.on('exit', (code) => process.exit(code || 0));
