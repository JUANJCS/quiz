const CATEGORY_A = 'Galaxy';
const CATEGORY_B = 'Constellation';

let items = [];
let order = [];
let idx = 0, score = 0, streak = 0, answered = false;

const $ = id => document.getElementById(id);

init();

async function init() {
  const res = await fetch('/api/items');
  const data = await res.json();
  items = data.items;
  order = shuffle([...Array(items.length).keys()]);
  idx = 0; score = 0; streak = 0; answered = false;
  $('score').textContent = 0; $('streak').textContent = 0;
  $('progress').textContent = `0 / ${items.length}`;
  $('result').textContent = ''; $('detail').hidden = true; $('next').disabled = true;
  setHandlers(true);
  render();
}

function render() {
  const item = items[order[idx]];
  $('itemName').textContent = item.name;
}

function setHandlers(on) {
  $('btnA').disabled = !on; $('btnB').disabled = !on;
}

async function answer(choice) {
  if (answered) return;
  const item = items[order[idx]];
  const res = await fetch('/api/answer', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: item.id, choice })
  });
  const result = await res.json();

  answered = true;
  if (result.correct) { score++; streak++; $('result').className = 'feedback ok'; $('result').textContent = 'Correct'; }
  else { streak = 0; $('result').className = 'feedback bad'; $('result').textContent = `Wrong — It is ${result.item.category}`; }

  $('score').textContent = score; $('streak').textContent = streak;
  $('progress').textContent = `${idx + 1} / ${items.length}`;
  $('img').src = result.item.imageUrl;
  $('explanation').textContent = result.item.explanation;
  $('detail').hidden = false;
  setHandlers(false);
  $('next').disabled = false;
}

$('btnA').onclick = () => answer(CATEGORY_A);
$('btnB').onclick = () => answer(CATEGORY_B);
$('next').onclick = next;
$('restart').onclick = init;

function next() {
  if (idx < items.length - 1) {
    idx++; answered = false; $('result').textContent = ''; $('detail').hidden = true; $('next').disabled = true; setHandlers(true); render();
  } else {
    $('itemName').textContent = 'Finished';
    $('result').className = 'feedback';
    $('result').textContent = `Final score: ${score} / ${items.length}`;
    $('detail').hidden = true;
    setHandlers(false);
    $('next').disabled = true;
  }
}

function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}