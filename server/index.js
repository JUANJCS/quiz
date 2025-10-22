const express = require('express');
const path = require('path');
const { getPublicItemsShuffled, checkAnswer } = require('./logic');

const fetch = require('node-fetch'); // add this import
const app = express();
app.use(express.json());

// serve frontend
app.use(express.static(path.join(__dirname, '..', 'public')));

// API: shuffled list with no categories
app.get('/api/items', (req, res) => {
  res.json({ items: getPublicItemsShuffled() });
});

// API: check an answer and reveal details
app.post('/api/answer', (req, res) => {
  const { id, choice } = req.body || {};
  if (!id || !choice) return res.status(400).json({ error: 'id and choice required' });
  const result = checkAnswer(id, choice);
  if (!result.found) return res.status(404).json({ error: 'item not found' });
  res.json(result);
});

// Simple image proxy with basic caching headers
app.get('/img', async (req, res) => {
  const u = req.query.u;
  if (!u) return res.status(400).end('missing u');
  try {
    const r = await fetch(u, {
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Accept': 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8'
      }
    });
    if (!r.ok) return res.status(502).end('bad upstream');
    res.set('Cache-Control', 'public, max-age=86400');
    res.set('Content-Type', r.headers.get('content-type') || 'image/png');
    r.body.pipe(res);
  } catch {
    res.status(502).end('fetch error');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Quiz server running at http://localhost:${PORT}`));