# 🚀 Bot Launchpad - Панель управления

<p align="center">
  <b>🌐 Язык / Language:</b> 
  <b>Русский</b> • 
  <a href="README.md">English</a>
</p>

---

Легкая и современная **Панель управления и менеджер процессов для Windows**, предназначенная для запуска, мониторинга и управления Telegram/Discord ботами, фоновыми скриптами, AI-агентами и ngrok-туннелями.

![Bot Launchpad Dashboard](public/icon.png)

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

## 📂 Структура проекта

```
bot-manager-dashboard/
├── config/
│   └── services.json.example   # Шаблон конфигурации сервисов
├── public/
│   ├── index.html              # Веб-интерфейс
│   ├── style.css               # Стили и адаптивный дизайн
│   ├── app.js                  # Клиентская логика и WebSockets
│   └── icon.png                # Иконка приложения
├── main.js                     # Запуск десктопного окна
├── server.js                   # Бэкенд Express & WebSocket
├── start_dashboard.bat         # Bat-скрипт запуска
├── start_hidden.vbs            # VBS-скрипт скрытого запуска
├── make_shortcut.ps1           # PowerShell скрипт создания ярлыков
├── package.json
├── README.md                   # Английская документация
└── README.ru.md                # Русская документация
```

---

## 📄 Лицензия

Проект распространяется под открытой лицензией [MIT License](LICENSE).
