const { connectMongo } = require('../_db');
const Deal = require('../models/Deal');

module.exports = async (req, res) => {
  // Enable CORS for simplicity; tighten in production if needed
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  try {
    await connectMongo();
  } catch (e) {
    res.status(500).json({ error: 'DB connection failed' });
    return;
  }

  if (req.method === 'POST') {
    try {
      const { creatorId, asset, amount, gifts, terms } = req.body || {};
      if (!creatorId || !asset || typeof amount !== 'number') {
        res.status(400).json({ error: 'creatorId, asset, amount required' });
        return;
      }
      const safeGifts = Array.isArray(gifts)
        ? gifts
            .filter(g => g && g.id && g.title && g.img)
            .map(g => ({ id: String(g.id), title: String(g.title), img: String(g.img) }))
        : [];
      const deal = await Deal.create({ creatorId, asset, amount, gifts: safeGifts, terms: terms ? String(terms) : '' });
      const payload = deal.toPublicJSON();
      res.status(201).json(payload);
    } catch (err) {
      res.status(500).json({ error: 'Failed to create deal' });
    }
    return;
  }

  if (req.method === 'GET') {
    try {
      const deals = await Deal.find({ status: 'open' }).sort({ createdAt: -1 }).limit(100);
      res.json(deals.map(d => d.toPublicJSON()));
    } catch (err) {
      res.status(500).json({ error: 'Failed to list deals' });
    }
    return;
  }

  res.status(405).json({ error: 'Method not allowed' });
};


