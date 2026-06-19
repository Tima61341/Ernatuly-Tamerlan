# QuizMaster Frontend

Современный веб-интерфейс для платформы интеллектуальных викторин.

## 🛠 Технологии

- **React 18** + Vite
- **Tailwind CSS** - стилизация
- **Framer Motion** - анимации
- **React Router** - маршрутизация
- **Axios** - HTTP клиент
- **Zustand** - state management
- **STOMP + SockJS** - WebSocket
- **React Hot Toast** - уведомления
- **Recharts** - графики
- **React QR Code** - QR-коды

## 📦 Установка

```bash
npm install
```

## 🚀 Запуск

### Development
```bash
npm run dev
```

Приложение запустится на `http://localhost:5173`

### Production build
```bash
npm run build
npm run preview
```

## 📁 Структура проекта

```
src/
├── components/
│   ├── layout/        # Navbar, Footer
│   ├── common/        # Общие компоненты
│   ├── quiz/          # Компоненты викторины
│   └── game/          # Игровые компоненты
├── pages/
│   ├── HomePage.jsx
│   ├── LoginPage.jsx
│   ├── RegisterPage.jsx
│   ├── DashboardPage.jsx
│   ├── QuizzesPage.jsx
│   ├── QuizEditorPage.jsx
│   ├── QuizDetailPage.jsx
│   ├── JoinGamePage.jsx
│   ├── HostGamePage.jsx
│   ├── PlayGamePage.jsx
│   ├── LeaderboardPage.jsx
│   ├── ProfilePage.jsx
│   ├── AdminPage.jsx
│   └── NotFoundPage.jsx
├── context/
│   ├── AuthContext.jsx
│   └── LanguageContext.jsx
├── services/
│   └── api.js
├── utils/
│   └── translations.js
├── App.jsx
├── main.jsx
└── index.css
```

## 🎨 Дизайн

### Цветовая схема
- **Primary**: Blue (#0ea5e9)
- **Game colors**: Red, Blue, Yellow, Green
- **Dark theme**: #0F172A, #1E293B

### Компоненты
- `btn-primary`, `btn-secondary`, `btn-success`, `btn-danger`
- `card`, `card-hover`
- `input`, `label`
- `badge`, `badge-primary`, `badge-success`

## 🌐 Мультиязычность

Поддерживаемые языки:
- 🇰🇿 Қазақша (kk)
- 🇷🇺 Русский (ru)
- 🇬🇧 English (en)

Переключение через header или в профиле.

## 📱 Responsive

Полная адаптивность для:
- Desktop (1024px+)
- Tablet (768px - 1023px)
- Mobile (< 768px)

## 🎮 Игровой процесс

### Хост (создатель)
1. Создать викторину или выбрать существующую
2. Нажать "Начать игру" → получить QR-код и код игры
3. Дождаться игроков
4. Управлять игрой (старт, след. вопрос, конец)

### Игрок
1. Перейти на `/join` или отсканировать QR
2. Ввести код игры и никнейм
3. Выбрать аватар
4. Ожидать старта и отвечать на вопросы

## 🔧 Конфигурация

### API Proxy (vite.config.js)
```javascript
proxy: {
  '/api': {
    target: 'http://localhost:8080',
    changeOrigin: true
  },
  '/ws': {
    target: 'ws://localhost:8080',
    ws: true
  }
}
```

### Environment Variables
Создайте `.env` файл:
```
VITE_API_URL=http://localhost:8080/api
```

## 📄 Лицензия

MIT
