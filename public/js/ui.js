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
M.addEventListener('contextmenu',e=>e.preventDefault());
// leave guard: warn on refresh and on back (one history entry only)
let inChat=false;
window.onJoined=()=>{if(!inChat){history.pushState({c:1},'');inChat=true}};
const _x=exitChat;exitChat=function(){inChat=false;_x()};
addEventListener('beforeunload',e=>{if(joined){e.preventDefault();e.returnValue=''}});
addEventListener('popstate',()=>{if(joined){history.pushState({c:1},'');$('#lv').style.display='flex'}else inChat=false});
$('#stay').onclick=()=>$('#lv').style.display='none';
$('#leave').onclick=()=>{$('#lv').style.display='none';exitChat()};
