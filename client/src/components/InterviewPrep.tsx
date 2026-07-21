import React from 'react';
import { InterviewTrack, DailyTask } from '../types/learningOS';

interface InterviewPrepProps {
  interviewTracks: InterviewTrack[];
  dailyTasks: DailyTask[];
  handleTaskAction: (taskId: string, action: 'completed' | 'skipped') => Promise<void>;
}

export default function InterviewPrep({
  interviewTracks,
  dailyTasks,
  handleTaskAction
}: InterviewPrepProps) {
  const interviewTasks = dailyTasks.filter(t => t.type === 'core_cs' || t.type === 'aptitude' || t.type === 'resume');

  const deckData: Record<string, string[]> = {
    'int-quant': ['Probability Formulas', 'Permutations & Combinations shortcuts', 'Profit & Loss calculation sheets'],
    'int-os': ['Process Scheduling (FCFS, SJF, Round Robin)', 'Paging vs Segmentation algorithms', 'Deadlock Detection & Recovery methods'],
    'int-system': ['Load Balancing algorithms', 'Database Sharding partitions', 'Caching policies (LRU, LFU)']
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate__animated animate__fadeIn">
      {/* Left Column: Weekly Interview Tasks Checklist */}
      <div className="lg:col-span-6 flex flex-col gap-6">
        <div className="brutal-card p-6 border-3 border-ink shadow-[6px_6px_0px_var(--ink)] bg-bg-white relative">
          <div className="absolute top-0 right-0 w-8 h-8 bg-accent-blue border-l-3 border-b-3 border-ink"></div>
          <h2 className="brutal-title text-lg font-black mb-1">WEEKLY INTERVIEW TARGETS</h2>
          <p className="brutal-mono text-xs text-muted mb-6">
            Coordinator scheduled tasks to reinforce core SDE fundamentals.
          </p>

          {interviewTasks.length === 0 ? (
            <div className="text-center brutal-mono text-xs text-muted p-8 border-3 border-dashed border-ink bg-bg-light">
              No interview prep tasks scheduled this week. Turn on Core CS or Aptitude tracks in Settings.
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {interviewTasks.map(t => {
                const isDone = t.status === 'completed';
                const isSkipped = t.status === 'skipped';

                return (
                  <div
                    key={t.id}
                    className="border-2 border-ink p-3 flex justify-between items-center transition-all"
                    style={{
                      opacity: isDone || isSkipped ? 0.6 : 1,
                      background: isDone ? 'rgba(111,207,126,0.1)' : isSkipped ? 'rgba(242,109,109,0.1)' : 'var(--bg-white)'
                    }}
                  >
                    <div>
                      <span className="brutal-mono text-[9px] uppercase tracking-widest bg-ink text-bg-white px-2 py-0.5 font-bold mr-2">
                        {t.type}
                      </span>
                      <span className={`text-xs font-bold ${isDone ? 'line-through' : ''}`}>
                        {t.title}
                      </span>
                    </div>

                    {t.status === 'pending' ? (
                      <div className="flex gap-2">
                        <button
                          className="brutal-btn py-1 px-2.5 text-[9px] bg-status-success font-black border-2"
                          onClick={() => handleTaskAction(t.id, 'completed')}
                        >
                          Done
                        </button>
                        <button
                          className="brutal-btn py-1 px-2.5 text-[9px] bg-status-danger font-black border-2"
                          onClick={() => handleTaskAction(t.id, 'skipped')}
                        >
                          Skip
                        </button>
                      </div>
                    ) : (
                      <span className="brutal-mono text-[9px] font-black uppercase">
                        {isDone ? 'COMPLETED ✓' : 'SKIPPED ✕'}
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
        <div className="brutal-card p-6 border-3 border-ink shadow-[6px_6px_0px_var(--ink)] bg-bg-white relative">
          <div className="absolute top-0 right-0 w-8 h-8 bg-accent-purple border-l-3 border-b-3 border-ink"></div>
          <h2 className="brutal-title text-lg font-black mb-1">INTERVIEW DECKS</h2>
          <p className="brutal-mono text-xs text-muted mb-6">
            Review questions mapped to target systems coding rounds.
          </p>

          <div className="flex flex-col gap-4">
            {interviewTracks.map(track => {
              const subDecks = deckData[track.id] || ['Core concepts flashcards', 'Standard QA checklists'];
              return (
                <div key={track.id} className="border-3 border-ink p-4 bg-bg-light relative hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_var(--ink)] transition-all">
                  <h3 className="brutal-title text-sm font-black m-0">{track.name}</h3>
                  <p className="brutal-mono text-[10px] text-muted mt-1 mb-3">{track.description}</p>
                  
                  <div className="flex flex-col gap-1.5 border-t border-ink/20 pt-3">
                    {subDecks.map((item, idx) => (
                      <div key={idx} className="text-xs font-bold leading-normal text-ink">
                        • {item}
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
  );
}
