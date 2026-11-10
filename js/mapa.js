(()=>{
const ns='http://www.w3.org/2000/svg';
const svg=(tag,attrs={},text='')=>{const el=document.createElementNS(ns,tag);for(const [k,v] of Object.entries(attrs))el.setAttribute(k,String(v));if(text)el.textContent=text;return el;};
function renderMap(container,galleries,onVisit,visited=[]){
  container.textContent='';
  const mapHeight=Math.max(835,...galleries.map(g=>g.y+g.h+65));
  const map=svg('svg',{viewBox:`0 0 955 ${mapHeight}`,role:'group','aria-label':'Planta arquitetônica interativa do museu. Utilize Tab para focar uma sala e Enter para entrar.',class:'floorplan-svg'});
  const defs=svg('defs');const pat=svg('pattern',{id:'floor-paper',patternUnits:'userSpaceOnUse',width:18,height:18});pat.append(svg('path',{d:'M 0 0 L 18 18',stroke:'#8f7b66','stroke-opacity':'.10','stroke-width':'.65'}));defs.append(pat);map.append(defs);
  map.append(svg('rect',{x:15,y:18,width:925,height:mapHeight-48,rx:5,fill:'#e2d4ba',stroke:'#6b5647','stroke-width':10}));
  map.append(svg('rect',{x:35,y:38,width:885,height:mapHeight-88,fill:'url(#floor-paper)',opacity:.65}));
  // Corredores e hall conectam os ambientes, inclusive a ala inferior.
  const corridor=svg('g',{class:'map-corridors'});
  corridor.append(svg('rect',{x:305,y:79,width:40,height:465,fill:'#f6edd9'}));
  corridor.append(svg('rect',{x:610,y:80,width:21,height:465,fill:'#f6edd9'}));
  corridor.append(svg('rect',{x:77,y:292,width:806,height:29,fill:'#f6edd9'}));
  corridor.append(svg('rect',{x:77,y:545,width:800,height:44,fill:'#f6edd9'}));
  corridor.append(svg('rect',{x:460,y:560,width:35,height:mapHeight-655,fill:'#f6edd9'}));
  const expandedRows=[...new Set(galleries.filter(g=>g.y>800).map(g=>g.y))];
  for(const y of expandedRows)corridor.append(svg('rect',{x:77,y:y-40,width:806,height:25,fill:'#f6edd9'}));
  corridor.append(svg('path',{d:`M 435 ${mapHeight-60} V ${mapHeight-38} Q 478 ${mapHeight-18} 520 ${mapHeight-38} V ${mapHeight-60}`,stroke:'#bc8b45',fill:'none','stroke-width':3,'stroke-dasharray':'6 5'}));
  map.append(corridor);
  const rooms=svg('g');
  for(const g of galleries){
    const group=svg('g',{class:'map-room'+(visited.includes(g.id)?' room-visited':''),tabindex:'0',role:'button','aria-label':`Entrar na galeria ${g.order}: ${g.name}`,'data-id':g.id});
    group.append(svg('rect',{x:g.x,y:g.y,width:g.w,height:g.h,fill:g.color||'#a6533c','fill-opacity':'.16',stroke:'#51453a','stroke-width':8,rx:2}));
    group.append(svg('rect',{x:g.x+9,y:g.y+9,width:Math.max(0,g.w-18),height:Math.max(0,g.h-18),fill:'transparent',stroke:'#b29b7b','stroke-width':1}));
    // Frame decorativo na sala, sempre relativo ao tamanho do espaço.
    const cx=g.x+g.w/2,cy=g.y+g.h/2;
    group.append(svg('rect',{x:cx-20,y:cy-34,width:40,height:50,fill:'#b59561','fill-opacity':'.23',stroke:'#a68b67','stroke-width':2}));
    group.append(svg('text',{x:cx,y:cy-1,'text-anchor':'middle',class:'map-room-letter'},g.letter||String(g.order).padStart(2,'0')));
    const words=g.name.split(' ');const lines=[];let ln='';for(const word of words){if((ln+' '+word).trim().length>22&&ln){lines.push(ln);ln=word;}else ln+=(ln?' ':'')+word;}if(ln)lines.push(ln);
    for(let i=0;i<Math.min(lines.length,3);i++)group.append(svg('text',{x:cx,y:cy+39+i*15-(lines.length>1?3:0),'text-anchor':'middle',class:'map-room-name'},lines[i]));
    group.append(svg('title',{},g.name+' — '+g.subtitle));
    group.addEventListener('click',()=>onVisit(g.id));
    group.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();onVisit(g.id);}});
    rooms.append(group);
  }
  map.append(rooms);
  map.append(svg('text',{x:478,y:580,class:'map-corridor-label','text-anchor':'middle'},'PASSAGEM CENTRAL'));
  map.append(svg('rect',{x:391,y:mapHeight-52,width:174,height:30,fill:'#30251f',rx:2}));
  map.append(svg('text',{x:478,y:mapHeight-32,fill:'#f2e8d5','text-anchor':'middle',style:'font: 11px system-ui;letter-spacing:3px;'},'ENTRADA PRINCIPAL ↑'));
  map.append(svg('text',{x:55,y:61,class:'map-north'},'N ↑'));
  container.append(map);
  return map;
}

Object.assign(window.Museu,{renderMap});
})();
