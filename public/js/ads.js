// AdSense: apna publisher ID aur slot IDs yahan bharo
// ===== ADSENSE: apna publisher ID aur slot IDs yahan bharo =====
const ADS={pub:'',slots:{top:'',mid:'',end:''}}; // pub: 'ca-pub-XXXXXXXXXXXXXXXX'
function ads(){
 if(ADS.pub&&!window.adl){window.adl=1;const s=document.createElement('script');s.async=1;s.crossOrigin='anonymous';s.src='https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client='+ADS.pub;document.head.appendChild(s)}
 $$('.ad').forEach(e=>{if(e.dataset.d)return;const id=ADS.slots[e.dataset.ad];
  if(ADS.pub&&id){e.dataset.d=1;e.innerHTML='<ins class="adsbygoogle" style="display:block;width:100%" data-ad-client="'+ADS.pub+'" data-ad-slot="'+id+'" data-ad-format="auto" data-full-width-responsive="true"></ins>';(window.adsbygoogle=window.adsbygoogle||[]).push({})}
  else e.textContent='AD SLOT "'+e.dataset.ad+'": '+e.dataset.t})}
