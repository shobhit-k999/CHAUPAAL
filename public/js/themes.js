// Theme slider: 0 dark, 1 light, 2 cute
const TH=['dark','light','cute'],TI=['🌙','☀️','🌸'];
function setTheme(i){i=TH[i]?i:0;document.documentElement.dataset.theme=TH[i];$('#th').value=i;$('#tl').textContent=TI[i];try{localStorage.theme=i}catch(e){}}
$('#th').oninput=e=>setTheme(+e.target.value);
setTheme(+(localStorage.theme||0));
