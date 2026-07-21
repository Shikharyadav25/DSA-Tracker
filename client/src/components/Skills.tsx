import React, { useState, useEffect } from 'react';
import { SkillTrack, Skill } from '../types/learningOS';

interface SkillsProps {
  skillTracks: SkillTrack[];
  skills: Skill[];
  saveSkill: (skill: Skill) => Promise<void>;
}

export default function Skills({
  skillTracks,
  skills,
  saveSkill
}: SkillsProps) {
  const [activeTrackId, setActiveTrackId] = useState('skt-backend');
  const [selectedSkillId, setSelectedSkillId] = useState<string | null>(null);

  // New Skill form state
  const [showAddSkill, setShowAddSkill] = useState(false);
  const [newSkillName, setNewSkillName] = useState('');
  const [newLessons, setNewLessons] = useState('');
  const [newResources, setNewResources] = useState('');

  const currentTrack = skillTracks.find(st => st.id === activeTrackId);
  const trackSkills = skills.filter(s => s.trackId === activeTrackId);

  useEffect(() => {
    if (trackSkills.length > 0) {
      setSelectedSkillId(trackSkills[0].id);
    } else {
      setSelectedSkillId(null);
    }
    setShowAddSkill(false);
  }, [activeTrackId]);

  const activeSkill = skills.find(s => s.id === selectedSkillId);

  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;

    const s: Skill = {
      id: 'sk-' + Date.now().toString(36),
      trackId: activeTrackId,
      name: newSkillName.trim(),
      status: 'Not Started',
      masteryLevel: 0,
      lessons: newLessons.split(',').map(l => l.trim()).filter(l => l !== ''),
      resources: newResources.split(',').map(r => r.trim()).filter(r => r !== '')
    };

    await saveSkill(s);
    setNewSkillName('');
    setNewLessons('');
    setNewResources('');
    setShowAddSkill(false);
    setSelectedSkillId(s.id);
  };

  const handleMasteryChange = async (sk: Skill, val: number) => {
    const status = val === 100 ? 'Mastered' : val > 0 ? 'In Progress' : 'Not Started';
    await saveSkill({
      ...sk,
      masteryLevel: val,
      status
    });
  };

  return (
    <div className="flex flex-col gap-6 animate__animated animate__fadeIn">
      {/* 1. Track buttons */}
      <div className="flex gap-3 overflow-x-auto pb-2 border-b-3 border-ink">
        {skillTracks.map(st => (
          <button
            key={st.id}
            onClick={() => setActiveTrackId(st.id)}
            className={`brutal-btn py-2 px-5 text-xs font-black uppercase ${
              activeTrackId === st.id ? 'bg-accent-blue text-ink' : 'bg-bg-white text-ink'
            }`}
          >
            ⚙️ {st.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Side: Skills list */}
        <div className="md:col-span-4 flex flex-col gap-6">
          <div className="brutal-card p-5 border-3 border-ink shadow-[6px_6px_0px_var(--ink)] bg-bg-white relative">
            <div className="absolute top-0 right-0 w-6 h-6 bg-accent-pink border-l-3 border-b-3 border-ink"></div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="brutal-title text-sm font-black m-0">SKILLS LIST</h3>
              <button
                className="brutal-btn py-1 px-3 text-[10px] bg-accent-pink font-bold border-2"
                onClick={() => setShowAddSkill(!showAddSkill)}
              >
                {showAddSkill ? 'CANCEL' : '+ ADD'}
              </button>
            </div>

            {showAddSkill && (
              <form onSubmit={handleAddSkill} className="border-3 border-ink p-4 bg-bg-light mb-4 flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-extrabold uppercase">Skill Name</label>
                  <input
                    type="text"
                    value={newSkillName}
                    onChange={e => setNewSkillName(e.target.value)}
                    placeholder="e.g. JWT Auth"
                    className="brutal-input text-xs p-2"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-extrabold uppercase">Lessons (comma-separated)</label>
                  <input
                    type="text"
                    value={newLessons}
                    onChange={e => setNewLessons(e.target.value)}
                    placeholder="e.g. hashing, secret key"
                    className="brutal-input text-xs p-2"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-extrabold uppercase">Resources (comma-separated)</label>
                  <input
                    type="text"
                    value={newResources}
                    onChange={e => setNewResources(e.target.value)}
                    placeholder="e.g. auth0.com articles"
                    className="brutal-input text-xs p-2"
                  />
                </div>
                <button type="submit" className="w-full brutal-btn brutal-btn-primary py-2 text-xs font-black">
                  SAVE SKILL
                </button>
              </form>
            )}

            <div className="flex flex-col gap-2">
              {trackSkills.map(sk => (
                <button
                  key={sk.id}
                  onClick={() => setSelectedSkillId(sk.id)}
                  className={`w-full text-left p-3 border-2 border-ink brutal-title text-xs font-black transition-all cursor-pointer flex justify-between items-center ${
                    selectedSkillId === sk.id ? 'bg-accent-pink text-ink' : 'bg-bg-white text-ink hover:translate-x-0.5'
                  }`}
                >
                  <span>{sk.name}</span>
                  <span className="brutal-mono text-[10px] font-bold bg-bg-light px-2 py-0.5 border border-ink">
                    {sk.masteryLevel}%
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Skill Syllabus Details */}
        <div className="md:col-span-8">
          {activeSkill ? (
            <div className="brutal-card p-6 border-3 border-ink shadow-[6px_6px_0px_var(--ink)] bg-bg-white relative">
              <div className="absolute top-0 right-0 w-8 h-8 bg-accent-yellow border-l-3 border-b-3 border-ink"></div>

              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="brutal-title text-xl font-black m-0 leading-none">{activeSkill.name}</h2>
                  <span className="brutal-mono text-xs text-muted block mt-2">
                    Status: {activeSkill.status}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <label className="brutal-title text-xs font-bold uppercase m-0">Mastery:</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="10"
                    value={activeSkill.masteryLevel}
                    onChange={e => handleMasteryChange(activeSkill, parseInt(e.target.value))}
                    className="w-24 h-4 cursor-pointer"
                  />
                  <span className="brutal-mono text-xs font-black border border-ink bg-bg-light px-2 py-0.5">
                    {activeSkill.masteryLevel}%
                  </span>
                </div>
              </div>

              {/* Lessons details */}
              {activeSkill.lessons && activeSkill.lessons.length > 0 && (
                <div className="mb-6">
                  <h4 className="brutal-title text-sm font-black mb-3">LESSON OBJECTIVES</h4>
                  <ul className="list-disc pl-5 m-0 text-xs font-bold leading-relaxed flex flex-col gap-2">
                    {activeSkill.lessons.map((lesson, idx) => (
                      <li key={idx} className="text-ink">{lesson}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Resources */}
              {activeSkill.resources && activeSkill.resources.length > 0 && (
                <div className="border-t-3 border-ink pt-6 mb-6">
                  <h4 className="brutal-title text-sm font-black mb-3">LEARNING RESOURCES</h4>
                  <div className="flex gap-2 flex-wrap">
                    {activeSkill.resources.map((res, idx) => (
                      <span key={idx} className="brutal-pill bg-bg-light border-2 border-ink text-ink font-bold text-xs">
                        📖 {res}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Mini quiz / assessments */}
              <div className="border-t-3 border-ink pt-6">
                <h4 className="brutal-title text-sm font-black mb-3">SDE SKILL ASSESSMENTS</h4>
                <div className="border-3 border-dashed border-ink p-4 bg-bg-light text-center">
                  <p className="brutal-mono text-xs font-bold text-ink mb-4">
                    Verify technical checkpoints to automatically mark this stack skill as mastered.
                  </p>
                  <button
                    className="brutal-btn brutal-btn-primary py-2 px-6 text-xs font-black"
                    onClick={() => handleMasteryChange(activeSkill, 100)}
                  >
                    ⚡ INITIATE ASSESSMENT
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center brutal-mono text-xs text-muted p-12 border-3 border-dashed border-ink bg-bg-white brutal-card">
              Select skill units on the left to see curriculum objectives.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
