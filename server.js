const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');
const { spawn, exec, execSync } = require('child_process');
const cors = require('cors');

const PORT = process.env.PORT || 4000;
const CONFIG_PATH = path.join(__dirname, 'config', 'services.json');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Memory state
let servicesConfig = [];
const activeProcesses = new Map(); // serviceId -> childProcess
const serviceLogs = new Map();     // serviceId -> array of log strings
const serviceState = new Map();    // serviceId -> { status, pid, startTime, uptime, exitCode }
const manualStops = new Set();     // serviceId -> boolean (prevent auto-restart when manually stopped)
const crashCounts = new Map();     // serviceId -> { count, lastCrashTime }

function sendCrashNotification(serviceName, exitCode, webhookUrl) {
  if (!webhookUrl) return;
  try {
    const url = new URL(webhookUrl);
    const postData = JSON.stringify({
      content: `⚠️ **Bot Launchpad Alert**: Service **${serviceName}** crashed with exit code \`${exitCode}\`.`,
      text: `⚠️ Bot Launchpad Alert: Service ${serviceName} crashed with exit code ${exitCode}.`
    });

    const options = {
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname + url.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const httpModule = url.protocol === 'https:' ? require('https') : require('http');
    const req = httpModule.request(options);
    req.on('error', () => {});
    req.write(postData);
    req.end();
  } catch (e) {}
}

// Load configuration
function loadServices() {
  try {
    if (fs.existsSync(CONFIG_PATH)) {
      const raw = fs.readFileSync(CONFIG_PATH, 'utf-8');
      servicesConfig = JSON.parse(raw);
    } else {
      servicesConfig = [];
    }
  } catch (err) {
    console.error('Error reading services.json:', err);
    servicesConfig = [];
  }

  // Initialize state map for all services
  servicesConfig.forEach(s => {
    if (!serviceLogs.has(s.id)) serviceLogs.set(s.id, []);
    if (!serviceState.has(s.id)) {
      serviceState.set(s.id, {
        status: s.enabled ? 'stopped' : 'disabled',
        pid: null,
        startTime: null,
        exitCode: null
      });
    }
  });
}

function saveServices() {
  try {
    const dir = path.dirname(CONFIG_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(servicesConfig, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving services.json:', err);
  }
}

// WebSocket broadcasting
function broadcast(data) {
  const message = JSON.stringify(data);
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

function appendLog(serviceId, text, type = 'stdout') {
  const logs = serviceLogs.get(serviceId) || [];
  const lines = text.toString().split(/\r?\n/);
  const now = new Date().toLocaleTimeString();

  lines.forEach(line => {
    if (line.trim().length === 0) return;
    const formatted = `[${now}] [${type.toUpperCase()}] ${line}`;
    logs.push({ timestamp: now, type, text: line, raw: formatted });
    if (logs.length > 500) logs.shift();

    broadcast({
      event: 'log',
      serviceId,
      log: { timestamp: now, type, text: line, raw: formatted }
    });
  });

  serviceLogs.set(serviceId, logs);
}

function updateState(serviceId, updates) {
  const currentState = serviceState.get(serviceId) || { status: 'stopped', pid: null };
  const newState = { ...currentState, ...updates };
  serviceState.set(serviceId, newState);

  broadcast({
    event: 'status_change',
    serviceId,
    state: newState
  });
}

// Live RAM Resource Monitor for Active Bot Processes
function pollResourceMetrics() {
  if (activeProcesses.size === 0) return;
  activeProcesses.forEach((child, serviceId) => {
    if (!child || !child.pid) return;
    exec(`tasklist /FI "PID eq ${child.pid}" /FO CSV /NH`, (err, stdout) => {
      if (err || !stdout || stdout.includes('No tasks')) return;
      const match = stdout.match(/"([^"]+)"\s*,\s*"(\d+)"\s*,\s*"([^"]+)"\s*,\s*"(\d+)"\s*,\s*"([^"]+)"/);
      if (match && match[5]) {
        const memKbStr = match[5].replace(/[^\d]/g, '');
        const memKb = parseInt(memKbStr, 10);
        if (!isNaN(memKb)) {
          const ramMb = (memKb / 1024).toFixed(1);
          updateState(serviceId, { ramMb: `${ramMb} MB` });
        }
      }
    });
  });
}

// Scheduler timer checking every 60 seconds
function checkScheduledTasks() {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();

  servicesConfig.forEach(s => {
    if (!s.enabled || !s.scheduleTime) return;
    const parts = s.scheduleTime.split(':');
    if (parts.length === 2) {
      const targetHour = parseInt(parts[0], 10);
      const targetMin = parseInt(parts[1], 10);
      if (currentHour === targetHour && currentMinute === targetMin) {
        if (!activeProcesses.has(s.id)) {
          appendLog(s.id, `⏰ Scheduled auto-start triggered (${s.scheduleTime})`, 'system');
          try { startService(s.id); } catch (e) {}
        }
      }
    }
  });
}

setInterval(checkScheduledTasks, 60000);

setInterval(pollResourceMetrics, 3000);

// Process Management
function startService(serviceId) {
  const config = servicesConfig.find(s => s.id === serviceId);
  if (!config) throw new Error('Service not found');
  if (!config.enabled) throw new Error('Service is disabled');

  if (activeProcesses.has(serviceId)) {
    return { message: 'Already running' };
  }

  manualStops.delete(serviceId);
  appendLog(serviceId, `=== Starting ${config.name}... ===`, 'system');
  updateState(serviceId, { status: 'starting', pid: null, startTime: Date.now() });

  try {
    const cwd = config.cwd || process.cwd();
    // Spawn shell command in Windows
    const child = spawn(config.command, [], {
      cwd,
      shell: true,
      windowsHide: false,
      env: { ...process.env, ...(config.env || {}) }
    });

    activeProcesses.set(serviceId, child);
    updateState(serviceId, { status: 'running', pid: child.pid, startTime: Date.now() });

    child.stdout.on('data', data => {
      appendLog(serviceId, data.toString(), 'stdout');
    });

    child.stderr.on('data', data => {
      appendLog(serviceId, data.toString(), 'stderr');
    });

    child.on('error', err => {
      appendLog(serviceId, `Spawn error: ${err.message}`, 'error');
      updateState(serviceId, { status: 'error', pid: null, exitCode: -1 });
      activeProcesses.delete(serviceId);
    });

    child.on('exit', (code, signal) => {
      appendLog(serviceId, `=== Process exited with code ${code} (signal: ${signal}) ===`, 'system');
      activeProcesses.delete(serviceId);

      const isManual = manualStops.has(serviceId);
      manualStops.delete(serviceId);

      const isCrash = !isManual && code !== 0 && code !== null;
      updateState(serviceId, {
        status: isCrash ? 'crashed' : 'stopped',
        pid: null,
        exitCode: code
      });

      if (isCrash) {
        sendCrashNotification(config.name, code, config.webhookUrl);
      }

      // Auto-restart handling ONLY if process crashed unexpectedly (not manually stopped)
      if (isCrash && config.autoRestart) {
        const now = Date.now();
        const crashInfo = crashCounts.get(serviceId) || { count: 0, lastCrashTime: 0 };
        if (now - crashInfo.lastCrashTime > 30000) crashInfo.count = 0;
        crashInfo.count++;
        crashInfo.lastCrashTime = now;
        crashCounts.set(serviceId, crashInfo);

        if (crashInfo.count >= 5) {
          appendLog(serviceId, `⚠️ Process crashed ${crashInfo.count} times in a row. Auto-restart paused. Fix the issue and click Start manually.`, 'error');
          return;
        }

        appendLog(serviceId, `Auto-restart triggered (Attempt ${crashInfo.count}/5). Restarting in 3 seconds...`, 'system');
        setTimeout(() => {
          if (!activeProcesses.has(serviceId) && !manualStops.has(serviceId) && config.enabled) {
            startService(serviceId);
          }
        }, 3000);
      } else {
        crashCounts.delete(serviceId);
      }
    });

    return { status: 'running', pid: child.pid };
  } catch (err) {
    appendLog(serviceId, `Failed to launch: ${err.message}`, 'error');
    updateState(serviceId, { status: 'error', pid: null });
    throw err;
  }
}

function stopService(serviceId) {
  const child = activeProcesses.get(serviceId);
  const config = servicesConfig.find(s => s.id === serviceId);

  manualStops.add(serviceId);

  if (!child) {
    updateState(serviceId, { status: 'stopped', pid: null });
    return { message: 'Not running' };
  }

  appendLog(serviceId, `=== Stopping ${config ? config.name : serviceId}... ===`, 'system');

  if (process.platform === 'win32' && child.pid) {
    try {
      execSync(`taskkill /pid ${child.pid} /T /F`, { stdio: 'ignore' });
    } catch (err) {
      try { child.kill('SIGKILL'); } catch (e) {}
    }
  } else {
    child.kill('SIGTERM');
  }

  activeProcesses.delete(serviceId);
  updateState(serviceId, { status: 'stopped', pid: null });
  return { status: 'stopped' };
}

// REST API Endpoints

// Get all services + status
app.get('/api/services', (req, res) => {
  const result = servicesConfig.map(s => {
    const state = serviceState.get(s.id) || { status: 'stopped' };
    const logs = serviceLogs.get(s.id) || [];
    return {
      ...s,
      state,
      logCount: logs.length
    };
  });
  res.json(result);
});

// Create new service
app.post('/api/services', (req, res) => {
  const { name, category, cwd, command, icon, autoStart, autoRestart, env } = req.body;
  if (!name || !command) {
    return res.status(400).json({ error: 'Name and Command are required' });
  }

  const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `service-${Date.now()}`;
  const newService = {
    id,
    name,
    category: category || 'Custom Task',
    cwd: cwd || process.cwd(),
    command,
    icon: icon || '⚡',
    autoStart: !!autoStart,
    autoRestart: !!autoRestart,
    enabled: true,
    env: env || {}
  };

  servicesConfig.push(newService);
  saveServices();

  serviceLogs.set(id, []);
  serviceState.set(id, { status: 'stopped', pid: null, startTime: null });

  broadcast({ event: 'service_added', service: newService });
  res.json(newService);
});

// Update service
app.put('/api/services/:id', (req, res) => {
  const { id } = req.params;
  const index = servicesConfig.findIndex(s => s.id === id);
  if (index === -1) return res.status(404).json({ error: 'Service not found' });

  const updated = { ...servicesConfig[index], ...req.body, id };
  servicesConfig[index] = updated;
  saveServices();

  broadcast({ event: 'service_updated', service: updated });
  res.json(updated);
});

// Delete service
app.delete('/api/services/:id', (req, res) => {
  const { id } = req.params;
  stopService(id);

  servicesConfig = servicesConfig.filter(s => s.id !== id);
  saveServices();
  serviceLogs.delete(id);
  serviceState.delete(id);

  broadcast({ event: 'service_deleted', id });
  res.json({ success: true });
});

// Get .env file content for service
app.get('/api/services/:id/env', (req, res) => {
  const { id } = req.params;
  const config = servicesConfig.find(s => s.id === id);
  if (!config) return res.status(404).json({ error: 'Service not found' });

  const envPath = path.join(config.cwd || process.cwd(), '.env');
  try {
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf-8');
      res.json({ exists: true, content, envPath });
    } else {
      res.json({ exists: false, content: '', envPath });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Save .env file content for service
app.post('/api/services/:id/env', (req, res) => {
  const { id } = req.params;
  const { content } = req.body;
  const config = servicesConfig.find(s => s.id === id);
  if (!config) return res.status(404).json({ error: 'Service not found' });

  const envPath = path.join(config.cwd || process.cwd(), '.env');
  try {
    fs.writeFileSync(envPath, content || '', 'utf-8');
    appendLog(id, `🔑 .env file updated via dashboard`, 'system');
    res.json({ success: true, envPath });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start service
app.post('/api/services/:id/start', (req, res) => {
  try {
    const result = startService(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Stop service
app.post('/api/services/:id/stop', (req, res) => {
  try {
    const result = stopService(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Restart service
app.post('/api/services/:id/restart', (req, res) => {
  const id = req.params.id;
  stopService(id);
  setTimeout(() => {
    try {
      const result = startService(id);
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }, 1000);
});

// Clear logs for service
app.post('/api/services/:id/clear-logs', (req, res) => {
  serviceLogs.set(req.params.id, []);
  broadcast({ event: 'logs_cleared', serviceId: req.params.id });
  res.json({ success: true });
});

// Full shutdown endpoint (stop all bots and exit server)
app.post('/api/shutdown', (req, res) => {
  res.json({ message: 'Shutting down all processes and server...' });
  cleanupAllProcesses();
  setTimeout(() => process.exit(0), 500);
});

// Clear logs for service
app.post('/api/services/:id/clear-logs', (req, res) => {
  serviceLogs.set(req.params.id, []);
  broadcast({ event: 'logs_cleared', serviceId: req.params.id });
  res.json({ success: true });
});

// Clean shutdown handler for all spawned bot processes
function cleanupAllProcesses() {
  if (activeProcesses.size === 0) return;
  console.log(`\nStopping ${activeProcesses.size} active bot process(es)...`);
  activeProcesses.forEach((child, serviceId) => {
    try {
      if (process.platform === 'win32' && child.pid) {
        execSync(`taskkill /pid ${child.pid} /T /F`, { stdio: 'ignore' });
      } else {
        child.kill('SIGKILL');
      }
    } catch (e) {
      console.error(`Error stopping service ${serviceId}:`, e.message);
    }
  });
  activeProcesses.clear();
}

process.on('SIGINT', () => {
  cleanupAllProcesses();
  setTimeout(() => process.exit(0), 500);
});

process.on('SIGTERM', () => {
  cleanupAllProcesses();
  setTimeout(() => process.exit(0), 500);
});

process.on('exit', () => {
  cleanupAllProcesses();
});

// Initialize and start server
loadServices();

server.listen(PORT, () => {
  console.log(`===================================================`);
  console.log(`  Bot & Script Manager Dashboard running on:`);
  console.log(`  http://localhost:${PORT}`);
  console.log(`===================================================`);

  // Auto-start marked services
  servicesConfig.forEach(s => {
    if (s.enabled && s.autoStart) {
      console.log(`Auto-starting service: ${s.name}`);
      try { startService(s.id); } catch (e) {}
    }
  });
});
