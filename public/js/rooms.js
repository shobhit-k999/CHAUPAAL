// rooms.js: public rooms (text only, messages expire after 3 days)
let inRoom=null;
window.onSocket=s=>{s.on('rm',m=>{if(inRoom)rmAdd(m)});s.on('warn',n=>toast('Warning '+n+'/3: abusive language is not allowed'))};
function openRooms(){show('rooms');inRoom=null;$('#rn').textContent='Rooms';$('#rc').textContent='';
 $('#rl').classList.remove('hid');$('#rmsgs').classList.add('hid');$('#rbar').classList.add('hid');
 S.emit('rooms',list=>{const l=$('#rl');l.innerHTML='';list.forEach(r=>{const b=document.createElement('button');b.textContent=r.n+'  ·  '+r.c+' online';b.onclick=()=>joinRoom(r);l.append(b)})})}
function joinRoom(r){S.emit('rjoin',r.k,old=>{inRoom=r.k;$('#rn').textContent=r.n;$('#rc').textContent='Messages are deleted after 3 days';
 $('#rl').classList.add('hid');$('#rmsgs').classList.remove('hid');$('#rbar').classList.remove('hid');$('#rmsgs').innerHTML='';old.forEach(rmAdd)})}
function rmAdd(m){const d=document.createElement('div'),n=document.createElement('small');d.className='m '+(m.name==me.name?'me':'th');
 n.textContent='@'+m.name;n.style.cssText='display:block;opacity:.7';d.append(n,m.text);$('#rmsgs').append(d);$('#rmsgs').scrollTop=1e9}
function rmSend(){const t=$('#rt').value.trim();if(t&&inRoom){S.emit('rsend',t);$('#rt').value=''}}
$('#rmb').onclick=()=>{pend=openRooms;setup()};
$('#rb').onclick=()=>inRoom?openRooms():exitChat();
$('#rsd').onclick=rmSend;$('#rt').onkeydown=e=>{if(e.key=='Enter')rmSend()};
