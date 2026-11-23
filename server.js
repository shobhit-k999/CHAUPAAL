// GapShap server: sab kuch RAM me, disk/DB nahi. Disconnect = data delete.
const express=require('express'),http=require('http'),{Server}=require('socket.io');
const app=express(),srv=http.createServer(app),io=new Server(srv,{maxHttpBufferSize:4e5});
app.set('trust proxy',1);app.use(express.static(__dirname+'/public'));
const U=new Map(),N=new Map(),Q=new Set(),R=new Map(),B=new Map();
const ICONS=['IG','SC','TG','WA','DC','X'],G=['m','f'];
const wants=(a,b)=>a.want==='mix'||a.want===b.gender,fit=(a,b)=>wants(a,b)&&wants(b,a);
const online=()=>io.emit('online',U.size);
function pair(a,b){Q.delete(a.id);Q.delete(b.id);a.p=b.id;b.p=a.id;
 io.to(a.id).emit('matched',{name:b.name,icon:b.icon});io.to(b.id).emit('matched',{name:a.name,icon:a.icon})}
function drop(u){const p=U.get(u.p);u.p=null;if(p&&p.p===u.id){p.p=null;io.to(p.id).emit('left')}}
function find(u){if(u.p)drop(u);Q.delete(u.id);for(const id of Q){const b=U.get(id);if(b&&fit(u,b))return pair(u,b)}Q.add(u.id)}
io.on('connection',s=>{
 const ip=String(s.handshake.headers['x-forwarded-for']||s.handshake.address).split(',')[0].trim();
 if((B.get(ip)||0)>Date.now()){s.emit('banned');return s.disconnect(true)}
 let u=null;s.emit('online',U.size);
 const flood=()=>{const n=Date.now();u.t=(u.t||[]).filter(x=>n-x<5000);u.t.push(n);return u.t.length>12};
 const peer=()=>u&&U.get(u.p);
 s.on('join',(d,cb)=>{if(u||typeof cb!=='function')return;d=d||{};const name=String(d.name||'');
  if(!/^\w{3,16}$/.test(name))return cb({err:'Username must be 3–16 letters, numbers or _'});
  if(!G.includes(d.gender))return cb({err:'Select your gender'});
  if(N.has(name.toLowerCase()))return cb({err:'This username is taken right now'});
  u={id:s.id,name,icon:ICONS.includes(d.icon)?d.icon:'X',gender:d.gender,want:G.includes(d.want)?d.want:'mix',ip,p:null};
  U.set(s.id,u);N.set(name.toLowerCase(),s.id);online();cb({ok:1})});
 s.on('find',()=>u&&find(u));
 s.on('msg',m=>{const p=peer();if(!p||!m||flood())return;const k=m.kind,t=String(m.text||'');let ok=false;
  if(k==='text')ok=t.trim().length>0&&t.length<=500;
  else if(k==='gift')ok=t.length>0&&t.length<=8;
  else if(k==='img')ok=t.startsWith('data:image/jpeg;base64,')&&t.length<3e5;
  if(ok)io.to(p.id).emit('msg',{id:String(m.id||'').slice(0,20),kind:k,text:t,reply:m.reply?String(m.reply).slice(0,80):undefined})});
 s.on('react',r=>{const p=peer();if(p&&r)io.to(p.id).emit('react',{id:String(r.id).slice(0,20),e:String(r.e).slice(0,4)})});
 s.on('typing',()=>{const p=peer();if(p)io.to(p.id).emit('typing')});
 s.on('report',()=>{const p=peer();if(!p)return;const x=R.get(p.ip)||new Set();x.add(u.ip);R.set(p.ip,x);
  if(x.size>=3){B.set(p.ip,Date.now()+36e5);io.to(p.id).emit('banned');const k=io.sockets.sockets.get(p.id);if(k)k.disconnect(true)}});
 s.on('ret',(n,cb)=>{const t=U.get(N.get(String(n).toLowerCase()));if(!u||!t||t.id===u.id)return cb&&cb(false);
  io.to(t.id).emit('ret_in',{name:u.name,icon:u.icon});cb&&cb(true)});
 s.on('ret_ok',n=>{const t=U.get(N.get(String(n).toLowerCase()));if(!u||!t)return;if(u.p)drop(u);if(t.p)drop(t);pair(u,t)});
 s.on('disconnect',()=>{if(!u)return;Q.delete(u.id);drop(u);U.delete(u.id);N.delete(u.name.toLowerCase());online()})});
setInterval(()=>{R.clear();const n=Date.now();for(const[k,v]of B)if(v<n)B.delete(k)},36e5);
srv.listen(process.env.PORT||3000,()=>console.log('GapShap live'));
