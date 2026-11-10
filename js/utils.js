(()=>{
const $=(q,parent=document)=>parent.querySelector(q);
const $$=(q,parent=document)=>[...parent.querySelectorAll(q)];
const escapeHtml=(val='')=>String(val??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const safeUrl=(u='')=>/^https:\/\//i.test(u)||/^(\.\/)?assets\/[a-zA-Z0-9_\/.-]+$/.test(u)&&!u.includes('..')?u:'';
const exhibitIcon=(i)=>['✎','◈','◉','▤','✦','◎'][i%6];
function toast(text){const el=$('#toast');el.textContent=text;el.classList.add('show');window.clearTimeout(toast.timeout);toast.timeout=window.setTimeout(()=>el.classList.remove('show'),4300);}
const formatDate=(date)=>new Date(date).toLocaleDateString('pt-BR');
Object.assign(window.Museu||(window.Museu={}),{$,$$,escapeHtml,safeUrl,exhibitIcon,toast,formatDate});
})();
