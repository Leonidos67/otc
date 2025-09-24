const http = require('http');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const { WebSocketServer } = require('ws');
const Deal = require('./models/Deal');

dotenv.config({ path: process.env.ENV_PATH || '.env' });

const PORT = process.env.PORT || 3001;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/otc_db';

async function connectMongo() {
  if (mongoose.connection.readyState === 1) return;
  await mongoose.connect(MONGODB_URI, {
    autoIndex: true,
  });
}

const app = express();
app.use(cors());
app.use(express.json());

// Health
app.get('/api/health', (_req, res) => res.json({ ok: true }));

// Create deal
app.post('/api/deals', async (req, res) => {
  try {
    await connectMongo();
    const { creatorId, asset, amount, gifts, terms } = req.body;
    if (!creatorId || !asset || typeof amount !== 'number') {
      return res.status(400).json({ error: 'creatorId, asset, amount required' });
    }
    const safeGifts = Array.isArray(gifts)
      ? gifts
          .filter(g => g && g.id && g.title && g.img)
          .map(g => ({ id: String(g.id), title: String(g.title), img: String(g.img) }))
      : [];
    const deal = await Deal.create({ creatorId, asset, amount, gifts: safeGifts, terms: terms ? String(terms) : '' });
    const payload = deal.toPublicJSON();
    broadcast({ type: 'deal_created', payload });
    res.status(201).json(payload);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create deal' });
  }
});

// List open deals
app.get('/api/deals', async (req, res) => {
  try {
    await connectMongo();
    const { status } = req.query;
    const filter = {};
    if (status) filter.status = status;
    const deals = await Deal.find(filter).sort({ createdAt: -1 }).limit(100);
    res.json(deals.map((d) => d.toPublicJSON()));
  } catch (err) {
    res.status(500).json({ error: 'Failed to list deals' });
  }
});

// Take a deal (match)
app.post('/api/deals/:id/take', async (req, res) => {
  try {
    await connectMongo();
    const { id } = req.params;
    const { takerId } = req.body;
    if (!takerId) return res.status(400).json({ error: 'takerId required' });

    const deal = await Deal.findById(id);
    if (!deal) return res.status(404).json({ error: 'Deal not found' });
    if (deal.status !== 'open') return res.status(409).json({ error: 'Deal not open' });

    deal.takerId = takerId;
    deal.status = 'matched';
    await deal.save();
    const payload = deal.toPublicJSON();
    broadcast({ type: 'deal_matched', payload });
    res.json(payload);
  } catch (err) {
    res.status(500).json({ error: 'Failed to take deal' });
  }
});

// Confirm deal by a participant (record payment if creator confirms)
app.post('/api/deals/:id/confirm', async (req, res) => {
  try {
    await connectMongo();
    const { id } = req.params;
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: 'userId required' });

    const deal = await Deal.findById(id);
    if (!deal) return res.status(404).json({ error: 'Deal not found' });
    if (!['matched'].includes(deal.status)) {
      return res.status(409).json({ error: 'Deal not in confirmable state' });
    }

    if (!deal.confirmedBy.includes(userId)) {
      deal.confirmedBy.push(userId);
    }

    // If creator confirms, record a payment marker once
    const isCreatorConfirm = userId === deal.creatorId;
    if (isCreatorConfirm && !deal.payment?.transferredBy) {
      deal.payment = {
        transferredBy: userId,
        amount: deal.amount,
        at: new Date(),
      };
    }

    // If both creator and taker confirmed, complete
    const bothConfirmed =
      deal.takerId && deal.confirmedBy.includes(deal.creatorId) && deal.confirmedBy.includes(deal.takerId);
    if (bothConfirmed) {
      deal.status = 'completed';
    }

    await deal.save();
    const payload = deal.toPublicJSON();
    const type = deal.status === 'completed' ? 'deal_completed' : 'deal_confirmed';
    broadcast({ type, payload });
    res.json(payload);
  } catch (err) {
    res.status(500).json({ error: 'Failed to confirm deal' });
  }
});

// Cancel deal by any participant
app.post('/api/deals/:id/cancel', async (req, res) => {
  try {
    await connectMongo();
    const { id } = req.params;
    const deal = await Deal.findById(id);
    if (!deal) return res.status(404).json({ error: 'Deal not found' });
    if (['completed', 'cancelled'].includes(deal.status)) {
      return res.status(409).json({ error: 'Deal already finalized' });
    }
    deal.status = 'cancelled';
    await deal.save();
    const payload = deal.toPublicJSON();
    broadcast({ type: 'deal_cancelled', payload });
    res.json(payload);
  } catch (err) {
    res.status(500).json({ error: 'Failed to cancel deal' });
  }
});

// Get single deal
app.get('/api/deals/:id', async (req, res) => {
  try {
    await connectMongo();
    const deal = await Deal.findById(req.params.id);
    if (!deal) return res.status(404).json({ error: 'Deal not found' });
    res.json(deal.toPublicJSON());
  } catch (err) {
    res.status(500).json({ error: 'Failed to get deal' });
  }
});

const server = http.createServer(app);

// WebSocket server
const wss = new WebSocketServer({ server, path: '/ws' });
const clients = new Set();

function broadcast(message) {
  const data = JSON.stringify(message);
  for (const ws of clients) {
    if (ws.readyState === ws.OPEN) {
      ws.send(data);
    }
  }
}

wss.on('connection', (ws) => {
  clients.add(ws);
  ws.on('close', () => clients.delete(ws));
});

server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`API listening on http://localhost:${PORT}`);
});

module.exports = { app };


