import React, { useState } from 'react';
import { Skill, SkillTrack } from '../types/learningOS';

interface SkillsProps {
  skills: Skill[];
  skillTracks: SkillTrack[];
  saveSkill: (skill: Skill) => Promise<void>;
  updateSkillStatus: (skillId: string, status: 'Not Started' | 'In Progress' | 'Completed') => Promise<void>;
}

export default function Skills({
  skills,
  skillTracks,
  saveSkill,
  updateSkillStatus
}: SkillsProps) {
  const [activeTrackId, setActiveTrackId] = useState<string>(skillTracks[0]?.id || 'backend_core');
  const [selectedSkillId, setSelectedSkillId] = useState<string | null>(null);

  // Form state
  const [showAddSkill, setShowAddSkill] = useState(false);
  const [sName, setSName] = useState('');
  const [sDesc, setSDesc] = useState('');
  const [sEstHours, setSEstHours] = useState('10');
  const [sResources, setSResources] = useState('');

  const currentTrack = skillTracks.find(t => t.id === activeTrackId);
  const trackSkills = skills.filter(s => s.trackId === activeTrackId);
  const activeSkill = skills.find(s => s.id === selectedSkillId) || trackSkills[0] || null;

  const handleCreateSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sName.trim()) return;

    const newSkill: Skill = {
      id: 'sk-' + Date.now().toString(36),
      trackId: activeTrackId,
      name: sName.trim(),
      description: sDesc.trim(),
      status: 'Not Started',
      estimatedHours: parseInt(sEstHours) || 10,
      completedHours: 0,
      objectives: ['Complete hands-on implementation project', 'Document key architectural tradeoffs'],
      resources: sResources.split(',').map(r => r.trim()).filter(Boolean)
    };

    await saveSkill(newSkill);
    setSName('');
    setSDesc('');
    setSResources('');
    setShowAddSkill(false);
  };

  return (
    <div className="flex flex-col gap-6 animate__animated animate__fadeIn">
      {/* 1. Skill Track Selector */}
      <div className="flex gap-3 overflow-x-auto pb-2 border-b-3 border-border">
        {skillTracks.map(st => (
          <button
            key={st.id}
            onClick={() => {
              setActiveTrackId(st.id);
              setSelectedSkillId(null);
            }}
            className={`brutal-btn py-2 px-5 text-xs font-black uppercase ${
              activeTrackId === st.id ? 'bg-accent-blue text-text-primary' : 'bg-bg-surface text-text-primary'
            }`}
          >
            {st.icon || '⚙️'} {st.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Column: Track Skills List */}
        <div className="md:col-span-4 flex flex-col gap-6">
          <div className="brutal-card p-5 border-3 border-border shadow-[6px_6px_0px_var(--shadow-color)] bg-bg-surface relative">
            <div className="absolute top-0 right-0 w-6 h-6 bg-accent-pink border-l-3 border-b-3 border-border"></div>
            
            <div className="flex justify-between items-center mb-4">
              <h3 className="brutal-title text-sm font-black m-0 text-text-primary">MODULES</h3>
              <button
                className="brutal-btn py-1 px-3 text-[10px] bg-accent-pink text-text-primary font-bold border-2 border-border"
                onClick={() => setShowAddSkill(!showAddSkill)}
              >
                {showAddSkill ? 'CANCEL' : '+ ADD SKILL'}
              </button>
            </div>

            {/* Add Skill Form */}
            {showAddSkill && (
              <form onSubmit={handleCreateSkill} className="border-3 border-border p-4 bg-bg-surface-alt mb-4 flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-extrabold uppercase text-text-primary">Skill Name</label>
                  <input type="text" value={sName} onChange={e => setSName(e.target.value)} placeholder="e.g. Redis Caching Patterns" className="brutal-input text-xs" required />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-extrabold uppercase text-text-primary">Description</label>
                  <input type="text" value={sDesc} onChange={e => setSDesc(e.target.value)} placeholder="e.g. Cache invalidation, pub/sub" className="brutal-input text-xs" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-extrabold uppercase text-text-primary">Est Hours</label>
                  <input type="number" min="1" value={sEstHours} onChange={e => setSEstHours(e.target.value)} className="brutal-input text-xs" required />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-extrabold uppercase text-text-primary">Resources (comma separated)</label>
                  <input type="text" value={sResources} onChange={e => setSResources(e.target.value)} placeholder="Redis Docs, YouTube tutorial" className="brutal-input text-xs" />
                </div>
                <button type="submit" className="brutal-btn brutal-btn-primary py-2 text-xs font-black">
                  SAVE SKILL
                </button>
              </form>
            )}

            <div className="flex flex-col gap-2">
              {trackSkills.map(sk => (
                <button
                  key={sk.id}
                  onClick={() => setSelectedSkillId(sk.id)}
                  className={`w-full text-left p-3 border-2 border-border brutal-title text-xs font-black transition-all cursor-pointer ${
                    selectedSkillId === sk.id ? 'bg-accent-pink text-text-primary' : 'bg-bg-surface text-text-primary hover:translate-x-0.5'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span>{sk.name}</span>
                    <span className="brutal-mono text-[9px] text-text-secondary">{sk.status}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Skill Syllabus Details */}
        <div className="md:col-span-8">
          {activeSkill ? (
            <div className="brutal-card p-6 border-3 border-border shadow-[6px_6px_0px_var(--shadow-color)] bg-bg-surface relative">
              <div className="absolute top-0 right-0 w-8 h-8 bg-accent-blue border-l-3 border-b-3 border-border"></div>

              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="brutal-title text-xl font-black m-0 leading-none text-text-primary">{activeSkill.name}</h2>
                  <span className="brutal-mono text-xs text-text-secondary block mt-2">
                    Status: {activeSkill.status}
                  </span>
                </div>
                
                <div className="flex gap-2">
                  {(['Not Started', 'In Progress', 'Completed'] as const).map(st => (
                    <button
                      key={st}
                      onClick={() => updateSkillStatus(activeSkill.id, st)}
                      className={`brutal-btn py-1 px-3 text-[10px] border-2 border-border font-bold ${
                        activeSkill.status === st ? 'bg-accent-green text-text-primary' : 'bg-bg-surface text-text-primary'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {activeSkill.description && (
                <p className="brutal-mono text-xs text-text-secondary mb-6 border-l-3 border-border pl-3 py-1">
                  {activeSkill.description}
                </p>
              )}

              {/* Objectives List */}
              <div className="mb-6">
                <h4 className="brutal-title text-xs font-black uppercase mb-3 text-text-primary">CORE OBJECTIVES</h4>
                <div className="flex flex-col gap-2">
                  {activeSkill.objectives.map((obj, idx) => (
                    <div key={idx} className="border-2 border-border p-3 bg-bg-surface-alt brutal-mono text-xs flex items-center gap-2 text-text-primary">
                      <span className="text-status-success font-black">✓</span>
                      {obj}
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommended Resources */}
              {activeSkill.resources.length > 0 && (
                <div>
                  <h4 className="brutal-title text-xs font-black uppercase mb-3 text-text-primary">CURATED RESOURCES</h4>
                  <div className="flex flex-wrap gap-2">
                    {activeSkill.resources.map((res, idx) => (
                      <span key={idx} className="brutal-pill bg-bg-surface-alt border-border text-xs text-text-primary">
                        🔗 {res}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center brutal-mono text-xs text-text-secondary p-12 border-3 border-dashed border-border bg-bg-surface brutal-card">
              Select a skill module on the left.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
