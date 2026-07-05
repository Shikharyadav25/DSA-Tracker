import { state, saveState, logActivity } from '../services/storage';
import { Question } from '../types/types';
import { renderAll } from '../main'; // we'll expose renderAll to refresh UI

export function seedStarter(silent?: boolean) {
  const starter = [
    ['Two Sum','LeetCode','https://leetcode.com/problems/two-sum/','Easy','Arrays','Hash map'],
    ['Best Time to Buy and Sell Stock','LeetCode','https://leetcode.com/problems/best-time-to-buy-and-sell-stock/','Easy','Arrays','One pass'],
    ['Valid Parentheses','LeetCode','https://leetcode.com/problems/valid-parentheses/','Easy','Stack','Stack matching'],
    ['Merge Two Sorted Lists','LeetCode','https://leetcode.com/problems/merge-two-sorted-lists/','Easy','Linked List','Two pointers'],
    ['Maximum Subarray','LeetCode','https://leetcode.com/problems/maximum-subarray/','Medium','Arrays','Kadane'],
    ['Longest Substring Without Repeating Characters','LeetCode','https://leetcode.com/problems/longest-substring-without-repeating-characters/','Medium','Strings','Sliding window'],
    ['Climbing Stairs','LeetCode','https://leetcode.com/problems/climbing-stairs/','Easy','Dynamic Programming','1D DP'],
    ['Binary Tree Inorder Traversal','LeetCode','https://leetcode.com/problems/binary-tree-inorder-traversal/','Easy','Trees','DFS'],
    ['Number of Islands','LeetCode','https://leetcode.com/problems/number-of-islands/','Medium','Graphs','BFS / DFS'],
    ['Course Schedule','LeetCode','https://leetcode.com/problems/course-schedule/','Medium','Graphs','Topological sort'],
    ['Coin Change','LeetCode','https://leetcode.com/problems/coin-change/','Medium','Dynamic Programming','Bottom-up DP'],
    ['Kth Largest Element in an Array','LeetCode','https://leetcode.com/problems/kth-largest-element-in-an-array/','Medium','Heap','Quickselect / heap']
  ];
  if(state.questions.length && !silent) {
    if(!confirm('This adds 12 curated starter questions on top of what you already have. Continue?')) return;
  }
  starter.forEach(([title,platform,link,difficulty,topic,pattern])=>{
    state.questions.push(makeQuestion({title,platform,link,difficulty,topic,pattern} as any));
  });
  saveState(); renderAll();
}

export function uid(){ return Date.now().toString(36)+Math.random().toString(36).slice(2,7); }

export function makeQuestion(data: Partial<Question>): Question {
  return {
    id: uid(),
    title: data.title || '',
    platform: data.platform || '',
    link: data.link || '',
    difficulty: data.difficulty || 'Easy',
    topic: data.topic || 'General',
    pattern: data.pattern || '',
    status: 'New',
    createdAt: Date.now(),
    box: 0,
    ease: 2.5,
    interval: 0,
    nextReview: null,
    lastReviewed: null,
    reviewCount: 0
  };
}

export function dayMs(n: number) { return n*24*60*60*1000; }

export function scheduleAfterSolve(q: Question) {
  q.status = 'Solved'; q.box = 1; q.interval = 1; q.ease = 2.5;
  q.nextReview = Date.now() + dayMs(1);
  q.lastReviewed = Date.now();
  logActivity();
}

export function rate(q: Question, grade: 'again' | 'hard' | 'good' | 'easy') {
  if(grade==='again'){
    q.box = 1; q.interval = 1; q.ease = Math.max(1.3, q.ease - 0.2);
  } else if(grade==='hard'){
    q.interval = Math.max(1, Math.round(q.interval * 1.2));
    q.ease = Math.max(1.3, q.ease - 0.15);
  } else if(grade==='good'){
    q.interval = Math.max(1, Math.round(q.interval * q.ease));
    q.box = Math.min(5, q.box + 1);
  } else if(grade==='easy'){
    q.interval = Math.max(1, Math.round(q.interval * q.ease * 1.3));
    q.ease = Math.min(3.2, q.ease + 0.15);
    q.box = Math.min(5, q.box + 1);
  }
  q.lastReviewed = Date.now();
  q.nextReview = Date.now() + dayMs(q.interval);
  q.reviewCount = (q.reviewCount||0) + 1;
  logActivity();
  saveState(); renderAll();
}

export function escapeHtml(s: string) { 
  const d = document.createElement('div'); 
  d.textContent = s; 
  return d.innerHTML; 
}
