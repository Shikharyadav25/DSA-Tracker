import * as Types from '../types/learningOS';

export const aiService = {
  // Call Express spaced repetition interval calculator
  async calculateSpacedRepetition(
    problem: Types.Problem,
    confidence: number,
    solvingTime: number,
    hintsCount: number,
    mistakesCount: number,
    retriesCount: number
  ): Promise<Partial<Types.Problem>> {
    try {
      const response = await fetch('/api/scheduler/spaced-repetition', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ problem, confidence, solvingTime, hintsCount, mistakesCount, retriesCount })
      });
      if (!response.ok) throw new Error('Network error');
      return await response.json();
    } catch (e) {
      console.warn('Backend server offline. Running client-side backup revision math.');
      // Local fallback calculation
      let ease = problem.ease || 2.5;
      let box = problem.box || 1;
      let interval = 1;

      if (confidence === 1) {
        box = 1;
        interval = 1;
        ease = Math.max(1.3, ease - 0.2 - 0.05 * mistakesCount);
      } else if (confidence === 2) {
        box = Math.max(1, box - 1);
        interval = 3;
        ease = Math.max(1.3, ease - 0.15 - 0.02 * hintsCount);
      } else if (confidence === 3) {
        interval = 7;
      } else if (confidence === 4) {
        box = Math.min(5, box + 1);
        interval = 14;
        ease = Math.min(3.2, ease + 0.15);
      } else if (confidence === 5) {
        box = Math.min(5, box + 1);
        interval = Math.min(45, Math.round(30 * ease * (solvingTime < problem.estimatedTime ? 1.2 : 0.9)));
        ease = Math.min(3.2, ease + 0.2);
      }

      if (hintsCount > 0) interval = Math.max(1, Math.round(interval * 0.7));
      if (retriesCount > 1) interval = Math.max(1, Math.round(interval * 0.8));

      return {
        box,
        ease: parseFloat(ease.toFixed(2)),
        interval,
        nextReview: Date.now() + interval * 24 * 60 * 60 * 1000,
        lastSolved: Date.now()
      };
    }
  },

  // Call Express scheduler to generate 7 days daily plan
  async generateWeeklyPlan(
    userId: string,
    preferences: Types.UserPreference,
    tracks: Types.LearningTrack[],
    topics: Types.Topic[],
    subtopics: Types.Subtopic[],
    problems: Types.Problem[],
    skills: Types.Skill[],
    projects: Types.Project[]
  ): Promise<any> {
    try {
      const response = await fetch('/api/scheduler/generate-weekly', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, preferences, tracks, topics, subtopics, problems, skills, projects })
      });
      if (!response.ok) throw new Error('API failure');
      return await response.json();
    } catch (e) {
      console.warn('Backend scheduler offline. Generating client-side plan fallback.');
      // Local plan generator
      const today = new Date();
      const offset = (7 - today.getDay()) % 7;
      const start = new Date(today);
      start.setDate(today.getDate() + offset);

      const dailyPlans = [];
      const planIds = [];

      for (let i = 0; i < 7; i++) {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        const dateStr = d.toISOString().split('T')[0];
        planIds.push(dateStr);

        const tasks = [];
        if (preferences.activeTracks.includes('dsa') && problems.length > 0) {
          const nextP = problems.find(x => x.status !== 'Solved') || problems[0];
          tasks.push({
            id: `task-${nextP.id}-${dateStr}`,
            userId,
            date: dateStr,
            type: 'problem' as const,
            title: `Solve Syllabus: ${nextP.title} (${nextP.difficulty})`,
            itemId: nextP.id,
            status: 'pending' as const
          });
        }
        if (preferences.activeTracks.includes('backend') && skills.length > 0) {
          const nextS = skills.find(x => x.status !== 'Mastered') || skills[0];
          tasks.push({
            id: `task-${nextS.id}-${dateStr}`,
            userId,
            date: dateStr,
            type: 'skill' as const,
            title: `Backend Skill: Practice ${nextS.name}`,
            itemId: nextS.id,
            status: 'pending' as const
          });
        }
        if (preferences.activeTracks.includes('projects') && projects.length > 0) {
          const nextProj = projects[0];
          tasks.push({
            id: `task-${nextProj.id}-${dateStr}`,
            userId,
            date: dateStr,
            type: 'project' as const,
            title: `Sprint: Build ${nextProj.name}`,
            itemId: nextProj.id,
            status: 'pending' as const
          });
        }

        dailyPlans.push({
          id: `day-${dateStr}-${userId}`,
          userId,
          date: dateStr,
          tasks: tasks.slice(0, 3),
          status: 'pending',
          focusArea: [5, 6, 0].includes(d.getDay()) ? 'Weekend Sprints' : 'Curriculum Studies'
        });
      }

      return {
        id: start.toISOString().split('T')[0],
        weekStartDate: start.toISOString().split('T')[0],
        userId,
        status: 'Active',
        targetHours: preferences.targetWeeklyHours,
        focusArea: 'Personal SDE OS Plan',
        dailyPlans
      };
    }
  },

  // Carry forward skipped items
  async adaptDailyPlan(
    dailyPlan: any,
    missedTasks: any[],
    tomorrowPlan: any,
    preferences: Types.UserPreference
  ): Promise<{ adaptedTomorrowTasks: any[]; burnoutAlert: boolean }> {
    try {
      const response = await fetch('/api/scheduler/adapt-daily', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dailyPlan, missedTasks, tomorrowPlan, preferences })
      });
      if (!response.ok) throw new Error('API failure');
      return await response.json();
    } catch (e) {
      const limit = preferences.intensity === 'chill' ? 2 : preferences.intensity === 'balanced' ? 3 : 5;
      const adapted = tomorrowPlan ? [...tomorrowPlan.tasks] : [];
      if (missedTasks.length > 0) {
        missedTasks.forEach(task => {
          if (!adapted.some(x => x.itemId === task.itemId) && adapted.length < limit) {
            adapted.unshift({ ...task, id: `task-adapted-${task.itemId}-${Date.now()}`, status: 'pending' });
          }
        });
      }
      return {
        adaptedTomorrowTasks: adapted,
        burnoutAlert: missedTasks.length >= 3
      };
    }
  },

  // Call Gemini weakness analyzers
  async fetchCoachInsights(problems: Types.Problem[], skills: Types.Skill[], dailyPlans: any[]): Promise<any> {
    try {
      const response = await fetch('/api/coach/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ problems, skills, dailyPlans })
      });
      if (!response.ok) throw new Error('API failure');
      return await response.json();
    } catch (e) {
      return {
        motivation: "Consistency builds mastery. Today is a great day to learn dynamic programming!",
        focus: "Syllabus practice problems.",
        weakness: "Trees and graph recursion traversal algorithms.",
        revisionReason: "Calculated based on scheduled memory decays.",
        completionTimeEstimate: "8 weeks left to target graduation.",
        weeklyAdvice: "Focus 2 hours on system design tradeoffs."
      };
    }
  },

  // Conversational promptings
  async chatWithAda(message: string, chatHistory: any[], context: any): Promise<string> {
    try {
      const response = await fetch('/api/coach/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, chatHistory, context })
      });
      if (!response.ok) throw new Error('API failure');
      const data = await response.json();
      return data.text;
    } catch (e) {
      return "Hello! I am Ada. I am running in local offline mode. Please start the Express server on port 5005 with a valid GEMINI_API_KEY to activate my real-time mentorship module!";
    }
  }
};
