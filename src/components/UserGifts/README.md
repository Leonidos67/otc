# Telegram Gifts Integration

## Текущая реализация

В данный момент компонент `UserGifts` работает в демонстрационном режиме с моковыми данными. Это связано с тем, что для получения реальных подарков пользователя через Telegram API требуется интеграция с MTProto API.

## Telegram Gifts API

Согласно [официальной документации Telegram Gifts](https://core.telegram.org/api/gifts), для получения подарков пользователя необходимо использовать:

### Основные методы:

1. **`payments.getUserStarGifts`** - получение подарков пользователя
2. **`payments.getStarGifts`** - получение списка доступных подарков
3. **`payments.saveStarGift`** - сохранение подарка на профиле
4. **`payments.convertStarGift`** - конвертация подарка в Telegram Stars

### Структура данных:

```javascript
// StarGift
{
  id: long,                    // ID подарка
  sticker: Document,           // Стикер подарка
  stars: long,                 // Стоимость в звездах
  convert_stars: long,         // Количество звезд при конвертации
  limited: boolean,            // Ограниченный выпуск
  sold_out: boolean,           // Распродан
  birthday: boolean,           // Праздничный подарок
  availability_remains: int,   // Осталось доступных
  availability_total: int,     // Всего было доступно
  first_sale_date: int,        // Дата первого выпуска
  last_sale_date: int          // Дата последнего выпуска
}

// UserStarGift
{
  gift: StarGift,              // Информация о подарке
  message: TextWithEntities,   // Сообщение с подарком
  convert_stars: long,         // Звезды при конвертации
  name_hidden: boolean,        // Имя отправителя скрыто
  saved: boolean,              // Сохранен на профиле
  converted: boolean           // Конвертирован в звезды
}
```

## Интеграция с MTProto API

Для получения реальных данных подарков необходимо:

1. **Настроить MTProto клиент** - использовать библиотеку типа `telegram` (Python) или `gramjs` (JavaScript)
2. **Аутентификация** - войти в аккаунт пользователя через MTProto
3. **Вызов API** - использовать `payments.getUserStarGifts` для получения подарков

### Пример интеграции (концептуальный):

```javascript
// Псевдокод для MTProto интеграции
import { TelegramApi } from 'telegram';

const api = new TelegramApi({
  apiId: process.env.TELEGRAM_API_ID,
  apiHash: process.env.TELEGRAM_API_HASH
});

async function getUserGifts(userId) {
  await api.start({
    phoneNumber: user.phone,
    password: user.password
  });
  
  const result = await api.invoke({
    _: 'payments.getUserStarGifts',
    user_id: { _: 'inputUserSelf' },
    offset: '',
    limit: 100
  });
  
  return result.gifts;
}
```

## Текущие ограничения

1. **Bot API ограничения** - Bot API не предоставляет доступ к подаркам пользователей
2. **MTProto сложность** - требует полной аутентификации пользователя
3. **Безопасность** - хранение учетных данных пользователя требует особой осторожности

## Рекомендации

1. **Для демо/тестирования** - использовать текущую реализацию с моковыми данными
2. **Для продакшена** - интегрироваться с MTProto API или использовать веб-хуки
3. **Альтернатива** - создать собственный API для управления подарками

## Дополнительные ресурсы

- [Telegram Gifts API Documentation](https://core.telegram.org/api/gifts)
- [MTProto API Documentation](https://core.telegram.org/api)
- [Telegram Bot API](https://core.telegram.org/bots/api)
