import React from 'react';
import { DailyTask } from '../types/learningOS';
import { Check, X, Brain } from 'lucide-react';

interface InterviewPrepProps {
  dailyTasks: DailyTask[];
  handleTaskAction: (taskId: string, action: 'completed' | 'skipped') => Promise<void>;
}

export default function InterviewPrep({ dailyTasks, handleTaskAction }: InterviewPrepProps) {
  const interviewTasks = dailyTasks.filter(t => t.type === 'interview');

  const interviewTracks = [
    { id: 'dsa_core', name: 'DSA & Coding Patterns', desc: 'Sliding window, Graphs, DP, Two Pointers' },
    { id: 'system_design', name: 'System Design Fundamentals', desc: 'Caching, Load Balancers, Sharding, Consistency' },
    { id: 'behavioral', name: 'Behavioral & STAR Method', desc: 'Conflict resolution, Leadership, Tradeoffs' },
    { id: 'cs_fundamentals', name: 'CS Core (OS, DBMS, CN)', desc: 'Processes vs Threads, Indexing, TCP/IP handshake' }
  ];

  const deckData: Record<string, string[]> = {
    dsa_core: ['Top 50 LeetCode Mediums', 'Graph Traversal Patterns', 'Dynamic Programming Grids'],
    system_design: ['URL Shortener Architecture', 'Distributed Rate Limiter', 'Chat Application Storage'],
    behavioral: ['Conflict with Tech Lead', 'Tight Deadline Tradeoff', 'Failure & Retrospective'],
    cs_fundamentals: ['Process Scheduling Algorithms', 'B+ Tree Indexing vs Hash', 'OS Memory Paging']
  };

  return (
    <div className="flex flex-col gap-6 animate__animated animate__fadeIn">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Scheduled Interview Targets */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          <div className="brutal-card p-6 border-3 border-border shadow-[6px_6px_0px_var(--shadow-color)] bg-bg-surface relative">
            <div className="absolute top-0 right-0 w-8 h-8 bg-accent-blue border-l-3 border-b-3 border-border"></div>
            <h2 className="brutal-title text-lg font-black mb-1 text-text-primary">WEEKLY INTERVIEW TARGETS</h2>
            <p className="brutal-mono text-xs text-text-secondary mb-6">
              Assigned checklist for interview preparedness this sprint.
            </p>

            {interviewTasks.length === 0 ? (
              <div className="text-center brutal-mono text-xs text-text-secondary p-8 border-3 border-dashed border-border bg-bg-surface-alt">
                No interview preparation tasks scheduled for today.
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {interviewTasks.map(t => {
                  const isDone = t.status === 'completed';
                  return (
                    <div
                      key={t.id}
                      className="border-2 border-border p-3 bg-bg-surface flex justify-between items-center text-text-primary"
                    >
                      <div className="flex items-center gap-3">
                        <span className="brutal-mono text-[9px] uppercase font-bold bg-accent-purple text-text-primary px-2 py-0.5 border border-border">
                          {t.type}
                        </span>
                        <span className={`text-xs font-bold ${isDone ? 'line-through' : ''}`}>
                          {t.title}
                        </span>
                      </div>

                      {t.status === 'pending' ? (
                        <div className="flex gap-2">
                          <button
                            className="brutal-btn py-1 px-2.5 text-[9px] bg-status-success text-text-primary font-black border-2 border-border"
                            onClick={() => handleTaskAction(t.id, 'completed')}
                          >
                            Done
                          </button>
                          <button
                            className="brutal-btn py-1 px-2.5 text-[9px] bg-status-danger text-text-primary font-black border-2 border-border"
                            onClick={() => handleTaskAction(t.id, 'skipped')}
                          >
                            Skip
                          </button>
                        </div>
                      ) : (
                        <span className="brutal-mono text-[9px] font-black uppercase text-text-primary flex items-center gap-1">
                          {isDone ? <>COMPLETED <Check className="w-3.5 h-3.5 text-accent-green" /></> : <>SKIPPED <X className="w-3.5 h-3.5 text-accent-red" /></>}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Flashcard decks */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          <div className="brutal-card p-6 border-3 border-border shadow-[6px_6px_0px_var(--shadow-color)] bg-bg-surface relative">
            <div className="absolute top-0 right-0 w-8 h-8 bg-accent-purple border-l-3 border-b-3 border-border"></div>
            <h2 className="brutal-title text-lg font-black mb-1 text-text-primary">INTERVIEW DECKS</h2>
            <p className="brutal-mono text-xs text-text-secondary mb-6">
              Review questions mapped to target systems coding rounds.
            </p>

            <div className="flex flex-col gap-4">
              {interviewTracks.map(track => {
                const subDecks = deckData[track.id] || ['Core concepts flashcards', 'Standard QA checklists'];
                return (
                  <div key={track.id} className="border-2 border-border p-4 bg-bg-surface-alt">
                    <h3 className="brutal-title text-xs font-black uppercase mb-1 text-text-primary">{track.name}</h3>
                    <p className="brutal-mono text-[10px] text-text-secondary mb-3">{track.desc}</p>

                    <div className="flex flex-wrap gap-2">
                      {subDecks.map((deck, idx) => (
                        <div key={idx} className="brutal-pill bg-bg-surface border-border text-[10px] font-bold text-text-primary flex items-center gap-1.5">
                          <Brain className="w-3 h-3 text-accent-primary shrink-0" />
                          <span>{deck}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
