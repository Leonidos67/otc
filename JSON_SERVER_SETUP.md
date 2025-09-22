# 🎁 JSON Server Setup для карточек подарков

## 📋 Что было настроено:

### 1. **JSON Server**
- Установлен `json-server` как dev dependency
- Создан `db.json` с данными о подарках
- Настроены скрипты для запуска

### 2. **API Сервис**
- `src/api/giftsApi.js` - API для работы с подарками
- Поддержка fallback данных при недоступности API
- Методы: `getAllGifts()`, `getFeaturedGifts()`, `getGiftById()`, `getGiftsByCategory()`

### 3. **Обновленные компоненты**
- `src/data/features.js` - теперь загружает данные из API
- `src/pages/Home.jsx` - добавлен индикатор загрузки
- CSS стили для анимации загрузки

## 🚀 Как запустить:

### Вариант 1: Запуск только JSON Server
```bash
npm run json-server
```
API будет доступен на: `http://localhost:3001`

### Вариант 2: Запуск JSON Server + React одновременно
```bash
npm run dev
```
- JSON Server: `http://localhost:3001`
- React App: `http://localhost:3000`

### Вариант 3: Обычный запуск React (без API)
```bash
npm start
```
Будут использоваться fallback данные

## 📊 API Endpoints:

- `GET /gifts` - все подарки
- `GET /gifts?isActive=true` - только активные подарки
- `GET /gifts?_limit=6` - первые 6 подарков
- `GET /gifts?isActive=true&_limit=6` - первые 6 активных подарков
- `GET /gifts/1` - подарок по ID
- `GET /gifts?category=romantic` - подарки по категории

## 🎯 Структура данных подарка:

```json
{
  "id": 1,
  "title": "Valentine Box",
  "icon": "https://nft.fragment.com/gift/valentinebox-18872.medium.jpg",
  "price": 100,
  "category": "romantic",
  "isActive": true
}
```

## 🔧 Добавление новых подарков:

1. Откройте `db.json`
2. Добавьте новый объект в массив `gifts`:
```json
{
  "id": 13,
  "title": "Новый подарок",
  "icon": "https://example.com/image.jpg",
  "price": 150,
  "category": "new",
  "isActive": true
}
```
3. JSON Server автоматически обновит API

## 🎨 Категории подарков:
- `romantic` - романтические
- `fun` - веселые
- `office` - офисные
- `holiday` - праздничные
- `luxury` - роскошные
- `magic` - магические

## ⚡ Особенности:
- **Автоматическое обновление** при изменении `db.json`
- **Fallback данные** при недоступности API
- **Индикатор загрузки** с анимацией
- **Ограничение до 6 карточек** через CSS
- **Поддержка сотен карточек** в базе данных

## 🐛 Отладка:
- Проверьте, что JSON Server запущен на порту 3001
- Откройте `http://localhost:3001/gifts` в браузере
- Проверьте консоль браузера на ошибки
- При ошибках API используются fallback данные
