/* Editor local: dados em memória e rascunho local; exporta JS estático para commit.
   Não implementa autenticação, gravação remota ou upload. */
(()=>{
'use strict';
const DRAFT_KEY='museu-editor-rascunho-v2';
const $=(q,root=document)=>root.querySelector(q);
const $$=(q,root=document)=>[...root.querySelectorAll(q)];
const h=(value='')=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const cleanId=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9-]/g,'-').replace(/-+/g,'-').replace(/^-|-$/g,'').slice(0,48);
const clone=v=>JSON.parse(JSON.stringify(v));
const initial=clone(window.MUSEU_DADOS);
let data=clone(initial), tab='dashboard', selectedGallery='',selectedProject='',selectedRoom='';
try{const draft=localStorage.getItem(DRAFT_KEY);if(draft){const parsed=JSON.parse(draft);if(isValid(parsed))data=parsed;}}catch{}
function isValid(obj){return !!obj&&typeof obj==='object'&&Array.isArray(obj.galleries)&&Array.isArray(obj.projects)&&Array.isArray(obj.references)&&Array.isArray(obj.messages)&&obj.settings&&typeof obj.settings==='object';}
function save(){try{localStorage.setItem(DRAFT_KEY,JSON.stringify(data));}catch{alert('O navegador não conseguiu salvar o rascunho. Exporte o arquivo para não perder seu trabalho.');}}
function toast(message){const el=$('#admin-toast');el.textContent=message;el.classList.add('visible');clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.classList.remove('visible'),3600);}
function randomId(prefix){return prefix+'-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,6);}
function field(label,name,value='',type='text',extra=''){
 const id='f-'+name.replace(/[^a-z0-9-]/gi,'-');
 return `<div class="field"><label for="${h(id)}">${h(label)}</label><input id="${h(id)}" name="${h(name)}" type="${h(type)}" value="${h(value)}" ${extra}></div>`;
}
function area(label,name,value='',rows=4){const id='f-'+name.replace(/[^a-z0-9-]/gi,'-');return `<div class="field"><label for="${h(id)}">${h(label)}</label><textarea id="${h(id)}" name="${h(name)}" rows="${rows}">${h(value)}</textarea></div>`;}
function lineList(arr){return Array.isArray(arr)?arr.join('\n'):'';}
function splitLines(s){return String(s||'').split('\n').map(l=>l.trim()).filter(Boolean);}
function heading(name,description,button=''){return `<div class="admin-heading"><div><small class="eyebrow">EDITOR · VOZES QUE NÃO SE CALAM</small><h1>${h(name)}</h1><p>${h(description)}</p></div>${button}</div>`;}
function gallery(id){return data.galleries.find(g=>g.id===id);}
function project(id){return data.projects.find(g=>g.id===id);}
function switchTab(next){tab=next;selectedGallery='';selectedProject='';render();}
function render(){
 $$('.tab-link').forEach(b=>b.classList.toggle('active',b.dataset.tab===tab));
 const titles={dashboard:'Visão geral',galleries:'Galerias e quadros',floor:'Planta do museu',projects:'Projetos escolares',mural:'Mural curatorial',institution:'Instituição e referências'};
 $('#admin-title').textContent=titles[tab];
 const views={dashboard:dashboard,galleries:galleries,floor:floor,projects:projects,mural:mural,institution:institution};
 $('#admin-content').innerHTML=views[tab]();
}
function dashboard(){const visible=data.galleries.filter(g=>g.published&&!g.archived);
 return heading('Curadoria do museu','Edite as exposições sem precisar escrever código.')+`
 <div class="stats"><div class="stat"><span>${data.galleries.length}</span><small>Galerias cadastradas</small></div><div class="stat"><span>${visible.length}</span><small>Galerias publicadas</small></div><div class="stat"><span>${data.galleries.reduce((s,g)=>s+(g.panels||[]).length,0)}</span><small>Quadros educativos</small></div><div class="stat"><span>${data.projects.filter(p=>p.published).length}</span><small>Projetos publicados</small></div></div>
 <div class="panel"><h2>Como publicar uma alteração no GitHub Pages</h2><ol class="editor-instructions"><li>Edite suas galerias, projetos e informações por aqui. O rascunho é guardado somente neste navegador.</li><li>Use <b>Prévia do rascunho</b> para conferir a aparência antes de publicar.</li><li>Clique em <b>Baixar dados.js para publicar</b>.</li><li>No repositório do GitHub, substitua o arquivo <code>js/dados.js</code> pelo arquivo baixado e confirme a alteração (commit).</li><li>O GitHub Pages atualizará o museu publicado. Imagens e documentos devem ser enviados ao repositório separadamente.</li></ol></div>
 <div class="notice"><strong>Importante:</strong> este editor não possui login nem acesso de escrita ao GitHub. Qualquer pessoa pode abrir a interface, mas as edições dela permanecem no navegador da própria pessoa, a menos que alguém com acesso ao repositório publique o arquivo exportado.</div>
 <div class="grid-two"><section class="panel"><h2>Gerenciar seus arquivos</h2><div class="editor-inline-actions"><button class="secondary" type="button" data-action="import">Importar dados.js ou JSON</button><button class="secondary" type="button" data-action="reset">Descartar rascunho local</button></div><p class="editor-small">A importação substitui o conteúdo do editor, mas só será publicada quando você enviar o novo arquivo ao GitHub.</p></section><section class="panel"><h2>Uso responsável</h2><p>Para fotos ou vídeos de estudantes, confirme previamente as autorizações necessárias. Este site não possui cadastro de visitantes nem coleta mensagens públicas automaticamente.</p><p>Créditos, fontes e autores podem ser informados em cada peça.</p></section></div>`;
}
function galleries(){
 const g=gallery(selectedGallery);if(g)return galleryForm(g);
 return heading('Galerias e quadros','Crie novas salas e altere os textos dos quadros.',`<button type="button" class="primary" data-action="add-gallery">+ Nova galeria</button>`)+`<section class="panel">
 ${[...data.galleries].sort((a,b)=>a.order-b.order).map(g=>`<div class="record"><div class="record-meta"><span class="record-index">${String(g.order).padStart(2,'0')}</span><div class="record-title"><strong>${h(g.name)}</strong><small>${(g.panels||[]).length} quadros · ${h(g.id)} · ${g.archived?'Arquivada':g.published?'Publicada':'Rascunho'}</small></div></div><div class="record-actions"><button class="secondary" type="button" data-action="edit-gallery" data-id="${h(g.id)}">Editar</button><button class="secondary" type="button" data-action="toggle-gallery" data-id="${h(g.id)}">${g.published&&!g.archived?'Despublicar':'Publicar'}</button><button class="danger" type="button" data-action="archive-gallery" data-id="${h(g.id)}">${g.archived?'Desarquivar':'Arquivar'}</button></div></div>`).join('')}
 </section>`;
}
function panelGroup(p,i){return `<fieldset class="editor-fieldset" data-panel-id="${h(p.id)}"><legend>Peça ${String(i+1).padStart(2,'0')}</legend>
 ${field('Título','panel-title-'+i,p.title)}
 ${area('Texto educativo','panel-text-'+i,p.text,5)}
 <div class="form-grid">${field('Tipo de peça','panel-kind-'+i,p.kind)}${field('Imagem (caminho assets/... ou https://...)','panel-image-'+i,p.image)}</div>
 ${field('Legenda da imagem','panel-caption-'+i,p.caption)}
 ${field('Fonte / referência','panel-source-'+i,p.source)}
 <button class="danger" type="button" data-action="remove-panel" data-id="${h(p.id)}">Remover esta peça</button>
 </fieldset>`;}
function galleryForm(g){return `<div class="editor-breadcrumb"><button type="button" data-action="back-galleries">← Todas as galerias</button> / ${h(g.name)}</div>
 ${heading('Editar galeria',`Sala ${String(g.order).padStart(2,'0')} · Os textos serão publicados depois da exportação do arquivo.`)}
 <form id="gallery-form" class="panel"><h2>Informações da exposição</h2>
 <div class="form-grid">${field('Nome da galeria','name',g.name)}${field('Título da exposição','title',g.title)}${field('Subtítulo','subtitle',g.subtitle)}${field('Tema','theme',g.theme)}${field('Letra ou símbolo da planta','letter',g.letter)}${field('Cor da sala','color',g.color,'color')}${field('Ordem','order',g.order,'number','min="1" max="999"')}${field('Chamada curta','tag',g.tag)}</div>
 ${area('Texto principal da galeria','description',g.description,7)}${area('Pergunta para reflexão','question',g.question,3)}${area('Fontes (uma URL HTTPS por linha)','refs',lineList(g.refs),3)}
 <label class="checkbox-line"><input type="checkbox" name="published" ${g.published?'checked':''}> Exibir no museu publicado</label>
 <h2>Quadros e peças da exposição</h2><p class="editor-small">Cada peça aparece como um quadro clicável na sala.</p>
 <div id="panel-editors">${g.panels.map(panelGroup).join('')}</div>
 <div class="editor-inline-actions"><button class="secondary" type="button" data-action="add-panel">+ Adicionar quadro</button></div>
 <div class="editor-actions-sticky"><button class="primary" type="submit">Salvar alterações no rascunho</button><button class="secondary" type="button" data-action="back-galleries">Voltar à lista</button></div>
 </form>`;}
function saveGalleryForm(){const g=gallery(selectedGallery),form=$('#gallery-form');if(!g||!form)return false;
 const fd=new FormData(form);for(const name of ['name','title','subtitle','theme','letter','color','tag','description','question'])g[name]=String(fd.get(name)||'').trim();
 g.name=g.name||'Galeria sem título';g.order=Math.max(1,Number(fd.get('order'))||1);g.refs=splitLines(fd.get('refs')).filter(u=>/^https:\/\//i.test(u));g.published=fd.has('published');
 g.panels=$$('[data-panel-id]',form).map(p=>{const no=Number($('input[name^="panel-title-"]',p)?.name.split('-').pop());const value=n=>String(fd.get(`panel-${n}-${no}`)||'').trim();return {id:p.dataset.panelId,title:value('title'),text:value('text'),kind:value('kind'),image:value('image'),caption:value('caption'),source:value('source')};});
 save();return true;
}
function floor(){const rooms=data.galleries.filter(g=>!g.archived);if(!selectedRoom||!gallery(selectedRoom))selectedRoom=rooms[0]?.id||'';
 const g=gallery(selectedRoom);
 const mapHeight=Math.max(835,...rooms.map(r=>Number(r.y)+Number(r.h)+70));
 return heading('Planta do museu','Selecione, arraste e redimensione salas. Para criar uma sala, use a aba Galerias.')+
 `<div class="panel"><p>Esta planta é editável sem servidor. As coordenadas são salvas no rascunho ao arrastar ou alterar os números.</p><div class="floor-editor"><svg id="floor-svg" viewBox="0 0 955 ${mapHeight}" aria-label="Editor de posições das salas na planta">
 <rect x="15" y="18" width="925" height="${mapHeight-48}" rx="5" fill="#e0d0b3" stroke="#695546" stroke-width="8"/>
 <rect x="315" y="70" width="25" height="470" fill="#faf0d7"/>
 <rect x="605" y="70" width="28" height="470" fill="#faf0d7"/>
 <rect x="70" y="294" width="815" height="32" fill="#faf0d7"/>
 <rect x="70" y="545" width="815" height="45" fill="#faf0d7"/>
 <rect x="460" y="570" width="36" height="${Math.max(0,mapHeight-655)}" fill="#faf0d7"/>
 ${[...new Set(rooms.filter(r=>r.y>800).map(r=>r.y))].map(y=>`<rect x="70" y="${y-40}" width="815" height="24" fill="#faf0d7"/>`).join('')}
 ${rooms.map(r=>`<g class="floor-room ${r.id===selectedRoom?'is-selected':''}" data-id="${h(r.id)}" tabindex="0" role="button" aria-label="Selecionar ${h(r.name)}" transform="translate(${r.x} ${r.y})"><rect width="${r.w}" height="${r.h}" fill="${/^#[0-9a-f]{6}$/i.test(r.color)?r.color:'#a6533c'}" fill-opacity=".28" rx="2"/><text x="${r.w/2}" y="${r.h/2}" text-anchor="middle" fill="#30251f">${h(r.name.slice(0,24))}</text></g>`).join('')}
 <rect x="380" y="${mapHeight-54}" width="190" height="30" fill="#30251f"/><text x="475" y="${mapHeight-34}" text-anchor="middle" fill="#fff">ENTRADA</text>
 </svg></div><p class="floor-info">Arraste as salas ou clique em uma e altere os valores. O espaço abaixo permite a criação de novas alas.</p>
 ${g?`<div class="floor-controls">${['x','y','w','h'].map(n=>`<label>${({x:'Posição X',y:'Posição Y',w:'Largura',h:'Altura'})[n]}<input type="number" data-floor-field="${n}" value="${Number(g[n])}" min="${['w','h'].includes(n)?80:0}" max="3000" step="5"></label>`).join('')}</div><div class="editor-inline-actions"><strong>Sala: ${h(g.name)}</strong></div>`:'<div class="empty">Ainda não há salas ativas.</div>'}
 </div>`;}
function projects(){const p=project(selectedProject);if(p)return projectForm(p);
 return heading('Projetos escolares','Cadastre os trabalhos das turmas e professores.',`<button class="primary" type="button" data-action="add-project">+ Novo projeto</button>`)+`<section class="panel">${data.projects.length?data.projects.map(p=>`<div class="record"><div class="record-meta"><span class="record-index">✦</span><div class="record-title"><strong>${h(p.title)}</strong><small>${h(p.teacher||'Docente não informado')} · ${p.published?'Publicado':'Rascunho'}</small></div></div><div class="record-actions"><button class="secondary" data-action="edit-project" data-id="${h(p.id)}">Editar</button><button class="secondary" data-action="toggle-project" data-id="${h(p.id)}">${p.published?'Despublicar':'Publicar'}</button><button class="danger" data-action="delete-project" data-id="${h(p.id)}">Excluir</button></div></div>`).join(''):'<div class="empty">Nenhum trabalho cadastrado ainda. Use “Novo projeto” para preparar a primeira exposição da escola.</div>'}</section>`;
}
function projectForm(p){return `<div class="editor-breadcrumb"><button data-action="back-projects">← Todos os projetos</button> / ${h(p.title)}</div>${heading('Editar projeto','A exposição individual será publicada na galeria da comunidade escolar.')}
 <form id="project-form" class="panel"><div class="form-grid">${field('Nome do projeto','title',p.title)}${field('Categoria','category',p.category)}${field('Professor(a)','teacher',p.teacher)}${field('Disciplina','subject',p.subject)}${field('Turma','class',p.class)}</div>
 ${area('Descrição','description',p.description,6)}${area('Objetivos','objectives',p.objectives)}${area('Resultados','results',p.results)}${area('Créditos','credits',p.credits)}
 ${area('Imagens (URL HTTPS ou caminho assets/...; uma por linha)','images',lineList(p.images),4)}
 ${area('Links e arquivos (uma URL por linha)','links',lineList(p.links),4)}
 <label class="checkbox-line"><input type="checkbox" name="published" ${p.published?'checked':''}> Publicar projeto</label>
 <div class="notice">Arquivos e imagens não são enviados por este editor. Primeiro adicione os arquivos à pasta <code>assets/</code> do repositório e depois use caminhos como <code>assets/foto1.jpg</code>.</div>
 <div class="editor-actions-sticky"><button class="primary" type="submit">Salvar projeto no rascunho</button><button class="secondary" type="button" data-action="back-projects">Voltar</button></div>
 </form>`;}
function saveProjectForm(){const p=project(selectedProject),form=$('#project-form');if(!p||!form)return;const fd=new FormData(form);
 for(const name of ['title','category','teacher','subject','class','description','objectives','results','credits'])p[name]=String(fd.get(name)||'').trim();p.title=p.title||'Projeto sem título';
 p.images=splitLines(fd.get('images')).filter(url=>/^https:\/\//i.test(url)||/^(\.\/)?assets\/[\w./-]+$/.test(url)&&!url.includes('..'));
 p.links=splitLines(fd.get('links')).filter(url=>/^https:\/\//i.test(url)||/^(\.\/)?assets\/[\w./-]+$/.test(url)&&!url.includes('..'));
 p.published=fd.has('published');save();}
function mural(){return heading('Mural curatorial','As mensagens públicas são cadastradas manualmente, não enviadas por visitantes.')+
 `<section class="panel"><h2>Adicionar uma reflexão selecionada</h2><p>Somente publique conteúdo com autorização e sem dados pessoais. O formulário público do museu não envia mensagens: ele guarda uma reflexão privada no navegador do visitante.</p>
 <form id="mural-editor-form">${area('Texto da mensagem','message','',4)}<button class="primary" type="submit">Adicionar mensagem ao rascunho</button></form></section>
 <section class="panel"><h2>Mensagens cadastradas (${data.messages.length})</h2>${data.messages.length?data.messages.map(m=>`<article class="record"><div><p class="mural-message">“${h(m.message)}”</p><small>${h(m.created_at||'')} · ${m.status==='approved'?'Visível no site':'Oculta'}</small></div><div class="record-actions"><button class="secondary" data-action="toggle-message" data-id="${h(m.id)}">${m.status==='approved'?'Ocultar':'Publicar'}</button><button class="danger" data-action="delete-message" data-id="${h(m.id)}">Excluir</button></div></article>`).join(''):'<div class="empty">Nenhuma mensagem curada até o momento.</div>'}</section>`;}
function institution(){const s=data.settings.institution||{};
 return heading('Instituição e fontes','Inclua os créditos de quem organizou o museu e as referências utilizadas.')+
 `<form id="institution-form" class="panel"><h2>Sobre a instituição</h2>${field('Nome da escola','school',s.school)}${field('Subtítulo do museu','subtitle',s.subtitle)}${area('Equipe organizadora','team',s.team)}${area('Créditos do projeto','credits',s.credits)}${field('Contato institucional (opcional)','contact',s.contact)}<h2>Referências bibliográficas</h2><p class="editor-small">Uma por linha no formato <code>Título | https://endereco...</code>. Também é permitido apenas o título de uma obra impressa.</p>${area('Referências','references',data.references.map(r=>r.name+(r.url?' | '+r.url:'')).join('\n'),8)}<div class="editor-actions-sticky"><button class="primary" type="submit">Salvar informações no rascunho</button></div></form>`;}
function exportData(){if(tab==='galleries'&&selectedGallery)saveGalleryForm();if(tab==='projects'&&selectedProject)saveProjectForm();
 const source='// Vozes que Não se Calam — acervo público estático. Gerado pelo editor.html.\nwindow.MUSEU_DADOS = '+JSON.stringify(data,null,2)+';\n';
 const blob=new Blob([source],{type:'text/javascript;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='dados.js';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),5000);toast('Arquivo dados.js baixado. Substitua js/dados.js no repositório.');}
function addGallery(){const n=Math.max(0,...data.galleries.map(g=>Number(g.order)||0))+1;
 const base=`galeria-${n}`,id=data.galleries.some(g=>g.id===base)?randomId('galeria'):base;
 const farY=Math.max(0,...data.galleries.map(g=>Number(g.y)||0));
 const newY=Math.max(845,farY+235);
 const g={id,order:n,name:'Nova galeria',title:'Nova exposição',theme:'Nova temática',tag:'',letter:'✦',subtitle:'Explore esta sala',color:'#a6533c',x:80,y:newY,w:360,h:170,description:'Escreva aqui a introdução da nova galeria.',question:'Que reflexões esta exposição nos inspira?',panels:[{id:id+'-1',title:'Primeiro quadro',text:'Adicione aqui o conteúdo educativo.',kind:'Painel educativo',image:'',caption:'',source:''}],published:false,archived:false,refs:[]};
 data.galleries.push(g);selectedGallery=id;save();render();toast('Galeria criada como rascunho.');}
function preview(){if(tab==='galleries'&&selectedGallery)saveGalleryForm();if(tab==='projects'&&selectedProject)saveProjectForm();save();window.open('./index.html?rascunho=1#explorar','_blank','noopener');}
async function importData(file){if(!file)return;const content=await file.text();let raw=content.trim();
 if(/\.js$/i.test(file.name)){
  raw=raw.replace(/^(?:\s*\/\/[^\n]*\n)*/, '');
  if(!/^window\.MUSEU_DADOS\s*=/.test(raw))throw new Error('Arquivo JS incompatível. Selecione um dados.js exportado pelo editor.');
  raw=raw.replace(/^window\.MUSEU_DADOS\s*=\s*/,'').replace(/;\s*$/,'');
 }
 const next=JSON.parse(raw);if(!isValid(next))throw new Error('Formato do acervo inválido.');
 if(!confirm('Importar este arquivo e substituir o rascunho atual neste navegador?'))return;
 data=next;save();selectedGallery='';selectedProject='';render();toast('Acervo importado para o rascunho.');}
$('#import-file').addEventListener('change',async e=>{try{await importData(e.target.files[0]);}catch(error){alert('Não foi possível importar: '+error.message);}finally{e.target.value='';}});
document.addEventListener('submit',e=>{
 if(e.target.id==='gallery-form'){e.preventDefault();saveGalleryForm();toast('Galeria salva no navegador. Exporte para publicar.');}
 if(e.target.id==='project-form'){e.preventDefault();saveProjectForm();toast('Projeto salvo no navegador. Exporte para publicar.');}
 if(e.target.id==='mural-editor-form'){e.preventDefault();const message=String(new FormData(e.target).get('message')||'').trim();if(message.length<8||message.length>500){alert('Mensagem deve ter de 8 a 500 caracteres.');return;}data.messages.push({id:randomId('mensagem'),message,created_at:new Date().toISOString(),status:'approved'});save();render();toast('Mensagem adicionada ao rascunho.');}
 if(e.target.id==='institution-form'){e.preventDefault();const fd=new FormData(e.target);data.settings.institution=Object.fromEntries(['school','subtitle','team','credits','contact'].map(k=>[k,String(fd.get(k)||'').trim()]));data.references=splitLines(fd.get('references')).map(line=>{const idx=line.indexOf('|');if(idx===-1)return {name:line,url:''};const name=line.slice(0,idx).trim();const url=line.slice(idx+1).trim();return {name,url:/^https:\/\//i.test(url)?url:''};}).filter(v=>v.name);save();toast('Créditos salvos no navegador.');}
});
document.addEventListener('click',e=>{
 const tabButton=e.target.closest('[data-tab]');if(tabButton){switchTab(tabButton.dataset.tab);return;}
 const btn=e.target.closest('[data-action]');if(!btn)return;
 const {action,id}=btn.dataset;
 if(action==='export'){exportData();return;}
 if(action==='preview'){preview();return;}
 if(action==='import'){$('#import-file').click();return;}
 if(action==='reset'){if(confirm('Descartar o rascunho deste navegador e voltar aos dados publicados?')){data=clone(initial);save();render();toast('Rascunho restaurado para a versão publicada.');}return;}
 if(action==='add-gallery'){addGallery();return;}
 if(action==='edit-gallery'){selectedGallery=id;render();return;}
 if(action==='back-galleries'){if(selectedGallery)saveGalleryForm();selectedGallery='';render();return;}
 if(action==='toggle-gallery'){const g=gallery(id);if(!g)return;g.archived=false;g.published=!(g.published&&!g.archived);save();render();return;}
 if(action==='archive-gallery'){const g=gallery(id);if(!g)return;g.archived=!g.archived;if(g.archived)g.published=false;save();render();return;}
 if(action==='add-panel'){if(!selectedGallery)return;saveGalleryForm();const g=gallery(selectedGallery);g.panels.push({id:randomId('painel'),title:'Novo quadro',text:'',kind:'Painel educativo',image:'',caption:'',source:''});save();render();return;}
 if(action==='remove-panel'){if(!selectedGallery)return;saveGalleryForm();const g=gallery(selectedGallery);if(!confirm('Remover esta peça da galeria?'))return;g.panels=g.panels.filter(p=>p.id!==id);save();render();return;}
 if(action==='add-project'){const id=randomId('projeto');data.projects.push({id,title:'Novo projeto',category:'Projetos interdisciplinares',teacher:'',subject:'',class:'',description:'',objectives:'',results:'',credits:'',images:[],links:[],published:false});selectedProject=id;save();render();return;}
 if(action==='edit-project'){selectedProject=id;render();return;}
 if(action==='back-projects'){if(selectedProject)saveProjectForm();selectedProject='';render();return;}
 if(action==='toggle-project'){const p=project(id);if(!p)return;p.published=!p.published;save();render();return;}
 if(action==='delete-project'){if(!confirm('Excluir este projeto do rascunho?'))return;data.projects=data.projects.filter(p=>p.id!==id);save();render();return;}
 if(action==='toggle-message'){const m=data.messages.find(m=>m.id===id);if(!m)return;m.status=m.status==='approved'?'hidden':'approved';save();render();return;}
 if(action==='delete-message'){if(!confirm('Excluir a mensagem do rascunho?'))return;data.messages=data.messages.filter(m=>m.id!==id);save();render();}
});
// Floorplan pointer editing (no backend); SVG coordinates preserve proportions.
let dragging=null;
const point=(svg,event)=>{const pos=svg.createSVGPoint();pos.x=event.clientX;pos.y=event.clientY;return pos.matrixTransform(svg.getScreenCTM().inverse());};
document.addEventListener('pointerdown',e=>{
 const target=e.target.closest?.('.floor-room');const svg=$('#floor-svg');if(!target||!svg)return;
 selectedRoom=target.dataset.id;const g=gallery(selectedRoom);if(!g)return;
 const p=point(svg,e);dragging={pointer:e.pointerId,id:g.id,dx:p.x-Number(g.x),dy:p.y-Number(g.y),moved:false};
 $$('.floor-room',svg).forEach(item=>item.classList.toggle('is-selected',item.dataset.id===selectedRoom));
 ['x','y','w','h'].forEach(k=>{const input=$(`[data-floor-field="${k}"]`);if(input)input.value=g[k];});
 try{target.setPointerCapture(e.pointerId);}catch{}
});
document.addEventListener('pointermove',e=>{
 if(!dragging||e.pointerId!==dragging.pointer)return;
 const svg=$('#floor-svg'),target=$(`.floor-room[data-id="${dragging.id}"]`,svg),g=gallery(dragging.id);if(!svg||!target||!g)return;
 const p=point(svg,e);const x=Math.max(35,Math.min(920-g.w,Math.round((p.x-dragging.dx)/5)*5));const y=Math.max(50,Math.min(2800,Math.round((p.y-dragging.dy)/5)*5));
 g.x=x;g.y=y;dragging.moved=true;target.setAttribute('transform',`translate(${x} ${y})`);
 const xi=$('[data-floor-field="x"]'),yi=$('[data-floor-field="y"]');if(xi)xi.value=x;if(yi)yi.value=y;
});
document.addEventListener('pointerup',e=>{if(!dragging||dragging.pointer!==e.pointerId)return;if(dragging.moved)save();dragging=null;});
document.addEventListener('keydown',e=>{const r=e.target.closest?.('.floor-room');if(r&&(e.key==='Enter'||e.key===' ')){e.preventDefault();selectedRoom=r.dataset.id;render();}});
document.addEventListener('change',e=>{const k=e.target.dataset.floorField;if(!k)return;const g=gallery(selectedRoom);if(!g)return;
 let n=Number(e.target.value);if(!Number.isFinite(n))return;n=Math.round(n/5)*5;
 if(k==='w'||k==='h')n=Math.max(80,Math.min(700,n));else if(k==='x')n=Math.max(35,Math.min(900-g.w,n));else n=Math.max(45,Math.min(2800,n));
 g[k]=n;save();render();});
render();
})();
