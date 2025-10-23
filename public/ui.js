const CATEGORY_A = window.QUIZ_LABEL_A;
const CATEGORY_B = window.QUIZ_LABEL_B;
let items=[],idx=0,score=0,streak=0,answered=false;

const $=id=>document.getElementById(id);
const stage=$('stage');
$('btnA').onclick=()=>answer(CATEGORY_A);
$('btnB').onclick=()=>answer(CATEGORY_B);
$('next').onclick=()=>next();

initDisclaimer();

function initDisclaimer(){
  const modal=$('disclaimer'),btn=$('acceptDisclaimer');
  btn.onclick=()=>{modal.style.display='none';localStorage.setItem('disclaimerAccepted','yes');start();};
  if(localStorage.getItem('disclaimerAccepted')==='yes')modal.style.display='none',start();
}

async function start(){
  const res=await fetch('/api/items');
  const data=await res.json();
  items=data.items||[];
  idx=0;score=0;streak=0;answered=false;
  render();updateStats();toggleAnswer(false);
}

function render(){
  const item=items[idx];if(!item)return;
  $('itemName').textContent=item.name;
}

function updateStats(){
  $('progress').textContent=`${idx}/${items.length}`;
  $('score').textContent=score;
  $('streak').textContent=streak;
}

function toggleAnswer(show){
  if(show)stage.classList.add('show-answer');
  else stage.classList.remove('show-answer');
}

async function answer(choice){
  if(answered)return;answered=true;
  const item=items[idx];
  const r=await(await fetch('/api/answer',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:item.id,choice})})).json();
  const ok=r.correct;
  $('result').textContent=ok?'Correct':`Wrong — It is ${r.item.category}`;
  $('result').className='feedback '+(ok?'ok':'bad');
  if(ok){score++;streak++;}else streak=0;
  const img=$('img');
  const fallback=r.item.category===CATEGORY_B?'/img/trans.png':'/img/transport.png';
  img.onerror=()=>img.src=fallback;
  img.src=r.item.image||r.item.logo||fallback;
  $('explanation').textContent=r.item.description||'';
  $('website').href=r.item.website||'#';
  toggleAnswer(true);updateStats();
}

function next(){
  if(idx<items.length-1){
    idx++;answered=false;
    toggleAnswer(false);render();updateStats();
  }else{
    $('itemName').textContent='Finished';
    $('result').textContent=`Final score: ${score}/${items.length}`;
    toggleAnswer(true);$('next').disabled=true;
  }
}