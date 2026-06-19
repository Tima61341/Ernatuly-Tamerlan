# QuizMaster - Интеллектуальная игровая платформа

## 📋 Описание

QuizMaster - это веб-приложение для создания и проведения интеллектуальных викторин, похожее на Kahoot. Платформа поддерживает мультиязычный интерфейс (казахский, русский, английский) и включает AI-генерацию вопросов.

## ✨ Основные функции

### Роли пользователей
- **ADMIN** - управление пользователями, темами, просмотр статистики
- **CREATOR** - создание викторин, проведение игр
- **PLAYER** - участие в играх без регистрации (через QR-код или Game ID)

### Игровой процесс
- Подключение игроков через QR-код или уникальный ID игры
- Автоматическая генерация аватаров (стиль 15-30 лет)
- Таймер на каждый вопрос
- Система подсчёта очков с бонусом за скорость
- Таблица лидеров в реальном времени

### Типы вопросов
- Один правильный ответ
- Несколько правильных ответов
- Открытый ответ (с fuzzy matching)
- Правда/Ложь

### AI-генерация
- Автоматическое создание вопросов по теме
- Выбор сложности (легко/средне/сложно)
- Поддержка KZ/RU/EN языков

## 🛠 Технологии

### Backend
- Java 17
- Spring Boot 3.2
- Spring Security + JWT
- Spring Data JPA
- PostgreSQL
- WebSocket (STOMP)
- WebFlux (для AI API)
- ZXing (QR-коды)

### Интеграции
- Groq Cloud API (LLaMA 3.1 для AI-генерации)
- DiceBear API (аватары)

## 📦 Установка и запуск

### Требования
- Java 17+
- Maven 3.8+
- PostgreSQL 14+

### 1. Создание базы данных

```sql
CREATE DATABASE quizmaster;
```

### 2. Настройка переменных окружения

```bash
# Обязательные
export GROQ_API_KEY=your-groq-api-key

# Опциональные (есть значения по умолчанию)
export DB_URL=jdbc:postgresql://localhost:5432/quizmaster
export DB_USERNAME=postgres
export DB_PASSWORD=postgres
```

### 3. Сборка и запуск

```bash
cd backend
mvn clean install
mvn spring-boot:run
```

Или с использованием JAR:

```bash
mvn clean package
java -jar target/quizmaster-backend-1.0.0.jar
```

### 4. Проверка работоспособности

```bash
curl http://localhost:8080/api/health
```

## 📡 API Endpoints

### Аутентификация
| Метод | Endpoint | Описание |
|-------|----------|----------|
| POST | `/api/auth/register` | Регистрация |
| POST | `/api/auth/login` | Вход |
| POST | `/api/auth/refresh` | Обновление токена |
| GET | `/api/auth/me` | Текущий пользователь |

### Пользователи (ADMIN)
| Метод | Endpoint | Описание |
|-------|----------|----------|
| GET | `/api/users` | Все пользователи |
| GET | `/api/users/{id}` | Пользователь по ID |
| PUT | `/api/users/{id}` | Обновить пользователя |
| PUT | `/api/users/{id}/role` | Изменить роль |
| DELETE | `/api/users/{id}` | Удалить пользователя |

### Темы
| Метод | Endpoint | Описание |
|-------|----------|----------|
| GET | `/api/topics` | Все активные темы |
| POST | `/api/topics` | Создать тему |
| PUT | `/api/topics/{id}` | Обновить тему |
| DELETE | `/api/topics/{id}` | Удалить тему |

### Викторины
| Метод | Endpoint | Описание |
|-------|----------|----------|
| GET | `/api/quizzes/public` | Публичные викторины |
| GET | `/api/quizzes/my` | Мои викторины |
| GET | `/api/quizzes/{id}` | Викторина с вопросами |
| POST | `/api/quizzes` | Создать викторину |
| PUT | `/api/quizzes/{id}` | Обновить викторину |
| DELETE | `/api/quizzes/{id}` | Удалить викторину |
| POST | `/api/quizzes/{id}/questions` | Добавить вопрос |

### Игры
| Метод | Endpoint | Описание |
|-------|----------|----------|
| POST | `/api/game/create` | Создать игру |
| POST | `/api/game/join` | Присоединиться (игрок) |
| POST | `/api/game/{code}/start` | Начать игру |
| POST | `/api/game/{code}/next` | Следующий вопрос |
| POST | `/api/game/play/answer` | Отправить ответ |
| GET | `/api/game/{code}/leaderboard` | Таблица лидеров |

### AI-генерация
| Метод | Endpoint | Описание |
|-------|----------|----------|
| POST | `/api/ai/generate-questions` | Генерация вопросов |
| POST | `/api/ai/generate-for-quiz` | Генерация для викторины |

### Статистика
| Метод | Endpoint | Описание |
|-------|----------|----------|
| GET | `/api/statistics/admin/dashboard` | Дашборд админа |
| GET | `/api/statistics/creator/dashboard` | Дашборд создателя |

## 🔌 WebSocket

### Подключение
```javascript
const socket = new SockJS('/api/ws/game');
const stompClient = Stomp.over(socket);
```

### Топики
- `/topic/game/{gameCode}/state` - состояние игры
- `/topic/game/{gameCode}/question` - текущий вопрос
- `/topic/game/{gameCode}/leaderboard` - таблица лидеров
- `/topic/game/{gameCode}/ended` - конец игры

## 📝 Примеры запросов

### Регистрация
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "password123",
    "firstName": "Админ",
    "lastName": "Системы",
    "preferredLanguage": "ru"
  }'
```

### Создание викторины
```bash
curl -X POST http://localhost:8080/api/quizzes \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Математика 5 класс",
    "description": "Базовые знания математики",
    "topicId": 1,
    "language": "ru",
    "difficulty": "EASY",
    "defaultTimerSeconds": 30,
    "isPublic": true,
    "questions": [
      {
        "text": "Сколько будет 2 + 2?",
        "type": "SINGLE_CHOICE",
        "options": [
          {"text": "3", "isCorrect": false},
          {"text": "4", "isCorrect": true},
          {"text": "5", "isCorrect": false},
          {"text": "6", "isCorrect": false}
        ]
      }
    ]
  }'
```

### AI-генерация вопросов
```bash
curl -X POST http://localhost:8080/api/ai/generate-questions \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "История Казахстана",
    "difficulty": "MEDIUM",
    "language": "kk",
    "questionType": "SINGLE_CHOICE",
    "count": 5,
    "includeExplanation": true
  }'
```

### Создание игры
```bash
curl -X POST http://localhost:8080/api/game/create \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "quizId": 1,
    "maxPlayers": 30
  }'
```

### Присоединение к игре (без авторизации)
```bash
curl -X POST http://localhost:8080/api/game/join \
  -H "Content-Type: application/json" \
  -d '{
    "gameCode": "ABC123",
    "nickname": "Игрок1",
    "gender": "MALE",
    "age": 18
  }'
```

## 🌐 Мультиязычность

Язык определяется через:
1. Header `Accept-Language: kk` / `ru` / `en`
2. Query параметр `?lang=kk`

Поддерживаемые языки:
- `ru` - Русский (по умолчанию)
- `kk` - Қазақша
- `en` - English

## 🔐 Безопасность

- JWT токены для аутентификации
- BCrypt для хеширования паролей
- Первый зарегистрированный пользователь получает роль ADMIN
- Игроки не требуют регистрации

## 📊 Система очков

- Базовые очки за правильный ответ: 1000 (настраивается)
- Бонус за скорость: до 500 очков (линейно)
- Частичные очки для multiple choice
- Fuzzy matching для открытых ответов (допуск 15%)

## 🐛 Отладка

Логи настроены в `application.yml`:
```yaml
logging:
  level:
    com.quizmaster: DEBUG
```

## 📄 Лицензия

MIT License

---

**Автор**: Дипломный проект  
**Версия**: 1.0.0
