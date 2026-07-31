let services = [];
let activeTerminalId = null;
let ws = null;

// i18n Dictionary
const translations = {
  ru: {
    subtitle: "Центр управления ботами и скриптами Windows",
    running: "Запущено",
    total: "Всего",
    addService: "Добавить новый бот / батник",
    shutdownAll: "Выключить всё",
    connectedProcesses: "Подключённые процессы и службы",
    searchPlaceholder: "🔍 Поиск бота...",
    loading: "Загрузка...",
    activeSummary: "{running} активных / {total} всего",
    terminalTitleDefault: "Консоль логов (Выберите процесс)",
    terminalBannerDefault: "=== Нажмите \"Логи\" на карточке любого бота для трансляции в реальном времени ===",
    autoscroll: "Автопрокрутка",
    exportLogs: "Скачать (.log)",
    copyLogs: "Копировать",
    clearLogs: "Очистить",
    logsCleared: "=== Логи очищены ===",
    logsCopied: "✅ Скопировано!",
    emptySearch: "Ничего не найдено по запросу",
    // Statuses
    statusRunning: "Работает",
    statusCrashed: "⚠️ Краш",
    statusStarting: "⏳ Запуск...",
    statusDisabled: "🚫 Отключен",
    statusStopped: "⏹️ Остановлен",
    code: "Код:",
    pid: "PID:",
    // Card buttons
    start: "Старт",
    stop: "Стоп",
    restart: "Перезапуск",
    logs: "Логи",
    env: ".env",
    schedule: "Расписание:",
    // Modals
    addTitle: "Добавить процесс / батник",
    editTitle: "Редактировать задачу",
    nameLabel: "Название задачи / бота *",
    namePlaceholder: "Например: Telegram Bot / Deploy Script",
    iconLabel: "Иконка (Emoji)",
    categoryLabel: "Категория",
    categoryPlaceholder: "Telegram Bot, Batch Script, Python Service...",
    commandLabel: "Команда запуска (Command) *",
    commandPlaceholder: "npm start ИЛИ python bot.py ИЛИ cmd /c script.bat",
    cwdLabel: "Рабочая директория (CWD)",
    cwdPlaceholder: "C:\\Users\\username\\Desktop\\my-bot",
    webhookLabel: "Webhook URL (уведомления в Discord / Telegram при крашах)",
    webhookPlaceholder: "https://discord.com/api/webhooks/...",
    scheduleLabel: "Время авто-запуска по расписанию (ЧЧ:ММ)",
    autoRestartLabel: "Перезапускать автоматически при краше (Auto-restart)",
    enabledLabel: "Включен",
    cancel: "Отмена",
    save: "Сохранить",
    envModalTitle: "Редактор .env файлов",
    saveEnv: "Сохранить .env",
    envLoading: "Загрузка .env файла...",
    envPath: "Путь к файлу:",
    envDefaultContent: "# Введите переменные окружения в формате KEY=VALUE\n",
    envSaved: "Файл .env успешно сохранён!",
    envSaveError: "Ошибка сохранения .env: ",
    confirmDelete: "Вы уверены, что хотите удалить \"{name}\" из списка?",
    confirmShutdown: "Вы действительно хотите остановить всех запущенных ботов и полностью закрыть программу?",
    logsNone: "=== Логи [{name}] пока отсутствуют ===",
    logsError: "❌ Ошибка загрузки логов: ",
    exportError: "Ошибка экспорта логов: ",
    startError: "Ошибка запуска: ",
    stopError: "Ошибка остановки: ",
    restartError: "Ошибка перезапуска: ",
    deleteError: "Ошибка удаления: ",
    saveError: "Ошибка сохранения: ",
    resizerTitle: "Зажмите и перетащите мышью для изменения ширины панелей"
  },
  en: {
    subtitle: "Windows Bot & Script Control Center",
    running: "Running",
    total: "Total",
    addService: "Add New Bot / Script",
    shutdownAll: "Shutdown All",
    connectedProcesses: "Connected Processes & Services",
    searchPlaceholder: "🔍 Search process...",
    loading: "Loading...",
    activeSummary: "{running} active / {total} total",
    terminalTitleDefault: "Log Console (Select a process)",
    terminalBannerDefault: "=== Click \"Logs\" on any process card for live streaming ===",
    autoscroll: "Autoscroll",
    exportLogs: "Export (.log)",
    copyLogs: "Copy",
    clearLogs: "Clear",
    logsCleared: "=== Logs cleared ===",
    logsCopied: "✅ Copied!",
    emptySearch: "No processes found matching",
    // Statuses
    statusRunning: "Running",
    statusCrashed: "⚠️ Crashed",
    statusStarting: "⏳ Starting...",
    statusDisabled: "🚫 Disabled",
    statusStopped: "⏹️ Stopped",
    code: "Code:",
    pid: "PID:",
    // Card buttons
    start: "Start",
    stop: "Stop",
    restart: "Restart",
    logs: "Logs",
    env: ".env",
    schedule: "Schedule:",
    // Modals
    addTitle: "Add Bot / Process",
    editTitle: "Edit Process",
    nameLabel: "Process / Bot Name *",
    namePlaceholder: "E.g., Telegram Bot / Deploy Script",
    iconLabel: "Icon (Emoji)",
    categoryLabel: "Category",
    categoryPlaceholder: "Telegram Bot, Batch Script, Python Service...",
    commandLabel: "Launch Command *",
    commandPlaceholder: "npm start OR python bot.py OR cmd /c script.bat",
    cwdLabel: "Working Directory (CWD)",
    cwdPlaceholder: "C:\\Users\\username\\Desktop\\my-bot",
    webhookLabel: "Webhook URL (Discord / Telegram crash alerts)",
    webhookPlaceholder: "https://discord.com/api/webhooks/...",
    scheduleLabel: "Scheduled Auto-Start Time (HH:MM)",
    autoRestartLabel: "Auto-restart on crash",
    enabledLabel: "Enabled",
    cancel: "Cancel",
    save: "Save",
    envModalTitle: "Edit .env File",
    saveEnv: "Save .env",
    envLoading: "Loading .env file...",
    envPath: "File path:",
    envDefaultContent: "# Enter environment variables as KEY=VALUE\n",
    envSaved: ".env file saved successfully!",
    envSaveError: "Error saving .env: ",
    confirmDelete: "Are you sure you want to delete \"{name}\"?",
    confirmShutdown: "Are you sure you want to stop all bots and shutdown the control panel?",
    logsNone: "=== No logs available for [{name}] yet ===",
    logsError: "❌ Error loading logs: ",
    exportError: "Error exporting logs: ",
    startError: "Error starting: ",
    stopError: "Error stopping: ",
    restartError: "Error restarting: ",
    deleteError: "Error deleting: ",
    saveError: "Error saving: ",
    resizerTitle: "Click and drag to resize panels"
  }
};

let currentLang = localStorage.getItem('bot_launchpad_lang_v2') || 'en';

function t(key, params = {}) {
  let str = (translations[currentLang] && translations[currentLang][key]) || (translations['en'][key]) || key;
  Object.keys(params).forEach(p => {
    str = str.replace(`{${p}}`, params[p]);
  });
  return str;
}

function applyLanguage() {
  const langIndicator = document.getElementById('lang-indicator');
  if (langIndicator) langIndicator.textContent = currentLang.toUpperCase();

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    el.textContent = t(key);
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    el.placeholder = t(key);
  });

  document.querySelectorAll('[data-i18n-title]').forEach(el => {
    const key = el.getAttribute('data-i18n-title');
    el.title = t(key);
  });

  updateStats();
  renderServices();
  renderTerminalTabs();

  if (activeTerminalId) {
    const s = services.find(x => x.id === activeTerminalId);
    if (s && terminalTitle) {
      terminalTitle.textContent = `${s.icon || '⚡'} ${t('logs')}: ${s.name}`;
    }
  } else if (terminalTitle) {
    terminalTitle.textContent = t('terminalTitleDefault');
  }
}

function toggleLanguage() {
  currentLang = currentLang === 'ru' ? 'en' : 'ru';
  localStorage.setItem('bot_launchpad_lang_v2', currentLang);
  applyLanguage();
}

// DOM Elements
const servicesGrid = document.getElementById('services-grid');
const runningCountEl = document.getElementById('running-count');
const totalCountEl = document.getElementById('total-count');
const servicesSummaryEl = document.getElementById('services-summary');

const terminalTitle = document.getElementById('current-terminal-title');
const terminalOutput = document.getElementById('terminal-output');
const autoscrollCheck = document.getElementById('autoscroll-check');
const btnCopyLogs = document.getElementById('btn-copy-logs');
const btnClearLogs = document.getElementById('btn-clear-logs');

const btnAddService = document.getElementById('btn-add-service');
const modalBackdrop = document.getElementById('service-modal');
const modalCloseBtn = document.getElementById('modal-close-btn');
const modalCancelBtn = document.getElementById('modal-cancel-btn');
const serviceForm = document.getElementById('service-form');
const modalTitle = document.getElementById('modal-title');
const btnLangToggle = document.getElementById('btn-lang-toggle');

if (btnLangToggle) {
  btnLangToggle.addEventListener('click', toggleLanguage);
}

// Initialize WebSocket connection
function initWebSocket() {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  ws = new WebSocket(`${protocol}//${window.location.host}`);

  ws.onopen = () => {
    console.log('WebSocket connected');
  };

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      handleWebSocketMessage(data);
    } catch (err) {
      console.error('WS error parsing:', err);
    }
  };

  ws.onclose = () => {
    console.warn('WS closed, reconnecting in 2s...');
    setTimeout(initWebSocket, 2000);
  };
}

function handleWebSocketMessage(data) {
  if (data.event === 'status_change') {
    const s = services.find(x => x.id === data.serviceId);
    if (s) {
      s.state = data.state;
      updateStats();
      renderServices();
    }
  } else if (data.event === 'log') {
    if (activeTerminalId === data.serviceId) {
      appendLogToTerminal(data.log);
    }
  } else if (data.event === 'service_added' || data.event === 'service_updated' || data.event === 'service_deleted') {
    fetchServices();
  } else if (data.event === 'logs_cleared') {
    if (activeTerminalId === data.serviceId) {
      terminalOutput.innerHTML = `<div class="log-line log-system">${t('logsCleared')}</div>`;
    }
  }
}

// Fetch all services from API
async function fetchServices() {
  try {
    const res = await fetch('/api/services');
    services = await res.json();
    updateStats();
    renderServices();

    // Auto select first running or first service if no active terminal selected
    if (!activeTerminalId && services.length > 0) {
      const running = services.find(s => s.state && s.state.status === 'running');
      selectTerminal(running ? running.id : services[0].id);
    }
  } catch (err) {
    console.error('Failed to fetch services:', err);
  }
}

function updateStats() {
  const total = services.length;
  const running = services.filter(s => s.state && s.state.status === 'running').length;

  runningCountEl.textContent = running;
  totalCountEl.textContent = total;
  servicesSummaryEl.textContent = t('activeSummary', { running, total });
}

let searchQuery = '';

const searchInput = document.getElementById('search-services');
if (searchInput) {
  searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value.toLowerCase().trim();
    renderServices();
  });
}

const btnExportLogs = document.getElementById('btn-export-logs');
if (btnExportLogs) {
  btnExportLogs.addEventListener('click', async () => {
    if (!activeTerminalId) return;
    try {
      const res = await fetch(`/api/services/${activeTerminalId}/logs`);
      const logs = await res.json();
      const content = logs.map(l => l.raw || l.text).join('\n');
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `${activeTerminalId}_logs_${Date.now()}.log`;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch (e) {
      alert(t('exportError') + e.message);
    }
  });
}

function formatUptime(startTime) {
  if (!startTime) return '';
  const seconds = Math.floor((Date.now() - startTime) / 1000);
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  const pad = n => String(n).padStart(2, '0');
  if (hrs > 0) return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
  return `${pad(mins)}:${pad(secs)}`;
}

function getLucideIconHtml(iconStr, categoryStr = '') {
  const cat = (categoryStr || '').toLowerCase();
  const icon = (iconStr || '').trim();

  if (icon === '🤖' || cat.includes('bot') || cat.includes('telegram')) return '<i data-lucide="bot"></i>';
  if (icon === '🌐' || cat.includes('network') || cat.includes('tunnel') || cat.includes('webhook')) return '<i data-lucide="globe"></i>';
  if (icon === '📝' || cat.includes('sync')) return '<i data-lucide="file-text"></i>';
  if (icon === '🚀' || cat.includes('deploy')) return '<i data-lucide="rocket"></i>';
  if (icon === '⚙️' || cat.includes('agent') || cat.includes('ai')) return '<i data-lucide="sparkles"></i>';
  
  return '<i data-lucide="zap"></i>';
}

// Render cards
function renderServices() {
  servicesGrid.innerHTML = '';

  const filtered = services.filter(s => {
    if (!searchQuery) return true;
    return (s.name && s.name.toLowerCase().includes(searchQuery)) ||
           (s.category && s.category.toLowerCase().includes(searchQuery)) ||
           (s.command && s.command.toLowerCase().includes(searchQuery));
  });

  if (filtered.length === 0) {
    servicesGrid.innerHTML = `<div class="empty-state">${t('emptySearch')} "${escapeHtml(searchQuery)}"</div>`;
    return;
  }

  filtered.forEach(s => {
    const card = document.createElement('div');
    const isSelected = activeTerminalId === s.id;
    card.className = `service-card ${isSelected ? 'active-terminal' : ''}`;

    const status = s.state ? s.state.status : 'stopped';
    const isRunning = status === 'running';
    const uptimeStr = isRunning && s.state.startTime ? ` ⏱️ ${formatUptime(s.state.startTime)}` : '';
    const ramStr = isRunning && s.state.ramMb ? ` | 🧠 ${s.state.ramMb}` : '';

    let statusPillHtml = '';
    if (status === 'running') {
      statusPillHtml = `<span class="status-pill running"><span class="pulse-dot"></span> ${t('statusRunning')} (${t('pid')} ${s.state.pid})${ramStr}${uptimeStr}</span>`;
    } else if (status === 'crashed') {
      statusPillHtml = `<span class="status-pill crashed">${t('statusCrashed')} (${t('code')} ${s.state.exitCode})</span>`;
    } else if (status === 'starting') {
      statusPillHtml = `<span class="status-pill starting">${t('statusStarting')}</span>`;
    } else if (!s.enabled) {
      statusPillHtml = `<span class="status-pill disabled">${t('statusDisabled')}</span>`;
    } else {
      statusPillHtml = `<span class="status-pill stopped">${t('statusStopped')}</span>`;
    }

    const iconHtml = getLucideIconHtml(s.icon, s.category);

    card.innerHTML = `
      <div class="card-top">
        <div class="card-info">
          <div class="card-icon">${iconHtml}</div>
          <div class="card-title">
            <h3>${escapeHtml(s.name)}</h3>
            <span class="card-category">${escapeHtml(s.category || 'Custom Task')}</span>
          </div>
        </div>
        ${statusPillHtml}
      </div>

      <div class="card-command">
        <code>${escapeHtml(s.command)}</code>
      </div>

      ${s.scheduleTime ? `<div class="card-schedule">⏰ ${t('schedule')} ${escapeHtml(s.scheduleTime)}</div>` : ''}

      <div class="card-actions">
        <div class="action-btns">
          ${isRunning 
            ? `<button class="btn btn-sm btn-danger-ghost" onclick="stopService('${s.id}')"><i data-lucide="square"></i> ${t('stop')}</button>`
            : `<button class="btn btn-sm btn-primary" onclick="startService('${s.id}')" ${!s.enabled ? 'disabled' : ''}><i data-lucide="play"></i> ${t('start')}</button>`
          }
          <button class="btn btn-sm btn-ghost" onclick="restartService('${s.id}')"><i data-lucide="rotate-cw"></i> ${t('restart')}</button>
        </div>

        <div class="action-btns">
          <button class="btn btn-sm ${isSelected ? 'btn-primary' : 'btn-ghost'}" onclick="selectTerminal('${s.id}')">
            <i data-lucide="terminal"></i> ${t('logs')}
          </button>
          <button class="btn btn-sm btn-ghost" onclick="openEnvModal('${s.id}')"><i data-lucide="key"></i> ${t('env')}</button>
          <button class="btn btn-sm btn-ghost" onclick="openEditModal('${s.id}')"><i data-lucide="settings"></i></button>
          <button class="btn btn-sm btn-danger-ghost" onclick="deleteService('${s.id}')"><i data-lucide="trash-2"></i></button>
        </div>
      </div>
    `;

    servicesGrid.appendChild(card);
  });

  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    window.lucide.createIcons();
  }
}

// Live Uptime Ticker every second
setInterval(() => {
  const hasRunning = services.some(s => s.state && s.state.status === 'running');
  if (hasRunning) renderServices();
}, 1000);

// Service Actions API calls
async function startService(id) {
  try {
    await fetch(`/api/services/${id}/start`, { method: 'POST' });
    selectTerminal(id);
  } catch (err) {
    alert(t('startError') + err.message);
  }
}

async function stopService(id) {
  try {
    await fetch(`/api/services/${id}/stop`, { method: 'POST' });
  } catch (err) {
    alert(t('stopError') + err.message);
  }
}

async function restartService(id) {
  try {
    await fetch(`/api/services/${id}/restart`, { method: 'POST' });
    selectTerminal(id);
  } catch (err) {
    alert(t('restartError') + err.message);
  }
}

async function deleteService(id) {
  const s = services.find(x => x.id === id);
  if (!confirm(t('confirmDelete', { name: s ? s.name : id }))) return;

  try {
    await fetch(`/api/services/${id}`, { method: 'DELETE' });
    if (activeTerminalId === id) {
      activeTerminalId = null;
      terminalTitle.textContent = t('terminalTitleDefault');
      terminalOutput.innerHTML = '';
    }
  } catch (err) {
    alert(t('deleteError') + err.message);
  }
}

let openTerminalTabs = [];

function renderTerminalTabs() {
  const tabsBar = document.getElementById('terminal-tabs-bar');
  if (!tabsBar) return;

  if (openTerminalTabs.length === 0) {
    tabsBar.style.display = 'none';
    return;
  }

  tabsBar.style.display = 'flex';
  tabsBar.innerHTML = '';

  openTerminalTabs.forEach(id => {
    const s = services.find(x => x.id === id);
    if (!s) return;

    const tab = document.createElement('div');
    const isActive = activeTerminalId === id;
    tab.className = `tab-item ${isActive ? 'active' : ''}`;
    
    tab.onclick = () => selectTerminal(s.id);
    tab.innerHTML = `
      <span class="tab-title">${s.icon || '⚡'} ${escapeHtml(s.name)}</span>
      <span class="tab-close" onclick="closeTerminalTab(event, '${s.id}')">&times;</span>
    `;

    tabsBar.appendChild(tab);
  });
}

function closeTerminalTab(event, id) {
  event.stopPropagation();
  openTerminalTabs = openTerminalTabs.filter(x => x !== id);
  if (activeTerminalId === id) {
    if (openTerminalTabs.length > 0) {
      selectTerminal(openTerminalTabs[openTerminalTabs.length - 1]);
    } else {
      activeTerminalId = null;
      terminalTitle.textContent = t('terminalTitleDefault');
      terminalOutput.innerHTML = `<div class="log-line log-system">${t('terminalBannerDefault')}</div>`;
      renderServices();
    }
  }
  renderTerminalTabs();
}

// Select terminal to display logs
async function selectTerminal(id) {
  if (!openTerminalTabs.includes(id)) {
    openTerminalTabs.push(id);
  }
  activeTerminalId = id;
  const s = services.find(x => x.id === id);

  if (s) {
    terminalTitle.textContent = `${s.icon || '⚡'} ${t('logs')}: ${s.name}`;
  }
  renderTerminalTabs();
  renderServices();

  try {
    const res = await fetch(`/api/services/${id}/logs`);
    const logs = await res.json();
    
    if (activeTerminalId !== id) return;

    terminalOutput.innerHTML = '';
    if (!Array.isArray(logs) || logs.length === 0) {
      terminalOutput.innerHTML = `<div class="log-line log-system">${t('logsNone', { name: s ? s.name : id })}</div>`;
    } else {
      logs.forEach(log => appendLogToTerminal(log));
    }
  } catch (err) {
    console.error('Failed to load logs:', err);
    terminalOutput.innerHTML = `<div class="log-line log-error">${t('logsError')}${escapeHtml(err.message)}</div>`;
  }
}

function appendLogToTerminal(log) {
  if (!log) return;
  const div = document.createElement('div');
  const type = (typeof log === 'object' && log.type) ? log.type : 'stdout';
  const text = (typeof log === 'string') ? log : (log.raw || log.text || JSON.stringify(log));

  div.className = `log-line log-${type}`;
  div.textContent = text;
  terminalOutput.appendChild(div);

  if (autoscrollCheck && autoscrollCheck.checked) {
    terminalOutput.scrollTop = terminalOutput.scrollHeight;
  }
}

// Copy & Clear terminal logs
btnCopyLogs.addEventListener('click', () => {
  const text = terminalOutput.innerText;
  navigator.clipboard.writeText(text).then(() => {
    const origText = btnCopyLogs.querySelector('span') ? btnCopyLogs.querySelector('span').textContent : btnCopyLogs.textContent;
    const span = btnCopyLogs.querySelector('span');
    if (span) span.textContent = t('logsCopied');
    else btnCopyLogs.textContent = t('logsCopied');
    setTimeout(() => {
      if (span) span.textContent = t('copyLogs');
      else btnCopyLogs.textContent = t('copyLogs');
    }, 1500);
  });
});

btnClearLogs.addEventListener('click', async () => {
  if (!activeTerminalId) return;
  await fetch(`/api/services/${activeTerminalId}/clear-logs`, { method: 'POST' });
});

// Modal Logic
btnAddService.addEventListener('click', () => {
  openAddModal();
});

modalCloseBtn.addEventListener('click', closeModal);
modalCancelBtn.addEventListener('click', closeModal);

function openAddModal() {
  modalTitle.textContent = t('addTitle');
  document.getElementById('service-id').value = '';
  document.getElementById('form-name').value = '';
  document.getElementById('form-icon').value = '⚡';
  document.getElementById('form-category').value = '';
  document.getElementById('form-command').value = '';
  document.getElementById('form-cwd').value = '';
  document.getElementById('form-webhook').value = '';
  document.getElementById('form-schedule').value = '';
  document.getElementById('form-auto-restart').checked = true;
  document.getElementById('form-enabled').checked = true;
  modalBackdrop.classList.remove('hidden');
}

function openEditModal(id) {
  const s = services.find(x => x.id === id);
  if (!s) return;

  modalTitle.textContent = t('editTitle');
  document.getElementById('service-id').value = s.id;
  document.getElementById('form-name').value = s.name;
  document.getElementById('form-icon').value = s.icon || '⚡';
  document.getElementById('form-category').value = s.category || '';
  document.getElementById('form-command').value = s.command;
  document.getElementById('form-cwd').value = s.cwd || '';
  document.getElementById('form-webhook').value = s.webhookUrl || '';
  document.getElementById('form-schedule').value = s.scheduleTime || '';
  document.getElementById('form-auto-restart').checked = !!s.autoRestart;
  document.getElementById('form-enabled').checked = !!s.enabled;
  modalBackdrop.classList.remove('hidden');
}

function closeModal() {
  modalBackdrop.classList.add('hidden');
}

serviceForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const id = document.getElementById('service-id').value;
  const data = {
    name: document.getElementById('form-name').value,
    icon: document.getElementById('form-icon').value || '⚡',
    category: document.getElementById('form-category').value || 'Custom Task',
    command: document.getElementById('form-command').value,
    cwd: document.getElementById('form-cwd').value,
    webhookUrl: document.getElementById('form-webhook').value,
    scheduleTime: document.getElementById('form-schedule').value,
    autoRestart: document.getElementById('form-auto-restart').checked,
    enabled: document.getElementById('form-enabled').checked
  };

  try {
    if (id) {
      await fetch(`/api/services/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    } else {
      await fetch('/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    }
    closeModal();
    fetchServices();
  } catch (err) {
    alert(t('saveError') + err.message);
  }
});

// .env Editor Modal Logic
const envModal = document.getElementById('env-modal');
const envModalCloseBtn = document.getElementById('env-modal-close-btn');
const envModalCancelBtn = document.getElementById('env-modal-cancel-btn');
const envModalSaveBtn = document.getElementById('env-modal-save-btn');
const envEditorTextarea = document.getElementById('env-content-editor');
const envPathHint = document.getElementById('env-path-hint');
const envServiceIdInput = document.getElementById('env-service-id');

if (envModalCloseBtn) envModalCloseBtn.addEventListener('click', closeEnvModal);
if (envModalCancelBtn) envModalCancelBtn.addEventListener('click', closeEnvModal);

async function openEnvModal(id) {
  const s = services.find(x => x.id === id);
  if (!s) return;

  envServiceIdInput.value = id;
  envPathHint.textContent = t('envLoading');
  envEditorTextarea.value = '';
  envModal.classList.remove('hidden');

  try {
    const res = await fetch(`/api/services/${id}/env`);
    const data = await res.json();
    envPathHint.textContent = `${t('envPath')} ${data.envPath}`;
    envEditorTextarea.value = data.content || t('envDefaultContent');
  } catch (err) {
    envPathHint.textContent = t('envSaveError');
  }
}

function closeEnvModal() {
  if (envModal) envModal.classList.add('hidden');
}

if (envModalSaveBtn) {
  envModalSaveBtn.addEventListener('click', async () => {
    const id = envServiceIdInput.value;
    const content = envEditorTextarea.value;
    try {
      await fetch(`/api/services/${id}/env`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      });
      alert(t('envSaved'));
      closeEnvModal();
    } catch (err) {
      alert(t('envSaveError') + err.message);
    }
  });
}

// Helper
function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

// Shutdown All Button Event Listener
const btnShutdownAll = document.getElementById('btn-shutdown-all');
if (btnShutdownAll) {
  btnShutdownAll.addEventListener('click', async () => {
    if (confirm(t('confirmShutdown'))) {
      try {
        await fetch('/api/shutdown', { method: 'POST' });
      } catch (e) {}
      window.close();
    }
  });
}

// Draggable Layout Resizer Logic
function initResizer() {
  const resizer = document.getElementById('resizer-bar');
  const mainLayout = document.querySelector('.main-layout');
  if (!resizer || !mainLayout) return;

  const savedWidth = localStorage.getItem('bot_launchpad_panel_width');
  if (savedWidth) {
    mainLayout.style.setProperty('--left-panel-width', savedWidth);
  }

  let isDragging = false;

  const startDrag = () => {
    isDragging = true;
    resizer.classList.add('is-dragging');
    document.body.style.cursor = window.innerWidth <= 1024 ? 'row-resize' : 'col-resize';
    document.body.style.userSelect = 'none';
  };

  const doDrag = (e) => {
    if (!isDragging) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const containerWidth = mainLayout.getBoundingClientRect().width;
    const leftPx = clientX - mainLayout.getBoundingClientRect().left;
    let percent = (leftPx / containerWidth) * 100;

    // Enforce limits (minimum 25%, maximum 75%)
    if (percent < 25) percent = 25;
    if (percent > 75) percent = 75;

    const val = `${percent.toFixed(2)}%`;
    mainLayout.style.setProperty('--left-panel-width', val);
    localStorage.setItem('bot_launchpad_panel_width', val);
  };

  const stopDrag = () => {
    if (!isDragging) return;
    isDragging = false;
    resizer.classList.remove('is-dragging');
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  };

  resizer.addEventListener('mousedown', startDrag);
  window.addEventListener('mousemove', doDrag);
  window.addEventListener('mouseup', stopDrag);

  resizer.addEventListener('touchstart', startDrag, { passive: true });
  window.addEventListener('touchmove', doDrag, { passive: true });
  window.addEventListener('touchend', stopDrag);
}

// Initial boot
applyLanguage();
fetchServices();
initWebSocket();
initResizer();
