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

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const userData = req.body || {};
    const botToken = process.env.TELEGRAM_BOT_TOKEN;

    // Optional: also check auth_date freshness (e.g., 1 day)
    const maxAgeSeconds = 24 * 60 * 60;
    const nowSeconds = Math.floor(Date.now() / 1000);
    const authDate = Number(userData.auth_date || 0);
    const isFresh = authDate > 0 && nowSeconds - authDate < maxAgeSeconds;

    const valid = isFresh && isTelegramAuthValid(userData, botToken);
    if (!valid) {
      res.status(401).json({ success: false, error: 'Invalid Telegram auth' });
      return;
    }

    res.status(200).json({ success: true, user: userData });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};


