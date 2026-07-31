# 🚀 Bot Launchpad - Control Panel

<p align="center">
  <b>🌐 Language / Язык:</b> 
  <a href="#-english">English</a> • 
  <a href="#-русский">Русский</a>
</p>

---

<a name="-english"></a>
# 🇬🇧 English

A lightweight, modern **Windows Process Launcher & Live Control Panel** designed for running, monitoring, and managing local Telegram/Discord bots, background scripts, AI agents, and ngrok tunnels.

![Bot Launchpad Dashboard](public/icon.png)

## ✨ Features

- **⚡ Real-time Process Management**: Start, stop, and restart multiple background processes from a clean Web GUI.
- **📜 Live WebSocket Logs**: Stream live terminal outputs (`stdout` / `stderr`) directly to your browser interface.
- **🔄 Auto-Restart Protection**: Automatically restarts crashed processes with built-in crash-loop protection.
- **🔔 Webhook Alerts**: Send instant notifications to Discord or Telegram when a process crashes or exits unexpectedly.
- **🖥️ Standalone Desktop Window**: Runs in Microsoft Edge App Mode for a native desktop application experience without browser chrome.
- **🔕 Silent Background Launch**: Includes VBS scripts to run the dashboard silently in the background without persistent command prompt windows.
- **📁 Flexible Configuration**: Manage services easily via the Web UI or by editing `config/services.json`.

---

## 🛠️ Quick Start

### 1. Prerequisites

- [Node.js](https://nodejs.org/) (v16 or higher)
- Windows OS (for Desktop mode and shortcut generation)

### 2. Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/ALEVOLDON/bot-manager-dashboard.git
cd bot-manager-dashboard
npm install
```

### 3. Running the Dashboard

#### Option A: Direct Node Server
```bash
npm start
```
Open [http://localhost:4000](http://localhost:4000) in your web browser.

#### Option B: Standalone Desktop Window
```bash
npm run app
```
Or double-click `start_dashboard.bat`.

#### Option C: Generate Desktop & Taskbar Shortcuts
Run the PowerShell shortcut generator script:
```powershell
powershell -ExecutionPolicy Bypass -File make_shortcut.ps1
```
This creates:
- **Bot Launchpad.lnk**: Direct launcher.
- **Bot Launchpad (Silent Mode).lnk**: Runs silently in the background using `start_hidden.vbs`.

---

## ⚙️ Configuration

Services are defined in `config/services.json`. If `services.json` does not exist on first launch, it will be automatically generated from `config/services.json.example`.

### Example `services.json` structure:

```json
[
  {
    "id": "telegram-bot-demo",
    "name": "Sample Telegram Bot",
    "category": "Telegram Bot",
    "cwd": "C:\\Users\\Username\\Projects\\my-bot",
    "command": "npm start",
    "icon": "🤖",
    "autoStart": false,
    "autoRestart": true,
    "enabled": true
  }
]
```

### Configuration Options:

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | `string` | Unique identifier for the service. |
| `name` | `string` | Display name in the control panel. |
| `category` | `string` | Grouping category (e.g. `Telegram Bot`, `Network`). |
| `cwd` | `string` | Working directory where the command should execute. |
| `command` | `string` | Command line to execute (e.g., `npm start`, `python bot.py`). |
| `icon` | `string` | Emoji icon displayed on the dashboard card. |
| `autoStart` | `boolean` | Automatically start when the dashboard server boots up. |
| `autoRestart` | `boolean` | Restart automatically if the process exits with an error. |
| `enabled` | `boolean` | Enable or disable the service in the dashboard. |

---

## 📂 Project Structure

```
bot-manager-dashboard/
├── config/
│   └── services.json.example   # Example service configuration template
├── public/
│   ├── index.html              # Dashboard Web UI layout
│   ├── style.css               # Styling & responsive design
│   ├── app.js                  # Frontend WebSocket client & state management
│   └── icon.png                # Application icon
├── main.js                     # Electron/App mode launcher
├── server.js                   # Express API & WebSocket backend
├── start_dashboard.bat         # Batch script to launch dashboard
├── start_hidden.vbs            # Silent VBS script launcher
├── make_shortcut.ps1           # PowerShell desktop shortcut creator
├── package.json
└── README.md
```

---

<a name="-русский"></a>
# 🇷🇺 Русский

Легкая и современная **Панель управления и менеджер процессов для Windows**, предназначенная для запуска, мониторинга и управления Telegram/Discord ботами, фоновыми скриптами, AI-агентами и ngrok-туннелями.

[⬆ К выбору языка](#🚀-bot-launchpad---control-panel)

## ✨ Возможности

- **⚡ Управление процессами в реальном времени**: Запуск, остановка и перезапуск процессов через удобный веб-интерфейс.
- **📜 Потоковые логи (WebSockets)**: Просмотр логов терминала (`stdout` / `stderr`) в режиме реального времени прямо в браузере.
- **🔄 Защита от крашей (Auto-Restart)**: Автоматическое восстановление упавших сервисов с встроенной защитой от бесконечных циклов падения.
- **🔔 Уведомления через Webhook**: Мгновенные оповещения в Discord или Telegram при нештатном завершении процессов.
- **🖥️ Оконный десктопный режим**: Запуск в автономном окне Microsoft Edge App Mode без рамок браузера.
- **🔕 Фоновый запуск без окон**: Набор VBS-скриптов для скрытого запуска панели в фоне без консольных окон командной строки.
- **📁 Гибкая настройка**: Удобное добавление сервисов через UI или файл конфигурации `config/services.json`.

---

## 🛠️ Быстрый старт

### 1. Требования

- [Node.js](https://nodejs.org/) (версия 16 или выше)
- ОС Windows (для десктопного режима и генерации ярлыков)

### 2. Установка

Клонируйте репозиторий и установите зависимости:

```bash
git clone https://github.com/ALEVOLDON/bot-manager-dashboard.git
cd bot-manager-dashboard
npm install
```

### 3. Запуск панели

#### Вариант А: Прямой запуск Node-сервера
```bash
npm start
```
Откройте в браузере адрес [http://localhost:4000](http://localhost:4000).

#### Вариант Б: Оконный десктопный режим
```bash
npm run app
```
Или дважды кликните по файлу `start_dashboard.bat`.

#### Вариант В: Создание ярлыков на Рабочем столе и Панели задач
Запустите PowerShell-скрипт генерации ярлыков:
```powershell
powershell -ExecutionPolicy Bypass -File make_shortcut.ps1
```
Скрипт создаст:
- **Bot Launchpad.lnk**: Прямой запуск.
- **Bot Launchpad (Silent Mode).lnk**: Скрытый запуск в фоне через `start_hidden.vbs`.

---

## ⚙️ Конфигурация

Список сервисов хранится в `config/services.json`. Если файл отсутствует при первом запуске, он будет автоматически создан из шаблона `config/services.json.example`.

### Пример структуры `services.json`:

```json
[
  {
    "id": "telegram-bot-demo",
    "name": "Sample Telegram Bot",
    "category": "Telegram Bot",
    "cwd": "C:\\Users\\Username\\Projects\\my-bot",
    "command": "npm start",
    "icon": "🤖",
    "autoStart": false,
    "autoRestart": true,
    "enabled": true
  }
]
```

### Описание параметров:

| Поле | Тип | Описание |
| :--- | :--- | :--- |
| `id` | `string` | Уникальный идентификатор сервиса. |
| `name` | `string` | Отображаемое название в панели управления. |
| `category` | `string` | Категория (например, `Telegram Bot`, `Network`). |
| `cwd` | `string` | Рабочая директория для выполнения команды. |
| `command` | `string` | Команда запуска (например, `npm start`, `python bot.py`). |
| `icon` | `string` | Emoji-иконка для карточки сервиса. |
| `autoStart` | `boolean` | Автоматический запуск при старте сервера панели. |
| `autoRestart` | `boolean` | Автоматический перезапуск при падении процесса. |
| `enabled` | `boolean` | Включен ли сервис в панели управления. |

---

## 📄 Лицензия

Проект распространяется под открытой лицензией [MIT License](LICENSE).
