(()=>{
const {escapeHtml,safeUrl}=window.Museu;
function refsHtml(refs){return refs.map(r=>`<li>${safeUrl(r.url)?`<a href="${escapeHtml(r.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(r.name)} ↗</a>`:escapeHtml(r.name)}</li>`).join('');}
function cardsHtml(galleries,projects=[]){
 const items=[...galleries.map(g=>({label:g.name,desc:g.description,href:`#galeria/${g.id}`,category:'Galeria'})),...projects.map(p=>({label:p.title,desc:p.description,href:`#projeto/${p.id}`,category:'Projeto escolar'}))];
 return items.map((p,i)=>`<a class="collection-item" href="${p.href}"><span>${String(i+1).padStart(2,'0')}</span><div><small>${p.category}</small><h3>${escapeHtml(p.label)}</h3><p>${escapeHtml(p.desc.slice(0,180))}...</p></div><b aria-hidden="true">↗</b></a>`).join('');
}

Object.assign(window.Museu,{refsHtml,cardsHtml});
})();
