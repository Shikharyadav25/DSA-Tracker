import React, { useState, useEffect } from 'react';
import { LearningTrack, Topic, Subtopic, Problem } from '../types/learningOS';
import { BookOpen, Server, Rocket, Brain, Cpu, FileText, ExternalLink, X, Settings } from 'lucide-react';

interface CurriculumProps {
  tracks: LearningTrack[];
  topics: Topic[];
  subtopics: Subtopic[];
  problems: Problem[];
  saveProblem: (problem: Problem) => Promise<void>;
  deleteProblem: (id: string) => Promise<void>;
}

export default function Curriculum({
  tracks,
  topics,
  subtopics,
  problems,
  saveProblem,
  deleteProblem
}: CurriculumProps) {
  const [activeTrack, setActiveTrack] = useState('dsa');
  const [activeTopic, setActiveTopic] = useState<string | null>(null);
  const [activeSubtopic, setActiveSubtopic] = useState<string | null>(null);

  // Forms state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newPlatform, setNewPlatform] = useState('LeetCode');
  const [newLink, setNewLink] = useState('');
  const [newDifficulty, setNewDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Easy');
  const [newPattern, setNewPattern] = useState('');
  const [newEstTime, setNewEstTime] = useState('20');

  const filteredTopics = topics.filter(t => t.trackId === activeTrack).sort((a, b) => a.order - b.order);

  // Set default topic when track shifts
  useEffect(() => {
    if (filteredTopics.length > 0) {
      setActiveTopic(filteredTopics[0].id);
    } else {
      setActiveTopic(null);
    }
  }, [activeTrack]);

  const filteredSubtopics = subtopics.filter(s => s.topicId === activeTopic).sort((a, b) => a.order - b.order);

  useEffect(() => {
    if (filteredSubtopics.length > 0) {
      setActiveSubtopic(filteredSubtopics[0].id);
    } else {
      setActiveSubtopic(null);
    }
  }, [activeTopic]);

  const currentSubtopic = subtopics.find(s => s.id === activeSubtopic);
  const subtopicProblems = problems.filter(p => p.subtopicId === activeSubtopic);

  // Mastered progress calculations
  const totalWeight = subtopicProblems.reduce((acc, p) => acc + (p.difficulty === 'Easy' ? 1 : p.difficulty === 'Medium' ? 2 : 3), 0);
  const solvedWeight = subtopicProblems.filter(p => p.status === 'Solved').reduce((acc, p) => acc + (p.difficulty === 'Easy' ? 1 : p.difficulty === 'Medium' ? 2 : 3), 0);
  const subtopicMastery = totalWeight > 0 ? Math.round((solvedWeight / totalWeight) * 100) : 0;

  const handleSubmitProblem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !activeSubtopic) return;

    const newProb: Problem = {
      id: 'p-' + Date.now().toString(36),
      subtopicId: activeSubtopic,
      title: newTitle.trim(),
      platform: newPlatform,
      link: newLink.trim(),
      difficulty: newDifficulty,
      pattern: newPattern.trim(),
      status: 'New',
      box: 1,
      ease: 2.5,
      interval: 0,
      nextReview: null,
      lastSolved: null,
      masteryScore: 0,
      estimatedTime: parseInt(newEstTime) || 20,
      frequency: 50,
      companyTags: []
    };

    await saveProblem(newProb);
    setNewTitle('');
    setNewLink('');
    setNewPattern('');
    setShowAddForm(false);
  };

  const getSubtopicStepClass = (step: 'lessons' | 'instructor' | 'practice' | 'checkpoint' | 'revision' | 'mastery') => {
    const solvedCount = subtopicProblems.filter(p => p.status === 'Solved').length;
    const totalCount = subtopicProblems.length;

    if (step === 'lessons') return 'completed';
    if (step === 'instructor') return totalCount > 0 ? 'completed' : 'pending';
    if (step === 'practice') return solvedCount > 0 ? 'completed' : 'pending';
    if (step === 'checkpoint') return solvedCount > 1 ? 'completed' : 'pending';
    if (step === 'revision') return subtopicProblems.some(p => p.box > 1) ? 'completed' : 'pending';
    if (step === 'mastery') return subtopicMastery >= 90 ? 'completed' : 'pending';
    return 'pending';
  };

  const getTrackIcon = (id: string) => {
    switch (id) {
      case 'dsa': return <BookOpen className="w-3.5 h-3.5 shrink-0" />;
      case 'backend': return <Server className="w-3.5 h-3.5 shrink-0" />;
      case 'projects': return <Rocket className="w-3.5 h-3.5 shrink-0" />;
      case 'aptitude': return <Brain className="w-3.5 h-3.5 shrink-0" />;
      case 'core_cs': return <Cpu className="w-3.5 h-3.5 shrink-0" />;
      case 'resume': return <FileText className="w-3.5 h-3.5 shrink-0" />;
      default: return <Settings className="w-3.5 h-3.5 shrink-0" />;
    }
  };

  return (
    <div className="flex flex-col gap-6 animate__animated animate__fadeIn">
      {/* 1. Horizontal Track selector buttons */}
      <div className="flex gap-3 overflow-x-auto pb-2 border-b-3 border-border">
        {tracks.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTrack(t.id)}
            className={`brutal-btn py-2 px-5 text-xs font-black uppercase flex items-center gap-2 ${
              activeTrack === t.id ? 'bg-accent-blue text-black' : 'bg-bg-surface text-black dark:text-white'
            }`}
          >
            {getTrackIcon(t.id)}
            <span>{t.name}</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Side Column: Topic Syllabus Lists */}
        <div className="md:col-span-4 flex flex-col gap-6">
          <div className="brutal-card p-5 border-3 border-border shadow-[6px_6px_0px_var(--shadow-color)] bg-bg-surface relative">
            <div className="absolute top-0 right-0 w-6 h-6 bg-accent-pink border-l-3 border-b-3 border-border"></div>
            <h3 className="brutal-title text-sm font-black mb-4 text-black dark:text-white">SYLLABUS TOPICS</h3>

            <div className="flex flex-col gap-2">
              {filteredTopics.map(topic => (
                <button
                  key={topic.id}
                  onClick={() => setActiveTopic(topic.id)}
                  className={`w-full text-left p-3 border-2 border-border brutal-title text-xs font-black transition-all cursor-pointer ${
                    activeTopic === topic.id 
                      ? 'topic-btn-selected shadow-[2px_2px_0px_var(--shadow-color)]' 
                      : 'topic-btn-unselected hover:translate-x-0.5'
                  }`}
                  style={{ color: '#000000' }}
                >
                  <span className="font-extrabold uppercase tracking-tight" style={{ color: '#000000' }}>{topic.name}</span>
                </button>
              ))}
            </div>
          </div>

          {activeTopic && filteredSubtopics.length > 1 && (
            <div className="brutal-card p-5 border-3 border-border shadow-[6px_6px_0px_var(--shadow-color)] bg-bg-surface relative">
              <div className="absolute top-0 right-0 w-6 h-6 bg-accent-blue border-l-3 border-b-3 border-border"></div>
              <h3 className="brutal-title text-sm font-black mb-4 text-black dark:text-white">PATTERN SUBTOPICS</h3>

              <div className="flex flex-col gap-2">
                {filteredSubtopics.map(sub => (
                  <button
                    key={sub.id}
                    onClick={() => setActiveSubtopic(sub.id)}
                    className={`w-full text-left p-2.5 border-2 border-border brutal-title text-xs font-black transition-all cursor-pointer ${
                      activeSubtopic === sub.id 
                        ? 'subtopic-btn-selected shadow-[2px_2px_0px_var(--shadow-color)]' 
                        : 'subtopic-btn-unselected hover:translate-x-0.5'
                    }`}
                    style={{ color: '#000000' }}
                  >
                    <span className="font-extrabold uppercase tracking-tight" style={{ color: '#000000' }}>{sub.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Active Syllabus content detail */}
        <div className="md:col-span-8">
          {currentSubtopic ? (
            <div className="brutal-card p-6 border-3 border-border shadow-[6px_6px_0px_var(--shadow-color)] bg-bg-surface relative">
              <div className="absolute top-0 right-0 w-8 h-8 bg-accent-green border-l-3 border-b-3 border-border"></div>

              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="brutal-title text-xl font-black m-0 leading-none text-text-primary">{currentSubtopic.name}</h2>
                  <span className="brutal-mono text-xs text-text-secondary block mt-2">
                    Subtopic score: {subtopicMastery}% | Logged questions: {subtopicProblems.length}
                  </span>
                </div>
                <button
                  className="brutal-btn py-2 px-4 text-xs bg-accent-green text-text-primary font-extrabold border-2 border-border shadow-[3px_3px_0px_var(--shadow-color)] hover:translate-x-[2px] hover:translate-y-[2px]"
                  onClick={() => {
                    if (!showAddForm && !newPattern) {
                      setNewPattern(currentSubtopic.name);
                    }
                    setShowAddForm(!showAddForm);
                  }}
                >
                  {showAddForm ? '✕ CANCEL' : '+ ADD QUESTION MANUALLY'}
                </button>
              </div>

              {/* Progress Tracker Horizontal bar */}
              <div className="grid grid-cols-6 border-3 border-border bg-bg-surface-alt p-3 mb-6 divide-x-2 divide-border text-center">
                {['lessons', 'instructor', 'practice', 'checkpoint', 'revision', 'mastery'].map(step => {
                  const done = getSubtopicStepClass(step as any) === 'completed';
                  return (
                    <div key={step} className="flex flex-col items-center justify-center">
                      <div className={`w-3.5 h-3.5 border-2 border-border rounded-full ${done ? 'bg-status-success' : 'bg-bg-surface'}`} />
                      <span className="brutal-mono text-[9px] uppercase font-bold mt-1 leading-none text-text-primary">{step}</span>
                    </div>
                  );
                })}
              </div>

              {/* Lesson details */}
              {currentSubtopic.lessonContent && (
                <div className="border-3 border-border bg-bg-surface-alt p-4 brutal-mono text-xs leading-relaxed mb-6 text-text-primary">
                  <span className="bg-text-primary text-bg-surface px-2 py-0.5 brutal-title text-[9px] font-black uppercase mr-2">
                    LESSON TEXT
                  </span>
                  {currentSubtopic.lessonContent}
                </div>
              )}

              {/* Add form */}
              {showAddForm && (
                <form onSubmit={handleSubmitProblem} className="border-3 border-border p-5 bg-bg-surface-alt mb-6 flex flex-col gap-4 shadow-[4px_4px_0px_var(--shadow-color)]">
                  <div className="flex justify-between items-center border-b-2 border-border pb-2">
                    <h4 className="brutal-title text-sm font-black m-0 text-text-primary">➕ Add Question to {currentSubtopic.name}</h4>
                    <span className="brutal-mono text-[10px] uppercase font-bold text-accent-primary">Manual Entry</span>
                  </div>
                  
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-extrabold uppercase text-text-primary">Question Title *</label>
                    <input type="text" value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="e.g. 3Sum / Subarray Sum Equals K" className="brutal-input text-xs" required />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-extrabold uppercase text-text-primary">Platform</label>
                      <select value={newPlatform} onChange={e => setNewPlatform(e.target.value)} className="brutal-select text-xs">
                        <option>LeetCode</option>
                        <option>Codeforces</option>
                        <option>CodeChef</option>
                        <option>GFG</option>
                        <option>InterviewBit</option>
                        <option>Custom</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-extrabold uppercase text-text-primary">Difficulty</label>
                      <select value={newDifficulty} onChange={e => setNewDifficulty(e.target.value as any)} className="brutal-select text-xs">
                        <option>Easy</option>
                        <option>Medium</option>
                        <option>Hard</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-extrabold uppercase text-text-primary">Est Time (mins)</label>
                      <input type="number" min="5" value={newEstTime} onChange={e => setNewEstTime(e.target.value)} className="brutal-input text-xs" required />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-extrabold uppercase text-text-primary">Pattern Tag</label>
                      <input type="text" value={newPattern} onChange={e => setNewPattern(e.target.value)} placeholder="e.g. Pattern: Two Pointers" className="brutal-input text-xs" />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-extrabold uppercase text-text-primary">Problem URL / Link</label>
                    <input type="url" value={newLink} onChange={e => setNewLink(e.target.value)} placeholder="https://leetcode.com/problems/..." className="brutal-input text-xs" />
                  </div>

                  <button type="submit" className="brutal-btn brutal-btn-primary py-3 text-xs font-black uppercase">
                    💾 Save Question to Syllabus
                  </button>
                </form>
              )}

              {/* Problems Stack list */}
              {subtopicProblems.length === 0 ? (
                <div className="text-center brutal-mono text-xs text-text-secondary p-10 border-3 border-dashed border-border bg-bg-surface-alt flex flex-col items-center gap-3">
                  <span>No active problems logged under this section yet.</span>
                  <button
                    type="button"
                    className="brutal-btn py-2 px-5 text-xs bg-accent-green text-text-primary font-black border-2 border-border shadow-[2px_2px_0px_var(--shadow-color)]"
                    onClick={() => {
                      if (!newPattern) setNewPattern(currentSubtopic.name);
                      setShowAddForm(true);
                    }}
                  >
                    + ADD QUESTION MANUALLY
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {subtopicProblems.map(p => (
                    <div key={p.id} className="border-3 border-border p-4 bg-bg-surface flex justify-between items-center transition-all duration-75 hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_var(--shadow-color)]">
                      <div>
                        <h4 className="brutal-title text-sm font-black m-0 leading-tight text-text-primary">{p.title}</h4>
                        <span className="brutal-mono text-[10px] text-text-secondary block mt-1">
                          {p.platform} · {p.pattern || 'No pattern tagged'} · {p.estimatedTime} mins est.
                        </span>
                      </div>
                      <div className="flex gap-2 items-center">
                        <span className={`brutal-pill text-[9px] font-black text-text-primary ${
                          p.difficulty === 'Easy' ? 'bg-accent-green' : p.difficulty === 'Medium' ? 'bg-accent-blue' : 'bg-accent-pink'
                        }`}>
                          {p.difficulty}
                        </span>
                        <span className="brutal-pill bg-bg-surface-alt border-border text-[9px] font-black text-text-primary">
                          {p.status}
                        </span>
                        {p.link && (
                          <a href={p.link} target="_blank" rel="noopener noreferrer" className="brutal-btn py-1 px-3 text-[10px] border-2 border-border text-text-primary flex items-center gap-1">
                            <span>SOLVE</span>
                            <ExternalLink className="w-3 h-3 shrink-0" />
                          </a>
                        )}
                        <button onClick={() => deleteProblem(p.id)} className="text-status-danger hover:text-accent-red font-bold text-sm cursor-pointer ml-1 p-1">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center brutal-mono text-xs text-text-secondary p-12 border-3 border-dashed border-border bg-bg-surface brutal-card">
              Select track topics on the left to see course roadmaps.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
