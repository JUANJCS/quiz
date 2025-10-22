const CATEGORY_A = window.QUIZ_LABEL_A || 'Transport Company';
const CATEGORY_B = window.QUIZ_LABEL_B || 'Trans Collective';
const $ = id => document.getElementById(id);

let items = [], idx = 0, score = 0, streak = 0, answered = false;
const stage = $('stage'), card = $('card'), itemNameEl = $('itemName');

$('btnA').textContent = CATEGORY_A;
$('btnB').textContent = CATEGORY_B;
$('badgeA').textContent = CATEGORY_A;
$('badgeB').textContent = CATEGORY_B;

$('btnA').onclick = () => answer(CATEGORY_A);
$('btnB').onclick = () => answer(CATEGORY_B);
$('next').onclick = () => goNext();

window.addEventListener('keydown', e => {
  if (!stage.classList.contains('show-answer')) {
    if (e.key.toLowerCase() === 'a' || e.key === 'ArrowLeft') answer(CATEGORY_A);
    if (e.key.toLowerCase() === 'b' || e.key === 'ArrowRight') answer(CATEGORY_B);
  } else {
    if (['ArrowLeft','ArrowRight'].includes(e.key)) goNext();
  }
  if (e.key === 'Enter') goNext();
});

init();

async function init(){
  const res = await fetch('/api/items');
  const data = await res.json();
  items = data.items || [];
  idx=0;score=0;streak=0;answered=false;
  setStats(0);setFeedback('');toggleAnswer(false);
  $('next').disabled=true;enableChoices(true);render();
}

function render(){
  const item=items[idx]; if(!item){itemNameEl.textContent='Finished';return;}
  itemNameEl.textContent=item.name; $('img').alt=`${item.name}`;
}

function setStats(i){$('score').textContent=score;$('streak').textContent=streak;$('progress').textContent=`${i} / ${items.length}`;}
function enableChoices(on){$('btnA').disabled=!on;$('btnB').disabled=!on;canSwipeQuestion=on;}
function setFeedback(t,ok){const el=$('result');el.className='feedback'+(ok===true?' ok':ok===false?' bad':'');el.textContent=t;}
function toggleAnswer(s){if(s)stage.classList.add('show-answer');else stage.classList.remove('show-answer');}

async function answer(choice){
  if(answered)return;const item=items[idx];if(!item)return;
  answered=true;enableChoices(false);
  const res=await fetch('/api/answer',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:item.id,choice})});
  const r=await res.json();if(r.error){setFeedback(r.error);answered=false;enableChoices(true);return;}
  if(r.correct){score++;streak++;setFeedback('Correct',true);}else{streak=0;setFeedback(`Wrong — It is ${r.item.category}`,false);}

  const media = document.getElementById('media');
  const imgEl = document.getElementById('img');
  const explEl = document.getElementById('explanation');

  media.style.display = '';
  explEl.style.display = '';

  imgEl.onerror = () => { media.style.display = 'none'; };
  imgEl.src = r.item.image || r.item.logo || '';
  explEl.textContent = r.item.description || '';

  const link = $('website');
  if (r.item.website) { link.href = r.item.website; link.style.display = ''; }
  else { link.style.display = 'none'; }

  toggleAnswer(true);setStats(idx+1);$('next').disabled=false;
}

function goNext(){
  if(!stage.classList.contains('show-answer'))return;
  if(idx<items.length-1){idx++;answered=false;setFeedback('');toggleAnswer(false);$('next').disabled=true;enableChoices(true);resetCard();render();setStats(idx);}
  else{itemNameEl.textContent='Finished';setFeedback(`Final score: ${score} / ${items.length}`);toggleAnswer(false);enableChoices(false);$('next').disabled=true;}
}

/* swipe on question card */
let startX=0,currentX=0,dragging=false,canSwipeQuestion=true;
card.addEventListener('pointerdown',e=>{if(!canSwipeQuestion||answered||stage.classList.contains('show-answer'))return;dragging=true;card.setPointerCapture(e.pointerId);startX=e.clientX;currentX=startX;card.classList.add('dragging');});
card.addEventListener('pointermove',e=>{if(!dragging)return;currentX=e.clientX;const dx=currentX-startX;const rot=Math.max(-15,Math.min(15,dx/10));card.style.transform=`translateX(${dx}px) rotate(${rot}deg) scale(1.01)`;card.classList.toggle('swipe-left',dx<-40);card.classList.toggle('swipe-right',dx>40);});
card.addEventListener('pointerup',release);card.addEventListener('pointercancel',release);card.addEventListener('pointerleave',release);
function release(){if(!dragging)return;dragging=false;card.classList.remove('dragging');const dx=currentX-startX;const t=80;if(Math.abs(dx)>=t){const c=dx<0?CATEGORY_A:CATEGORY_B;const off=Math.sign(dx)*600;card.style.transition='transform .18s ease,opacity .18s ease';card.style.transform=`translateX(${off}px) rotate(${Math.sign(dx)*18}deg) scale(1.02)`;card.style.opacity='0';setTimeout(()=>{resetCard();answer(c);},180);}else resetCard();}

/* swipe on answer panel = next */
const panel=$('answerPanel');let aStart=0,aCur=0,aDrag=false;
panel.addEventListener('pointerdown',e=>{if(!stage.classList.contains('show-answer'))return;aDrag=true;panel.setPointerCapture(e.pointerId);aStart=e.clientX;aCur=aStart;});
panel.addEventListener('pointermove',e=>{if(!aDrag)return;aCur=e.clientX;});
function finish(){if(!aDrag)return;aDrag=false;const dx=aCur-aStart;if(Math.abs(dx)>=60)goNext();}
panel.addEventListener('pointerup',finish);panel.addEventListener('pointercancel',finish);panel.addEventListener('pointerleave',finish);

function resetCard(){card.style.transition='transform .18s ease,opacity .18s ease';card.style.transform='translateX(0) rotate(0deg) scale(1)';card.style.opacity='1';card.classList.remove('swipe-left','swipe-right');setTimeout(()=>{card.style.transition='';},200);}