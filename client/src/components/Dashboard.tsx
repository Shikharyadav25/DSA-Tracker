import React, { useState, useEffect, useRef } from 'react';
import { DailyTask, WeeklyPlan, UserPreference, AIInsight, Problem, Skill } from '../types/learningOS';
import { aiService } from '../services/ai';

interface DashboardProps {
  dailyTasks: DailyTask[];
  weeklyPlans: WeeklyPlan[];
  preferences: UserPreference | null;
  streak: number;
  generateWeeklyPlan: () => Promise<void>;
  handleTaskAction: (taskId: string, action: 'completed' | 'skipped') => Promise<void>;
  setActiveTab: (tab: string) => void;
  problems: Problem[];
  skills: Skill[];
  insights: AIInsight[];
}

interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
}

export default function Dashboard({
  dailyTasks,
  weeklyPlans,
  preferences,
  streak,
  generateWeeklyPlan,
  handleTaskAction,
  setActiveTab,
  problems,
  skills,
  insights
}: DashboardProps) {
  const todayStr = new Date().toISOString().split('T')[0];
  const todayTasks = dailyTasks.filter(t => t.date === todayStr);

  // AI Insights state
  const [aiReport, setAiReport] = useState<any>(null);
  const [loadingInsights, setLoadingInsights] = useState(false);

  // Chatbot states
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    { sender: 'ai', text: "WELCOME! I AM ADA, YOUR SDE AI MENTOR. WHAT CONCEPT, SCHEDULE, OR ALGORITHM WOULD YOU LIKE TO DEBUG TODAY?" }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  useEffect(() => {
    if (problems.length > 0 && !aiReport) {
      loadInsights();
    }
  }, [problems]);

  const loadInsights = async () => {
    setLoadingInsights(true);
    const data = await aiService.fetchCoachInsights(problems, skills, dailyTasks);
    setAiReport(data);
    setLoadingInsights(false);
  };

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userText = chatInput.trim();
    setChatHistory(prev => [...prev, { sender: 'user', text: userText }]);
    setChatInput('');
    setChatLoading(true);

    const context = {
      dailyPlan: todayTasks,
      streak,
      mastery: aiReport || {}
    };

    const aiReply = await aiService.chatWithAda(userText, chatHistory, context);
    setChatHistory(prev => [...prev, { sender: 'ai', text: aiReply }]);
    setChatLoading(false);
  };

  return (
    <div className="flex flex-col gap-6 animate__animated animate__fadeIn">
      {/* 1. TOP MAIN ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Tasks Planner */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="brutal-card p-8 border-3 border-border shadow-[6px_6px_0px_var(--shadow-color)] bg-bg-surface relative">
            {/* Category colored corner tab */}
            <div className="absolute top-0 right-0 w-8 h-8 bg-accent-blue border-l-3 border-b-3 border-border"></div>

            <div className="flex justify-between items-center mb-6">
              <h2 className="brutal-title text-2xl font-black m-0 text-text-primary">TODAY'S PLAN</h2>
              <div className="brutal-pill bg-accent-blue border-2 border-border text-text-primary font-bold text-[10px]">
                {todayStr}
              </div>
            </div>

            {todayTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center p-10 border-3 border-dashed border-border bg-bg-surface-alt">
                <span className="text-3xl mb-3">📅</span>
                <h3 className="brutal-title text-base font-extrabold mb-1 text-text-primary">NO TASKS CONFIGURED TODAY</h3>
                <p className="brutal-mono text-xs text-text-secondary max-w-[280px] mb-6">
                  Autopilot scheduling is awaiting weekly target definitions.
                </p>
                <button className="brutal-btn brutal-btn-accent py-3 px-6 text-xs" onClick={generateWeeklyPlan}>
                  ⚡ GENERATE WEEKLY Sprints
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {todayTasks.map(task => {
                  const isDone = task.status === 'completed';
                  const isSkipped = task.status === 'skipped';

                  return (
                    <div
                      key={task.id}
                      className="border-3 border-border p-4 bg-bg-surface flex justify-between items-center transition-all duration-75 hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_var(--shadow-color)]"
                      style={{
                        opacity: isDone || isSkipped ? 0.6 : 1,
                        borderLeftWidth: '8px',
                        borderLeftColor: task.type === 'problem' ? 'var(--accent-blue)' : task.type === 'project' ? 'var(--accent-pink)' : 'var(--accent-green)'
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <span className="brutal-mono text-[9px] uppercase tracking-widest bg-text-primary text-bg-surface px-2 py-0.5 font-bold">
                          {task.type}
                        </span>
                        <h4 className="brutal-title text-sm font-black m-0 leading-tight text-text-primary">
                          {task.title}
                        </h4>
                      </div>

                      {task.status === 'pending' ? (
                        <div className="flex gap-2">
                          <button
                            className="brutal-btn py-1.5 px-3 text-[10px] bg-status-success text-text-primary font-black border-2 border-border"
                            onClick={() => handleTaskAction(task.id, 'completed')}
                          >
                            Done
                          </button>
                          <button
                            className="brutal-btn py-1.5 px-3 text-[10px] bg-status-danger text-text-primary font-black border-2 border-border"
                            onClick={() => handleTaskAction(task.id, 'skipped')}
                          >
                            Skip
                          </button>
                        </div>
                      ) : (
                        <span className="brutal-mono text-[10px] font-black uppercase tracking-wider text-text-primary">
                          {isDone ? 'COMPLETED ✓' : 'SKIPPED / POSTPONED ✕'}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* AI Insights inbox */}
          {insights.length > 0 && (
            <div className="brutal-card p-6 border-3 border-border shadow-[6px_6px_0px_var(--shadow-color)] bg-bg-surface relative">
              <div className="absolute top-0 right-0 w-8 h-8 bg-accent-orange border-l-3 border-b-3 border-border"></div>
              <h3 className="brutal-title text-base font-black mb-4 text-text-primary">AI ALERTS INBOX</h3>
              <div className="flex flex-col gap-3">
                {insights.slice(0, 2).map(ins => (
                  <div key={ins.id} className="border-2 border-border p-3 bg-bg-surface-alt brutal-mono text-xs text-text-primary">
                    <span className="bg-text-primary text-bg-surface px-1.5 py-0.5 font-bold uppercase text-[9px] mr-2">
                      {ins.type}
                    </span>
                    {ins.content}
                    {ins.actionItem && (
                      <div className="mt-2 text-accent-pink font-extrabold uppercase text-[10px] brutal-title">
                        💡 ACTION: {ins.actionItem}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Streaks, Mentor Advice & Diagnostic summary */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Consistency Streak */}
          <div className="brutal-card p-6 border-3 border-border shadow-[6px_6px_0px_var(--shadow-color)] bg-bg-surface relative">
            <div className="absolute top-0 right-0 w-8 h-8 bg-accent-orange border-l-3 border-b-3 border-border"></div>
            <h3 className="brutal-title text-base font-black mb-3 text-text-primary">STREAK HEALTH</h3>
            <div className="flex items-center gap-4">
              <span className="text-4xl">🔥</span>
              <div>
                <div className="brutal-title text-2xl font-black text-text-primary">{streak} DAYS</div>
                <div className="brutal-mono text-[10px] font-bold uppercase leading-none mt-1 text-text-secondary">
                  {streak > 0 ? 'KEEP THE FLAME BURNING' : 'START CODING TO IGNITE STREAK'}
                </div>
              </div>
            </div>
          </div>

          {/* AI Coach Report panel */}
          <div className="brutal-card p-6 border-3 border-border shadow-[6px_6px_0px_var(--shadow-color)] bg-bg-surface relative">
            <div className="absolute top-0 right-0 w-8 h-8 bg-accent-purple border-l-3 border-b-3 border-border"></div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="brutal-title text-base font-black m-0 text-text-primary">MENTOR INSIGHTS</h3>
              <button className="brutal-btn py-1 px-3 text-[10px] border-2 border-border" onClick={loadInsights}>
                {loadingInsights ? 'RELOAD...' : 'REFRESH'}
              </button>
            </div>

            {aiReport ? (
              <div className="flex flex-col gap-4">
                <div>
                  <div className="brutal-mono text-[10px] uppercase font-bold text-text-secondary mb-0.5">Today's Focus</div>
                  <div className="brutal-title text-xs font-black bg-accent-pink text-text-primary px-2.5 py-1 inline-block border-2 border-border">
                    {aiReport.focus}
                  </div>
                </div>

                <div className="border-t border-border pt-3">
                  <div className="brutal-mono text-[10px] uppercase font-bold text-text-secondary mb-0.5">Ada's Advice</div>
                  <p className="text-xs leading-relaxed font-bold m-0 text-text-primary">
                    "{aiReport.motivation}"
                  </p>
                </div>

                <div className="border-t border-border pt-3">
                  <div className="brutal-mono text-[10px] uppercase font-bold text-text-secondary mb-0.5">Weakness alert</div>
                  <div className="text-xs leading-relaxed m-0 brutal-mono text-text-primary">
                    {aiReport.weakness}
                  </div>
                </div>

                <div className="border-t border-border pt-3 bg-bg-surface-alt p-3 border-2 border-border">
                  <div className="brutal-mono text-[10px] uppercase font-bold text-text-secondary mb-1">Reason for task selection</div>
                  <p className="text-xs leading-normal font-medium m-0 text-text-primary">
                    {aiReport.revisionReason}
                  </p>
                </div>

                <div className="border-t border-border pt-3 brutal-mono text-[10px] font-bold uppercase text-text-secondary">
                  ⏳ Syllabus Grad: {aiReport.completionTimeEstimate}
                </div>
              </div>
            ) : (
              <div className="brutal-mono text-xs text-text-secondary">Querying study diagnostics...</div>
            )}
          </div>
        </div>
      </div>

      {/* 2. CHAT WITH ADA */}
      <div className="brutal-card p-6 border-3 border-border shadow-[6px_6px_0px_var(--shadow-color)] bg-bg-surface relative">
        <div className="absolute top-0 right-0 w-8 h-8 bg-accent-green border-l-3 border-b-3 border-border"></div>
        <h2 className="brutal-title text-lg font-black mb-4 text-text-primary">CHAT WITH MENTOR ADA</h2>

        <div className="h-[220px] overflow-y-auto border-3 border-border p-4 flex flex-col gap-3 bg-bg-surface-alt mb-4">
          {chatHistory.map((c, idx) => (
            <div
              key={idx}
              className={`max-w-[80%] p-3 border-2 border-border ${
                c.sender === 'ai' ? 'bg-bg-surface-alt text-text-primary self-start' : 'bg-accent-pink text-text-primary self-end'
              }`}
            >
              <div className="brutal-mono text-[9px] uppercase font-bold mb-1 opacity-70">
                {c.sender === 'ai' ? 'Ada Coach' : 'User'}
              </div>
              <p className="text-xs m-0 font-bold leading-normal">{c.text}</p>
            </div>
          ))}
          {chatLoading && <div className="brutal-mono text-xs text-text-secondary">Ada is typing...</div>}
          <div ref={chatEndRef} />
        </div>

        <form onSubmit={handleSendChat} className="flex gap-2">
          <input
            type="text"
            value={chatInput}
            onChange={e => setChatInput(e.target.value)}
            placeholder="Ask Ada: 'How do I optimize sliding window?' or 'Explain processes.'"
            className="brutal-input flex-1 text-xs"
            disabled={chatLoading}
          />
          <button className="brutal-btn brutal-btn-primary px-6 py-3 text-xs" type="submit" disabled={chatLoading}>
            SEND
          </button>
        </form>
      </div>
    </div>
  );
}
