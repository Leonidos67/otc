module.exports = async (req, res) => {
  if (req.method === 'POST') {
    try {
      const userData = req.body;
      
      // Простая проверка для разработки
      // В продакшене добавьте настоящую верификацию
      if (userData && userData.id) {
        res.status(200).json({ success: true, user: userData });
      } else {
        res.status(400).json({ success: false, error: 'Invalid data' });
      }
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
};