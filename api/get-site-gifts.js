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
let userGifts = {
  // Пример подарков для тестового пользователя
  123456789: [
    {
      id: 'site_gift_1',
      title: 'Welcome Gift',
      img: 'https://optim.tildacdn.one/tild3534-6437-4733-a663-653232613962/-/cover/80x80/center/center/-/format/webp/GiftsGiftsGifts_AgAD.png',
      quantity: 1,
      received_date: new Date().toISOString(),
      stars: 5,
      converted: false,
      sender: 'OTC Platform',
      message: 'Добро пожаловать на платформу!'
    },
    {
      id: 'site_gift_2',
      title: 'First Deal Gift',
      img: 'https://static.tildacdn.one/tild3735-3535-4230-a535-386234383163/GiftsGiftsGifts_AgAD.png',
      quantity: 1,
      received_date: new Date(Date.now() - 86400000).toISOString(),
      stars: 10,
      converted: false,
      sender: 'OTC Platform',
      message: 'Поздравляем с первой сделкой!'
    }
  ]
};

async function getUserSiteGifts(userId) {
  try {
    // Получаем подарки пользователя
    const gifts = userGifts[userId] || [];
    
    // Сортируем по дате получения (новые сначала)
    gifts.sort((a, b) => new Date(b.received_date) - new Date(a.received_date));
    
    return {
      success: true,
      gifts: gifts,
      total: gifts.length
    };
  } catch (error) {
    console.error('Error fetching user site gifts:', error);
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
    const { userData } = req.body;
    const botToken = process.env.TELEGRAM_BOT_TOKEN;

    if (!userData || !userData.id) {
      res.status(400).json({ success: false, error: 'User data required' });
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
    }

    // Получаем подарки пользователя с сайта
    const giftsResult = await getUserSiteGifts(userData.id);
    
    if (!giftsResult.success) {
      res.status(500).json({ success: false, error: giftsResult.error });
      return;
    }

    res.status(200).json({ 
      success: true, 
      gifts: giftsResult.gifts,
      total: giftsResult.total,
      note: "Подарки получены с платформы OTC"
    });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};
