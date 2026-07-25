import React, { useState, useEffect } from 'react';
import { AppUser, registerAuthObserver, logout, loginAsGuest, loginWithGoogle, submitAuth, authMode, setAuthMode } from './services/auth';
import { dbService } from './services/db';
import { aiService } from './services/ai';
import * as Types from './types/learningOS';
import { Calendar, BookOpen, RefreshCw, Briefcase, BarChart3, Settings as SettingsIcon, Sun, Moon, AlertTriangle, Zap, Flame } from 'lucide-react';

// Component Views
import Dashboard from './components/Dashboard';
import Curriculum from './components/Curriculum';
import Revision from './components/Revision';
import InterviewPrep from './components/InterviewPrep';
import Analytics from './components/Analytics';
import Settings from './components/Settings';

export default function App() {
  const [user, setUser] = useState<AppUser | null>(null);
  const [authTab, setAuthTab] = useState<'login' | 'signup'>('login');
  const [authError, setAuthError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  // Primary OS Collections
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [tracks, setTracks] = useState<Types.LearningTrack[]>([]);
  const [topics, setTopics] = useState<Types.Topic[]>([]);
  const [subtopics, setSubtopics] = useState<Types.Subtopic[]>([]);
  const [problems, setProblems] = useState<Types.Problem[]>([]);
  const [problemAttempts, setProblemAttempts] = useState<Types.ProblemAttempt[]>([]);
  const [revisionHistory, setRevisionHistory] = useState<Types.RevisionHistory[]>([]);
  const [skillTracks, setSkillTracks] = useState<Types.SkillTrack[]>([]);
  const [skills, setSkills] = useState<Types.Skill[]>([]);
  const [projects, setProjects] = useState<Types.Project[]>([]);
  const [projectMilestones, setProjectMilestones] = useState<Types.ProjectMilestone[]>([]);
  const [interviewTracks, setInterviewTracks] = useState<Types.InterviewTrack[]>([]);
  const [weeklyPlans, setWeeklyPlans] = useState<Types.WeeklyPlan[]>([]);
  const [dailyTasks, setDailyTasks] = useState<Types.DailyTask[]>([]);
  const [taskCompletions, setTaskCompletions] = useState<Types.TaskCompletion[]>([]);
  const [contests, setContests] = useState<Types.Contest[]>([]);
  const [contestAttempts, setContestAttempts] = useState<Types.ContestAttempt[]>([]);
  const [notes, setNotes] = useState<Types.Notes[]>([]);
  const [bookmarks, setBookmarks] = useState<Types.Bookmarks[]>([]);
  const [aiInsights, setAiInsights] = useState<Types.AIInsight[]>([]);
  const [preferences, setPreferences] = useState<Types.UserPreference | null>(null);
  const [masteryScores, setMasteryScores] = useState<Types.MasteryScore[]>([]);
  const [streaks, setStreaks] = useState<Types.Streak | null>(null);

  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    registerAuthObserver((u) => {
      setUser(u);
      if (!u) {
        setTracks([]);
        setTopics([]);
        setSubtopics([]);
        setProblems([]);
        setProjects([]);
      }
    });

    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const initialTheme = savedTheme || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    setTheme(initialTheme);
    document.body.classList.toggle('dark-mode', initialTheme === 'dark');
  }, []);

  useEffect(() => {
    if (!user) return;
    loadOSData();
  }, [user]);

  const loadOSData = async () => {
    try {
      const dbTracks = await dbService.getCollection<Types.LearningTrack>('learningTracks', dbService.getSeedTracks());
      const dbTopics = await dbService.getCollection<Types.Topic>('topics', dbService.getSeedTopics());
      const dbSubtopics = await dbService.getCollection<Types.Subtopic>('subtopics', dbService.getSeedSubtopics());
      const dbProblems = await dbService.getCollection<Types.Problem>('problems', dbService.getSeedProblems());
      const dbSkillTracks = await dbService.getCollection<Types.SkillTrack>('skillTracks', dbService.getSeedSkillTracks());
      const dbSkills = await dbService.getCollection<Types.Skill>('skills', dbService.getSeedSkills());
      const dbProjects = await dbService.getCollection<Types.Project>('projects', dbService.getSeedProjects());
      const dbMilestones = await dbService.getCollection<Types.ProjectMilestone>('projectMilestones');
      const dbInterview = await dbService.getCollection<Types.InterviewTrack>('interviewTracks', dbService.getSeedInterviewTracks());
      const dbWeekly = await dbService.getCollection<Types.WeeklyPlan>('weeklyPlans');
      const dbTasks = await dbService.getCollection<Types.DailyTask>('dailyTasks');
      const dbPrefs = await dbService.getCollection<Types.UserPreference>('preferences');
      const dbInsights = await dbService.getCollection<Types.AIInsight>('aiInsights');
      const dbMastery = await dbService.getCollection<Types.MasteryScore>('masteryScores');
      const dbStreak = await dbService.getCollection<Types.Streak>('streaks');
      const dbCompletions = await dbService.getCollection<Types.TaskCompletion>('taskCompletions');
      const dbContests = await dbService.getCollection<Types.Contest>('contests');
      const dbContestAttempts = await dbService.getCollection<Types.ContestAttempt>('contestAttempts');
      const dbNotes = await dbService.getCollection<Types.Notes>('notes');
      const dbBookmarks = await dbService.getCollection<Types.Bookmarks>('bookmarks');
      const dbAttempts = await dbService.getCollection<Types.ProblemAttempt>('problemAttempts');
      const dbHistory = await dbService.getCollection<Types.RevisionHistory>('revisionHistory');

      setTracks(dbTracks);
      setTopics(dbTopics);
      setSubtopics(dbSubtopics);
      setProblems(dbProblems);
      setSkillTracks(dbSkillTracks);
      setSkills(dbSkills);
      setProjects(dbProjects);
      setProjectMilestones(dbMilestones);
      setInterviewTracks(dbInterview);
      setWeeklyPlans(dbWeekly);
      setDailyTasks(dbTasks);
      setAiInsights(dbInsights);
      setMasteryScores(dbMastery);
      setTaskCompletions(dbCompletions);
      setContests(dbContests);
      setContestAttempts(dbContestAttempts);
      setNotes(dbNotes);
      setBookmarks(dbBookmarks);
      setProblemAttempts(dbAttempts);
      setRevisionHistory(dbHistory);

      if (dbStreak.length > 0) {
        setStreaks(dbStreak[0]);
      } else {
        const initStreak: Types.Streak = {
          id: `streak-${user.uid}`,
          userId: user.uid,
          currentStreak: 0,
          maxStreak: 0,
          lastActiveDate: ''
        };
        await dbService.saveDoc('streaks', initStreak.id, initStreak);
        setStreaks(initStreak);
      }

      if (dbPrefs.length > 0) {
        setPreferences(dbPrefs[0]);
      } else {
        const initPrefs: Types.UserPreference = {
          uid: user.uid,
          targetWeeklyHours: 15,
          activeTracks: ['dsa', 'backend', 'projects', 'core_cs'],
          studyDays: [1, 2, 3, 4, 5, 6, 0],
          wakeTime: '08:00',
          intensity: 'balanced',
          collegeWorkload: 'Low'
        };
        await dbService.saveDoc('preferences', user.uid, initPrefs);
        setPreferences(initPrefs);
      }
    } catch (e) {
      console.error('Data load fail', e);
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthMode(authTab);
    const res = await submitAuth(email, password, name);
    if (!res.success) {
      setAuthError(res.error || 'Authentication error.');
    }
  };

  const handleGoogleAuth = async () => {
    setAuthError(null);
    const res = await loginWithGoogle();
    if (!res.success) {
      setAuthError(res.error || 'Google login failed.');
    }
  };

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('theme', nextTheme);
    document.body.classList.toggle('dark-mode', nextTheme === 'dark');
  };

  const saveProblem = async (problem: Types.Problem) => {
    const updated = [...problems];
    const idx = updated.findIndex(p => p.id === problem.id);
    if (idx > -1) updated[idx] = problem; else updated.push(problem);
    setProblems(updated);
    await dbService.saveDoc('problems', problem.id, problem);
  };

  const deleteProblem = async (id: string) => {
    setProblems(problems.filter(p => p.id !== id));
    await dbService.deleteDoc('problems', id);
  };

  const saveSkill = async (skill: Types.Skill) => {
    const updated = [...skills];
    const idx = updated.findIndex(s => s.id === skill.id);
    if (idx > -1) updated[idx] = skill; else updated.push(skill);
    setSkills(updated);
    await dbService.saveDoc('skills', skill.id, skill);
  };

  const saveProject = async (proj: Types.Project) => {
    const updated = [...projects];
    const idx = updated.findIndex(p => p.id === proj.id);
    if (idx > -1) updated[idx] = proj; else updated.push(proj);
    setProjects(updated);
    await dbService.saveDoc('projects', proj.id, proj);
  };

  const deleteProject = async (id: string) => {
    setProjects(projects.filter(p => p.id !== id));
    await dbService.deleteDoc('projects', id);
  };

  const savePreferences = async (newPrefs: Types.UserPreference) => {
    setPreferences(newPrefs);
    await dbService.saveDoc('preferences', user!.uid, newPrefs);
  };

  const generateWeeklyPlan = async () => {
    if (!preferences) return;
    const plan = await aiService.generateWeeklyPlan(
      user!.uid,
      preferences,
      tracks,
      topics,
      subtopics,
      problems,
      skills,
      projects
    );

    const updatedWeekly = [plan, ...weeklyPlans.filter(w => w.weekStartDate !== plan.weekStartDate)];
    setWeeklyPlans(updatedWeekly);
    await dbService.saveDoc('weeklyPlans', plan.id, plan);

    const inlineDaily = plan.dailyPlans || [];
    const updatedTasks = [...dailyTasks];

    for (const dp of inlineDaily) {
      const inlineTasks: Types.DailyTask[] = dp.tasks || [];
      for (const t of inlineTasks) {
        const idx = updatedTasks.findIndex(x => x.id === t.id);
        if (idx > -1) updatedTasks[idx] = t; else updatedTasks.push(t);
        await dbService.saveDoc('dailyTasks', t.id, t);
      }
    }
    setDailyTasks(updatedTasks);
    loadOSData();
  };

  const handleTaskAction = async (taskId: string, action: 'completed' | 'skipped') => {
    const task = dailyTasks.find(t => t.id === taskId);
    if (!task) return;

    task.status = action;
    const updated = [...dailyTasks];
    const idx = updated.findIndex(t => t.id === taskId);
    updated[idx] = task;
    setDailyTasks(updated);
    await dbService.saveDoc('dailyTasks', task.id, task);

    if (action === 'completed') {
      const completion: Types.TaskCompletion = {
        id: `comp-${Date.now()}`,
        taskId: task.id,
        timestamp: Date.now(),
        timeSpent: 30
      };
      await dbService.saveDoc('taskCompletions', completion.id, completion);

      if (task.type === 'problem') {
        const p = problems.find(prob => prob.id === task.itemId);
        if (p) {
          await saveProblem({
            ...p,
            status: 'Solved',
            masteryScore: Math.min(100, p.masteryScore + 15),
            nextReview: Date.now() + 1 * 24 * 60 * 60 * 1000
          });
        }
      }
      if (task.type === 'skill') {
        const sk = skills.find(s => s.id === task.itemId);
        if (sk) {
          const val = Math.min(100, sk.masteryLevel + 10);
          await saveSkill({
            ...sk,
            masteryLevel: val,
            status: val === 100 ? 'Mastered' : 'In Progress'
          });
        }
      }

      if (streaks) {
        const todayStr = new Date().toISOString().split('T')[0];
        if (streaks.lastActiveDate !== todayStr) {
          const newStreak = streaks.currentStreak + 1;
          const updatedStreak = {
            ...streaks,
            currentStreak: newStreak,
            maxStreak: Math.max(streaks.maxStreak, newStreak),
            lastActiveDate: todayStr
          };
          setStreaks(updatedStreak);
          await dbService.saveDoc('streaks', streaks.id, updatedStreak);
        }
      }
    }

    if (action === 'skipped') {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomStr = tomorrow.toISOString().split('T')[0];

      const carryOver: Types.DailyTask = {
        ...task,
        id: `task-carry-${task.itemId}-${Date.now()}`,
        date: tomStr,
        status: 'pending'
      };
      await dbService.saveDoc('dailyTasks', carryOver.id, carryOver);
      setDailyTasks(prev => [...prev, carryOver]);

      const todayStr = new Date().toISOString().split('T')[0];
      const todaySkipsCount = dailyTasks.filter(t => t.date === todayStr && t.status === 'skipped').length;
      if (todaySkipsCount >= 2) {
        const burnoutInsight: Types.AIInsight = {
          id: `insight-burnout-${Date.now()}`,
          userId: user!.uid,
          date: todayStr,
          type: 'burnout',
          content: 'Multiple study tasks skipped today. Workload limits adjusted downward automatically to prevent fatigue.',
          actionItem: 'Sleep earlier, lower weekly study goals in Settings.'
        };
        await dbService.saveDoc('aiInsights', burnoutInsight.id, burnoutInsight);
        setAiInsights(prev => [burnoutInsight, ...prev]);
      }
    }
  };

  const triggerReset = async () => {
    if (confirm('Verify reset. This deletes all database progress.')) {
      await dbService.resetAndSeedAll();
      loadOSData();
      setActiveTab('dashboard');
    }
  };

  // -------------------------------------------------------------
  // Onboarding / Entry Screen (Yellow Grid Background Layout)
  // -------------------------------------------------------------
  if (!user) {
    return (
      <div className="min-h-screen w-full brutal-grid-paper flex items-center justify-center p-6 select-none">
        <div className="relative brutal-card max-w-[420px] w-full p-10 bg-bg-white flex flex-col items-center">
          {/* Tagline stickers rotated */}
          <div className="absolute -top-4 -left-4 brutal-sticker">
            curriculum OS
          </div>

          <button
            className="theme-toggle-btn absolute top-4 right-4 brutal-btn w-10 h-10 p-0 flex items-center justify-center"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-700" />}
          </button>

          <div className="w-full flex flex-col items-center mb-8 mt-4 text-center">
            {/* Square Logo Swatch */}
            <div className="w-14 h-14 border-3 border-border shadow-[4px_4px_0px_var(--shadow-color)] bg-accent-primary text-white flex items-center justify-center mb-4">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-7 h-7">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
              </svg>
            </div>
            <h1 className="brutal-title text-3xl leading-none font-extrabold mb-1 text-text-primary">LEARNING OS</h1>
            <p className="brutal-mono uppercase text-xs tracking-wider text-text-secondary">Autonomous study coordinator</p>
          </div>

          <div className="auth-toggle w-full flex border-3 border-border mb-6 overflow-hidden">
            <button
              className={`flex-1 py-3 text-sm font-extrabold brutal-title uppercase cursor-pointer ${authTab === 'login' ? 'bg-accent-primary' : 'bg-white'}`}
              style={{ color: authTab === 'login' ? '#FFFFFF' : '#141414', backgroundColor: authTab === 'login' ? '#4A9FD8' : '#FFFFFF' }}
              onClick={() => setAuthTab('login')}
            >
              Sign In
            </button>
            <button
              className={`flex-1 py-3 text-sm font-extrabold brutal-title uppercase cursor-pointer border-l-3 border-border ${authTab === 'signup' ? 'bg-accent-primary' : 'bg-white'}`}
              style={{ color: authTab === 'signup' ? '#FFFFFF' : '#141414', backgroundColor: authTab === 'signup' ? '#4A9FD8' : '#FFFFFF' }}
              onClick={() => setAuthTab('signup')}
            >
              Sign Up
            </button>
          </div>

          <button className="google-btn w-full py-3 brutal-btn brutal-btn-accent text-white mb-4 text-sm" onClick={handleGoogleAuth}>
            Continue with Google
          </button>

          <div className="divider w-full flex items-center justify-center gap-3 brutal-title text-[10px] text-text-secondary mb-4 uppercase">
            or use email
          </div>

          {authError && (
            <div className="w-full brutal-card p-3 bg-status-danger text-text-primary font-bold text-xs mb-4 border-2 border-border flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-accent-red shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleAuthSubmit} className="w-full flex flex-col gap-4">
            {authTab === 'signup' && (
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-extrabold uppercase tracking-wide text-text-primary">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="ADA LOVELACE"
                  className="brutal-input text-xs"
                  required
                />
              </div>
            )}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-extrabold uppercase tracking-wide text-text-primary">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="NAME@EXAMPLE.COM"
                className="brutal-input text-xs"
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-extrabold uppercase tracking-wide text-text-primary">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="******"
                className="brutal-input text-xs"
                required
              />
            </div>
            <button type="submit" className="w-full brutal-btn brutal-btn-primary py-3.5 text-sm mt-2">
              {authTab === 'login' ? 'Confirm Sign In' : 'Create Account'}
            </button>
          </form>

          <button
            className="w-full brutal-btn py-3 mt-3 text-xs"
            onClick={loginAsGuest}
          >
            Guest Sandbox (Offline)
          </button>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // Main App Shell (Sidebar + Content layout pattern)
  // -------------------------------------------------------------
  return (
    <div className="flex min-h-screen bg-bg-canvas text-text-primary">
      {/* Fixed Sidebar Layout */}
      <aside className="w-[280px] border-r-3 border-border bg-bg-surface flex flex-col justify-between flex-shrink-0">
        <div>
          {/* Top Header Block */}
          <div className="sidebar-header bg-bg-surface p-4 px-5 border-b-3 border-border flex items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 border-2 border-border bg-accent-primary text-white flex items-center justify-center flex-shrink-0">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-6 h-6">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
                </svg>
              </div>
              <div>
                <h2 className="brutal-title text-base leading-none font-black text-text-primary m-0">LEARNING OS</h2>
                <span className="brutal-mono text-[9px] uppercase tracking-wider text-text-secondary font-bold">AUTOPILOT SDE MENTOR</span>
              </div>
            </div>
            <button
              className="theme-toggle-btn brutal-btn w-9 h-9 p-0 flex items-center justify-center flex-shrink-0"
              onClick={toggleTheme}
              aria-label="Toggle theme"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>
          </div>

          {/* Navigation Items Stacked */}
          <nav className="p-4 flex flex-col gap-3">
            {[
              { id: 'dashboard', label: 'Plan Board', icon: Calendar },
              { id: 'curriculum', label: 'Curriculum', icon: BookOpen },
              { id: 'revision', label: 'Revision SR', icon: RefreshCw },
              { id: 'interview', label: 'Interview', icon: Briefcase },
              { id: 'analytics', label: 'Analytics', icon: BarChart3 },
              { id: 'settings', label: 'Settings', icon: SettingsIcon }
            ].map(item => {
              const isActive = activeTab === item.id;
              const IconComp = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full text-left py-3.5 px-4 brutal-title text-xs font-black uppercase transition-all duration-75 cursor-pointer brutal-btn flex items-center gap-2.5 ${
                    isActive ? 'bg-accent-primary text-white shadow-[0px_0px_0px_var(--shadow-color)] translate-x-[3px] translate-y-[3px]' : 'bg-bg-surface text-text-primary'
                  }`}
                >
                  <IconComp className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar bottom block */}
        <div className="p-4 border-t-3 border-border bg-bg-surface flex flex-col gap-3">
          {/* Active safety / Reset CTA */}
          <button className="w-full py-3 brutal-btn brutal-btn-accent text-xs flex items-center justify-center gap-1.5" onClick={generateWeeklyPlan}>
            <Zap className="w-4 h-4 shrink-0" />
            <span>GENERATE AUTOPILOT PLAN</span>
          </button>
          
          <button className="w-full py-2.5 brutal-btn text-xs" onClick={logout}>
            EXIT PORTAL
          </button>

          {/* Dash line divider */}
          <div className="border-t-2 border-dashed border-border my-1"></div>

          {/* Pinned Monospace Footer */}
          <div className="brutal-mono text-[10px] uppercase font-bold leading-normal">
            <div>User: {user.name}</div>
            <div>Mode: {user.isGuest ? 'Sandbox' : 'Firestore'}</div>
            <div className="flex items-center gap-1">
              Streak: {streaks?.currentStreak || 0} days <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 min-h-screen p-8 bg-bg-canvas brutal-grid-paper overflow-y-auto relative">
        <button
          className="theme-toggle-btn absolute top-6 right-8 brutal-btn w-10 h-10 p-0 z-30 flex items-center justify-center"
          onClick={toggleTheme}
          aria-label="Toggle theme"
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-700" />}
        </button>
        {activeTab === 'dashboard' && (
          <Dashboard
            dailyTasks={dailyTasks}
            weeklyPlans={weeklyPlans}
            preferences={preferences}
            streak={streaks?.currentStreak || 0}
            generateWeeklyPlan={generateWeeklyPlan}
            handleTaskAction={handleTaskAction}
            setActiveTab={setActiveTab}
            problems={problems}
            skills={skills}
            insights={aiInsights}
          />
        )}
        {activeTab === 'curriculum' && (
          <Curriculum
            tracks={tracks}
            topics={topics}
            subtopics={subtopics}
            problems={problems}
            saveProblem={saveProblem}
            deleteProblem={deleteProblem}
          />
        )}
        {activeTab === 'revision' && (
          <Revision
            problems={problems}
            saveProblem={saveProblem}
            userId={user.uid}
          />
        )}
        {activeTab === 'interview' && (
          <InterviewPrep
            interviewTracks={interviewTracks}
            dailyTasks={dailyTasks}
            handleTaskAction={handleTaskAction}
          />
        )}
        {activeTab === 'analytics' && (
          <Analytics
            problems={problems}
            skills={skills}
            projects={projects}
            dailyTasks={dailyTasks}
            contests={contests}
            contestAttempts={contestAttempts}
            setContestAttempts={setContestAttempts}
            userId={user.uid}
          />
        )}
        {activeTab === 'settings' && (
          <Settings
            preferences={preferences}
            savePrefs={savePreferences}
            triggerReset={triggerReset}
            theme={theme}
            toggleTheme={toggleTheme}
          />
        )}
      </main>
    </div>
  );
}
