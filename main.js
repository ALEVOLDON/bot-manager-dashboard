const { spawn, exec } = require('child_process');
const http = require('http');
const path = require('path');

const PORT = 4000;
const APP_URL = `http://localhost:${PORT}`;

let serverProcess = null;

function launchDesktopWindow() {
  if (process.platform === 'win32') {
    // Launch using Edge App Mode (Standalone Window without browser tabs/address bar)
    const edgeAppCmd = `start msedge --app="${APP_URL}" --user-data-dir="%LOCALAPPDATA%\\BotLaunchpadData"`;
    exec(edgeAppCmd, (err) => {
      if (err) {
        exec(`start "" "${APP_URL}"`);
      }
    });
  } else {
    exec(`open "${APP_URL}"`);
  }
}

function startServerAndLaunch() {
  console.log('Starting Bot Launchpad Server...');
  serverProcess = spawn('node', ['server.js'], {
    cwd: __dirname,
    stdio: 'inherit',
    shell: true
  });

  checkServerReady(30);
}

function checkServerReady(retries) {
  if (retries <= 0) {
    console.error('Server start timeout.');
    process.exit(1);
  }

  http.get(APP_URL, (res) => {
    if (res.statusCode === 200) {
      console.log('Server is ready! Launching Desktop App Window...');
      launchDesktopWindow();
    } else {
      setTimeout(() => checkServerReady(retries - 1), 300);
    }
  }).on('error', () => {
    setTimeout(() => checkServerReady(retries - 1), 300);
  });
}

// 1. Check if server is already running before spawning a duplicate instance
http.get(APP_URL, (res) => {
  if (res.statusCode === 200) {
    console.log('Server is already running on port 4000. Opening App Window...');
    launchDesktopWindow();
  } else {
    startServerAndLaunch();
  }
}).on('error', () => {
  startServerAndLaunch();
});

function stopAll() {
  if (serverProcess && serverProcess.pid) {
    if (process.platform === 'win32') {
      exec(`taskkill /pid ${serverProcess.pid} /T /F`, () => {});
    } else {
      serverProcess.kill('SIGTERM');
    }
  }
}

process.on('SIGINT', () => {
  stopAll();
  setTimeout(() => process.exit(0), 300);
});

process.on('SIGTERM', () => {
  stopAll();
  setTimeout(() => process.exit(0), 300);
});

process.on('exit', () => {
  stopAll();
});
