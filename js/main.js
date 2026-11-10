/*
  Vozes que Não se Calam — navegação estática para GitHub Pages.
  A planta é a ÚNICA entrada para as salas. Não existe catálogo separado.
  Conteúdos editáveis permanecem em js/dados.js.
*/
(() => {
  'use strict';
  const api = window.Museu || {};
  const view = document.getElementById('view');
  const menu = document.getElementById('main-nav');
  const menuButton = document.getElementById('mobile-menu');
  const state = { galleries: [], projects: [], messages: [], references: [], settings: {}, visited: [] };
  const h = (value = '') => String(value ?? '').replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));
  const asText = value => String(value ?? '');
  const safe = url => (typeof api.safeUrl === 'function' ? api.safeUrl(url) : '');
  const roomUrl = id => '#sala/' + encodeURIComponent(id);

  try {
    const previous = JSON.parse(localStorage.getItem('museu-visitadas') || '[]');
    if (Array.isArray(previous)) state.visited = previous;
  } catch (_) { /* A navegação não depende do localStorage. */ }

  function renderError(error) {
    console.error('[Museu] Erro de inicialização:', error);
    const message = error && error.message ? error.message : asText(error);
    view.innerHTML = `<section class="plain-page wrap"><div class="section-eyebrow">Aviso técnico</div>
      <h1 class="display">O museu não pôde ser iniciado.</h1>
      <p>Confira se <code>js/dados.js</code> está presente e se os arquivos foram enviados para as pastas corretas.</p>
      <p class="muted"><strong>Detalhe:</strong> <code>${h(message)}</code></p>
      <p><a class="button" href="./diagnostico.html">Abrir diagnóstico ↗</a></p></section>`;
  }

  function readData() {
    let data = window.MUSEU_DADOS;
    if (new URLSearchParams(location.search).has('rascunho')) {
      try {
        const draft = localStorage.getItem('museu-editor-rascunho-v2');
        if (draft) data = JSON.parse(draft);
      } catch (err) { console.warn('Rascunho inválido, usando arquivo publicado.', err); }
    }
    if (!data || typeof data !== 'object' || !Array.isArray(data.galleries)) {
      throw new Error('MUSEU_DADOS não encontrado ou sem a lista galleries. Verifique js/dados.js.');
    }
    state.galleries = data.galleries.filter(g => g && g.published !== false && !g.archived)
      .map((g,i) => ({...g, id: asText(g.id || `sala-${i+1}`), name: asText(g.name || 'Sala sem nome'),
        order: Number(g.order) || i + 1, x: Number(g.x) || 80, y: Number(g.y) || 80,
        w: Number(g.w) || 225, h: Number(g.h) || 185, panels: Array.isArray(g.panels) ? g.panels : [],
        color: /^#[0-9a-f]{6}$/i.test(g.color || '') ? g.color : '#a6533c',
        refs: Array.isArray(g.refs) ? g.refs.filter(u => safe(u)) : [] }))
      .sort((a,b) => a.order - b.order);
    state.projects = Array.isArray(data.projects) ? data.projects.filter(p => p && p.published === true) : [];
    state.messages = Array.isArray(data.messages) ? data.messages.filter(m => m && m.status === 'approved') : [];
    state.references = Array.isArray(data.references) ? data.references : [];
    state.settings = data.settings || {};
  }

  function home() {
    const gs = state.galleries;
    return `<section class="intro wrap" id="inicio"><div>
      <div class="section-eyebrow">Museu Virtual de Memória, Literatura e Educação Antirracista</div>
      <h1 class="display">Vozes que<br><em>não se</em> calam<span style="color:var(--ochre)">.</span></h1>
      </div><div class="intro-aside"><p>Conheça histórias, memórias e formas de resistência. Escolha uma sala diretamente na planta do museu.</p>
      <a class="button" href="#explorar" id="start-visit">Entrar no museu ↗</a>
      <div class="intro-counter"><strong>${String(gs.length).padStart(2,'0')}</strong><span>Salas abertas<br>à visitação</span></div></div></section>
      <section class="museum-section" id="explorar"><div class="wrap">
        <div class="map-heading"><div><div class="section-eyebrow eyebrow-light">Mapa interativo</div>
        <h2>Escolha uma sala<br><em>na planta.</em></h2></div><p>Clique em um ambiente para entrar, observar os quadros e abrir as exposições.</p></div>
        <div class="map-layout"><div class="map-card"><div class="map-toolbar"><span>PLANTA BAIXA · MUSEU VIRTUAL</span>
        <div class="map-tools"><span>ZOOM</span><button type="button" id="map-zoom-out" aria-label="Diminuir planta">−</button>
        <button type="button" id="map-zoom-in" aria-label="Ampliar planta">+</button>
        <button type="button" id="map-reset" aria-label="Restaurar planta">⟳</button></div></div>
        <div class="map-viewport" id="map-viewport"><div id="museum-map"></div></div>
        <div class="map-caption"><span>Selecione uma sala no mapa</span><span>Entrada principal na parte inferior</span></div></div>
        <aside class="map-sidebar"><div class="room-links" aria-label="Alternativa acessível à planta">
        ${gs.map(g => `<button type="button" class="room-link" data-room-id="${h(g.id)}"><span class="room-link-num">${String(g.order).padStart(2,'0')}</span><span><b>${h(g.name)}</b><small>${h(g.theme || '')}</small></span></button>`).join('')}
        </div><div class="map-hint"><span>⌖</span><p>A lista é uma alternativa à planta para navegação por teclado e celular.</p></div>
        <span class="progress-label">${state.visited.filter(id => gs.some(g => g.id === id)).length} de ${gs.length} salas visitadas</span></aside></div>
      </div></section>`;
  }

  function bindHome() {
    const holder = document.getElementById('museum-map');
    if (!holder || typeof api.renderMap !== 'function') throw new Error('js/mapa.js não foi carregado.');
    const svg = api.renderMap(holder, state.galleries, id => { location.hash = roomUrl(id); }, state.visited);
    document.querySelectorAll('.room-link').forEach(button => button.addEventListener('click', () => {
      location.hash = roomUrl(button.dataset.roomId);
    }));
    let zoom = 1;
    const viewport = document.getElementById('map-viewport');
    const adjust = delta => {
      zoom = Math.min(2.6, Math.max(1, zoom + delta));
      svg.style.width = (100 * zoom) + '%';
      viewport.style.overflow = zoom > 1 ? 'auto' : 'hidden';
    };
    document.getElementById('map-zoom-in').onclick = () => adjust(0.25);
    document.getElementById('map-zoom-out').onclick = () => adjust(-0.25);
    document.getElementById('map-reset').onclick = () => { zoom = 1; svg.style.width = '100%'; viewport.style.overflow = 'hidden'; };
  }

  function about() {
    const s = state.settings.institution || {};
    return `<article class="plain-page wrap"><div class="section-eyebrow">Sobre o projeto</div>
      <h1 class="display">Um museu de<br><em>memórias.</em></h1><div class="reading">
      <p class="lead">A memória preserva histórias. A educação transforma futuros.</p>
      <p>O museu <strong>Vozes que Não se Calam</strong> tem como referência a obra <em>Quarto de Despejo</em>, de Carolina Maria de Jesus. Seus ambientes relacionam literatura, história, educação antirracista e produções da comunidade escolar.</p>
      <p>Para explorar, <a href="#explorar">abra a planta</a> e selecione uma sala. Dentro dela, clique nos quadros para conhecer os textos e os projetos expostos.</p>
      ${s.school ? `<h2 class="subheading">Escola</h2><p>${h(s.school)}</p>` : ''}
      ${s.team ? `<h2 class="subheading">Equipe responsável</h2><p>${h(s.team)}</p>` : ''}
      <p><a href="#explorar" class="button">Visitar a planta ↗</a></p></div></article>`;
  }

  function credits() {
    const s = state.settings.institution || {};
    const refs = state.references.map(r => {
      const u = safe(r.url);
      return `<li>${u ? `<a href="${h(u)}" rel="noopener noreferrer" target="_blank">${h(r.name)} ↗</a>` : h(r.name)}</li>`;
    }).join('');
    return `<article class="plain-page wrap"><div class="section-eyebrow">Créditos e fontes</div>
      <h1 class="display">Créditos &<br><em>referências.</em></h1>
      <div class="reading"><p class="lead">Textos e exposições podem ser atualizados pela equipe responsável.</p>
      <h2 class="subheading">Referências</h2><ul class="reference-list">${refs}</ul>
      <h2 class="subheading">Autoria</h2><p>${h(s.credits || 'Projeto educativo da comunidade escolar.')}</p>
      ${s.school ? `<p><b>Instituição:</b> ${h(s.school)}</p>` : ''}
      ${s.team ? `<p><b>Equipe:</b> ${h(s.team)}</p>` : ''}
      <p>As representações gráficas abstratas são ilustrações, não documentos históricos.</p></div></article>`;
  }

  function projectScreen(p) {
    const images = (Array.isArray(p.images) ? p.images : []).filter(u => safe(u));
    const links = (Array.isArray(p.links) ? p.links : []).filter(u => safe(u));
    return `<article class="plain-page wrap"><a class="backline" href="#sala/projetos">← Voltar à exposição da escola</a>
      <div class="section-eyebrow">${h(p.category || 'Projeto escolar')}</div>
      <h1 class="display">${h(p.title)}</h1><div class="reading"><p class="lead">${h(p.description)}</p>
      ${p.teacher ? `<p><b>Professor(a):</b> ${h(p.teacher)}</p>` : ''}
      ${p.subject ? `<p><b>Disciplina:</b> ${h(p.subject)}</p>` : ''}
      ${p.class ? `<p><b>Turma:</b> ${h(p.class)}</p>` : ''}
      ${p.objectives ? `<h2 class="subheading">Objetivos</h2><p>${h(p.objectives)}</p>` : ''}
      ${images.length ? `<h2 class="subheading">Imagens</h2><div class="project-media">${images.map(u => `<a href="${h(u)}" target="_blank" rel="noopener noreferrer"><img src="${h(u)}" alt="Registro do projeto ${h(p.title)}" loading="lazy"></a>`).join('')}</div>` : ''}
      ${p.results ? `<h2 class="subheading">Resultados</h2><p>${h(p.results)}</p>` : ''}
      ${links.length ? `<h2 class="subheading">Recursos</h2><ul>${links.map(u => `<li><a href="${h(u)}" target="_blank" rel="noopener noreferrer">Abrir documento ↗</a></li>`).join('')}</ul>` : ''}
      ${p.credits ? `<p><b>Créditos:</b> ${h(p.credits)}</p>` : ''}</div></article>`;
  }

  function notFound() {
    return `<section class="plain-page wrap"><div class="section-eyebrow">Sala não encontrada</div>
    <h1 class="display">Esta porta não<br><em>está aberta.</em></h1>
    <p>Volte à planta para escolher um dos ambientes disponíveis.</p>
    <a class="button" href="#explorar">Abrir a planta ↗</a></section>`;
  }

  function markVisited(id) {
    if (state.visited.includes(id)) return;
    state.visited.push(id);
    try { localStorage.setItem('museu-visitadas', JSON.stringify(state.visited)); } catch (_) {}
  }

  function route() {
    try {
      const hash = decodeURIComponent(location.hash.slice(1) || 'inicio');
      const [part, id] = hash.split('/');
      if (['inicio','explorar','galerias','acervo'].includes(hash)) {
        view.innerHTML = home();
        bindHome();
        if (hash === 'explorar' || hash === 'galerias' || hash === 'acervo') {
          document.getElementById('explorar')?.scrollIntoView({behavior:'instant',block:'start'});
        } else { window.scrollTo(0,0); }
      } else if (part === 'sala' || part === 'galeria') {
        const g = state.galleries.find(entry => entry.id === id);
        if (!g) view.innerHTML = notFound();
        else {
          if (typeof api.renderGallery !== 'function') throw new Error('js/galerias.js não foi carregado.');
          markVisited(g.id);
          view.innerHTML = api.renderGallery(g, state.galleries, state.projects, state.messages);
          if (typeof api.bindDialog === 'function') api.bindDialog(g);
          if (typeof api.bindGalleryExtras === 'function') api.bindGalleryExtras(g);
          // Os links existentes no arquivo de exposições apontam para #galeria/.
          // São preservados para compatibilidade com páginas já compartilhadas.
        }
        window.scrollTo(0,0);
      } else if (part === 'projeto') {
        const p = state.projects.find(entry => entry.id === id);
        view.innerHTML = p ? projectScreen(p) : notFound();
        window.scrollTo(0,0);
      } else if (hash === 'sobre') {
        view.innerHTML = about(); window.scrollTo(0,0);
      } else if (hash === 'creditos') {
        view.innerHTML = credits(); window.scrollTo(0,0);
      } else { view.innerHTML = notFound(); window.scrollTo(0,0); }
      document.querySelectorAll('.main-nav a').forEach(a => {
        a.classList.toggle('active', a.getAttribute('href') === '#' + hash);
      });
      menu?.classList.remove('open');
      menuButton?.setAttribute('aria-expanded', 'false');
    } catch (error) { renderError(error); }
  }

  if (menuButton && menu) {
    menuButton.addEventListener('click', () => {
      const open = menu.classList.toggle('open');
      menuButton.setAttribute('aria-expanded', String(open));
    });
  }

  try {
    if (!api.renderMap || !api.renderGallery || !api.bindDialog) {
      throw new Error('Os scripts auxiliares do museu não foram carregados. Verifique a pasta js/.');
    }
    readData();
    route();
    window.addEventListener('hashchange', route);
    if (new URLSearchParams(location.search).has('rascunho')) {
      const notice = document.createElement('div');
      notice.className = 'preview-notice';
      notice.textContent = 'PRÉVIA LOCAL · alterações não publicadas no GitHub';
      document.body.appendChild(notice);
    }
  } catch (error) { renderError(error); }
})();
