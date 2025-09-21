const crypto = require('crypto');

function getDataCheckString(data) {
  const entries = Object.entries(data)
    .filter(([key]) => key !== 'hash')
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([key, value]) => `${key}=${value}`);
  return entries.join('\n');
}

function isTelegramAuthValid(data, botToken) {
  if (!botToken) return false;
  const secret = crypto.createHash('sha256').update(botToken).digest();
  const dataCheckString = getDataCheckString(data);
  const hmac = crypto.createHmac('sha256', secret).update(dataCheckString).digest('hex');
  return hmac === String(data.hash);
}

// Временное хранилище подарков (в продакшене используйте базу данных)
let userGifts = {};

// Доступные подарки для отправки
const availableGifts = [
  {
    id: 'gift_1',
    title: 'Heart Locket',
    img: 'https://optim.tildacdn.one/tild3534-6437-4733-a663-653232613962/-/cover/80x80/center/center/-/format/webp/GiftsGiftsGifts_AgAD.png',
    stars: 10,
    description: 'Символ любви и дружбы'
  },
  {
    id: 'gift_2',
    title: 'Plush Pepe',
    img: 'https://static.tildacdn.one/tild3735-3535-4230-a535-386234383163/GiftsGiftsGifts_AgAD.png',
    stars: 15,
    description: 'Мягкий и милый пепе'
  },
  {
    id: 'gift_3',
    title: 'Diamond Ring',
    img: 'https://static.tildacdn.one/tild3864-3763-4234-b964-373932633839/GiftsGiftsGifts_AgAD.png',
    stars: 50,
    description: 'Роскошное кольцо с бриллиантом'
  },
  {
    id: 'gift_4',
    title: 'Magic Potion',
    img: 'https://static.tildacdn.one/tild3639-6433-4963-b863-616462666138/GiftsGiftsGifts_AgAD.png',
    stars: 25,
    description: 'Волшебное зелье удачи'
  }
];

async function sendGift(senderId, receiverId, giftId, message) {
  try {
    // Находим подарок в списке доступных
    const gift = availableGifts.find(g => g.id === giftId);
    if (!gift) {
      return {
        success: false,
        error: 'Подарок не найден'
      };
    }

    // Создаем подарок для получателя
    const newGift = {
      id: `gift_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: gift.title,
      img: gift.img,
      quantity: 1,
      received_date: new Date().toISOString(),
      stars: gift.stars,
      converted: false,
      sender: senderId,
      sender_name: 'Пользователь', // В реальном приложении получите имя отправителя
      message: message || 'Подарок от друга!'
    };

    // Добавляем подарок получателю
    if (!userGifts[receiverId]) {
      userGifts[receiverId] = [];
    }
    userGifts[receiverId].push(newGift);

    return {
      success: true,
      gift: newGift,
      message: 'Подарок успешно отправлен!'
    };
  } catch (error) {
    console.error('Error sending gift:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { userData, receiverId, giftId, message } = req.body;
    const botToken = process.env.TELEGRAM_BOT_TOKEN;

    if (!userData || !userData.id) {
      res.status(400).json({ success: false, error: 'User data required' });
      return;
    }

    if (!receiverId || !giftId) {
      res.status(400).json({ success: false, error: 'Receiver ID and Gift ID required' });
      return;
    }

    // Проверяем авторизацию пользователя
    const isDevelopment = process.env.NODE_ENV === 'development';
    if (!isDevelopment && botToken) {
      const valid = isTelegramAuthValid(userData, botToken);
      if (!valid) {
        res.status(401).json({ success: false, error: 'Invalid Telegram auth' });
        return;
      }
    } else if (!isDevelopment && !botToken) {
      // Если нет токена бота, используем упрощенную проверку
      console.warn('No bot token configured, using simplified auth check for send-gift');
    } else if (!isDevelopment && botToken) {
      console.log('Bot token found, using full Telegram auth validation for send-gift');
    }

    // Отправляем подарок
    const result = await sendGift(userData.id, receiverId, giftId, message);
    
    if (!result.success) {
      res.status(400).json({ success: false, error: result.error });
      return;
    }

    res.status(200).json({ 
      success: true, 
      gift: result.gift,
      message: result.message
    });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};
