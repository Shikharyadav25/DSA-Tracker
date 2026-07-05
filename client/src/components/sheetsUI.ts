import { sheetsData, saveSheets } from '../services/storage';
import { Sheet } from '../types/types';
import { escapeHtml } from './questionsData';
import { currentUser } from '../services/auth';

export const DSA_SHEETS: Sheet[] = [
  { id:'striver-a2z', name:"Striver's A2Z DSA Sheet", author:'Raj Vikramaditya · takeUforward', url:'https://takeuforward.org/strivers-a2z-dsa-course/strivers-a2z-dsa-course-sheet-2/',
    blurb:'~455 problems across 18 sections, basics through advanced graphs and DP.',
    topics:[['Basics',31],['Sorting techniques',7],['Arrays',40],['Binary search',32],['Strings',24],['Linked list',31],['Recursion',25],['Bit manipulation',18],['Stacks & queues',30],['Sliding window & two pointers',12],['Heaps',17],['Greedy',16],['Binary trees',39],['Binary search trees',22],['Graphs',54],['Dynamic programming',56],['Tries',7],['Advanced topics',12]]
  },
  { id:'neetcode-150', name:'NeetCode 150', author:'NeetCode', url:'https://neetcode.io/practice/practice/neetcode150',
    blurb:'150 problems across 18 categories.',
    topics:[['Arrays & hashing',9],['Two pointers',5],['Sliding window',6],['Stack',7],['Binary search',7],['Linked list',11],['Trees',15],['Tries',3],['Heap / priority queue',7],['Backtracking',9],['Graphs',13],['Advanced graphs',6],['1-D dynamic programming',12],['2-D dynamic programming',11],['Greedy',8],['Intervals',6],['Math & geometry',8],['Bit manipulation',7]]
  },
  { id:'algomaster', name:'AlgoMaster patterns', author:'Ashish Pratap Singh', url:'https://algomaster.io/',
    blurb:'Pattern-first, not topic-first.',
    topics:[['Prefix sum',6],['Two pointers',8],['Sliding window',8],['Fast & slow pointers',6],['Linked list in-place reversal',6],['Monotonic stack',7],['Top K elements',6],['Overlapping intervals',6],['Modified binary search',8],['Binary tree traversal',10],['Backtracking',8],['Trie',5],['Union-Find',6],['Topological sort',5],['Knapsack / DP patterns',12]]
  }
];

export const CP_SHEETS: Sheet[] = [
  { id:'tle-cp31', name:'CP-31 Sheet', author:'TLE Eliminators', url:'https://www.tle-eliminators.com/cp-sheet',
    blurb:'Handpicked Codeforces problems grouped by rating (800–1900).',
    topics:[['Rating 800–1000',31],['Rating 1000–1200',31],['Rating 1200–1400',31],['Rating 1400–1600',31],['Rating 1600–1900',31]]
  }
];

let sheetRoute = 'dsa';

function checkGuest(): boolean {
  if (currentUser?.isGuest) {
    alert("Guest Mode: You have read-only access. Sign in to edit sheet progress.");
    return true;
  }
  return false;
}

export function switchSheetRoute(route: string) {
  sheetRoute = route;
  document.getElementById('sheet-tab-dsa')?.classList.toggle('active', route==='dsa');
  document.getElementById('sheet-tab-cp')?.classList.toggle('active', route==='cp');
  renderSheets();
}

function allTopicsFor(sheet: Sheet) {
  const custom = sheetsData.custom[sheet.id] || [];
  return [...sheet.topics, ...custom] as [string, number][];
}

function progFor(sheetId: string, topicName: string) {
  const p = (sheetsData.progress[sheetId]||{})[topicName];
  return p || null;
}

export function renderSheets() {
  const list = sheetRoute==='dsa' ? DSA_SHEETS : CP_SHEETS;
  const container = document.getElementById('sheets-container');
  if(!container) return;
  
  const anyHidden = list.some(s=>sheetsData.hidden[s.id]);
  container.innerHTML = list.map(sheet => {
    const hidden = !!sheetsData.hidden[sheet.id];
    if(hidden){
      return `<div class="panel" style="display:flex;justify-content:space-between;align-items:center;">
        <div><b>${escapeHtml(sheet.name)}</b> <span style="color:var(--ink-faint);font-size:12px;">— hidden</span></div>
        <button class="btn ghost" onclick="toggleHideSheet('${sheet.id}')">Show</button>
      </div>`;
    }
    const topics = allTopicsFor(sheet);
    let totalSolved=0, totalCount=0;
    const rows = topics.map(([name, total])=>{
      const p = progFor(sheet.id, name) || { solved:0, total };
      const t = p.total!=null ? p.total : total;
      const s = Math.min(p.solved||0, t);
      totalSolved += s; totalCount += t;
      const pct = t>0 ? Math.round(s/t*100) : 0;
      return `
        <div class="bar-row" style="align-items:center;">
          <div class="name" style="width:190px;">${escapeHtml(name)}</div>
          <div class="bar-track"><div class="bar-fill" style="width:${pct}%"></div></div>
          <input type="number" min="0" value="${s}" style="width:50px;padding:4px 6px;font-size:11.5px;" onchange="updateTopicProgress('${sheet.id}','${name.replace(/'/g,"\\'")}','solved',this.value,${t})">
          <span style="font-size:11.5px;color:var(--ink-faint);">/</span>
          <input type="number" min="0" value="${t}" style="width:50px;padding:4px 6px;font-size:11.5px;" onchange="updateTopicProgress('${sheet.id}','${name.replace(/'/g,"\\'")}','total',this.value,${s})">
        </div>`;
    }).join('');
    const overallPct = totalCount>0 ? Math.round(totalSolved/totalCount*100) : 0;
    return `
      <div class="panel">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;flex-wrap:wrap;">
          <div>
            <h3 style="margin:0 0 3px;font-size:16px;"><a href="${sheet.url}" target="_blank" rel="noopener" style="color:var(--ink);text-decoration:none;border-bottom:1px solid var(--line);">${escapeHtml(sheet.name)}</a></h3>
            <div style="font-size:12px;color:var(--ink-faint);">${escapeHtml(sheet.author)}</div>
          </div>
          <div style="text-align:right;">
            <div style="font-size:20px;font-weight:600;font-family:Georgia,serif;color:var(--moss-dark);">${overallPct}%</div>
            <div style="font-size:11px;color:var(--ink-faint);">${totalSolved}/${totalCount} solved</div>
          </div>
        </div>
        <p style="font-size:12.5px;color:var(--ink-soft);">${escapeHtml(sheet.blurb)}</p>
        <div style="margin-top:10px;">${rows}</div>
        <div style="display:flex;gap:8px;margin-top:14px;flex-wrap:wrap;">
          <button class="btn ghost" onclick="addCustomTopic('${sheet.id}')">+ Add topic</button>
          <button class="btn ghost" onclick="resetSheetProgress('${sheet.id}')">Reset progress</button>
          <button class="btn ghost" onclick="toggleHideSheet('${sheet.id}')">Hide sheet</button>
        </div>
      </div>`;
  }).join('') + (anyHidden ? '' : '');
}

export function updateTopicProgress(sheetId: string, topicName: string, field: 'solved'|'total', value: string, otherVal: number) {
  if (checkGuest()) {
    renderSheets();
    return;
  }
  const n = Math.max(0, parseInt(value)||0);
  sheetsData.progress[sheetId] = sheetsData.progress[sheetId] || {};
  const existing = sheetsData.progress[sheetId][topicName] || { solved:0, total:otherVal };
  if(field==='solved'){ existing.solved = n; if(existing.total==null) existing.total = otherVal; }
  else { existing.total = n; existing.solved = Math.min(existing.solved||0, n); }
  sheetsData.progress[sheetId][topicName] = existing;
  saveSheets(); renderSheets();
}

export function addCustomTopic(sheetId: string) {
  if (checkGuest()) return;
  const name = prompt('Topic name');
  if(!name) return;
  const total = parseInt(prompt('How many problems in this topic?','10') as string)||10;
  sheetsData.custom[sheetId] = sheetsData.custom[sheetId] || [];
  sheetsData.custom[sheetId].push([name, total]);
  saveSheets(); renderSheets();
}

export function resetSheetProgress(sheetId: string) {
  if (checkGuest()) return;
  if(!confirm('Reset all progress for this sheet?')) return;
  delete sheetsData.progress[sheetId];
  saveSheets(); renderSheets();
}

export function toggleHideSheet(sheetId: string) {
  if (checkGuest()) return;
  sheetsData.hidden[sheetId] = !sheetsData.hidden[sheetId];
  saveSheets(); renderSheets();
}
