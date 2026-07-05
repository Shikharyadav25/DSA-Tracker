export type Difficulty = 'Easy' | 'Medium' | 'Hard';
export type Stage = 'New' | 'Reading' | 'Attempting' | 'Hint used' | 'Solved';

export interface Question {
  id: string;
  title: string;
  platform: string;
  link: string;
  difficulty: Difficulty;
  topic: string;
  pattern: string;
  status: Stage;
  createdAt: number;
  box: number;
  ease: number;
  interval: number;
  nextReview: number | null;
  lastReviewed: number | null;
  reviewCount: number;
}

export interface User {
  name: string;
  email: string;
  password?: string;
  provider: 'email' | 'google';
}

export interface AppState {
  questions: Question[];
  activityLog: Record<string, boolean>;
}

export interface Sheet {
  id: string;
  name: string;
  author: string;
  url: string;
  blurb: string;
  topics: [string, number][]; // [topicName, totalQuestions]
}

export interface TopicProgress {
  solved: number;
  total: number;
}

export interface SheetsData {
  progress: Record<string, Record<string, TopicProgress>>;
  hidden: Record<string, boolean>;
  custom: Record<string, [string, number][]>;
}
