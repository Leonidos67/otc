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
    const { userId } = req.body || {};
    if (!userId) {
      res.status(400).json({ error: 'userId required' });
      return;
    }

    const deal = await Deal.findById(id);
    if (!deal) {
      res.status(404).json({ error: 'Deal not found' });
      return;
    }
    if (!['matched'].includes(deal.status)) {
      res.status(409).json({ error: 'Deal not in confirmable state' });
      return;
    }

    if (!deal.confirmedBy.includes(userId)) {
      deal.confirmedBy.push(userId);
    }

    const isCreatorConfirm = userId === deal.creatorId;
    if (isCreatorConfirm && !deal.payment?.transferredBy) {
      deal.payment = {
        transferredBy: userId,
        amount: deal.amount,
        at: new Date(),
      };
    }

    const bothConfirmed = deal.takerId && deal.confirmedBy.includes(deal.creatorId) && deal.confirmedBy.includes(deal.takerId);
    if (bothConfirmed) {
      deal.status = 'completed';
    }

    await deal.save();
    const payload = deal.toPublicJSON();
    res.json(payload);
  } catch (err) {
    res.status(500).json({ error: 'Failed to confirm deal' });
  }
};


