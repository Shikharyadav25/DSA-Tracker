import React, { useState, useEffect } from 'react';
import { AppUser, registerAuthObserver, logout, loginAsGuest, loginWithGoogle, submitAuth, authMode, setAuthMode, resetPassword } from './services/auth';
import { dbService } from './services/db';
import { aiService } from './services/ai';
import * as Types from './types/learningOS';
import { Calendar, BookOpen, RefreshCw, Briefcase, BarChart3, Settings as SettingsIcon, Sun, Moon, AlertTriangle, Zap, Flame, CheckCircle, Menu, X } from 'lucide-react';

import { useLocation, useNavigate, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import Curriculum from './components/Curriculum';
import Revision from './components/Revision';
import InterviewPrep from './components/InterviewPrep';
import Analytics from './components/Analytics';
import Settings from './components/Settings';
import LeetLogo from './components/LeetLogo';

const GoogleLogo = () => (
  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
    />
  </svg>
);

export default function App() {
  const [user, setUser] = useState<AppUser | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const location = useLocation();
  const navigate = useNavigate();

  const handleSetActiveTab = (tab: string) => {
    if (tab === 'dashboard') {
      navigate('/');
    } else {
      navigate(`/${tab}`);
    }
  };
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
    setAuthInfo(null);
    setAuthLoading(true);
    setAuthMode(authTab);
    try {
      const res = await submitAuth(email, password, name);
      if (!res.success) {
        setAuthError(res.error || 'Authentication error.');
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setAuthError(null);
    setAuthInfo(null);
    setAuthLoading(true);
    try {
      const res = await loginWithGoogle();
      if (!res.success) {
        setAuthError(res.error || 'Google login failed.');
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    setAuthError(null);
    setAuthInfo(null);
    if (!email || !email.includes('@')) {
      setAuthError('Please enter your email address first, then click "Forgot Password?".');
      return;
    }
    setAuthLoading(true);
    try {
      const res = await resetPassword(email);
      if (res.success) {
        setAuthInfo(res.message || 'Password reset link sent to your email.');
      } else {
        setAuthError(res.error || 'Failed to send reset link.');
      }
    } finally {
      setAuthLoading(false);
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
      navigate('/');
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
            leet track OS
          </div>

          <button
            className="theme-toggle-btn absolute top-4 right-4 brutal-btn w-10 h-10 p-0 flex items-center justify-center"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-700" />}
          </button>

          <div className="w-full flex flex-col items-center mb-8 mt-4 text-center">
            {/* Square Logo Swatch with LeetCode styling */}
            <div className="w-14 h-14 border-3 border-border shadow-[4px_4px_0px_var(--shadow-color)] bg-[#1A1A1A] text-white flex items-center justify-center mb-4 rounded-lg">
              <LeetLogo className="w-8 h-8" />
            </div>
            <h1 className="brutal-title text-3xl leading-none font-extrabold mb-1 text-text-primary">LEET TRACK</h1>
            <p className="brutal-mono uppercase text-xs tracking-wider text-text-secondary">Autonomous LeetCode & SDE Tracker</p>
          </div>

          {authError && (
            <div className="w-full brutal-card p-3 bg-status-danger text-text-primary font-bold text-xs mb-6 border-2 border-border flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-accent-red shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          <button 
            type="button"
            disabled={authLoading}
            className="google-btn w-full py-4 brutal-btn bg-white hover:bg-slate-50 text-text-primary mb-4 text-sm font-black brutal-title flex items-center justify-center gap-3 shadow-[4px_4px_0px_var(--shadow-color)] border-3 border-border cursor-pointer transition-all active:translate-x-[2px] active:translate-y-[2px]" 
            onClick={handleGoogleAuth}
          >
            <GoogleLogo />
            <span>{authLoading ? 'CONNECTING...' : 'CONTINUE WITH GOOGLE'}</span>
          </button>

          <button
            type="button"
            className="w-full brutal-btn py-3 text-xs brutal-mono font-bold uppercase cursor-pointer"
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
    <div className="flex flex-col md:flex-row min-h-screen bg-bg-canvas text-text-primary relative overflow-x-hidden">
      {/* Mobile Top Header Bar */}
      <header className="md:hidden sticky top-0 z-40 bg-bg-surface border-b-3 border-border p-3 px-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="brutal-btn p-2 text-text-primary cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="w-8 h-8 border-2 border-border bg-[#1A1A1A] text-white flex items-center justify-center flex-shrink-0 rounded-md">
            <LeetLogo className="w-5 h-5" />
          </div>
          <span className="brutal-title text-sm font-black text-text-primary">LEET TRACK</span>
        </div>

        <button
          className="theme-toggle-btn brutal-btn w-9 h-9 p-0 flex items-center justify-center flex-shrink-0"
          onClick={toggleTheme}
          aria-label="Toggle theme"
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
        </button>
      </header>

      {/* Mobile Backdrop Overlay */}
      {mobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/60 z-40 transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Layout (Drawer on Mobile, Static on Desktop) */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-[280px] border-r-3 border-border bg-bg-surface flex flex-col justify-between flex-shrink-0 transition-transform duration-200 ease-in-out ${
          mobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div>
          {/* Top Header Block */}
          <div className="sidebar-header bg-bg-surface p-4 px-5 border-b-3 border-border flex items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 border-2 border-border bg-[#1A1A1A] text-white flex items-center justify-center flex-shrink-0 rounded-md">
                <LeetLogo className="w-6 h-6" />
              </div>
              <div>
                <h2 className="brutal-title text-base leading-none font-black text-text-primary m-0">LEET TRACK</h2>
                <span className="brutal-mono text-[9px] uppercase tracking-wider text-text-secondary font-bold">AUTOPILOT SDE MENTOR</span>
              </div>
            </div>
            <button
              className="hidden md:flex theme-toggle-btn brutal-btn w-9 h-9 p-0 items-center justify-center flex-shrink-0"
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
              { id: 'dashboard', path: '/', label: 'Plan Board', icon: Calendar },
              { id: 'curriculum', path: '/curriculum', label: 'Curriculum', icon: BookOpen },
              { id: 'revision', path: '/revision', label: 'Revision SR', icon: RefreshCw },
              { id: 'interview', path: '/interview', label: 'Interview', icon: Briefcase },
              { id: 'analytics', path: '/analytics', label: 'Analytics', icon: BarChart3 },
              { id: 'settings', path: '/settings', label: 'Settings', icon: SettingsIcon }
            ].map(item => {
              const isActive = location.pathname === item.path || (item.path === '/' && location.pathname === '/dashboard');
              const IconComp = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    navigate(item.path);
                    setMobileMenuOpen(false);
                  }}
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
          <button 
            className="w-full py-3 brutal-btn brutal-btn-accent text-xs flex items-center justify-center gap-1.5" 
            onClick={() => {
              generateWeeklyPlan();
              setMobileMenuOpen(false);
            }}
          >
            <Zap className="w-4 h-4 shrink-0" />
            <span>GENERATE AUTOPILOT PLAN</span>
          </button>
          
          <button 
            className="w-full py-2.5 brutal-btn text-xs" 
            onClick={() => {
              logout();
              setMobileMenuOpen(false);
            }}
          >
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
      <main className="flex-1 min-w-0 min-h-screen p-4 sm:p-6 md:p-8 bg-bg-canvas brutal-grid-paper overflow-y-auto relative">
        <button
          className="hidden md:flex theme-toggle-btn absolute top-6 right-8 brutal-btn w-10 h-10 p-0 z-30 items-center justify-center"
          onClick={toggleTheme}
          aria-label="Toggle theme"
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-700" />}
        </button>
        <Routes>
          <Route
            path="/"
            element={
              <Dashboard
                dailyTasks={dailyTasks}
                weeklyPlans={weeklyPlans}
                preferences={preferences}
                streak={streaks?.currentStreak || 0}
                generateWeeklyPlan={generateWeeklyPlan}
                handleTaskAction={handleTaskAction}
                setActiveTab={handleSetActiveTab}
                problems={problems}
                skills={skills}
                insights={aiInsights}
              />
            }
          />
          <Route path="/dashboard" element={<Navigate to="/" replace />} />
          <Route
            path="/curriculum"
            element={
              <Curriculum
                tracks={tracks}
                topics={topics}
                subtopics={subtopics}
                problems={problems}
                saveProblem={saveProblem}
                deleteProblem={deleteProblem}
              />
            }
          />
          <Route
            path="/revision"
            element={
              <Revision
                problems={problems}
                saveProblem={saveProblem}
              />
            }
          />
          <Route
            path="/interview"
            element={
              <InterviewPrep
                interviewTracks={interviewTracks}
                dailyTasks={dailyTasks}
                handleTaskAction={handleTaskAction}
              />
            }
          />
          <Route
            path="/analytics"
            element={
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
            }
          />
          <Route
            path="/settings"
            element={
              <Settings
                preferences={preferences}
                savePrefs={savePreferences}
                triggerReset={triggerReset}
                theme={theme}
                toggleTheme={toggleTheme}
              />
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
