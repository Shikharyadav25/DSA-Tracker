import { db } from '../firebase';
import { currentUser } from './auth';
import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc
} from 'firebase/firestore';
import * as Types from '../types/learningOS';

function getUid(): string {
  return currentUser?.uid || 'guest';
}

function isGuest(): boolean {
  return !currentUser || currentUser.isGuest === true || currentUser.uid === 'guest';
}

// LocalStorage relational tables fallbacks
function getLocalTable<T>(name: string): T[] {
  const key = `learning_os_${getUid()}_${name}`;
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
}

function saveLocalTable<T>(name: string, items: T[]): void {
  const key = `learning_os_${getUid()}_${name}`;
  localStorage.setItem(key, JSON.stringify(items));
}

// -------------------------------------------------------------
// Database Seeds (Configurable from Database, Relational Keys)
// -------------------------------------------------------------
export function getSeedTracks(): Types.LearningTrack[] {
  return [
    { id: 'dsa', name: 'Data Structures & Algorithms', description: 'Autonomous patterns study and Leitner Box revisions.', active: true },
    { id: 'backend', name: 'Backend Engineering', description: 'Scale APIs, manage caching layers, message queues, and DevOps.', active: true },
    { id: 'projects', name: 'Personal Projects', description: 'Build and validate capstone web applications.', active: true },
    { id: 'aptitude', name: 'Aptitude & Reasoning', description: 'Quantitative, logical, and verbal prep for OA assessments.', active: false },
    { id: 'core_cs', name: 'Core Computer Science', description: 'OS, DBMS, Networks, and OOPs System Design.', active: true },
    { id: 'resume', name: 'Resume & Branding', description: 'Resume parsing, LinkedIn branding, and portfolio deployments.', active: false }
  ];
}

export function getSeedTopics(): Types.Topic[] {
  return [
    // DSA Topics
    { id: 'top-arrays-strings', trackId: 'dsa', name: 'Arrays and Strings', order: 1 },
    { id: 'top-linked-list', trackId: 'dsa', name: 'Linked List', order: 2 },
    { id: 'top-stack', trackId: 'dsa', name: 'Stack', order: 3 },
    { id: 'top-hash-maps', trackId: 'dsa', name: 'Hash Maps', order: 4 },
    { id: 'top-binary-search', trackId: 'dsa', name: 'Binary Search', order: 5 },
    { id: 'top-heap-pattern', trackId: 'dsa', name: 'Heap Pattern', order: 6 },
    { id: 'top-tree-pattern', trackId: 'dsa', name: 'Tree Pattern', order: 7 },
    { id: 'top-graphs', trackId: 'dsa', name: 'GRAPHS', order: 8 },
    { id: 'top-dp', trackId: 'dsa', name: 'DP (Dynamic Programming)', order: 9 },

    // Backend Topics
    { id: 'top-node', trackId: 'backend', name: 'Node.js & Express Architecture', order: 1 },
    { id: 'top-docker', trackId: 'backend', name: 'Docker & Containerships', order: 2 },

    // Core CS Topics
    { id: 'top-os', trackId: 'core_cs', name: 'Operating Systems', order: 1 },
    { id: 'top-dbms', trackId: 'core_cs', name: 'Database Management Systems', order: 2 }
  ];
}

export function getSeedSubtopics(): Types.Subtopic[] {
  return [
    // Arrays and Strings Subtopics
    { id: 'sub-arr-two-pointers', topicId: 'top-arrays-strings', name: 'Pattern: Two Pointers', order: 1, lessonContent: 'Two Pointers technique for array and string manipulation.' },
    { id: 'sub-arr-sliding-window', topicId: 'top-arrays-strings', name: 'Pattern: Sliding Window', order: 2, lessonContent: 'Dynamic or fixed window boundaries over contiguous subarrays or substrings.' },
    { id: 'sub-arr-fast-slow', topicId: 'top-arrays-strings', name: 'Pattern: Fast & Slow pointers', order: 3, lessonContent: 'Fast and slow pointer movement over array sequences.' },
    { id: 'sub-arr-kadane', topicId: 'top-arrays-strings', name: 'Pattern: Kadane pattern', order: 4, lessonContent: 'Maximum subarray sum tracking local and global max values.' },
    { id: 'sub-arr-prefix-sum', topicId: 'top-arrays-strings', name: 'Pattern: Prefix Sum', order: 5, lessonContent: 'Cumulative array preprocessing for O(1) range sum queries.' },
    { id: 'sub-arr-merge-intervals', topicId: 'top-arrays-strings', name: 'Pattern: Merge Intervals', order: 6, lessonContent: 'Sorting interval pairs by start time and merging overlapping ranges.' },

    // Linked List Subtopics
    { id: 'sub-ll-fast-slow', topicId: 'top-linked-list', name: 'Pattern: Fast & Slow pointers', order: 1, lessonContent: 'Floyd\'s Cycle Detection algorithm for linked lists.' },
    { id: 'sub-ll-in-place-reversal', topicId: 'top-linked-list', name: 'Pattern: In-place Reversal of a LinkedList', order: 2, lessonContent: 'Reversing pointer links in-place using prev, curr, and next pointers.' },

    // Topics without subtopics (single core subtopic)
    { id: 'sub-stack-core', topicId: 'top-stack', name: 'Stack', order: 1, lessonContent: 'LIFO processing for matching parentheses and monotonic stacks.' },
    { id: 'sub-hashmaps-core', topicId: 'top-hash-maps', name: 'Hash Maps', order: 1, lessonContent: 'Fast O(1) frequency lookup and pair matching.' },
    { id: 'sub-bs-core', topicId: 'top-binary-search', name: 'Binary Search', order: 1, lessonContent: 'Halving search space on sorted elements or monotonic conditions.' },

    // Heap Pattern Subtopics
    { id: 'sub-heap-kth', topicId: 'top-heap-pattern', name: '1. Kth', order: 1, lessonContent: 'Kth largest or smallest elements using min/max heaps.' },
    { id: 'sub-heap-k-closest', topicId: 'top-heap-pattern', name: '2. K closest', order: 2, lessonContent: 'Heap sorted by distance metrics for K closest elements.' },
    { id: 'sub-heap-as-pointer', topicId: 'top-heap-pattern', name: '3. heap as pointer', order: 3, lessonContent: 'Using heap items as pointers to merge K sorted lists.' },
    { id: 'sub-heap-greedy', topicId: 'top-heap-pattern', name: '4. GREEDY+heap', order: 4, lessonContent: 'Priority-driven greedy selection.' },
    { id: 'sub-heap-2-heaps', topicId: 'top-heap-pattern', name: '5. 2 heaps', order: 5, lessonContent: 'Dual heap balancing for streaming median calculation.' },

    // Tree Pattern Subtopics
    { id: 'sub-tree-traversal', topicId: 'top-tree-pattern', name: '1. Traversal', order: 1, lessonContent: 'In-order, Pre-order, Post-order, and Level-order BFS/DFS traversals.' },
    { id: 'sub-tree-mirror', topicId: 'top-tree-pattern', name: '2. Mirror and Symmetry', order: 2, lessonContent: 'Symmetric tree validation and sub-tree mirroring.' },
    { id: 'sub-tree-search', topicId: 'top-tree-pattern', name: '3. Search', order: 3, lessonContent: 'Binary search tree node lookups and insertions.' },
    { id: 'sub-tree-validation', topicId: 'top-tree-pattern', name: '4. Validation', order: 4, lessonContent: 'Validating BST properties using min/max range constraints.' },
    { id: 'sub-tree-path-sum', topicId: 'top-tree-pattern', name: '5. Path SUM', order: 5, lessonContent: 'Root-to-leaf path sum accumulation.' },
    { id: 'sub-tree-construction', topicId: 'top-tree-pattern', name: '6. Construction', order: 6, lessonContent: 'Constructing trees from preorder/inorder traversals.' },

    // Graphs
    { id: 'sub-graphs-core', topicId: 'top-graphs', name: 'GRAPHS', order: 1, lessonContent: 'BFS, DFS, Topological Sort, Dijkstra, Union-Find.' },

    // DP
    { id: 'sub-dp-core', topicId: 'top-dp', name: 'DP (Dynamic Programming)', order: 1, lessonContent: 'Memoization and Tabulation for overlapping subproblems.' },

    // Backend
    { id: 'sub-node-api', topicId: 'top-node', name: 'REST Router Design', order: 1, lessonContent: 'Modular route setups. Use controllers to segregate request mapping.' },
    { id: 'sub-dockerfile', topicId: 'top-docker', name: 'Writing Clean Dockerfiles', order: 1, lessonContent: 'Layer caching optimization. Use multi-stage builds to limit image size.' },

    // Core CS
    { id: 'sub-os-process', topicId: 'top-os', name: 'Process vs Threads Scheduling', order: 1, lessonContent: 'Processes own resources. Threads share memory space. Context switching costs.' },
    { id: 'sub-dbms-indexes', topicId: 'top-dbms', name: 'B+ Tree Indexing Structures', order: 1, lessonContent: 'Balanced search indices. Indexes speed up reads but add execution costs to writes.' }
  ];
}

export function getSeedProblems(): Types.Problem[] {
  return [
    {
      id: 'prob-two-sum',
      subtopicId: 'sub-arr-two-pointers',
      title: 'Two Sum II - Input Array Is Sorted',
      platform: 'LeetCode',
      link: 'https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/',
      difficulty: 'Medium',
      pattern: 'Pattern: Two Pointers',
      status: 'Solved',
      box: 1,
      ease: 2.5,
      interval: 1,
      nextReview: Date.now() + 1 * 24 * 60 * 60 * 1000,
      lastSolved: Date.now(),
      masteryScore: 80,
      estimatedTime: 15,
      frequency: 95,
      companyTags: ['Google', 'Meta']
    },
    {
      id: 'prob-max-subarray',
      subtopicId: 'sub-arr-sliding-window',
      title: 'Maximum Average Subarray I',
      platform: 'LeetCode',
      link: 'https://leetcode.com/problems/maximum-average-subarray-i/',
      difficulty: 'Easy',
      pattern: 'Pattern: Sliding Window',
      status: 'New',
      box: 1,
      ease: 2.5,
      interval: 0,
      nextReview: null,
      lastSolved: null,
      masteryScore: 0,
      estimatedTime: 15,
      frequency: 85,
      companyTags: ['Amazon']
    },
    {
      id: 'prob-linked-list-cycle',
      subtopicId: 'sub-ll-fast-slow',
      title: 'Linked List Cycle',
      platform: 'LeetCode',
      link: 'https://leetcode.com/problems/linked-list-cycle/',
      difficulty: 'Easy',
      pattern: 'Pattern: Fast & Slow pointers',
      status: 'Solved',
      box: 2,
      ease: 2.6,
      interval: 3,
      nextReview: Date.now() + 3 * 24 * 60 * 60 * 1000,
      lastSolved: Date.now() - 1 * 24 * 60 * 60 * 1000,
      masteryScore: 75,
      estimatedTime: 10,
      frequency: 90,
      companyTags: ['Amazon']
    },
    {
      id: 'prob-max-sub-kadane',
      subtopicId: 'sub-arr-kadane',
      title: 'Maximum Subarray',
      platform: 'LeetCode',
      link: 'https://leetcode.com/problems/maximum-subarray/',
      difficulty: 'Medium',
      pattern: 'Pattern: Kadane pattern',
      status: 'Solved',
      box: 2,
      ease: 2.5,
      interval: 3,
      nextReview: Date.now() + 3 * 24 * 60 * 60 * 1000,
      lastSolved: Date.now(),
      masteryScore: 85,
      estimatedTime: 15,
      frequency: 95,
      companyTags: ['Microsoft']
    },
    {
      id: 'prob-range-sum-query',
      subtopicId: 'sub-arr-prefix-sum',
      title: 'Range Sum Query - Immutable',
      platform: 'LeetCode',
      link: 'https://leetcode.com/problems/range-sum-query-immutable/',
      difficulty: 'Easy',
      pattern: 'Pattern: Prefix Sum',
      status: 'New',
      box: 1,
      ease: 2.5,
      interval: 0,
      nextReview: null,
      lastSolved: null,
      masteryScore: 0,
      estimatedTime: 12,
      frequency: 80,
      companyTags: ['Meta']
    },
    {
      id: 'prob-merge-intervals',
      subtopicId: 'sub-arr-merge-intervals',
      title: 'Merge Intervals',
      platform: 'LeetCode',
      link: 'https://leetcode.com/problems/merge-intervals/',
      difficulty: 'Medium',
      pattern: 'Pattern: Merge Intervals',
      status: 'New',
      box: 1,
      ease: 2.5,
      interval: 0,
      nextReview: null,
      lastSolved: null,
      masteryScore: 0,
      estimatedTime: 20,
      frequency: 95,
      companyTags: ['Google']
    },
    {
      id: 'prob-reverse-linked-list',
      subtopicId: 'sub-ll-in-place-reversal',
      title: 'Reverse Linked List',
      platform: 'LeetCode',
      link: 'https://leetcode.com/problems/reverse-linked-list/',
      difficulty: 'Easy',
      pattern: 'Pattern: In-place Reversal of a LinkedList',
      status: 'Solved',
      box: 3,
      ease: 2.7,
      interval: 7,
      nextReview: Date.now() + 7 * 24 * 60 * 60 * 1000,
      lastSolved: Date.now(),
      masteryScore: 90,
      estimatedTime: 10,
      frequency: 98,
      companyTags: ['Apple']
    },
    {
      id: 'prob-valid-parentheses',
      subtopicId: 'sub-stack-core',
      title: 'Valid Parentheses',
      platform: 'LeetCode',
      link: 'https://leetcode.com/problems/valid-parentheses/',
      difficulty: 'Easy',
      pattern: 'Stack',
      status: 'Solved',
      box: 2,
      ease: 2.6,
      interval: 3,
      nextReview: Date.now() + 3 * 24 * 60 * 60 * 1000,
      lastSolved: Date.now() - 1 * 24 * 60 * 60 * 1000,
      masteryScore: 85,
      estimatedTime: 12,
      frequency: 95,
      companyTags: ['Bloomberg']
    },
    {
      id: 'prob-hashmap-duplicates',
      subtopicId: 'sub-hashmaps-core',
      title: 'Contains Duplicate',
      platform: 'LeetCode',
      link: 'https://leetcode.com/problems/contains-duplicate/',
      difficulty: 'Easy',
      pattern: 'Hash Maps',
      status: 'Solved',
      box: 1,
      ease: 2.5,
      interval: 1,
      nextReview: Date.now() + 1 * 24 * 60 * 60 * 1000,
      lastSolved: Date.now(),
      masteryScore: 90,
      estimatedTime: 10,
      frequency: 90,
      companyTags: ['Google']
    },
    {
      id: 'prob-binary-search',
      subtopicId: 'sub-bs-core',
      title: 'Binary Search',
      platform: 'LeetCode',
      link: 'https://leetcode.com/problems/binary-search/',
      difficulty: 'Easy',
      pattern: 'Binary Search',
      status: 'Solved',
      box: 2,
      ease: 2.5,
      interval: 3,
      nextReview: Date.now() + 3 * 24 * 60 * 60 * 1000,
      lastSolved: Date.now(),
      masteryScore: 85,
      estimatedTime: 10,
      frequency: 95,
      companyTags: ['Microsoft']
    },
    {
      id: 'prob-kth-largest',
      subtopicId: 'sub-heap-kth',
      title: 'Kth Largest Element in an Array',
      platform: 'LeetCode',
      link: 'https://leetcode.com/problems/kth-largest-element-in-an-array/',
      difficulty: 'Medium',
      pattern: 'Heap Pattern: 1. Kth',
      status: 'New',
      box: 1,
      ease: 2.5,
      interval: 0,
      nextReview: null,
      lastSolved: null,
      masteryScore: 0,
      estimatedTime: 20,
      frequency: 90,
      companyTags: ['Meta']
    },
    {
      id: 'prob-tree-inorder',
      subtopicId: 'sub-tree-traversal',
      title: 'Binary Tree Inorder Traversal',
      platform: 'LeetCode',
      link: 'https://leetcode.com/problems/binary-tree-inorder-traversal/',
      difficulty: 'Easy',
      pattern: 'Tree Pattern: 1. Traversal',
      status: 'Solved',
      box: 2,
      ease: 2.5,
      interval: 3,
      nextReview: Date.now() + 3 * 24 * 60 * 60 * 1000,
      lastSolved: Date.now(),
      masteryScore: 80,
      estimatedTime: 12,
      frequency: 85,
      companyTags: ['Microsoft']
    },
    {
      id: 'prob-number-islands',
      subtopicId: 'sub-graphs-core',
      title: 'Number of Islands',
      platform: 'LeetCode',
      link: 'https://leetcode.com/problems/number-of-islands/',
      difficulty: 'Medium',
      pattern: 'GRAPHS',
      status: 'New',
      box: 1,
      ease: 2.5,
      interval: 0,
      nextReview: null,
      lastSolved: null,
      masteryScore: 0,
      estimatedTime: 25,
      frequency: 95,
      companyTags: ['Amazon']
    },
    {
      id: 'prob-climbing-stairs',
      subtopicId: 'sub-dp-core',
      title: 'Climbing Stairs',
      platform: 'LeetCode',
      link: 'https://leetcode.com/problems/climbing-stairs/',
      difficulty: 'Easy',
      pattern: 'DP (Dynamic Programming)',
      status: 'Solved',
      box: 1,
      ease: 2.5,
      interval: 1,
      nextReview: Date.now() + 1 * 24 * 60 * 60 * 1000,
      lastSolved: Date.now(),
      masteryScore: 80,
      estimatedTime: 15,
      frequency: 90,
      companyTags: ['Uber']
    }
  ];
}

export function getSeedSkillTracks(): Types.SkillTrack[] {
  return [
    { id: 'skt-backend', name: 'Backend SDE Core', description: 'Scale service endpoints and concurrency handles.' },
    { id: 'skt-devops', name: 'DevOps & Containers', description: 'Automate build runs and setup deployment runtimes.' }
  ];
}

export function getSeedSkills(): Types.Skill[] {
  return [
    { id: 'sk-spring', trackId: 'skt-backend', name: 'Spring Boot Framework', status: 'Not Started', masteryLevel: 10, lessons: ['Spring Context', 'JPA Relationships', 'Spring Security Auth'], resources: ['Spring.io guides', 'Baeldung tutorials'] },
    { id: 'sk-node', trackId: 'skt-backend', name: 'Node.js & Express Event Loop', status: 'In Progress', masteryLevel: 45, lessons: ['Non-blocking I/O', 'REST API Routes', 'Express middleware validation'], resources: ['Nodejs.org documentation'] },
    { id: 'sk-docker', trackId: 'skt-devops', name: 'Docker Registry Deployments', status: 'Not Started', masteryLevel: 0, lessons: ['Writing Multi-Stage Dockerfiles', 'Docker Compose networks'], resources: ['Docker docs portal'] }
  ];
}

export function getSeedProjects(): Types.Project[] {
  return [
    { id: 'proj-leet-track', userId: 'guest', name: 'Clean Architecture Leet Track Platform', description: 'An automated SDE & LeetCode mentoring Operating System with scheduler backends.', status: 'In Progress', priority: 'High', weekCommitment: 10, githubUrl: 'https://github.com/Shikharyadav25/DSA-Tracker', completionPercentage: 40 }
  ];
}

export function getSeedInterviewTracks(): Types.InterviewTrack[] {
  return [
    { id: 'int-quant', name: 'Quantitative Aptitude', description: 'Combinatorics, probability, algebra.' },
    { id: 'int-os', name: 'Operating Systems', description: 'Process scheduler, memory paging, deadlocks.' },
    { id: 'int-system', name: 'System Design', description: 'Load balancers, sharding, replication protocols.' }
  ];
}

// -------------------------------------------------------------
// Database Generic Repository Client (Clean Abstraction)
// -------------------------------------------------------------
export const dbService = {
  // Generic Repository Fetch
  async getCollection<T>(name: string, defaultSeeds: T[] = []): Promise<T[]> {
    const uid = getUid();
    if (isGuest()) {
      let local = getLocalTable<T>(name);
      if (name === 'topics') {
        const hasNewSeeds = local.some((x: any) => x.id === 'top-arrays-strings');
        if (!hasNewSeeds) {
          const freshTopics = getSeedTopics() as any as T[];
          saveLocalTable('topics', freshTopics);
          saveLocalTable('subtopics', getSeedSubtopics());
          saveLocalTable('problems', getSeedProblems());
          local = freshTopics;
        }
      }
      if (name === 'subtopics' && !local.some((x: any) => x.id === 'sub-arr-two-pointers')) {
        const freshSubtopics = getSeedSubtopics() as any as T[];
        saveLocalTable('subtopics', freshSubtopics);
        local = freshSubtopics;
      }
      if (local.length === 0 && defaultSeeds.length > 0) {
        saveLocalTable<T>(name, defaultSeeds);
        return defaultSeeds;
      }
      return local;
    }

    try {
      const colRef = collection(db, 'users', uid, name);
      const snapshot = await getDocs(colRef);
      if (snapshot.empty && defaultSeeds.length > 0) {
        // Seed remote user database sandbox on first initialization
        const batch = defaultSeeds.map(seed => {
          const docId = (seed as any).id || (seed as any).uid || 'default';
          const docRef = doc(db, 'users', uid, name, docId);
          return setDoc(docRef, seed as any);
        });
        await Promise.all(batch);
        return defaultSeeds;
      }
      const remoteDocs = snapshot.docs.map(doc => doc.data() as T);
      if (name === 'topics' && !remoteDocs.some((x: any) => x.id === 'top-arrays-strings')) {
        const freshTopics = getSeedTopics();
        await Promise.all(freshTopics.map(t => setDoc(doc(db, 'users', uid, 'topics', t.id), t)));
        await Promise.all(getSeedSubtopics().map(s => setDoc(doc(db, 'users', uid, 'subtopics', s.id), s)));
        return freshTopics as any as T[];
      }
      return remoteDocs;
    } catch (e) {
      console.warn(`Firestore read failed for collection ${name}, falling back to localStorage.`, e);
      return getLocalTable<T>(name);
    }
  },

  // Generic Repository Save
  async saveDoc<T>(name: string, id: string, data: T): Promise<void> {
    const uid = getUid();
    if (isGuest()) {
      const local = getLocalTable<T>(name);
      const index = local.findIndex((x: any) => (x.id === id || x.uid === id));
      if (index > -1) {
        local[index] = data;
      } else {
        local.push(data);
      }
      saveLocalTable<T>(name, local);
      return;
    }

    try {
      const docRef = doc(db, 'users', uid, name, id);
      await setDoc(docRef, data as any);
    } catch (e) {
      console.error(`Firestore save failed for ${name}/${id}`, e);
      const local = getLocalTable<T>(name);
      const index = local.findIndex((x: any) => (x.id === id || x.uid === id));
      if (index > -1) local[index] = data; else local.push(data);
      saveLocalTable<T>(name, local);
    }
  },

  // Generic Repository Delete
  async deleteDoc(name: string, id: string): Promise<void> {
    const uid = getUid();
    if (isGuest()) {
      const local = getLocalTable<any>(name);
      const filtered = local.filter((x: any) => (x.id !== id && x.uid !== id));
      saveLocalTable(name, filtered);
      return;
    }

    try {
      const docRef = doc(db, 'users', uid, name, id);
      await deleteDoc(docRef);
    } catch (e) {
      console.error(`Firestore delete failed for ${name}/${id}`, e);
      const local = getLocalTable<any>(name);
      const filtered = local.filter((x: any) => (x.id !== id && x.uid !== id));
      saveLocalTable(name, filtered);
    }
  },

  // Reseed all relational schemas
  async resetAndSeedAll(): Promise<void> {
    const uid = getUid();
    const tracks = getSeedTracks();
    const topics = getSeedTopics();
    const subtopics = getSeedSubtopics();
    const problems = getSeedProblems();
    const skillTracks = getSeedSkillTracks();
    const skills = getSeedSkills();
    const projects = getSeedProjects();
    const interview = getSeedInterviewTracks();

    const preferences: Types.UserPreference = {
      uid,
      targetWeeklyHours: 15,
      activeTracks: ['dsa', 'backend', 'projects', 'core_cs'],
      studyDays: [1, 2, 3, 4, 5, 6, 0],
      wakeTime: '08:00',
      intensity: 'balanced',
      collegeWorkload: 'Low'
    };

    if (isGuest()) {
      saveLocalTable('learningTracks', tracks);
      saveLocalTable('topics', topics);
      saveLocalTable('subtopics', subtopics);
      saveLocalTable('problems', problems);
      saveLocalTable('skillTracks', skillTracks);
      saveLocalTable('skills', skills);
      saveLocalTable('projects', projects);
      saveLocalTable('interviewTracks', interview);
      saveLocalTable('preferences', [preferences]);
      saveLocalTable('dailyTasks', []);
      saveLocalTable('weeklyPlans', []);
      saveLocalTable('problemAttempts', []);
      saveLocalTable('revisionHistory', []);
      saveLocalTable('contests', []);
      saveLocalTable('contestAttempts', []);
      saveLocalTable('aiInsights', []);
      saveLocalTable('masteryScores', []);
      return;
    }

    // Save to Firestore batch processes
    await Promise.all([
      ...tracks.map(t => this.saveDoc('learningTracks', t.id, t)),
      ...topics.map(t => this.saveDoc('topics', t.id, t)),
      ...subtopics.map(s => this.saveDoc('subtopics', s.id, s)),
      ...problems.map(p => this.saveDoc('problems', p.id, p)),
      ...skillTracks.map(st => this.saveDoc('skillTracks', st.id, st)),
      ...skills.map(s => this.saveDoc('skills', s.id, s)),
      ...projects.map(p => this.saveDoc('projects', p.id, p)),
      ...interview.map(i => this.saveDoc('interviewTracks', i.id, i)),
      this.saveDoc('preferences', uid, preferences)
    ]);
  },
  getSeedTracks,
  getSeedTopics,
  getSeedSubtopics,
  getSeedProblems,
  getSeedSkillTracks,
  getSeedSkills,
  getSeedProjects,
  getSeedInterviewTracks
};
