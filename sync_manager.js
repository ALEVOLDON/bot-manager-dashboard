const { spawn, execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

function resolveExistingPath(paths) {
  for (const p of paths) {
    if (fs.existsSync(p)) return p;
  }
  return paths[0];
}

const ADB_PATH = resolveExistingPath([
  path.join('D:', '_CODE_2026_', 'H96_Remote_Control', 'adb.exe'),
  path.join('C:', 'Users', 'alevo', 'Desktop', 'H96_Remote_Control', 'adb.exe')
]);
const SCRCPY_PATH = resolveExistingPath([
  path.join('D:', '_CODE_2026_', 'H96_Remote_Control', 'scrcpy.exe'),
  path.join('C:', 'Users', 'alevo', 'Desktop', 'H96_Remote_Control', 'scrcpy.exe')
]);
const SYNC_CODE_PY = resolveExistingPath([
  path.join('D:', '_CODE_2026_', 'H96_TV_Box_Project', 'sync_all_to_box.py'),
  path.join('C:', 'Users', 'alevo', 'Desktop', 'H96_TV_Box_Project', 'sync_all_to_box.py')
]);
const SYNC_POSTS_PY = resolveExistingPath([
  path.join('D:', '_CODE_2026_', 'H96_TV_Box_Project', 'sync_posts_from_box.py'),
  path.join('C:', 'Users', 'alevo', 'Desktop', 'H96_TV_Box_Project', 'sync_posts_from_box.py')
]);
const LOCAL_POSTS_DIR = resolveExistingPath([
  path.join('D:', '_CODE_2026_', 'obsidian_posts_smart_tags', 'posts'),
  path.join('C:', 'Users', 'alevo', 'Desktop', 'obsidian_posts_smart_tags', 'posts')
]);

let isSyncing = false;
let lastSyncResult = { time: null, newPosts: 0, updatedPosts: 0, totalPosts: 0, status: 'idle' };

function countLocalPosts() {
  try {
    let count = 0;
    function walk(dir) {
      if (!fs.existsSync(dir)) return;
      const items = fs.readdirSync(dir);
      for (const it of items) {
        const full = path.join(dir, it);
        const st = fs.statSync(full);
        if (st.isDirectory()) walk(full);
        else if (it.endsWith('.md')) count++;
      }
    }
    walk(LOCAL_POSTS_DIR);
    return count;
  } catch (e) {
    return 0;
  }
}

async function checkTvBoxOnline(boxIp = '192.168.0.103') {
  if (process.platform !== 'win32') return false;
  return new Promise((resolve) => {
    const child = spawn(ADB_PATH, ['connect', `${boxIp}:5555`], { timeout: 3000 });
    let out = '';
    child.stdout.on('data', d => out += d);
    child.on('close', () => {
      resolve(out.includes('connected') || out.includes('already'));
    });
    child.on('error', () => resolve(false));
  });
}

async function syncVaultFromBox() {
  if (process.platform !== 'win32') return { success: false, reason: 'Not running on Windows' };
  if (isSyncing) return { success: false, reason: 'Sync already in progress' };

  isSyncing = true;
  lastSyncResult.status = 'syncing';

  return new Promise((resolve) => {
    const child = spawn('python', [SYNC_POSTS_PY], {
      windowsHide: true,
      env: { ...process.env, PYTHONIOENCODING: 'utf-8' }
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', d => stdout += d.toString());
    child.stderr.on('data', d => stderr += d.toString());

    child.on('close', (code) => {
      isSyncing = false;
      const totalPosts = countLocalPosts();
      
      let newPosts = 0;
      let updatedPosts = 0;

      const newMatch = stdout.match(/New posts:\s*(\d+)/i);
      const updMatch = stdout.match(/Updated posts:\s*(\d+)/i);
      if (newMatch) newPosts = parseInt(newMatch[1], 10);
      if (updMatch) updatedPosts = parseInt(updMatch[1], 10);

      lastSyncResult = {
        time: Date.now(),
        newPosts,
        updatedPosts,
        totalPosts,
        status: code === 0 ? 'success' : 'error',
        log: stdout || stderr
      };

      resolve({
        success: code === 0,
        newPosts,
        updatedPosts,
        totalPosts,
        log: stdout,
        error: stderr
      });
    });

    child.on('error', (err) => {
      isSyncing = false;
      lastSyncResult = { time: Date.now(), status: 'error', error: err.message };
      resolve({ success: false, error: err.message });
    });
  });
}

async function syncCodeToBox() {
  if (process.platform !== 'win32') return { success: false, reason: 'Not running on Windows' };
  return new Promise((resolve) => {
    const child = spawn('python', [SYNC_CODE_PY], {
      windowsHide: true,
      env: { ...process.env, PYTHONIOENCODING: 'utf-8' }
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', d => stdout += d.toString());
    child.stderr.on('data', d => stderr += d.toString());

    child.on('close', (code) => {
      resolve({
        success: code === 0,
        output: stdout,
        error: stderr
      });
    });
  });
}

function launchRemoteScreen(boxIp = '192.168.0.103') {
  if (process.platform !== 'win32') return { success: false };
  try {
    const startScript = resolveExistingPath([
      path.join('D:', '_CODE_2026_', 'H96_Remote_Control', 'start_remote.bat'),
      path.join('C:', 'Users', 'alevo', 'Desktop', 'H96_Remote_Control', 'start_remote.bat')
    ]);
    spawn('cmd.exe', ['/c', startScript], {
      detached: true,
      stdio: 'ignore',
      cwd: path.dirname(startScript)
    }).unref();
    return { success: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

module.exports = {
  countLocalPosts,
  checkTvBoxOnline,
  syncVaultFromBox,
  syncCodeToBox,
  launchRemoteScreen,
  getLastSyncResult: () => ({ ...lastSyncResult, totalPosts: countLocalPosts() })
};
