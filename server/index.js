const express = require('express');
const path = require('path');
const { getPublicItems, checkAnswer } = require('./logic');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

app.get('/api/items', (req, res) => {
  res.json({ items: getPublicItems() });
});

app.post('/api/answer', (req, res) => {
  const { id, choice } = req.body || {};
  if (!id || !choice) return res.status(400).json({ error: 'id and choice required' });
  const result = checkAnswer(id, choice);
  if (!result.found) return res.status(404).json({ error: 'item not found' });
  res.json(result);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Quiz server running at http://localhost:${PORT}`));