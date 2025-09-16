module.exports = async (req, res) => {
  const crypto = require('crypto');
  
  if (req.method === 'POST') {
    try {
      const { initData } = req.body;
      
      // Верификация данных Telegram (упрощенная версия)
      const params = new URLSearchParams(initData);
      const hash = params.get('hash');
      params.delete('hash');
      
      const dataCheckString = Array.from(params.entries())
        .map(([key, value]) => `${key}=${value}`)
        .sort()
        .join('\n');
      
      const secretKey = crypto.createHmac('sha256', 'WebAppData')
        .update(process.env.BOT_TOKEN);
      
      const calculatedHash = crypto
        .createHmac('sha256', secretKey.digest())
        .update(dataCheckString)
        .digest('hex');
      
      if (calculatedHash === hash) {
        res.status(200).json({ success: true });
      } else {
        res.status(401).json({ success: false, error: 'Invalid hash' });
      }
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
};