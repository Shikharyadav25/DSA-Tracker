export type Difficulty = 'Easy' | 'Medium' | 'Hard';
export type ProblemStatus = 'New' | 'Reading' | 'Attempting' | 'Hint used' | 'Solved';
export type TaskType = 'problem' | 'project' | 'skill' | 'aptitude' | 'core_cs' | 'resume';
export type TaskStatus = 'pending' | 'completed' | 'skipped';

// 1. User
export interface User {
  uid: string;
  name: string;
  email: string;
  provider: 'email' | 'google';
  createdAt: number;
}

// 2. LearningTrack
export interface LearningTrack {
  id: string; // e.g. 'dsa', 'backend', 'core_cs', 'aptitude', 'projects', 'resume'
  name: string;
  description: string;
  active: boolean;
}

// 3. Topic
export interface Topic {
  id: string;
  trackId: string; // Foreign Key to LearningTrack
  name: string;
  description?: string;
  order: number;
}

// 4. Subtopic
export interface Subtopic {
  id: string;
  topicId: string; // Foreign Key to Topic
  name: string;
  order: number;
  lessonContent?: string;
}

// 5. Problem
export interface Problem {
  id: string;
  subtopicId: string; // Foreign Key to Subtopic
  title: string;
  platform: string; // LeetCode, Codeforces, CodeChef, AtCoder, GFG, Custom
  link: string;
  difficulty: Difficulty;
  pattern: string;
  status: ProblemStatus;
  box: number; // Leitner Box (1-5)
  ease: number; // SM-2 ease factor
  interval: number; // review interval in days
  nextReview: number | null; // next review timestamp
  lastSolved: number | null; // last solved timestamp
  masteryScore: number; // 0 to 100
  estimatedTime: number; // in minutes
  frequency: number; // interview occurrence index
  companyTags: string[];
}

// 6. ProblemAttempt
export interface ProblemAttempt {
  id: string;
  problemId: string; // Foreign Key to Problem
  userId: string; // Foreign Key to User
  timestamp: number;
  solvingTime: number; // in minutes
  hintsUsedCount: number;
  retriesCount: number;
  success: boolean;
  notes?: string;
}

// 7. RevisionHistory
export interface RevisionHistory {
  id: string;
  problemId: string; // FK to Problem
  userId: string; // FK to User
  date: string; // YYYY-MM-DD
  confidenceScore: number; // 1 to 5
  mistakesCount: number;
  solvingTime: number;
  hintsCount: number;
  retriesCount: number;
}

// 8. SkillTrack
export interface SkillTrack {
  id: string; // e.g., 'backend', 'frontend', 'database', 'devops', 'cloud', 'ai_ml'
  name: string;
  description: string;
}

// 9. Skill
export interface Skill {
  id: string;
  trackId: string; // FK to SkillTrack
  name: string;
  status: 'Not Started' | 'In Progress' | 'Mastered';
  masteryLevel: number; // 0 to 100
  lessons: string[];
  resources: string[];
}

// 10. Project
export interface Project {
  id: string;
  userId: string; // FK to User
  name: string;
  description: string;
  status: 'Idea' | 'In Progress' | 'Completed';
  priority: 'High' | 'Medium' | 'Low';
  weekCommitment: number; // Target hours per week
  githubUrl?: string;
  demoUrl?: string;
  completionPercentage: number;
}

// 11. ProjectMilestone
export interface ProjectMilestone {
  id: string;
  projectId: string; // FK to Project
  title: string;
  dueDate: string; // YYYY-MM-DD
  status: 'pending' | 'completed';
}

// 12. InterviewTrack
export interface InterviewTrack {
  id: string; // e.g., 'reasoning', 'aptitude', 'os', 'dbms', 'cn', 'oop', 'behavioral', 'system_design'
  name: string;
  description: string;
}

// 13. WeeklyPlan
export interface WeeklyPlan {
  id: string; // YYYY-MM-DD (Sunday)
  weekStartDate: string; // YYYY-MM-DD
  userId: string; // FK to User
  status: 'Active' | 'Completed' | 'Failed';
  targetHours: number;
  focusArea: string;
}

// 14. DailyTask
export interface DailyTask {
  id: string;
  userId: string; // FK to User
  date: string; // YYYY-MM-DD
  type: TaskType;
  title: string;
  itemId: string; // References Problem.id, Project.id, Skill.id, etc.
  status: TaskStatus;
}

// 15. TaskCompletion
export interface TaskCompletion {
  id: string;
  taskId: string; // FK to DailyTask
  timestamp: number;
  timeSpent: number; // minutes
}

// 16. Contest
export interface Contest {
  id: string;
  name: string;
  platform: string; // LeetCode, Codeforces, CodeChef, AtCoder, etc.
  date: string; // YYYY-MM-DD
  url?: string;
}

// 17. ContestAttempt
export interface ContestAttempt {
  id: string;
  contestId: string; // FK to Contest
  userId: string; // FK to User
  solvedCount: number;
  totalCount: number;
  rating?: number;
  rank?: number;
}

// 18. Notes
export interface Notes {
  id: string;
  userId: string; // FK to User
  itemId: string; // References Problem.id, Skill.id, etc.
  content: string;
  updatedAt: number;
}

// 19. Bookmarks
export interface Bookmarks {
  id: string;
  userId: string; // FK to User
  itemId: string; // References Problem.id, etc.
  createdAt: number;
}

// 20. AIInsight
export interface AIInsight {
  id: string;
  userId: string; // FK to User
  date: string; // YYYY-MM-DD
  type: 'weakness' | 'burnout' | 'motivation' | 'weekly_advice';
  content: string;
  actionItem?: string;
}

// 21. UserPreference
export interface UserPreference {
  uid: string; // FK to User
  targetWeeklyHours: number;
  activeTracks: string[]; // FKs to LearningTrack.id
  studyDays: number[]; // days of week: [0, 1, 2, 3, 4, 5, 6]
  wakeTime: string; // HH:MM
  intensity: 'chill' | 'balanced' | 'hardcore';
  collegeWorkload: 'Low' | 'Medium' | 'High';
}

// 22. MasteryScore
export interface MasteryScore {
  id: string; // FK_entity_id
  entityType: 'topic' | 'subtopic' | 'track' | 'skill';
  entityId: string;
  score: number; // 0 to 100
  updatedAt: number;
}

// 23. StudySession
export interface StudySession {
  id: string;
  userId: string; // FK to User
  date: string; // YYYY-MM-DD
  duration: number; // total study session in minutes
}

// 24. MistakeLog
export interface MistakeLog {
  id: string;
  problemId: string; // FK to Problem
  userId: string; // FK to User
  mistakeDescription: string;
  createdAt: number;
}

// 25. RevisionQueue
export interface RevisionQueue {
  id: string;
  problemId: string; // FK to Problem
  userId: string; // FK to User
  nextReviewDate: number; // timestamp
}

// 26. LearningGoal
export interface LearningGoal {
  id: string;
  userId: string; // FK to User
  goalDescription: string;
  targetDate: string; // YYYY-MM-DD
  status: 'In Progress' | 'Achieved' | 'Missed';
}

// 27. Achievement
export interface Achievement {
  id: string;
  userId: string; // FK to User
  title: string;
  description: string;
  unlockedAt: number;
}

// 28. Streak (Bonus Track support)
export interface Streak {
  id: string;
  userId: string; // FK to User
  currentStreak: number;
  maxStreak: number;
  lastActiveDate: string; // YYYY-MM-DD
}
