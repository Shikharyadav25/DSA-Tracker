import React, { useState } from 'react';
import { Problem } from '../types/learningOS';
import { aiService } from '../services/ai';
import { CheckCircle2, ExternalLink } from 'lucide-react';

interface RevisionProps {
  problems: Problem[];
  saveProblem?: (problem: Problem) => Promise<void>;
  submitReview?: (problemId: string, ratingScore: number) => Promise<void>;
}

export default function Revision({ problems = [], saveProblem, submitReview }: RevisionProps) {
  // Filter problems due for review
  const nowTs = Date.now();
  const dueProblems = problems.filter(p => {
    if (!p.nextReview) return true;
    if (typeof p.nextReview === 'number') return p.nextReview <= nowTs;
    const ms = new Date(p.nextReview).getTime();
    return isNaN(ms) || ms <= nowTs;
  });
  const activeProblem = dueProblems[0] || null;

  const [solveTime, setSolveTime] = useState('15');
  const [hintsCount, setHintsCount] = useState('0');
  const [mistakesCount, setMistakesCount] = useState('0');
  const [showCodeNotes, setShowCodeNotes] = useState(false);
  const [solutionNotes, setSolutionNotes] = useState('');
  const [evaluating, setEvaluating] = useState(false);
  const [aiEvaluation, setAiEvaluation] = useState<any>(null);

  const ratings = [
    { score: 1, label: 'Forgot', desc: '1 Day', color: 'bg-status-danger text-text-primary' },
    { score: 2, label: 'Hard', desc: '3 Days', color: 'bg-accent-orange text-text-primary' },
    { score: 3, label: 'Good', desc: '7 Days', color: 'bg-accent-blue text-text-primary' },
    { score: 4, label: 'Easy', desc: '14 Days', color: 'bg-accent-purple text-text-primary' },
    { score: 5, label: 'Mastered', desc: '30+ Days', color: 'bg-status-success text-text-primary' }
  ];

  const handleRating = async (score: number) => {
    if (!activeProblem) return;
    setEvaluating(true);

    try {
      const evalResult = await aiService.evaluateSpacedRepetition(
        activeProblem.title,
        score,
        parseInt(solveTime) || 15,
        parseInt(hintsCount) || 0,
        parseInt(mistakesCount) || 0
      );
      setAiEvaluation(evalResult);
    } catch (err) {
      console.error('AI evaluation error', err);
    }

    const intervalDaysMap: Record<number, number> = { 1: 1, 2: 3, 3: 7, 4: 14, 5: 30 };
    const days = intervalDaysMap[score] || 7;
    const nextReviewTs = Date.now() + days * 24 * 60 * 60 * 1000;
    const currentBox = activeProblem.box || 1;
    const nextBox = score >= 3 ? Math.min(5, currentBox + 1) : 1;

    const updatedProblem: Problem = {
      ...activeProblem,
      box: nextBox,
      interval: days,
      nextReview: nextReviewTs,
      lastSolved: Date.now(),
      status: 'Solved'
    };

    if (saveProblem) {
      await saveProblem(updatedProblem);
    } else if (submitReview) {
      await submitReview(activeProblem.id, score);
    }

    setEvaluating(false);

    // Reset inputs
    setSolveTime('15');
    setHintsCount('0');
    setMistakesCount('0');
    setShowCodeNotes(false);
    setSolutionNotes('');
  };

  return (
    <div className="flex flex-col gap-6 animate__animated animate__fadeIn max-w-[900px] mx-auto">
      <div>
        <h2 className="brutal-title text-2xl font-black text-center mb-2 text-text-primary">SPACED REPETITION ENGINE</h2>
        <p className="brutal-mono text-xs text-text-secondary text-center">
          SuperMemo 2 algorithm tracking memory decay. Due reviews: {dueProblems.length} items.
        </p>
      </div>

      {!activeProblem ? (
        <div className="brutal-card p-10 border-3 border-border shadow-[6px_6px_0px_var(--shadow-color)] bg-bg-surface text-center">
          <CheckCircle2 className="w-12 h-12 mb-3 mx-auto text-accent-green shrink-0" />
          <h3 className="brutal-title text-base font-extrabold mb-1 text-text-primary">REVISION QUEUE EMPTY</h3>
          <p className="brutal-mono text-xs text-text-secondary max-w-[280px] mx-auto">
            All solved problems are up to date. Work on syllabus curriculum tasks today!
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="brutal-card p-8 border-3 border-border shadow-[6px_6px_0px_var(--shadow-color)] bg-bg-surface relative">
            <span className="absolute top-4 right-4 brutal-pill bg-accent-blue border-2 border-border text-text-primary font-bold text-[10px]">
              Box {activeProblem.box}
            </span>

            <span className="brutal-mono text-[10px] text-text-secondary uppercase font-bold">Item due for review</span>
            <h3 className="brutal-title text-lg font-black mt-1 mb-4 leading-tight text-text-primary">{activeProblem.title}</h3>

            <div className="flex gap-2 flex-wrap mb-6">
              <span className={`brutal-pill text-[9px] font-black text-text-primary ${
                activeProblem.difficulty === 'Easy' ? 'bg-accent-green' : activeProblem.difficulty === 'Medium' ? 'bg-accent-blue' : 'bg-accent-pink'
              }`}>
                {activeProblem.difficulty}
              </span>
              <span className="brutal-pill bg-bg-surface-alt border-border text-[9px] font-black text-text-primary">{activeProblem.platform}</span>
              {activeProblem.pattern && <span className="brutal-pill bg-bg-surface-alt border-border text-[9px] font-black text-text-primary">{activeProblem.pattern}</span>}
            </div>

            {activeProblem.link && (
              <a
                href={activeProblem.link}
                target="_blank"
                rel="noopener noreferrer"
                className="brutal-btn brutal-btn-primary py-2 px-5 text-xs inline-flex items-center gap-1.5"
              >
                <span>OPEN PROBLEM LINK</span>
                <ExternalLink className="w-3.5 h-3.5 shrink-0" />
              </a>
            )}

            {/* Inputs metrics Form */}
            <div className="mt-8 border-t-3 border-border pt-6 flex flex-col gap-4">
              <h4 className="brutal-title text-sm font-black m-0 text-text-primary">SESSION EVALUATIONS</h4>

              <div className="grid grid-cols-3 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-extrabold uppercase text-text-primary">Solve time (mins)</label>
                  <input type="number" min="1" value={solveTime} onChange={e => setSolveTime(e.target.value)} className="brutal-input text-xs" required />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-extrabold uppercase text-text-primary">Hints count</label>
                  <input type="number" min="0" value={hintsCount} onChange={e => setHintsCount(e.target.value)} className="brutal-input text-xs" required />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-extrabold uppercase text-text-primary">Mistakes count</label>
                  <input type="number" min="0" value={mistakesCount} onChange={e => setMistakesCount(e.target.value)} className="brutal-input text-xs" required />
                </div>
              </div>

              {/* Toggle Code notes */}
              <button
                type="button"
                className="brutal-mono text-xs text-text-secondary text-left underline cursor-pointer"
                onClick={() => setShowCodeNotes(!showCodeNotes)}
              >
                {showCodeNotes ? '- Hide Solution Notes' : '+ Add Solution Notes / Time Complexity'}
              </button>

              {showCodeNotes && (
                <textarea
                  rows={3}
                  value={solutionNotes}
                  onChange={e => setSolutionNotes(e.target.value)}
                  placeholder="e.g. O(N) space using frequency map"
                  className="brutal-input text-xs"
                />
              )}

              {/* Confidence Ratings Submit Buttons */}
              <div className="mt-4">
                <label className="text-[10px] font-extrabold uppercase text-text-primary block mb-2">Rate recall confidence:</label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {ratings.map(r => (
                    <button
                      key={r.score}
                      disabled={evaluating}
                      onClick={() => handleRating(r.score)}
                      className={`brutal-btn flex-col p-3 border-3 border-border transition-all ${r.color}`}
                    >
                      <span className="brutal-title text-sm font-black">{r.label}</span>
                      <span className="brutal-mono text-[9px] font-bold mt-1 opacity-90">{r.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* AI Feedback card output */}
          {aiEvaluation && (
            <div className="brutal-card p-6 border-3 border-border shadow-[6px_6px_0px_var(--shadow-color)] bg-bg-surface">
              <span className="brutal-title text-xs font-black bg-accent-green text-text-primary px-2.5 py-1 inline-block border-2 border-border mb-2">
                SM-2 REVISION MEMORY FEEDBACK
              </span>
              <p className="text-xs font-bold leading-relaxed m-0 text-text-primary">
                {aiEvaluation.feedback}
              </p>
              <div className="brutal-mono text-[10px] text-text-secondary mt-2">
                Next interval: {aiEvaluation.recommendedIntervalDays} days | Adjusted Box: {aiEvaluation.adjustedBox}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
