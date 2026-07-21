import React, { useState } from 'react';
import { Problem, Skill, Project, DailyTask, Contest, ContestAttempt } from '../types/learningOS';
import { dbService } from '../services/db';

interface AnalyticsProps {
  problems: Problem[];
  skills: Skill[];
  projects: Project[];
  dailyTasks: DailyTask[];
  contests: Contest[];
  contestAttempts: ContestAttempt[];
  setContestAttempts: React.Dispatch<React.SetStateAction<ContestAttempt[]>>;
  userId: string;
}

export default function Analytics({
  problems,
  skills,
  projects,
  dailyTasks,
  contests,
  contestAttempts,
  setContestAttempts,
  userId
}: AnalyticsProps) {
  const [showAddContest, setShowAddContest] = useState(false);
  const [cName, setCName] = useState('');
  const [cPlatform, setCPlatform] = useState('LeetCode');
  const [cSolved, setCSolved] = useState('2');
  const [cTotal, setCTotal] = useState('4');
  const [cRating, setCRating] = useState('');
  const [cRank, setCRank] = useState('');

  const calculateDSAMastery = () => {
    const solved = problems.filter(p => p.status === 'Solved');
    if (problems.length === 0) return 0;
    const totalWeight = problems.reduce((acc, p) => acc + (p.difficulty === 'Easy' ? 1 : p.difficulty === 'Medium' ? 2 : 3), 0);
    const solvedWeight = solved.reduce((acc, p) => acc + (p.difficulty === 'Easy' ? 1 : p.difficulty === 'Medium' ? 2 : 3), 0);
    return Math.round((solvedWeight / totalWeight) * 100);
  };

  const calculateBackendMastery = () => {
    if (skills.length === 0) return 0;
    const total = skills.reduce((acc, s) => acc + (s.masteryLevel || 0), 0);
    return Math.round(total / skills.length);
  };

  const calculateProjectsMastery = () => {
    if (projects.length === 0) return 0;
    const total = projects.reduce((acc, p) => acc + (p.completionPercentage || 0), 0);
    return Math.round(total / projects.length);
  };

  const calculateCSCoreMastery = () => {
    const completedTasks = dailyTasks.filter(t => t.type === 'core_cs' && t.status === 'completed').length;
    return Math.min(100, 30 + completedTasks * 10);
  };

  const dsaMastery = calculateDSAMastery();
  const backendMastery = calculateBackendMastery();
  const projectsMastery = calculateProjectsMastery();
  const coreCSMastery = calculateCSCoreMastery();

  const internshipReadinessIndex = Math.round(
    dsaMastery * 0.40 +
    backendMastery * 0.30 +
    coreCSMastery * 0.15 +
    projectsMastery * 0.15
  );

  const getIRIStatus = (score: number) => {
    if (score >= 85) return { label: 'TOP CANDIDATE', color: 'text-accent-green', desc: 'Excellent SDE resume fundamentals.' };
    if (score >= 50) return { label: 'INTERVIEW READY', color: 'text-accent-yellow', desc: 'Ready to submit OA assessment roles.' };
    return { label: 'REINFORCING LOGIC', color: 'text-status-danger', desc: 'Focus on medium arrays and recursion.' };
  };

  const iri = getIRIStatus(internshipReadinessIndex);

  const getProjections = () => {
    const solvedCount = problems.filter(p => p.status === 'Solved').length;
    const totalCount = problems.length;
    const remaining = totalCount - solvedCount;

    const completedTasks = dailyTasks.filter(t => t.status === 'completed' && t.type === 'problem');
    const velocity = Math.max(1, completedTasks.length);
    const weeksRemaining = Math.ceil(remaining / velocity);

    const completionDate = new Date();
    completionDate.setDate(completionDate.getDate() + weeksRemaining * 7);

    return {
      velocity,
      weeksRemaining,
      completionStr: completionDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };
  };

  const projections = getProjections();

  const handleLogContest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cName.trim()) return;

    const contest: Contest = {
      id: 'c-' + Date.now().toString(36),
      name: cName.trim(),
      platform: cPlatform,
      date: new Date().toISOString().split('T')[0]
    };
    await dbService.saveDoc('contests', contest.id, contest);

    const attempt: ContestAttempt = {
      id: 'att-' + Date.now().toString(36),
      contestId: contest.id,
      userId,
      solvedCount: parseInt(cSolved) || 0,
      totalCount: parseInt(cTotal) || 4,
      rating: cRating ? parseInt(cRating) : undefined,
      rank: cRank ? parseInt(cRank) : undefined
    };
    const updated = [...contestAttempts, attempt];
    setContestAttempts(updated);
    await dbService.saveDoc('contestAttempts', attempt.id, attempt);

    setCName('');
    setCRating('');
    setCRank('');
    setShowAddContest(false);
  };

  return (
    <div className="flex flex-col gap-6 animate__animated animate__fadeIn">
      {/* 1. Internship Readiness Gauge */}
      <div className="brutal-card p-8 border-3 border-ink shadow-[6px_6px_0px_var(--ink)] bg-bg-white relative">
        <div className="absolute top-0 right-0 w-8 h-8 bg-accent-blue border-l-3 border-b-3 border-ink"></div>

        <div className="flex justify-between items-center">
          <div>
            <h2 className="brutal-title text-2xl font-black m-0 leading-none">INTERNSHIP READINESS INDEX</h2>
            <p className="brutal-mono text-xs text-muted mt-2">
              Aggregate SDE metric weighting DSA, Systems code, and Capstone projects.
            </p>
          </div>
          <span className="brutal-title text-3xl font-black">{internshipReadinessIndex}%</span>
        </div>

        <div className="w-full h-5 border-3 border-ink bg-bg-light relative my-6">
          <div
            className="h-full bg-accent-green"
            style={{ width: `${internshipReadinessIndex}%` }}
          />
        </div>

        <div className="flex justify-between items-center text-xs font-bold uppercase">
          <span>Status: <b className={iri.color}>{iri.label}</b> ({iri.desc})</span>
          <span className="brutal-mono">Target: 90%</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Domain Mastery breakdown & velocity */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          <div className="brutal-card p-6 border-3 border-ink shadow-[6px_6px_0px_var(--ink)] bg-bg-white relative">
            <div className="absolute top-0 right-0 w-6 h-6 bg-accent-pink border-l-3 border-b-3 border-ink"></div>
            <h2 className="brutal-title text-base font-black mb-4">DOMAIN MASTERY</h2>

            <div className="flex flex-col gap-4">
              {[
                { label: 'Data Structures & Algorithms', val: dsaMastery, color: 'bg-accent-blue' },
                { label: 'Backend Engineering', val: backendMastery, color: 'bg-accent-pink' },
                { label: 'Capstone Projects', val: projectsMastery, color: 'bg-accent-green' },
                { label: 'CS Core Fundamentals', val: coreCSMastery, color: 'bg-accent-purple' }
              ].map((item, idx) => (
                <div key={idx}>
                  <div className="flex justify-between text-xs font-bold uppercase mb-1">
                    <span>{item.label}</span>
                    <span>{item.val}%</span>
                  </div>
                  <div className="w-full h-3 border-2 border-ink bg-bg-light">
                    <div className={`h-full ${item.color}`} style={{ width: `${item.val}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Forecasting Projections */}
          <div className="brutal-card p-6 border-3 border-ink shadow-[6px_6px_0px_var(--ink)] bg-accent-yellow">
            <h3 className="brutal-title text-base font-black mb-3">AUTOPILOT FORECASTS</h3>
            <div className="flex flex-col gap-2 brutal-mono text-xs font-bold text-ink">
              <div>🏎️ VELOCITY: {projections.velocity} Problems/week solved</div>
              <div>🏁 WEEKS REMAINING: {projections.weeksRemaining} week(s) to completion</div>
              <div className="border-t border-ink/20 pt-2 text-sm uppercase brutal-title font-black mt-1">
                📅 TARGET GRADUATION: {projections.completionStr}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Contest logs */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          <div className="brutal-card p-6 border-3 border-ink shadow-[6px_6px_0px_var(--ink)] bg-bg-white relative">
            <div className="absolute top-0 right-0 w-8 h-8 bg-accent-purple border-l-3 border-b-3 border-ink"></div>

            <div className="flex justify-between items-center mb-4">
              <h2 className="brutal-title text-base font-black m-0">CP CONTESTS</h2>
              <button
                className="brutal-btn py-1 px-3 text-[10px] bg-accent-purple font-bold border-2"
                onClick={() => setShowAddContest(!showAddContest)}
              >
                {showAddContest ? 'CANCEL' : '+ LOG CONTEST'}
              </button>
            </div>

            {showAddContest && (
              <form onSubmit={handleLogContest} className="border-3 border-ink p-4 bg-bg-light mb-4 flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-extrabold uppercase">Contest Name</label>
                  <input type="text" value={cName} onChange={e => setCName(e.target.value)} required className="brutal-input text-xs p-2" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-extrabold uppercase">Platform</label>
                    <select value={cPlatform} onChange={e => setCPlatform(e.target.value)} className="brutal-select text-xs">
                      <option>LeetCode</option>
                      <option>Codeforces</option>
                      <option>CodeChef</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-extrabold uppercase">Rating Delta</label>
                    <input type="number" value={cRating} onChange={e => setCRating(e.target.value)} placeholder="+15" className="brutal-input text-xs p-2" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-extrabold uppercase">Problems Solved</label>
                    <input type="number" value={cSolved} onChange={e => setCSolved(e.target.value)} className="brutal-input text-xs p-2" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-extrabold uppercase">Global Rank</label>
                    <input type="number" value={cRank} onChange={e => setCRank(e.target.value)} placeholder="e.g. 240" className="brutal-input text-xs p-2" />
                  </div>
                </div>
                <button type="submit" className="w-full brutal-btn brutal-btn-primary py-2 text-xs font-black">
                  SAVE CONTEST REPORT
                </button>
              </form>
            )}

            {contestAttempts.length === 0 ? (
              <div className="text-center brutal-mono text-xs text-muted p-8 border-3 border-dashed border-ink bg-bg-light">
                No contest rounds logged. Benchmark your performance statistics here.
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {contestAttempts.map(att => {
                  const matchContest = contests.find(c => c.id === att.contestId);
                  return (
                    <div key={att.id} className="border-2 border-ink p-3 bg-bg-light flex justify-between items-center hover:translate-x-0.5 transition-all">
                      <div>
                        <h4 className="brutal-title text-xs font-black m-0">{matchContest?.name || 'Contest Round'}</h4>
                        <span className="brutal-mono text-[9px] text-muted block mt-0.5">{matchContest?.platform} · {matchContest?.date}</span>
                      </div>
                      <div className="text-right">
                        <span className="brutal-pill bg-bg-white border border-ink text-[10px] font-black">
                          {att.solvedCount}/{att.totalCount} SOLVED
                        </span>
                        {att.rating && <div className="text-[10px] font-bold text-accent-green mt-1">Delta: {att.rating}</div>}
                        {att.rank && <div className="text-[9px] brutal-mono text-muted">Rank: #{att.rank}</div>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
