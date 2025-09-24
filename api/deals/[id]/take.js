const { connectMongo } = require('../../_db');
const Deal = require('../../models/Deal');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    await connectMongo();
    const { id } = req.query;
    const { takerId } = req.body || {};
    if (!takerId) {
      res.status(400).json({ error: 'takerId required' });
      return;
    }

    const deal = await Deal.findById(id);
    if (!deal) {
      res.status(404).json({ error: 'Deal not found' });
      return;
    }
    if (deal.status !== 'open') {
      res.status(409).json({ error: 'Deal not open' });
      return;
    }

    deal.takerId = takerId;
    deal.status = 'matched';
    await deal.save();
    const payload = deal.toPublicJSON();
    res.json(payload);
  } catch (err) {
    res.status(500).json({ error: 'Failed to take deal' });
  }
};


