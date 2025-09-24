const { connectMongo } = require('../../_db');
const Deal = require('../../models/Deal');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    await connectMongo();
    const { id } = req.query;
    const deal = await Deal.findById(id);
    if (!deal) {
      res.status(404).json({ error: 'Deal not found' });
      return;
    }
    res.json(deal.toPublicJSON());
  } catch (err) {
    res.status(500).json({ error: 'Failed to get deal' });
  }
};


