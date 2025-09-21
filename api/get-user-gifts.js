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

async function getUserGiftsFromTelegram(userId, botToken) {
  try {
    // Используем Telegram Bot API для получения информации о подарках
    // Это примерный запрос - в реальности нужно использовать правильный endpoint
    const response = await fetch(`https://api.telegram.org/bot${botToken}/getUserProfilePhotos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: userId,
        limit: 100
      })
    });

    if (!response.ok) {
      throw new Error(`Telegram API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Здесь можно добавить логику для получения подарков
    // Пока возвращаем моковые данные
    return {
      success: true,
      gifts: [
        {
          id: 1,
          title: "Heart Locket",
          img: "https://optim.tildacdn.one/tild3534-6437-4733-a663-653232613962/-/cover/80x80/center/center/-/format/webp/GiftsGiftsGifts_AgAD.png",
          quantity: 1,
          received_date: new Date().toISOString()
        },
        {
          id: 2,
          title: "Plush Pepe", 
          img: "https://static.tildacdn.one/tild3735-3535-4230-a535-386234383163/GiftsGiftsGifts_AgAD.png",
          quantity: 2,
          received_date: new Date(Date.now() - 86400000).toISOString()
        }
      ]
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
    if (!isDevelopment) {
      const valid = isTelegramAuthValid(userData, botToken);
      if (!valid) {
        res.status(401).json({ success: false, error: 'Invalid Telegram auth' });
        return;
      }
    }

    // Получаем подарки пользователя
    const giftsResult = await getUserGiftsFromTelegram(userData.id, botToken);
    
    if (!giftsResult.success) {
      res.status(500).json({ success: false, error: giftsResult.error });
      return;
    }

    res.status(200).json({ 
      success: true, 
      gifts: giftsResult.gifts 
    });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};
