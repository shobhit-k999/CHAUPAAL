// ui.js: Sure? buttons, Undo, swipe-to-reply, reply cancel, leave guard
function sure(btn,ms,act){let t=null,txt=btn.textContent;btn.onclick=()=>{
 if(!partner&&!t)return act();
 if(t){clearTimeout(t);t=null;btn.classList.remove('arm');btn.textContent=txt;return act()}
 btn.classList.add('arm');btn.textContent='Sure?';
 t=setTimeout(()=>{t=null;btn.classList.remove('arm');btn.textContent=txt},ms)}}
let ut=null;
function undoBar(name){
 let b=$('#ud');if(!b){b=document.createElement('div');b.id='ud';document.body.append(b)}
 b.innerHTML='';const s=document.createElement('span');s.textContent='Skipped @'+name;
 const u=document.createElement('button');u.textContent='Undo';
 u.onclick=()=>{b.style.display='none';clearTimeout(ut);if(S)S.emit('ret',name,ok=>toast(ok?'Request sent ✅':'That user is not online'))};
 b.append(s,u,document.createElement('i'));b.style.display='flex';b.classList.remove('go');void b.offsetWidth;b.classList.add('go');
 clearTimeout(ut);ut=setTimeout(()=>b.style.display='none',7000)}
sure($('#nx'),5000,()=>{const p=partner&&partner.name;find();if(p)undoBar(p)});
sure($('#ex'),5000,()=>exitChat());
// reply: swipe right on a bubble, tap the bar to cancel
function replyTo(m){const img=m.querySelector('img.pic');
 rep=img?'📷 Photo':[...m.childNodes].filter(n=>n.nodeType==3).map(n=>n.textContent).join('').slice(0,60);
 $('#rp').textContent='↩ '+rep;$('#rp').style.display='block';$('#tx').focus()}
$('#rp').onclick=()=>{rep=null;$('#rp').style.display='none'};
let sx=0,sy=0,se=null;const M=$('#msgs');
M.addEventListener('touchstart',e=>{const m=e.target.closest('.m:not(.gift)');if(!m)return;se=m;sx=e.touches[0].clientX;sy=e.touches[0].clientY},{passive:true});
M.addEventListener('touchmove',e=>{if(!se)return;const dx=e.touches[0].clientX-sx,dy=Math.abs(e.touches[0].clientY-sy);if(dx>0&&dx>dy)se.style.transform='translateX('+Math.min(dx,70)+'px)'},{passive:true});
M.addEventListener('touchend',e=>{if(!se)return;const dx=e.changedTouches[0].clientX-sx,m=se;se=null;m.style.transform='';if(dx>60)replyTo(m)},{passive:true});
// leave guard: warn on refresh and on back (one history entry only)
let inChat=false;
window.onJoined=()=>{if(!inChat){history.pushState({c:1},'');inChat=true}};
const _x=exitChat;exitChat=function(){inChat=false;_x()};
addEventListener('beforeunload',e=>{if(joined){e.preventDefault();e.returnValue=''}});
addEventListener('popstate',()=>{if(joined){history.pushState({c:1},'');$('#lv').style.display='flex'}else inChat=false});
$('#stay').onclick=()=>$('#lv').style.display='none';
$('#leave').onclick=()=>{$('#lv').style.display='none';exitChat()};

// emoji/gift panels get a close button
['#ep','#gp'].forEach(id=>{const x=document.createElement('span');x.textContent='✕';x.className='x';x.onclick=()=>$(id).style.display='none';$(id).prepend(x)});
// long-press menu: react, reply, copy, report
let lp=null,lx=0,ly=0,mt=0;
const closeMenu=()=>{const x=$('#mn');if(x)x.remove()};
function sheet(title,items,emo){closeMenu();mt=Date.now();const d=document.createElement('div');d.id='mn';
 const mk=(t,f,p)=>{const b=document.createElement('button');b.textContent=t;b.onclick=()=>{closeMenu();f()};p.append(b)};
 if(title){const h=document.createElement('b');h.textContent=title;d.append(h)}
 if(emo){const r=document.createElement('div');r.className='mr';emo.forEach(([t,f])=>mk(t,f,r));d.append(r)}
 items.concat([['Close',()=>{}]]).forEach(([t,f])=>mk(t,f,d));document.body.append(d)}
function menu(m){const id=m.id.slice(1),mine=m.classList.contains('me');
 const txt=[...m.childNodes].filter(n=>n.nodeType==3).map(n=>n.textContent).join('');
 const it=[['↩ Reply',()=>replyTo(m)]];
 if(txt)it.push(['📋 Copy',()=>{if(navigator.clipboard)navigator.clipboard.writeText(txt).then(()=>toast('Copied'))}]);
 if(!mine)it.push(['🚩 Report message',()=>sheet('Why are you reporting?',[['Abuse',()=>{S.emit('rpm',{id,reason:'abuse'});toast('Reported. Thank you')}],["I don't like it",()=>{S.emit('rpm',{id,reason:'dislike'});toast('Noted')}]])]);
 sheet('',it,['👍','❤️','😂','😮','😢','🔥'].map(e=>[e,()=>{S.emit('react',{id,e});react(id,e)}]))}
M.addEventListener('touchstart',e=>{const m=e.target.closest('.m');if(!m)return;lx=e.touches[0].clientX;ly=e.touches[0].clientY;
 lp=setTimeout(()=>{lp=null;menu(m);if(navigator.vibrate)navigator.vibrate(15)},500)},{passive:true});
M.addEventListener('touchmove',e=>{if(Math.abs(e.touches[0].clientX-lx)>10||Math.abs(e.touches[0].clientY-ly)>10)clearTimeout(lp)},{passive:true});
['touchend','touchcancel'].forEach(t=>M.addEventListener(t,()=>clearTimeout(lp),{passive:true}));
M.addEventListener('contextmenu',e=>{e.preventDefault();const m=e.target.closest('.m');if(m&&!lp&&Date.now()-mt>600)menu(m)});
document.addEventListener('click',e=>{if(Date.now()-mt>400&&!e.target.closest('#mn'))closeMenu()});
