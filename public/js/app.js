const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const COL={IG:'#ff6fa5',SC:'#ffd84a',TG:'#4cc3f5',WA:'#3be07f',DC:'#8c98ff',X:'#aab'};
const EMO=[...'😀😂😍😘😎🥺😭😡👍🙏🔥💯🎉😴🤔🙈'],GIFTS=['🌹','🍫','🧸','💍','🎂','☕','🍕','💎'];
const J=(k,d)=>{try{return JSON.parse(localStorage[k])||d}catch(e){return d}};
const val=g=>($(g+' .on')||{dataset:{}}).dataset.v;
let S=null,me=J('me',{}),cur=[],partner=null,rep=null,pend=null,joined=false,tt,lt=0;
function toast(t){const e=$('#toast');e.textContent=t;e.style.display='block';clearTimeout(toast.t);toast.t=setTimeout(()=>e.style.display='none',2500)}
document.addEventListener('click',e=>{const c=e.target.closest('.chip');if(c){c.parentNode.querySelectorAll('.chip').forEach(x=>x.classList.remove('on'));c.classList.add('on')}});
function pick(g,v){$$(g+' .chip').forEach(x=>x.classList.toggle('on',x.dataset.v===v))}
function show(v){$('#home').style.display=v=='home'?'block':'none';$('#chat').style.display=v=='chat'?'flex':'none';$('#rooms').style.display=v=='rooms'?'flex':'none'}
function av(el,ic){el.textContent=ic=='X'?'✦':ic;el.style.background=COL[ic]||COL.X}
function sys(t){const d=document.createElement('div');d.className='sys';d.textContent=t;$('#msgs').append(d);$('#msgs').scrollTop=1e9}
function setup(){$('#nm').value=me.name||'';if(me.icon)pick('#ic',me.icon);if(me.gender)pick('#gd',me.gender);$('#md').style.display='flex'}
function connect(){
 if(S)S.disconnect();S=io();if(window.onSocket)onSocket(S);
 S.on('online',n=>$('#on').textContent='● '+n+' online');
 S.on('matched',p=>{endChat();partner=p;cur=[];$('#msgs').innerHTML='';$('#pn').textContent='@'+p.name;av($('#pi'),p.icon);
  sys("You’re connected! Say hi 👋 Don’t share personal info. Phone numbers and links are hidden automatically.");const h=J('hist',[]).filter(x=>x.name!=p.name);h.unshift({name:p.name,icon:p.icon});localStorage.hist=JSON.stringify(h.slice(0,10))});
 S.on('left',()=>{sys('Your partner left the chat.');endChat();$('#pn').textContent='…';if($('#auto').checked)setTimeout(find,1200)});
 S.on('msg',m=>{add(m,0);$('#ty').textContent=''});
 S.on('react',r=>react(r.id,r.e));
 S.on('typing',()=>{$('#ty').textContent='typing…';clearTimeout(tt);tt=setTimeout(()=>$('#ty').textContent='',2000)});
 S.on('ret_in',f=>{const q=$('#rq');q.innerHTML='';const t=document.createElement('div');t.textContent='@'+f.name+' wants to reconnect with you';
  const a=document.createElement('button');a.className='pri';a.textContent='Accept';a.onclick=()=>{S.emit('ret_ok',f.name);q.style.display='none'};
  const i=document.createElement('button');i.textContent='Ignore';i.onclick=()=>q.style.display='none';q.append(t,a,' ',i);q.style.display='block'});
 S.on('banned',()=>{toast('You are blocked for 1 hour because of reports');exitChat()});
 S.on('disconnect',()=>{joined=false})}
function join(){
 const name=$('#nm').value.trim(),icon=val('#ic'),gender=val('#gd');
 if(!/^\w{3,16}$/.test(name))return toast('Username must be 3–16 letters, numbers or _');
 if(!gender)return toast('Select your gender');
 if(!$('#age').checked)return toast('Please confirm you are 18+');
 connect();S.emit('join',{name,icon,gender,want:val('#fl'),lang:val('#lg'),tags:$('#tg').value},r=>{
  if(r.err){S.disconnect();return toast(r.err)}
  me={name,icon,gender};localStorage.me=JSON.stringify(me);joined=true;$('#md').style.display='none';show('chat');ads();if(window.onJoined)onJoined();if(pend){pend();pend=null}else find()})}
function find(){endChat();sys('Looking for a stranger…');S.emit('find')}
function endChat(){if(partner&&cur.length){const r=J('recent',[]);r.unshift({name:partner.name,icon:partner.icon,msgs:cur});localStorage.recent=JSON.stringify(r.slice(0,3))}partner=null;cur=[]}
function exitChat(){endChat();if(S)S.disconnect();S=null;joined=false;show('home')}
function react(id,e){const m=document.getElementById('m'+id);if(!m)return;let r=m.querySelector('.rx');if(!r){r=document.createElement('span');r.className='rx';m.append(r)}r.textContent=e}
function add(m,mine){
 cur.push({m:mine,t:m.kind=='img'?'📷 Photo':m.text});
 const d=document.createElement('div');d.id='m'+m.id;d.className='m '+(mine?'me':'th')+(m.kind=='gift'?' gift':'');
 if(m.reply){const q=document.createElement('div');q.className='q';q.textContent=m.reply;d.append(q)}
 if(m.kind=='img'){const i=new Image();i.src=m.text;i.className='pic';i.onclick=e=>{i.classList.add('on');e.stopPropagation()};d.append(i)}else d.append(m.text);
 if(m.kind!='gift'){const a=document.createElement('div');a.className='acts';
  ['↩','👍','❤️','😂','😮','😢'].forEach(x=>{const b=document.createElement('button');b.textContent=x;b.onclick=ev=>{ev.stopPropagation();d.classList.remove('sel');
   if(x=='↩'){rep=m.kind=='img'?'📷 Photo':m.text.slice(0,60);$('#rp').textContent='↩ '+rep;$('#rp').style.display='block';$('#tx').focus()}else{S.emit('react',{id:m.id,e:x});react(m.id,x)}};a.append(b)});
  d.append(a);d.onclick=()=>{const w=d.classList.contains('sel');$$('.sel').forEach(x=>x.classList.remove('sel'));if(!w)d.classList.add('sel')}}
 $('#msgs').append(d);$('#msgs').scrollTop=1e9}
function send(o){if(!partner)return toast('Wait until you are connected');o.id=Date.now().toString(36)+Math.random().toString(36).slice(2,5);
 if(rep){o.reply=rep;rep=null;$('#rp').style.display='none'}S.emit('msg',o);add(o,1)}
function sendTx(){const t=$('#tx').value.trim();if(t){send({kind:'text',text:t});$('#tx').value=''}}
function pan(id,arr,fn){const p=$(id);arr.forEach(x=>{const s=document.createElement('span');s.textContent=x;s.onclick=()=>fn(x);p.append(s)})}
pan('#ep',EMO,x=>{$('#tx').value+=x;$('#tx').focus()});pan('#gp',GIFTS,x=>{send({kind:'gift',text:x});$('#gp').style.display='none'});
const tg=id=>{['#ep','#gp'].forEach(p=>$(p).style.display=p==id&&$(p).style.display!='flex'?'flex':'none')};
$('#eb').onclick=()=>tg('#ep');$('#gb').onclick=()=>tg('#gp');$('#pb').onclick=()=>$('#ph').click();
$('#ph').onchange=e=>{const f=e.target.files[0];e.target.value='';if(!f||!partner)return;const i=new Image();i.onload=()=>{const w=Math.min(800,i.width),c=document.createElement('canvas');c.width=w;c.height=i.height*w/i.width;c.getContext('2d').drawImage(i,0,0,c.width,c.height);let q=.6,u;do{u=c.toDataURL('image/jpeg',q);q-=.1}while(u.length>280000&&q>.2);if(u.length>290000)return toast('Photo is too large');send({kind:'img',text:u})};i.src=URL.createObjectURL(f)};
$('#sd').onclick=sendTx;$('#tx').onkeydown=e=>{if(e.key=='Enter')sendTx()};
$('#tx').oninput=()=>{if(partner&&Date.now()-lt>1500){lt=Date.now();S.emit('typing')}};
$('#st').onclick=()=>{pend=null;setup()};$('#cl').onclick=()=>$('#md').style.display='none';$('#go').onclick=join;
$('#nx').onclick=find;$('#ex').onclick=exitChat;$('#rpt').onclick=()=>{if(!partner)return;S.emit('report');toast('Reported. Finding someone new');find()};
function row(p,txt,fn){const d=document.createElement('div');d.className='row';const a=document.createElement('span');a.className='av';av(a,p.icon);const n=document.createElement('span');n.textContent='@'+p.name;const b=document.createElement('button');b.textContent=txt;b.onclick=fn;d.append(a,n,b);return d}
function hist(){const b=$('#hbody');b.innerHTML='<h3>History (last 10)</h3>';const h=J('hist',[]);if(!h.length)b.append('No history yet.');
 h.forEach(p=>b.append(row(p,'Reconnect',()=>{$('#hm').style.display='none';const f=()=>S.emit('ret',p.name,ok=>toast(ok?'Request sent ✅':'That user is not online'));if(joined)f();else{pend=f;setup()}})));
 b.insertAdjacentHTML('beforeend','<h3 style="margin-top:14px">Recent chats (last 3)</h3>');const r=J('recent',[]);if(!r.length)b.append('No recent chats.');
 r.forEach(c=>b.append(row(c,'View',()=>{b.innerHTML='<h3>@'+c.name.replace(/[<>&]/g,'')+'</h3>';c.msgs.forEach(m=>{const l=document.createElement('div');l.textContent=(m.m?'You: ':'Them: ')+m.t;b.append(l)});const x=document.createElement('button');x.textContent='Back';x.onclick=hist;b.append(x)})));
 const x=document.createElement('button');x.className='big';x.textContent='Close';x.onclick=()=>$('#hm').style.display='none';b.append(x);$('#hm').style.display='flex'}
$('#hb').onclick=hist;$('#hb2').onclick=hist;
ads();
