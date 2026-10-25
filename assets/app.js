'use strict';
(()=>{
const $=id=>document.getElementById(id);
const h=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&quot;'}[c]));
const github='MeuRepertorio';
const definitions=[
{id:'nexus',name:'Nexus',icon:'NX',desc:'Administradora condominial · estudo acadêmico',repo:'Nexus-Public',site:'Nexus-Public',status:'Em foco'},
{id:'je',name:'Jovem Empreendedor',icon:'JE',desc:'Plataforma e laboratório de aprendizagem',repo:'Jovem-Empreendedor',site:'Jovem-Empreendedor',status:'Em andamento'},
{id:'americanas',name:'Americanas',icon:'AM',desc:'Dossiê empresarial de 1929 a 2026',repo:'Estudo-de-caso---Americanas',site:'Estudo-de-caso---Americanas',status:'Em andamento'},
{id:'atlas',name:'ATLAS',icon:'AT',desc:'Ética · Legislação · Logística · DMN',repo:'ATLAS',site:'ATLAS',status:'Em foco'},
{id:'sgl',name:'SGL',icon:'SG',desc:'Signals · marca streetwear · estudo e criação',repo:'SGL-Studio',site:'SGL-Studio',status:'Em espera'},
{id:'entrevista',name:'Entrevista de Emprego',icon:'RH',desc:'Preparação para o Mercado de Trabalho',repo:'Entrevista-de-Emprego',site:'Entrevista-de-Emprego',status:'Em foco'}
];
const stored=(()=>{try{return JSON.parse(localStorage.getItem('abalion-central-v2')||'null')}catch{return null}})();
const defaults={projects:Object.fromEntries(definitions.map(x=>[x.id,{status:x.status,progress:0,next:'',due:'',notes:''}])),tasks:[],history:[],theme:'light'};
let state=stored&&typeof stored==='object'&&stored.projects?{...defaults,...stored}:structuredClone(defaults);
for(const x of definitions){if(!state.projects[x.id])state.projects[x.id]={...defaults.projects[x.id]};}
const save=()=>{try{localStorage.setItem('abalion-central-v2',JSON.stringify(state))}catch(e){alert('Armazenamento cheio; exporte seus dados.')}};
const fmt=d=>{if(!d)return 'A definir';const dt=new Date(d+'T12:00:00');return Number.isNaN(dt.getTime())?d:dt.toLocaleDateString('pt-BR',{day:'2-digit',month:'short',year:'numeric'})};
const doc=(text,kind)=>{const el=document.createElement(kind);el.textContent=text;return el};
const repoURL=p=>'https://github.com/'+github+'/'+p.repo;
const siteURL=p=>'https://'+github.toLowerCase()+'.github.io/'+encodeURIComponent(p.site)+'/';
let editingTask=null,editingProject='atlas';
function nav(view){
 document.querySelectorAll('#nav button[data-view]').forEach(b=>b.classList.toggle('active',b.dataset.view===view));
 document.querySelectorAll('section.view').forEach(s=>s.classList.toggle('active',s.id==='view-'+view));
 $('pageCrumb').textContent=({'visao':'VISÃO GERAL','constelacao':'CONSTELAÇÃO','fluxo':'FLUXO','agenda':'AGENDA','controle':'PUBLICAR NOS PROJETOS','observatorio':'GITHUB','memoria':'MEMÓRIA'})[view]||view.toUpperCase();
 window.scrollTo({top:0,behavior:'smooth'});
}
function renderHome(){
 const done=state.tasks.filter(t=>t.status==='Concluído').length;
 const withDate=state.tasks.filter(t=>t.due&&t.status!=='Concluído').sort((a,b)=>a.due.localeCompare(b.due));
 $('metrics').innerHTML=[['06','PROJETOS','Sistemas conectáveis'],[String(state.tasks.length).padStart(2,'0'),'INICIATIVAS','Registradas nesta central'],[String(done).padStart(2,'0'),'CONCLUÍDAS','No quadro de trabalho'],[String(withDate.length).padStart(2,'0'),'DATAS','Prazos ainda abertos']].map(([v,a,b])=>`<div class="metric"><small>${h(a)}</small><strong>${h(v)}</strong><span>${h(b)}</span></div>`).join('');
 $('projectList').innerHTML=definitions.map(p=>`<button class="proj-row" data-open-project="${p.id}"><span class="proj-icon">${p.icon}</span><span class="proj-main"><b>${h(p.name)}</b><small>${h(p.desc)}</small></span><span class="rowstate">${h(state.projects[p.id].status)}</span><span class="arrow">↗</span></button>`).join('');
 $('nextDeadlines').innerHTML=withDate.length?withDate.slice(0,5).map(t=>`<div class="horizon"><div class="cal"><b>${h(t.due.slice(8,10))}</b><small>${h(t.due.slice(5,7))}</small></div><div class="hmain"><b>${h(t.title)}</b><span>${h(definitions.find(p=>p.id===t.project)?.name||'Geral')}</span></div></div>`).join(''):'<p class="tiny-note">Nenhuma tarefa com prazo futuro registrada. As datas são criadas por você.</p>';
 $('insightText').textContent='Seu painel pessoal registra progresso e prioridades. Para modificar os sites de verdade, abra Publicar nos projetos.';
}
function renderPlanets(){
 $('planetNodes').innerHTML=definitions.map((p,i)=>`<button class="planet" data-open-project="${p.id}" style="--i:${i}"><span class="picon">${p.icon}</span><b>${h(p.name)}</b><small>${h(state.projects[p.id].status)}</small></button>`).join('');
 // Explicit coordinates, consistent across viewport sizes
 const pos=[[16,17],[49,9],[79,22],[78,68],[45,80],[12,67]];
 [...$('planetNodes').children].forEach((b,i)=>{b.style.position='absolute';b.style.left=pos[i][0]+'%';b.style.top=pos[i][1]+'%';b.style.transform='translate(-50%,-50%)';});
 const svg=$('connections');svg.innerHTML=pos.map(([x,y])=>`<line x1="500" y1="320" x2="${x*10}" y2="${y*6.4}" stroke="currentColor" opacity=".2" stroke-width="2" stroke-dasharray="8 6"/>`).join('');
}
function renderBoard(){
 const statuses=['Ideias','Em andamento','Concluído'];const proj=$('boardProject').value,prio=$('boardPriority').value,term=$('boardSearch').value.toLowerCase();
 $('kanban').innerHTML=statuses.map(stage=>{
 const list=state.tasks.filter(t=>t.status===stage&&(proj==='all'||t.project===proj)&&(prio==='all'||t.priority===prio)&&t.title.toLowerCase().includes(term));
 return `<div class="column" data-stage="${stage}"><div class="colhead"><b>${stage}</b><span>${list.length}</span></div>${list.map(t=>`<article class="taskcard" draggable="true" data-task="${h(t.id)}"><div class="tasktop"><span>${h(definitions.find(p=>p.id===t.project)?.name||'Geral')}</span><span class="${t.priority==='Alta'?'high':''}">${h(t.priority)}</span></div><button data-edit-task="${h(t.id)}"><h3>${h(t.title)}</h3></button><div class="taskfoot"><span>${fmt(t.due)}</span><span>↗ Abrir</span></div></article>`).join('')||'<p class="col-empty">Arraste tarefas para esta etapa.</p>'}</div>`;}).join('');
 $('kanban').querySelectorAll('[draggable]').forEach(a=>a.addEventListener('dragstart',e=>e.dataTransfer.setData('text/plain',a.dataset.task)));
 $('kanban').querySelectorAll('.column').forEach(col=>{col.addEventListener('dragover',e=>{e.preventDefault();col.classList.add('over')});col.addEventListener('dragleave',()=>col.classList.remove('over'));col.addEventListener('drop',e=>{e.preventDefault();col.classList.remove('over');const t=state.tasks.find(x=>x.id===e.dataTransfer.getData('text/plain'));if(t){t.status=col.dataset.stage;save();renderAll()}})});
}
function renderAgenda(){
 const list=state.tasks.filter(t=>t.due&&t.status!=='Concluído').sort((a,b)=>a.due.localeCompare(b.due));
 $('agendaClosest').textContent=list.length?fmt(list[0].due):'—';
 $('agendaList').innerHTML=list.length?list.map(t=>`<div class="agendarow"><div class="date">${fmt(t.due)}</div><div><b>${h(t.title)}</b><small>${h(definitions.find(p=>p.id===t.project)?.name||'Geral')} · ${h(t.status)}</small></div><button data-edit-task="${h(t.id)}">VER TAREFA ↗</button></div>`).join(''):'<p class="tiny-note">Nenhuma data registrada. Adicione prazos no quadro de tarefas.</p>';
}
function renderHistory(){
 $('historyCount').textContent=state.history.length+' REGISTROS';
 $('history').innerHTML=state.history.length?state.history.slice().reverse().map((n,i)=>`<div class="history-item"><button data-del-history="${state.history.length-1-i}" aria-label="Excluir registro">✕</button><small>${h(n.at)} · ${h(definitions.find(p=>p.id===n.project)?.name||'Geral')}</small><p>${h(n.text)}</p></div>`).join(''):'<p class="tiny-note">Nenhum registro ainda. Notas locais são opcionais; mudanças reais nos sites ocorrem em Publicar nos projetos.</p>';
}
function renderAll(){renderHome();renderPlanets();renderBoard();renderAgenda();renderHistory()}
function openProject(id){const p=definitions.find(x=>x.id===id);if(!p)return;editingProject=id;const form=$('projectForm');
 $('projectModalTitle').textContent=p.name;$('projectDescription').textContent=p.desc;
 for(const key of ['status','progress','next','due','notes'])form.elements[key].value=state.projects[id][key]??'';
 $('projectGithub').href=repoURL(p);$('projectSite').href=siteURL(p);
 $('projectDialog').showModal();}
function openTask(id=null,project=null){const t=state.tasks.find(x=>x.id===id);editingTask=t?.id||null;
 const form=$('taskForm');form.reset();$('taskModalTitle').textContent=t?'EDITAR TAREFA':'NOVA TAREFA';
 if(t)for(const key of ['title','project','status','priority','due','description'])form.elements[key].value=t[key]||'';
 else{form.elements.project.value=project||editingProject||'atlas';form.elements.status.value='Ideias';form.elements.priority.value='Média';}
 $('removeTask').hidden=!t;$('taskDialog').showModal();}
function setSelect(el,options,all=false){el.innerHTML=(all?'<option value="all">Todos os projetos</option>':'')+definitions.map(p=>`<option value="${p.id}">${h(p.name)}</option>`).join('')}
setSelect($('taskForm').elements.project,definitions);setSelect($('noteProject'),definitions);setSelect($('boardProject'),definitions,true);
$('boardProject').value='all';
$('projectForm').addEventListener('submit',e=>{e.preventDefault();const f=e.currentTarget;const d=state.projects[editingProject];
 for(const key of ['status','next','due','notes'])d[key]=f.elements[key].value;
 d.progress=Math.max(0,Math.min(100,Number(f.elements.progress.value)||0));save();$('projectDialog').close();renderAll();});
$('taskForm').addEventListener('submit',e=>{e.preventDefault();const f=e.currentTarget,t=state.tasks.find(x=>x.id===editingTask)||{id:'t-'+Date.now().toString(36),status:'Ideias'};
 for(const key of ['title','project','status','priority','due','description'])t[key]=f.elements[key].value;
 if(!editingTask)state.tasks.push(t);save();$('taskDialog').close();renderAll();});
$('removeTask').addEventListener('click',()=>{if(editingTask&&confirm('Excluir esta tarefa?')){state.tasks=state.tasks.filter(x=>x.id!==editingTask);$('taskDialog').close();save();renderAll();}});
$('closeProject').addEventListener('click',()=>$('projectDialog').close());$('closeTask').addEventListener('click',()=>$('taskDialog').close());
$('newProjectTask').addEventListener('click',()=>{$('projectDialog').close();openTask(null,editingProject)});
$('quickAdd').addEventListener('click',()=>openTask());$('addFromBoard').addEventListener('click',()=>openTask());
for(const x of ['boardProject','boardPriority','boardSearch'])$(x).addEventListener(x==='boardSearch'?'input':'change',renderBoard);
$('noteForm').addEventListener('submit',e=>{e.preventDefault();const v=$('noteText').value.trim();if(!v)return;state.history.push({project:$('noteProject').value,text:v,at:new Date().toLocaleString('pt-BR')});$('noteText').value='';save();renderHistory()});
$('exportAll').addEventListener('click',()=>{const blob=new Blob([JSON.stringify({version:2,exportedAt:new Date().toISOString(),data:state},null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='abalion-backup-'+new Date().toISOString().slice(0,10)+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)});
$('importAll').addEventListener('click',()=>$('importFile').click());$('importFile').addEventListener('change',async e=>{const f=e.target.files?.[0];if(!f)return;try{const o=JSON.parse(await f.text());if(!o.data||!Array.isArray(o.data.tasks)||!o.data.projects)throw Error();if(confirm('Substituir os dados locais pelos do backup?')){state={...defaults,...o.data};save();renderAll();}}catch{alert('Arquivo inválido. Selecione um backup exportado pelo Abalion.')}e.target.value=''});
$('resetAll').textContent='Restaurar central vazia';$('resetAll').addEventListener('click',()=>{if(confirm('Limpar tarefas e registros locais? Exporte antes se quiser preservar.')){state=structuredClone(defaults);save();renderAll();}});
$('themeBtn').addEventListener('click',()=>{state.theme=state.theme==='light'?'dark':'light';document.documentElement.dataset.theme=state.theme;save()});document.documentElement.dataset.theme=state.theme;
$('today').textContent=new Date().toLocaleDateString('pt-BR',{day:'2-digit',month:'short',year:'numeric'}).toUpperCase();
$('globalSearch').addEventListener('input',e=>{const term=e.target.value.toLowerCase().trim();if(!term)return;const p=definitions.find(x=>x.name.toLowerCase().includes(term)||x.desc.toLowerCase().includes(term));if(p){nav('constelacao');document.querySelector(`[data-open-project="${p.id}"]`)?.focus()}});
$('homeBrand').addEventListener('click',e=>{e.preventDefault();nav('visao')});
document.addEventListener('click',e=>{const n=e.target.closest('[data-view],[data-navigate],[data-open-project],[data-edit-task],[data-del-history]');if(!n)return;
 if(n.dataset.view)nav(n.dataset.view);else if(n.dataset.navigate)nav(n.dataset.navigate);
 else if(n.dataset.openProject)openProject(n.dataset.openProject);
 else if(n.dataset.editTask)openTask(n.dataset.editTask);
 else if(n.dataset.delHistory!==undefined){state.history.splice(Number(n.dataset.delHistory),1);save();renderHistory();}
});
function renderGithub(message='Consulte para ver dados atuais do GitHub.'){
 $('githubGrid').innerHTML=definitions.map(p=>`<div class="repo-card" data-repo="${p.repo}"><div class="repo-top"><div class="proj-icon">${p.icon}</div><div><b>${h(p.name)}</b><small>${h(p.repo)}</small></div></div><div class="repo-status">${message}</div><div class="repo-actions"><a href="${repoURL(p)}" target="_blank" rel="noopener">REPOSITÓRIO ↗</a><a href="${siteURL(p)}" target="_blank" rel="noopener">SITE ↗</a><a href="#" data-preselect-project="${p.id}">CRIAR ABA ↗</a></div></div>`).join('');
 document.querySelectorAll('[data-preselect-project]').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();nav('controle');document.querySelectorAll('#controlTargets input').forEach(x=>x.checked=x.value==='MeuRepertorio/'+definitions.find(p=>p.id===a.dataset.preselectProject)?.repo)}));}
renderGithub();
$('refreshGithub').addEventListener('click',async()=>{
 $('refreshGithub').disabled=true;
 for(const p of definitions){const card=document.querySelector(`[data-repo="${p.repo}"] .repo-status`);if(!card)continue;card.textContent='Consultando repositório...';
 try{const res=await fetch(`https://api.github.com/repos/${github}/${p.repo}`,{headers:{'Accept':'application/vnd.github+json'}});if(res.status===404){card.textContent='Repositório ainda não criado ou não está público.';continue;}if(!res.ok)throw Error('GitHub indisponível');const data=await res.json();const updated=new Date(data.pushed_at).toLocaleDateString('pt-BR');card.textContent='Última atualização: '+updated+' · branch '+(data.default_branch||'main');}catch(e){card.textContent='Não foi possível consultar agora; os links continuam disponíveis.';}}
 $('refreshGithub').disabled=false;
});
// Real GitHub integration: UI builds a public issue command; no credentials are stored or embedded.
const targetField=$('controlTargets');targetField.innerHTML=definitions.map(p=>`<label><input type="checkbox" value="MeuRepertorio/${p.repo}" ${p.id==='atlas'?'checked':''}/><span>${h(p.name)}</span></label>`).join('');
const cm=$('realControlForm');
function makeCommand(){const repos=[...targetField.querySelectorAll('input:checked')].map(x=>x.value);if(!repos.length)throw Error('Selecione pelo menos um projeto.');
 const title=cm.elements.title.value.trim(),summary=cm.elements.summary.value.trim(),content=cm.elements.content.value.trim();
 if(title.length<3||title.length>90||content.length<15||content.length>3600)throw Error('Título e conteúdo precisam ser preenchidos.');
 return {version:1,action:'create_section',repos,title,summary,content};}
function previewAction(){try{const c=makeCommand();const box=$('realPreview');box.replaceChildren();
 box.append(doc('ABAS NOVAS · '+c.repos.length+' PROJETO(S)','small'),doc(c.title,'strong'),doc(c.summary||'Sem resumo.','p'),doc(c.content.slice(0,330)+(c.content.length>330?'…':''),'p'));
 const dest=doc('DESTINOS: '+c.repos.map(x=>x.split('/')[1]).join(' · '),'small');box.append(dest);return c;
 }catch(e){alert(e.message);return null;}}
$('previewRealAction').addEventListener('click',previewAction);
cm.addEventListener('submit',e=>{e.preventDefault();const c=previewAction();if(!c)return;
 if(!confirm('Publicar este conteúdo nos repositórios selecionados? Será criada uma solicitação pública no GitHub para você confirmar.'))return;
 const command='<!-- ABALION_COMMAND_START -->\n'+JSON.stringify(c)+'\n<!-- ABALION_COMMAND_END -->';
 const body='Operação visual enviada pela central Abalion. **Conteúdo destinado a publicação pública.**\n\n'+command+'\n\nA execução ocorrerá somente após a automação estar configurada e autorizada pelo proprietário.';
 const title='[ABALION] Criar aba: '+c.title;
 const u='https://github.com/MeuRepertorio/Abalion-Central/issues/new?'+new URLSearchParams({title,body}).toString();
 window.open(u,'_blank','noopener,noreferrer');$('realActionStatus').textContent='Solicitação preparada. Na aba do GitHub, confirme em Submit new issue. Depois consulte o resultado da automação. Sem essa confirmação, nenhum arquivo externo é modificado.';
});
renderAll();
})();