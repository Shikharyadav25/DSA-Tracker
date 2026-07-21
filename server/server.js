import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Gemini API
const geminiApiKey = process.env.GEMINI_API_KEY || '';
let genAI = null;
if (geminiApiKey) {
  genAI = new GoogleGenerativeAI(geminiApiKey);
} else {
  console.warn("WARNING: GEMINI_API_KEY is not defined. AI Coach will execute using simulated model.");
}

// -------------------------------------------------------------
// 1. Spaced Repetition (Adaptive SM-2 Algorithm)
// -------------------------------------------------------------
function calculateNextRevision(q, confidence, solvingTime, hintsCount, mistakesCount, retriesCount) {
  // confidence: 1 = Again (forgot), 2 = Hard, 3 = Good, 4 = Easy, 5 = Mastered (instant recall)
  let box = q.box || 1;
  let ease = q.ease || 2.5;
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
    box = box;
    interval = 7;
  } else if (confidence === 4) {
    box = Math.min(5, box + 1);
    interval = 14;
    ease = Math.min(3.2, ease + 0.15);
  } else if (confidence === 5) {
    box = Math.min(5, box + 1);
    // 30+ days: scale based on ease and actual speed compared to estimatedTime
    const speedRatio = q.estimatedTime ? Math.max(0.5, Math.min(1.5, q.estimatedTime / solvingTime)) : 1.0;
    interval = Math.min(45, Math.round(30 * ease * speedRatio));
    ease = Math.min(3.2, ease + 0.2);
  }

  // Adjust intervals based on assistance penalties
  if (hintsCount > 0) {
    interval = Math.max(1, Math.round(interval * 0.7));
  }
  if (retriesCount > 1) {
    interval = Math.max(1, Math.round(interval * 0.8));
  }

  const nextReview = Date.now() + interval * 24 * 60 * 60 * 1000;

  return {
    box,
    ease: parseFloat(ease.toFixed(2)),
    interval,
    nextReview,
    lastSolved: Date.now()
  };
}

// -------------------------------------------------------------
// 2. Autonomous Scheduler Engine
// -------------------------------------------------------------
function generateWeeklyPlanSchedule(userId, preferences, tracks, topics, subtopics, problems, skills, projects) {
  const activeTracks = preferences?.activeTracks || ['dsa', 'backend', 'projects', 'core_cs'];
  const intensity = preferences?.intensity || 'balanced';
  const targetWeeklyHours = preferences?.targetWeeklyHours || 15;
  const studyDays = preferences?.studyDays || [1, 2, 3, 4, 5, 6, 0];
  const collegeWorkload = preferences?.collegeWorkload || 'Low';

  // Burnout check: adjust study capacity if college workload is high
  let dailyTasksLimit = intensity === 'chill' ? 2 : intensity === 'balanced' ? 3 : 5;
  if (collegeWorkload === 'High') {
    dailyTasksLimit = Math.max(1, dailyTasksLimit - 1);
  }

  // Calculate start of next Sunday
  const today = new Date();
  const daysUntilSunday = (7 - today.getDay()) % 7;
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() + daysUntilSunday);

  const dailyPlans = [];
  const weeklyPlanId = startOfWeek.toISOString().split('T')[0];

  // Helper variables for track counters
  let problemIndex = 0;
  let skillIndex = 0;
  let csIndex = 0;

  for (let i = 0; i < 7; i++) {
    const currentDate = new Date(startOfWeek);
    currentDate.setDate(startOfWeek.getDate() + i);
    const dayOfWeek = currentDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const dateStr = currentDate.toISOString().split('T')[0];

    const isStudyDay = studyDays.includes(dayOfWeek);
    if (!isStudyDay) {
      dailyPlans.push({
        id: `day-${dateStr}-${userId}`,
        date: dateStr,
        tasks: [],
        status: 'skipped',
        focusArea: 'Rest Day'
      });
      continue;
    }

    const tasks = [];
    let focusArea = 'DSA & API Study';

    // Weekend (Friday-Sunday): Sprints focus on Projects & Spaced Revisions
    const isWeekend = [5, 6, 0].includes(dayOfWeek);

    if (isWeekend) {
      focusArea = 'Projects Sprint & Revision';

      // 1. Spaced Repetition (revisions)
      const dueRevisions = problems
        .filter(p => p.status === 'Solved' && p.nextReview && p.nextReview <= currentDate.getTime())
        .slice(0, 2);

      dueRevisions.forEach(p => {
        tasks.push({
          id: `task-${p.id}-${dateStr}`,
          userId,
          date: dateStr,
          type: 'problem',
          title: `Revise: ${p.title} (Box ${p.box})`,
          itemId: p.id,
          status: 'pending'
        });
      });

      // 2. High-priority Projects Sprints
      if (activeTracks.includes('projects')) {
        const activeProjects = projects.filter(p => p.status === 'In Progress');
        activeProjects.forEach(proj => {
          tasks.push({
            id: `task-${proj.id}-${dateStr}`,
            userId,
            date: dateStr,
            type: 'project',
            title: `Sprint: Build ${proj.name} (${proj.completionPercentage}% complete)`,
            itemId: proj.id,
            status: 'pending'
          });
        });
      }

      // 3. Resume / Profile tailoring
      if (activeTracks.includes('resume') && dayOfWeek === 6) {
        tasks.push({
          id: `task-resume-${dateStr}`,
          userId,
          date: dateStr,
          type: 'resume',
          title: 'Review and refine LinkedIn portfolio / cold emails template',
          itemId: 'res-portfolio',
          status: 'pending'
        });
      }

    } else {
      // Weekdays (Monday-Thursday): Curriculum Syllabus Focus
      
      // 1. Core Spaced Revisions (Leitner check)
      const dueRevisions = problems
        .filter(p => p.status === 'Solved' && p.nextReview && p.nextReview <= currentDate.getTime())
        .slice(0, 1);

      dueRevisions.forEach(p => {
        tasks.push({
          id: `task-${p.id}-${dateStr}`,
          userId,
          date: dateStr,
          type: 'problem',
          title: `Revise Spaced Card: ${p.title}`,
          itemId: p.id,
          status: 'pending'
        });
      });

      // 2. Next Curriculum Problem
      if (activeTracks.includes('dsa')) {
        const unsolved = problems.filter(p => p.status !== 'Solved');
        if (unsolved.length > 0) {
          const nextProb = unsolved[problemIndex % unsolved.length];
          tasks.push({
            id: `task-${nextProb.id}-${dateStr}`,
            userId,
            date: dateStr,
            type: 'problem',
            title: `Syllabus Practice: ${nextProb.title} (${nextProb.difficulty})`,
            itemId: nextProb.id,
            status: 'pending'
          });
          problemIndex++;
        }
      }

      // 3. Backend Skill Practicing
      if (activeTracks.includes('backend') && skills.length > 0) {
        const incomplete = skills.filter(s => s.status !== 'Mastered');
        if (incomplete.length > 0) {
          const nextSkill = incomplete[skillIndex % incomplete.length];
          tasks.push({
            id: `task-${nextSkill.id}-${dateStr}`,
            userId,
            date: dateStr,
            type: 'skill',
            title: `Backend Skill: Study ${nextSkill.name}`,
            itemId: nextSkill.id,
            status: 'pending'
          });
          skillIndex++;
        }
      }

      // 4. Core CS / Aptitude (Alternate weekdays)
      if (activeTracks.includes('core_cs') && [1, 3].includes(dayOfWeek)) {
        const coreTopics = topics.filter(t => t.trackId === 'core_cs');
        if (coreTopics.length > 0) {
          const nextCS = coreTopics[csIndex % coreTopics.length];
          tasks.push({
            id: `task-${nextCS.id}-${dateStr}`,
            userId,
            date: dateStr,
            type: 'core_cs',
            title: `Core CS: Study ${nextCS.name}`,
            itemId: nextCS.id,
            status: 'pending'
          });
          csIndex++;
        }
      } else if (activeTracks.includes('aptitude') && [2, 4].includes(dayOfWeek)) {
        tasks.push({
          id: `task-aptitude-${dateStr}`,
          userId,
          date: dateStr,
          type: 'aptitude',
          title: 'Aptitude: Practice OA Logical Puzzles',
          itemId: 'apt-quant',
          status: 'pending'
        });
      }
    }

    const finalTasks = tasks.slice(0, dailyTasksLimit);

    dailyPlans.push({
      id: `day-${dateStr}-${userId}`,
      userId,
      date: dateStr,
      tasks: finalTasks,
      status: finalTasks.length > 0 ? 'pending' : 'completed',
      focusArea
    });
  }

  return {
    id: weeklyPlanId,
    weekStartDate: weeklyPlanId,
    userId,
    status: 'Active',
    targetHours,
    focusArea: 'Personalized SDE Curriculum',
    dailyPlans
  };
}

// -------------------------------------------------------------
// 3. AI Insights Engine (Gemini API integrations)
// -------------------------------------------------------------
async function queryAIInsights(problems, skills, dailyPlans) {
  if (!genAI) {
    return {
      motivation: "Keep pushing forward! Consistency beats talent. Review your DFS islands concept today.",
      focus: "DSA Trees & Backend caching configurations.",
      weakness: "Graph traversals and Docker layering patterns.",
      revisionReason: "Your two-sum sliding window review is due today to reinforce memory retention.",
      completionTimeEstimate: "Estimated 6 weeks to complete active syllabus tracks.",
      weeklyAdvice: "Dedicate 2 hours to Docker multi-stage build optimization this Saturday."
    };
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `
      You are "Ada", a senior technical architect and software engineering coach.
      Analyze this student tracking data:
      - DSA Problems: ${JSON.stringify(problems.map(p => ({ title: p.title, status: p.status, box: p.box, diff: p.difficulty })))}
      - Backend Skills: ${JSON.stringify(skills.map(s => ({ name: s.name, level: s.masteryLevel, status: s.status })))}
      - Daily Plans: ${JSON.stringify(dailyPlans.slice(-7).map(d => ({ date: d.date, status: d.status })))}

      Generate a deep performance audit in JSON format. Do not return any other text or markdown wrappers. Exactly match this schema:
      {
        "motivation": "Inspiring SDE motivation quote",
        "focus": "Specify exactly what primary topic they must code today",
        "weakness": "Which specific data structure or tech stack they are struggling with",
        "revisionReason": "Detailed explanation of why today's revision problems were algorithmically chosen",
        "completionTimeEstimate": "Timeline prediction (e.g. 5 weeks to syllabus completion)",
        "weeklyAdvice": "General architectural advice for this week's studies"
      }
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    const cleanJson = text.replace(/^```json/i, '').replace(/```$/, '').trim();
    return JSON.parse(cleanJson);
  } catch (e) {
    console.error("Gemini insights failure:", e);
    return {
      motivation: "Consistency leads to mastery. Focus on your scheduled tasks today.",
      focus: "Syllabus scheduled lessons.",
      weakness: "Variable depending on review intervals.",
      revisionReason: "Scheduled by spaced-repetition cues to prevent memory decay.",
      completionTimeEstimate: "8 weeks estimated timeline.",
      weeklyAdvice: "Allocate dedicated revision sessions on weekends."
    };
  }
}

// -------------------------------------------------------------
// 4. API Controllers
// -------------------------------------------------------------

app.get('/health', (req, res) => {
  res.json({ status: 'ok', api_loaded: !!genAI });
});

// Post review ratings and calculate next revision
app.post('/api/scheduler/spaced-repetition', (req, res) => {
  const { problem, confidence, solvingTime, hintsCount, mistakesCount, retriesCount } = req.body;
  if (!problem) return res.status(400).json({ error: 'Missing problem data' });

  const update = calculateNextRevision(
    problem,
    parseInt(confidence) || 3,
    parseInt(solvingTime) || 15,
    parseInt(hintsCount) || 0,
    parseInt(mistakesCount) || 0,
    parseInt(retriesCount) || 1
  );
  res.json(update);
});

// Generate complete weekly study plans
app.post('/api/scheduler/generate-weekly', (req, res) => {
  const { userId, preferences, tracks, topics, subtopics, problems, skills, projects } = req.body;
  if (!userId || !preferences) return res.status(400).json({ error: 'Missing study profiles' });

  const weeklyPlan = generateWeeklyPlanSchedule(
    userId,
    preferences,
    tracks || [],
    topics || [],
    subtopics || [],
    problems || [],
    skills || [],
    projects || []
  );
  res.json(weeklyPlan);
});

// Adapt tomorrow's study load
app.post('/api/scheduler/adapt-daily', (req, res) => {
  const { dailyPlan, missedTasks, tomorrowPlan, preferences } = req.body;
  if (!dailyPlan) return res.status(400).json({ error: 'Missing today plan context' });

  const intensity = preferences?.intensity || 'balanced';
  const limit = intensity === 'chill' ? 2 : intensity === 'balanced' ? 3 : 5;

  const adaptedTasks = tomorrowPlan ? [...tomorrowPlan.tasks] : [];

  // Automatically prepend missed tasks so that the user never loses progress
  if (missedTasks && missedTasks.length > 0) {
    missedTasks.forEach(task => {
      const exists = adaptedTasks.some(t => t.itemId === task.itemId);
      if (!exists && adaptedTasks.length < limit) {
        adaptedTasks.unshift({
          ...task,
          id: `task-adapted-${task.itemId}-${Date.now()}`,
          status: 'pending'
        });
      }
    });
  }

  res.json({
    adaptedTomorrowTasks: adaptedTasks,
    burnoutAlert: missedTasks && missedTasks.length >= 3
  });
});

// AI Coach Report Insights
app.post('/api/coach/insights', async (req, res) => {
  const { problems, skills, dailyPlans } = req.body;
  const reports = await queryAIInsights(problems || [], skills || [], dailyPlans || []);
  res.json(reports);
});

// AI Coach Chat Portal
app.post('/api/coach/chat', async (req, res) => {
  const { message, chatHistory, context } = req.body;
  if (!message) return res.status(400).json({ error: 'Missing query message' });

  if (!genAI) {
    return res.json({
      text: `Ada Mentor (Offline mode): You queried "${message}". To unlock intelligent replies, configure a valid GEMINI_API_KEY inside your env variables. In the meantime, remember: focus on today's revision cards!`
    });
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const formattedHistory = (chatHistory || []).map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }]
    }));

    const systemPrompt = `
      You are "Ada", a senior staff engineer and personal mentor.
      Context:
      - Today's tasks: ${JSON.stringify(context?.dailyPlan || {})}
      - Streaks count: ${context?.streak || 0} days active.
      Guide the student with code tips, design breakdowns, and friendly software development motivation.
    `;

    const chat = model.startChat({
      history: formattedHistory,
      systemInstruction: systemPrompt
    });

    const result = await chat.sendMessage(message);
    res.json({ text: result.response.text() });
  } catch (error) {
    console.error("AI Coach chatbot error:", error);
    res.status(500).json({ error: "Failed to query mentor chatbot." });
  }
});

const PORT = process.env.PORT || 5005;
app.listen(PORT, () => {
  console.log(`Learning OS Backend listening on port ${PORT}`);
});
