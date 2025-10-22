const fs = require('fs');
const path = require('path');

const ITEMS_PATH = path.join(__dirname, '..', 'data', 'items.json');

function loadItems() {
  const raw = fs.readFileSync(ITEMS_PATH, 'utf8');
  return JSON.parse(raw);
}

function getPublicItems() {
  return loadItems().map(({ id, name }) => ({ id, name }));
}

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
      imageUrl: item.imageUrl,
      explanation: item.explanation
    }
  };
}

module.exports = { getPublicItems, checkAnswer };