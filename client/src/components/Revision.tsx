import React, { useState } from 'react';
import { Problem, RevisionHistory, ProblemAttempt } from '../types/learningOS';
import { aiService } from '../services/ai';
import { dbService } from '../services/db';

interface RevisionProps {
  problems: Problem[];
  saveProblem: (problem: Problem) => Promise<void>;
  userId: string;
}

export default function Revision({
  problems,
  saveProblem,
  userId
}: RevisionProps) {
  const now = Date.now();
  const due = problems
    .filter(p => p.status === 'Solved' && p.nextReview && p.nextReview <= now)
    .sort((a, b) => (a.nextReview || 0) - (b.nextReview || 0));

  // Log states
  const [selectedConfidence, setSelectedConfidence] = useState<number | null>(null);
  const [solveTime, setSolveTime] = useState('20');
  const [hintsCount, setHintsCount] = useState('0');
  const [mistakesCount, setMistakesCount] = useState('0');
  const [retriesCount, setRetriesCount] = useState('1');
  const [notes, setNotes] = useState('');

  const [activeIndex, setActiveIndex] = useState(0);

  const activeProblem = due[activeIndex];

  const handleRateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProblem || selectedConfidence === null) return;

    const conf = selectedConfidence;
    const timeVal = parseInt(solveTime) || 20;
    const hintsVal = parseInt(hintsCount) || 0;
    const mistakesVal = parseInt(mistakesCount) || 0;
    const retriesVal = parseInt(retriesCount) || 1;

    const scheduleUpdate = await aiService.calculateSpacedRepetition(
      activeProblem,
      conf,
      timeVal,
      hintsVal,
      mistakesVal,
      retriesVal
    );

    const updated: Problem = {
      ...activeProblem,
      ...scheduleUpdate
    };
    await saveProblem(updated);

    // Save logs
    const history: RevisionHistory = {
      id: `rev-${Date.now()}`,
      problemId: activeProblem.id,
      userId,
      date: new Date().toISOString().split('T')[0],
      confidenceScore: conf,
      mistakesCount: mistakesVal,
      solvingTime: timeVal,
      hintsCount: hintsVal,
      retriesCount: retriesVal
    };
    await dbService.saveDoc('revisionHistory', history.id, history);

    const attempt: ProblemAttempt = {
      id: `att-${Date.now()}`,
      problemId: activeProblem.id,
      userId,
      timestamp: Date.now(),
      solvingTime: timeVal,
      hintsUsedCount: hintsVal,
      retriesCount: retriesVal,
      success: conf > 1,
      notes: notes.trim() || undefined
    };
    await dbService.saveDoc('problemAttempts', attempt.id, attempt);

    if (mistakesVal > 0) {
      const log = {
        id: `mistake-${Date.now()}`,
        problemId: activeProblem.id,
        userId,
        mistakeDescription: notes.trim() || `Attempt with ${mistakesVal} mistakes.`,
        createdAt: Date.now()
      };
      await dbService.saveDoc('mistakeLogs', log.id, log);
    }

    setSelectedConfidence(null);
    setSolveTime('20');
    setHintsCount('0');
    setMistakesCount('0');
    setRetriesCount('1');
    setNotes('');

    if (activeIndex >= due.length - 1) {
      setActiveIndex(0);
    }
  };

  const confidenceLabels = [
    { score: 1, label: 'Forgot', desc: '1 Day', color: 'bg-status-danger' },
    { score: 2, label: 'Hard', desc: '3 Days', color: 'bg-accent-orange' },
    { score: 3, label: 'Good', desc: '7 Days', color: 'bg-accent-blue' },
    { score: 4, label: 'Easy', desc: '14 Days', color: 'bg-accent-purple' },
    { score: 5, label: 'Mastered', desc: '30+ Days', color: 'bg-status-success' }
  ];

  return (
    <div className="flex flex-col gap-6 animate__animated animate__fadeIn max-w-[650px] mx-auto">
      <h2 className="brutal-title text-2xl font-black text-center mb-2">SPACED REPETITION ENGINE</h2>

      {due.length === 0 ? (
        <div className="brutal-card p-10 border-3 border-ink shadow-[6px_6px_0px_var(--ink)] bg-bg-white text-center">
          <span className="text-4xl mb-3 block">🏁</span>
          <h3 className="brutal-title text-base font-extrabold mb-1">REVISION QUEUE EMPTY</h3>
          <p className="brutal-mono text-xs text-muted max-w-[280px] mx-auto">
            All solved problems are up to date. Work on syllabus curriculum tasks today!
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="brutal-card p-8 border-3 border-ink shadow-[6px_6px_0px_var(--ink)] bg-bg-white relative">
            <span className="absolute top-4 right-4 brutal-pill bg-accent-yellow border-2 border-ink text-ink font-bold text-[10px]">
              Box {activeProblem.box}
            </span>

            <span className="brutal-mono text-[10px] text-muted uppercase font-bold">Item due for review</span>
            <h3 className="brutal-title text-lg font-black mt-1 mb-4 leading-tight">{activeProblem.title}</h3>

            <div className="flex gap-2 flex-wrap mb-6">
              <span className={`brutal-pill text-[9px] font-black ${
                activeProblem.difficulty === 'Easy' ? 'bg-accent-green' : activeProblem.difficulty === 'Medium' ? 'bg-accent-yellow' : 'bg-accent-pink'
              }`}>
                {activeProblem.difficulty}
              </span>
              <span className="brutal-pill bg-bg-light text-[9px] font-black">{activeProblem.platform}</span>
              {activeProblem.pattern && <span className="brutal-pill bg-bg-light text-[9px] font-black">{activeProblem.pattern}</span>}
            </div>

            {activeProblem.link && (
              <div className="mb-6">
                <a
                  href={activeProblem.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="brutal-btn brutal-btn-primary py-2 px-5 text-xs inline-flex"
                >
                  🚀 OPEN PROBLEM LINK ↗
                </a>
              </div>
            )}

            <form onSubmit={handleRateSubmit} className="border-t-3 border-ink pt-6 flex flex-col gap-4">
              <h4 className="brutal-title text-sm font-black m-0">SESSION EVALUATIONS</h4>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-extrabold uppercase">Solve time (mins)</label>
                  <input type="number" min="1" value={solveTime} onChange={e => setSolveTime(e.target.value)} className="brutal-input text-xs" required />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-extrabold uppercase">Hints count</label>
                  <input type="number" min="0" value={hintsCount} onChange={e => setHintsCount(e.target.value)} className="brutal-input text-xs" required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-extrabold uppercase">Mistakes count</label>
                  <input type="number" min="0" value={mistakesCount} onChange={e => setMistakesCount(e.target.value)} className="brutal-input text-xs" required />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-extrabold uppercase">Retries count</label>
                  <input type="number" min="1" value={retriesCount} onChange={e => setRetriesCount(e.target.value)} className="brutal-input text-xs" required />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-extrabold uppercase">Attempt Notes / Mistakes log</label>
                <input type="text" value={notes} onChange={e => setNotes(e.target.value)} placeholder="e.g. forgot base boundaries context" className="brutal-input text-xs" />
              </div>

              <div className="flex flex-col gap-1.5 mt-2">
                <label className="text-[10px] font-extrabold uppercase">Confidence Rating & Interval</label>
                <div className="grid grid-cols-5 gap-2">
                  {confidenceLabels.map(item => {
                    const isSelected = selectedConfidence === item.score;
                    return (
                      <button
                        key={item.score}
                        type="button"
                        onClick={() => setSelectedConfidence(item.score)}
                        className={`py-2 px-1 border-2 border-ink brutal-title text-center cursor-pointer transition-all duration-75 ${
                          isSelected ? `${item.color} text-ink font-black shadow-[0px_0px_0px_var(--ink)] translate-x-[2px] translate-y-[2px]` : 'bg-bg-white text-ink hover:-translate-y-0.5 hover:shadow-[2px_2px_0px_var(--ink)]'
                        }`}
                      >
                        <div className="text-[10px] font-black uppercase leading-tight">{item.label}</div>
                        <div className="brutal-mono text-[8px] font-bold mt-0.5 leading-none">{item.desc}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <button type="submit" className="w-full brutal-btn brutal-btn-primary py-3.5 text-xs mt-3 font-black" disabled={selectedConfidence === null}>
                ✓ SAVE ATTEMPT LOG & RESCHEDULE
              </button>
            </form>
          </div>

          <p className="text-center brutal-mono text-xs text-muted">
            {due.length - 1} more revision items waiting in queue after this one
          </p>
        </div>
      )}
    </div>
  );
}
