// Pure game logic, hidden on the server
const fs = require('fs');
const path = require('path');

const ITEMS_PATH = path.join(__dirname, '..', 'data', 'items.json');

function loadItems() {
  const raw = fs.readFileSync(ITEMS_PATH, 'utf8');
  return JSON.parse(raw);
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Send only id+name, already shuffled
function getPublicItemsShuffled() {
  const safe = loadItems().map(({ id, name }) => ({ id, name }));
  return shuffle(safe);
}

// Evaluate an answer and reveal details after the guess
function checkAnswer(id, choice) {
  const item = loadItems().find(x => x.id === id);
  if (!item) return { found: false };
  const correct = item.category === choice;
  return {
    found: true,
    correct,
    item: {
      id: item.id,
      name: item.name,
      category: item.category,
      // map to new schema fields
      image: item.image || item.logo || null,
      description: item.description || '',
      website: item.website || '',
      logo: item.logo || ''
    }
  };
}

module.exports = { getPublicItemsShuffled, checkAnswer };