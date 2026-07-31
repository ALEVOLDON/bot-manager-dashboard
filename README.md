# 🚀 Bot Launchpad - Control Panel

<p align="center">
  <b>🌐 Language / Язык:</b> 
  <b>English</b> • 
  <a href="README.ru.md">Русский</a>
</p>

---

A lightweight, modern **Windows Process Launcher & Live Control Panel** designed for running, monitoring, and managing local Telegram/Discord bots, background scripts, AI agents, and ngrok tunnels.

![Bot Launchpad Dashboard Interface](public/preview.jpg)

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
├── README.md                   # English documentation
└── README.ru.md                # Russian documentation
```

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
