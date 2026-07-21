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
    { id: 'top-arrays', trackId: 'dsa', name: 'Arrays & Hashing', order: 1 },
    { id: 'top-pointers', trackId: 'dsa', name: 'Two Pointers', order: 2 },
    { id: 'top-window', trackId: 'dsa', name: 'Sliding Window', order: 3 },
    { id: 'top-stack', trackId: 'dsa', name: 'Stacks & Queues', order: 4 },
    { id: 'top-trees', trackId: 'dsa', name: 'Trees & BSTs', order: 5 },
    { id: 'top-graphs', trackId: 'dsa', name: 'Graphs', order: 6 },
    { id: 'top-dp', trackId: 'dsa', name: 'Dynamic Programming', order: 7 },

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
    // Arrays Subtopics
    { id: 'sub-hashmap', topicId: 'top-arrays', name: 'HashMap Cache Pattern', order: 1, lessonContent: 'Hash tables offer O(1) average lookups. Essential for Two Sum and duplicate detections.' },
    { id: 'sub-prefix-sum', topicId: 'top-arrays', name: 'Prefix Sum Array', order: 2, lessonContent: 'Cumulative sums allow O(1) subarray query ranges. Standard for contiguous calculations.' },

    // Two Pointer Subtopics
    { id: 'sub-sorted-pointers', topicId: 'top-pointers', name: 'Sorted Array Colliders', order: 1, lessonContent: 'Initialize pointers at boundaries. Converge based on comparison sum targets.' },

    // Stack Subtopics
    { id: 'sub-stack-match', topicId: 'top-stack', name: 'Stack Character Matching', order: 1, lessonContent: 'Push brackets. Pop and check compatibility on closing brackets.' },

    // Graphs Subtopics
    { id: 'sub-dfs-traversal', topicId: 'top-graphs', name: 'DFS Traversal Grid', order: 1, lessonContent: 'Recursively mark cells visited. Clean DFS logic tracks boundaries.' },

    // DP Subtopics
    { id: 'sub-dp-1d', topicId: 'top-dp', name: '1D DP Fibonacci Progression', order: 1, lessonContent: 'Compute subproblems bottom-up. Standard O(N) array or O(1) variables memory.' },

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
      subtopicId: 'sub-hashmap',
      title: 'Two Sum',
      platform: 'LeetCode',
      link: 'https://leetcode.com/problems/two-sum/',
      difficulty: 'Easy',
      pattern: 'Hash Table Lookup',
      status: 'New',
      box: 1,
      ease: 2.5,
      interval: 0,
      nextReview: null,
      lastSolved: null,
      masteryScore: 0,
      estimatedTime: 15,
      frequency: 95,
      companyTags: ['Google', 'Meta', 'Amazon']
    },
    {
      id: 'prob-valid-parentheses',
      subtopicId: 'sub-stack-match',
      title: 'Valid Parentheses',
      platform: 'LeetCode',
      link: 'https://leetcode.com/problems/valid-parentheses/',
      difficulty: 'Easy',
      pattern: 'Stack Comparison',
      status: 'Solved',
      box: 2,
      ease: 2.6,
      interval: 3,
      nextReview: Date.now() + 3 * 24 * 60 * 60 * 1000,
      lastSolved: Date.now() - 1 * 24 * 60 * 60 * 1000,
      masteryScore: 60,
      estimatedTime: 12,
      frequency: 90,
      companyTags: ['Bloomberg', 'Apple']
    },
    {
      id: 'prob-number-islands',
      subtopicId: 'sub-dfs-traversal',
      title: 'Number of Islands',
      platform: 'LeetCode',
      link: 'https://leetcode.com/problems/number-of-islands/',
      difficulty: 'Medium',
      pattern: 'DFS Traversal',
      status: 'New',
      box: 1,
      ease: 2.5,
      interval: 0,
      nextReview: null,
      lastSolved: null,
      masteryScore: 0,
      estimatedTime: 30,
      frequency: 85,
      companyTags: ['Amazon', 'Microsoft']
    },
    {
      id: 'prob-climbing-stairs',
      subtopicId: 'sub-dp-1d',
      title: 'Climbing Stairs',
      platform: 'LeetCode',
      link: 'https://leetcode.com/problems/climbing-stairs/',
      difficulty: 'Easy',
      pattern: '1D DP',
      status: 'New',
      box: 1,
      ease: 2.5,
      interval: 0,
      nextReview: null,
      lastSolved: null,
      masteryScore: 0,
      estimatedTime: 15,
      frequency: 80,
      companyTags: ['Google', 'Uber']
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
    { id: 'proj-learning-os', userId: 'guest', name: 'Clean Architecture Learning OS', description: 'An automated SDE mentoring Operating System with scheduler backends.', status: 'In Progress', priority: 'High', weekCommitment: 10, githubUrl: 'https://github.com/Shikharyadav25/DSA-Tracker', completionPercentage: 40 }
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
      const local = getLocalTable<T>(name);
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
      return snapshot.docs.map(doc => doc.data() as T);
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
