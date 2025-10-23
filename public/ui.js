const CATEGORY_A = window.QUIZ_LABEL_A;
const CATEGORY_B = window.QUIZ_LABEL_B;

let items=[], idx=0, score=0, streak=0, answered=false;

const $ = id => document.getElementById(id);
const stage = $('stage');
const phone = $('phone');

$('btnA').onclick = () => answer(CATEGORY_A);
$('btnB').onclick = () => answer(CATEGORY_B);
$('next').onclick = () => goNext();
$('acceptDisclaimer').onclick = () => { $('disclaimer').style.display='none'; start(); };

// Show disclaimer every load
window.addEventListener('load', () => { $('disclaimer').style.display='flex'; });

async function start(){
  const res = await fetch('/api/items');
  const data = await res.json();
  items = data.items || [];
  idx=0; score=0; streak=0; answered=false;
  render(); updateStats(); showAnswer(false);
}

function render(){
  const item = items[idx]; if(!item) return;
  $('itemName').textContent = item.name;
}

function updateStats(){
  $('progress').textContent = `${idx}/${items.length}`;
  $('score').textContent = score;
  $('streak').textContent = streak;
}

function showAnswer(isAnswer){
  if (isAnswer) {
    stage.classList.add('show-answer');
    phone.classList.remove('mode-question'); phone.classList.add('mode-answer');
  } else {
    stage.classList.remove('show-answer');
    phone.classList.remove('mode-answer'); phone.classList.add('mode-question');
  }
}

async function answer(choice){
  if(answered) return; answered=true;
  const item = items[idx];

  const r = await (await fetch('/api/answer',{
    method:'POST', headers:{'Content-Type':'application/json'},
    body:JSON.stringify({ id:item.id, choice })
  })).json();

  const ok = r.correct;
  $('result').textContent = ok ? 'Correct' : `Wrong — It is ${r.item.category}`;
  $('result').className = 'feedback ' + (ok ? 'ok' : 'bad');
  if (ok) { score++; streak++; } else { streak = 0; }

  const img = $('img');
  const fallback = r.item.category === CATEGORY_B ? '/img/trans.png' : '/img/transport.png';
  img.onerror = () => { img.src = fallback; };
  img.src = r.item.image || r.item.logo || fallback;

  $('explanation').textContent = r.item.description || '';
  $('website').href = r.item.website || '#';

  showAnswer(true);
  updateStats();
}

function goNext(){
  if (idx < items.length - 1) {
    idx++; answered=false; render(); updateStats(); showAnswer(false);
  } else {
    $('itemName').textContent='Finished';
    $('result').textContent=`Final score: ${score}/${items.length}`;
    showAnswer(true);
  }
}