import { state, saveState, logActivity } from '../services/storage';
import { Question } from '../types/types';
import { escapeHtml, makeQuestion, dayMs, scheduleAfterSolve } from './questionsData';
import { renderAll } from '../main'; 
import { currentUser } from '../services/auth';

let editingId: string | null = null;

function checkGuest(): boolean {
  if (currentUser?.isGuest) {
    alert("Guest Mode: You have read-only access. Sign in to save questions.");
    return true;
  }
  return false;
}

export function openModal(id?: string) {
  if (checkGuest()) return;
  editingId = id || null;
  const q = id ? state.questions.find(x => x.id === id) : null;
  (document.getElementById('m-title') as HTMLInputElement).value = q ? q.title : '';
  (document.getElementById('m-platform') as HTMLSelectElement).value = q ? q.platform : 'LeetCode';
  (document.getElementById('m-difficulty') as HTMLSelectElement).value = q ? q.difficulty : 'Easy';
  (document.getElementById('m-link') as HTMLInputElement).value = q ? q.link : '';
  (document.getElementById('m-topic') as HTMLInputElement).value = q ? q.topic : '';
  (document.getElementById('m-pattern') as HTMLInputElement).value = q ? q.pattern : '';
  document.getElementById('modal-bg')?.classList.add('open');
}

export function closeModal() { 
  document.getElementById('modal-bg')?.classList.remove('open'); 
}

export function saveQuestion() {
  if (checkGuest()) return;
  const title = (document.getElementById('m-title') as HTMLInputElement).value.trim();
  if(!title){ alert('Give the question a title.'); return; }
  const data: Partial<Question> = {
    title,
    platform: (document.getElementById('m-platform') as HTMLSelectElement).value,
    difficulty: (document.getElementById('m-difficulty') as HTMLSelectElement).value as any,
    link: (document.getElementById('m-link') as HTMLInputElement).value.trim(),
    topic: (document.getElementById('m-topic') as HTMLInputElement).value.trim() || 'General',
    pattern: (document.getElementById('m-pattern') as HTMLInputElement).value.trim()
  };
  if(editingId){
    const q = state.questions.find(x=>x.id===editingId);
    if(q) Object.assign(q, data);
  } else {
    state.questions.push(makeQuestion(data));
  }
  logActivity();
  closeModal(); 
  saveState(); 
  renderAll();
}

export function deleteQuestion(id: string) {
  if (checkGuest()) return;
  if(!confirm('Delete this question? This cannot be undone.')) return;
  state.questions = state.questions.filter(x=>x.id!==id);
  saveState(); 
  renderAll();
}

export function advanceStage(q: Question, newStatus: any) {
  if (checkGuest()) {
    // Re-render questions to reset select dropdown
    renderQuestions();
    return;
  }
  q.status = newStatus;
  if(newStatus==='Solved') { scheduleAfterSolve(q); }
  saveState(); 
  renderAll();
}

export function renderStats() {
  const qs = state.questions;
  const solved = qs.filter(q=>q.status==='Solved').length;
  const now = Date.now();
  const due = qs.filter(q=>q.nextReview && q.nextReview<=now).length;
  const overdue = qs.filter(q=>q.nextReview && q.nextReview < now - dayMs(2)).length;
  const streak = computeStreak();
  const row = document.getElementById('stat-row');
  if(!row) return;
  row.innerHTML = `
    <div class="stat-card"><div class="num">${qs.length}</div><div class="lbl">Questions logged</div></div>
    <div class="stat-card accent"><div class="num">${solved}</div><div class="lbl">Solved</div></div>
    <div class="stat-card warn"><div class="num">${due}</div><div class="lbl">Due for revision</div></div>
    <div class="stat-card danger"><div class="num">${overdue}</div><div class="lbl">Overdue (2+ days)</div></div>
    <div class="stat-card"><div class="num">${streak}</div><div class="lbl">Day streak</div></div>
  `;
}

function computeStreak() {
  let streak=0;
  let cursor = new Date();
  while(true){
    const key = cursor.getFullYear()+'-'+(cursor.getMonth()+1)+'-'+cursor.getDate();
    if(state.activityLog[key]){ streak++; cursor.setDate(cursor.getDate()-1); }
    else break;
  }
  return streak;
}

export function renderStreak() {
  const strip = document.getElementById('streak-strip');
  if(!strip) return;
  strip.innerHTML='';
  const days=[];
  for(let i=25;i>=0;i--){
    const d=new Date(); d.setDate(d.getDate()-i);
    const key = d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate();
    days.push(!!state.activityLog[key]);
  }
  days.forEach(hit=>{
    const cell=document.createElement('div');
    cell.className='streak-cell'+(hit?' hit':'');
    strip.appendChild(cell);
  });
}

export function renderTopicBars() {
  const counts: Record<string, number> = {};
  state.questions.forEach(q=>{ counts[q.topic]=(counts[q.topic]||0)+1; });
  const entries = Object.entries(counts).sort((a,b)=>b[1]-a[1]).slice(0,8);
  const max = Math.max(1,...entries.map(e=>e[1]));
  const el = document.getElementById('topic-bars');
  if(!el) return;
  if(!entries.length){ el.innerHTML = '<p style="font-size:12.5px;color:var(--ink-faint);">No questions logged yet.</p>'; return; }
  el.innerHTML = entries.map(([topic,count])=>`
    <div class="bar-row">
      <div class="name">${escapeHtml(topic)}</div>
      <div class="bar-track"><div class="bar-fill" style="width:${(count/max*100).toFixed(0)}%"></div></div>
      <div class="cnt">${count}</div>
    </div>
  `).join('');
}

export function renderBoxes() {
  const el = document.getElementById('box-row');
  if(!el) return;
  const labels=['Box 1','Box 2','Box 3','Box 4','Box 5'];
  const counts=[0,0,0,0,0];
  state.questions.forEach(q=>{ if(q.box>=1 && q.box<=5) counts[q.box-1]++; });
  el.innerHTML = labels.map((l,i)=>`
    <div class="box-tile"><div class="n">${counts[i]}</div><div class="l">${l}</div></div>
  `).join('');
}

export function renderRevise() {
  const now = Date.now();
  const due = state.questions.filter(q=>q.nextReview && q.nextReview<=now)
    .sort((a,b)=>a.nextReview!-b.nextReview!);
  const body = document.getElementById('revise-body');
  if(!body) return;
  if(!due.length){
    body.innerHTML = `<div class="empty"><div class="big">✓</div><p>Nothing due right now. Solve a new question or come back later — the box will let you know when it's time.</p></div>`;
    return;
  }
  const q = due[0];
  const daysOverdue = Math.max(0, Math.floor((now - q.nextReview!)/dayMs(1)));
  body.innerHTML = `
    <div class="rev-card animate__animated animate__fadeIn">
      <span class="box-badge">Box ${q.box}</span>
      <h3>${escapeHtml(q.title)}</h3>
      <div class="meta-row" style="justify-content:center;">
        <span class="tag ${q.difficulty.toLowerCase()}">${q.difficulty}</span>
        <span class="tag plain">${escapeHtml(q.topic)}</span>
        ${q.pattern?`<span class="tag plain">${escapeHtml(q.pattern)}</span>`:``}
      </div>
      <p class="due-note">${daysOverdue>0? daysOverdue+' day(s) overdue' : 'Due today'} · reviewed ${q.reviewCount||0} time(s)${q.link?` · <a href="${q.link}" target="_blank" rel="noopener" style="color:var(--nb-red);font-weight:800;">open problem</a>`:``}</p>
      <p style="font-size:13px;color:var(--ink-soft);font-weight:600;">Try to solve it again from memory first. Then rate how it went.</p>
      <div class="rate-row">
        <button class="rate-btn again" onclick="rate(state.questions.find(x=>x.id==='${q.id}'),'again')">Again<small>couldn't recall</small></button>
        <button class="rate-btn hard" onclick="rate(state.questions.find(x=>x.id==='${q.id}'),'hard')">Hard<small>slow, shaky</small></button>
        <button class="rate-btn good" onclick="rate(state.questions.find(x=>x.id==='${q.id}'),'good')">Good<small>solved it</small></button>
        <button class="rate-btn easy" onclick="rate(state.questions.find(x=>x.id==='${q.id}'),'easy')">Easy<small>instant</small></button>
      </div>
    </div>
    <p style="text-align:center;color:var(--ink-soft);font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">${due.length-1} more waiting after this one</p>
  `;
}

export function renderQuestions() {
  const topicSel = document.getElementById('f-topic') as HTMLSelectElement;
  const topics = [...new Set(state.questions.map(q=>q.topic))].sort();
  const currentTopic = topicSel?.value || '';
  if(topicSel) topicSel.innerHTML = '<option value="">All topics</option>' + topics.map(t=>`<option ${t===currentTopic?'selected':''}>${escapeHtml(t)}</option>`).join('');

  const fTopic = (document.getElementById('f-topic') as HTMLSelectElement)?.value;
  const fDiff = (document.getElementById('f-diff') as HTMLSelectElement)?.value;
  const fStatus = (document.getElementById('f-status') as HTMLSelectElement)?.value;

  let list = state.questions.slice().sort((a,b)=>b.createdAt-a.createdAt);
  if(fTopic) list = list.filter(q=>q.topic===fTopic);
  if(fDiff) list = list.filter(q=>q.difficulty===fDiff);
  if(fStatus) list = list.filter(q=>q.status===fStatus);

  const el = document.getElementById('question-list');
  if(!el) return;
  if(!list.length){
    el.innerHTML = `<div class="empty"><div class="big">＋</div><p>No questions match. Log one to get started.</p></div>`;
    return;
  }
  el.innerHTML = list.map(q=>`
    <div class="qcard">
      <div class="qcard-top">
        <div>
          <h3>${escapeHtml(q.title)}</h3>
          <div style="font-size:12.5px;color:var(--ink-soft);font-weight:600;margin-top:4px;">${escapeHtml(q.platform)}${q.nextReview?` · next review ${new Date(q.nextReview).toLocaleDateString()}`:``}</div>
        </div>
        <div class="qcard-actions">
          <button class="icon-btn" title="Edit" onclick="openModal('${q.id}')">✎</button>
          <button class="icon-btn" title="Delete" onclick="deleteQuestion('${q.id}')">✕</button>
        </div>
      </div>
      <div class="meta-row">
        <span class="tag ${q.difficulty.toLowerCase()}">${q.difficulty}</span>
        <span class="tag plain">${escapeHtml(q.topic)}</span>
        ${q.pattern?`<span class="tag plain">${escapeHtml(q.pattern)}</span>`:``}
        <span class="tag plain">${q.status}</span>
      </div>
      <div class="stage-select">
        <label style="margin-top:10px;">Stage</label>
        <select onchange="advanceStage(state.questions.find(x=>x.id==='${q.id}'), this.value)">
          ${['New','Reading','Attempting','Hint used','Solved'].map(s=>`<option ${q.status===s?'selected':''}>${s}</option>`).join('')}
        </select>
      </div>
      ${q.link?`<div><a href="${q.link}" target="_blank" rel="noopener" class="problem-link">view problem ↗</a></div>`:``}
    </div>
  `).join('');
}
