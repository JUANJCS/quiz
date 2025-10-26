const els = {
  bar: document.getElementById('bar'),
  left: document.getElementById('leftCount'),
  score: document.getElementById('score'),
  streak: document.getElementById('streak'),
  name: document.getElementById('name'),
  questionCard: document.getElementById('questionCard'),
  answerCard: document.getElementById('answerCard'),
  questionActions: document.getElementById('questionActions'),
  answerActions: document.getElementById('answerActions'),
  btnA: document.getElementById('btnA'),
  btnB: document.getElementById('btnB'),
  visit: document.getElementById('visit'),
  next: document.getElementById('next'),
  badge: document.getElementById('answerBadge'),
  emoji: document.getElementById('answerEmoji'),
  desc: document.getElementById('desc'),
  modal: document.getElementById('disclaimerModal'),
  accept: document.getElementById('acceptDisclaimer'),
  legalSheet: document.getElementById('legalSheet'),
  openLegal: document.getElementById('openLegal'),
  closeLegal: document.getElementById('closeLegal'),
};

const LS_ACCEPT = 'tquiz.accepted';
let items = [];
let order = [];
let idx = 0;
let score = 0;
let streak = 0;
let categories = ['Transport Company', 'Trans Collective']; // default labels

function shuffle(a){ for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];} return a;}

async function load() {
  // show disclaimer (once)
  if (!localStorage.getItem(LS_ACCEPT)) els.modal.hidden = false;

  // fetch items from /data (server serves this path)
  const res = await fetch('/data/items.json', { cache: 'no-store' });
  const data = await res.json();
  items = data;

  // infer two category labels from data to auto-adapt
  const labels = Array.from(new Set(items.map(i=>i.category))).slice(0,2);
  if (labels.length === 2) categories = labels;
  els.btnA.textContent = categories[0];
  els.btnB.textContent = categories[1];

  order = shuffle([...Array(items.length).keys()]);
  idx = 0; score = 0; streak = 0;
  render();
}

function render() {
  const left = items.length - idx;
  els.left.textContent = `${left}/${items.length}`;
  els.score.textContent = String(score);
  els.streak.textContent = String(streak);
  els.bar.style.width = items.length ? `${(idx/items.length)*100}%` : '0%';

  // question mode
  document.body.classList.remove('mode-answer');
  const it = items[order[idx]];
  els.name.textContent = it ? it.name : '—';
}

function showAnswer(userGuess) {
  const it = items[order[idx]];
  if (!it) return;
  const ok = userGuess === it.category;

  if (ok) { score += 1; streak += 1; }
  else { streak = 0; }

  els.badge.textContent = ok ? 'Correct' : `Wrong — it’s ${it.category}`;
  els.badge.classList.toggle('bad', !ok);
  els.emoji.textContent = ok ? '✅' : '❌';
  els.desc.textContent = it.description || '';

  els.visit.href = it.website || '#';
  els.visit.style.pointerEvents = it.website ? 'auto' : 'none';
  els.visit.classList.toggle('disabled', !it.website);

  document.body.classList.add('mode-answer');
}

function next() {
  idx++;
  if (idx >= items.length) {
    order = shuffle([...Array(items.length).keys()]);
    idx = 0; score = 0; streak = 0;
  }
  render();
}

// events
els.btnA.addEventListener('click', ()=>showAnswer(categories[0]));
els.btnB.addEventListener('click', ()=>showAnswer(categories[1]));
els.next.addEventListener('click', next);
window.addEventListener('keydown', (e)=>{
  if (document.body.classList.contains('mode-answer')) {
    if (e.key === 'Enter' || e.key === ' ') next();
    return;
  }
  if (e.key === 'ArrowLeft') showAnswer(categories[0]);
  if (e.key === 'ArrowRight') showAnswer(categories[1]);
});

els.accept.addEventListener('click', ()=>{
  localStorage.setItem(LS_ACCEPT,'1');
  els.modal.hidden = true;
});
els.openLegal.addEventListener('click', ()=> els.legalSheet.hidden = false);
els.closeLegal.addEventListener('click', ()=> els.legalSheet.hidden = true);

// basic swipe
let sx=null;
document.addEventListener('touchstart',e=>{sx=e.changedTouches[0].clientX;},{passive:true});
document.addEventListener('touchend',e=>{
  if (sx==null) return; const dx=e.changedTouches[0].clientX - sx;
  sx=null; if (Math.abs(dx)<40) return;
  if (document.body.classList.contains('mode-answer')) { next(); return; }
  if (dx<0) showAnswer(categories[1]); else showAnswer(categories[0]);
},{passive:true});

load().catch(err=>{
  els.name.textContent = 'Failed to load items';
  console.error(err);
});