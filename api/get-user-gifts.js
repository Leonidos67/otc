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

async function getUserGiftsFromTelegram(userId, userData) {
  try {
    // Согласно документации Telegram Gifts API, для получения подарков пользователя
    // нужно использовать payments.getUserStarGifts, но это требует MTProto API
    // В рамках Bot API мы можем только получить базовую информацию
    
    // Для демонстрации возвращаем моковые данные подарков
    // В реальном приложении нужно интегрироваться с MTProto API
    const mockGifts = [
      {
        id: 1,
        title: "Heart Locket",
        img: "https://optim.tildacdn.one/tild3534-6437-4733-a663-653232613962/-/cover/80x80/center/center/-/format/webp/GiftsGiftsGifts_AgAD.png",
        quantity: 1,
        received_date: new Date().toISOString(),
        stars: 10,
        converted: false
      },
      {
        id: 2,
        title: "Plush Pepe", 
        img: "https://static.tildacdn.one/tild3735-3535-4230-a535-386234383163/GiftsGiftsGifts_AgAD.png",
        quantity: 2,
        received_date: new Date(Date.now() - 86400000).toISOString(),
        stars: 15,
        converted: false
      },
      {
        id: 3,
        title: "Ion Gem",
        img: "https://static.tildacdn.one/tild3861-3531-4736-a135-643061633061/GiftsGiftsGifts_AgAD.png",
        quantity: 1,
        received_date: new Date(Date.now() - 172800000).toISOString(),
        stars: 20,
        converted: true
      },
      {
        id: 4,
        title: "Diamond Ring",
        img: "https://static.tildacdn.one/tild3864-3763-4234-b964-373932633839/GiftsGiftsGifts_AgAD.png",
        quantity: 1,
        received_date: new Date(Date.now() - 259200000).toISOString(),
        stars: 50,
        converted: false
      },
      {
        id: 5,
        title: "Magic Potion",
        img: "https://static.tildacdn.one/tild3639-6433-4963-b863-616462666138/GiftsGiftsGifts_AgAD.png",
        quantity: 3,
        received_date: new Date(Date.now() - 345600000).toISOString(),
        stars: 25,
        converted: false
      }
    ];

    return {
      success: true,
      gifts: mockGifts,
      note: "Данные подарков получены в демонстрационном режиме. Для получения реальных данных требуется интеграция с MTProto API."
    };
  } catch (error) {
    console.error('Error fetching user gifts:', error);
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

    // Получаем подарки пользователя
    const giftsResult = await getUserGiftsFromTelegram(userData.id, userData);
    
    if (!giftsResult.success) {
      res.status(500).json({ success: false, error: giftsResult.error });
      return;
    }

    res.status(200).json({ 
      success: true, 
      gifts: giftsResult.gifts,
      note: giftsResult.note
    });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};
