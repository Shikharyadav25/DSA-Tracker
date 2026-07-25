import React, { useState } from 'react';
import { Project, ProjectMilestone } from '../types/learningOS';

interface ProjectsProps {
  projects: Project[];
  saveProject: (project: Project) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
}

export default function Projects({ projects, saveProject, deleteProject }: ProjectsProps) {
  const [selectedProjId, setSelectedProjId] = useState<string | null>(projects[0]?.id || null);

  // Forms state
  const [showAddProject, setShowAddProject] = useState(false);
  const [pName, setPName] = useState('');
  const [pDesc, setPDesc] = useState('');
  const [pPriority, setPPriority] = useState<'High' | 'Medium' | 'Low'>('High');
  const [pCommitment, setPCommitment] = useState('5');
  const [pGithub, setPGithub] = useState('');
  const [pDemo, setPDemo] = useState('');

  const [showAddMilestone, setShowAddMilestone] = useState(false);
  const [mTitle, setMTitle] = useState('');
  const [mTargetWeek, setMTargetWeek] = useState('Week 1');

  const activeProj = projects.find(p => p.id === selectedProjId) || projects[0] || null;

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pName.trim()) return;

    const newProj: Project = {
      id: 'proj-' + Date.now().toString(36),
      name: pName.trim(),
      description: pDesc.trim(),
      status: 'In Progress',
      priority: pPriority,
      weekCommitment: parseInt(pCommitment) || 5,
      completionPercentage: 0,
      milestones: [
        { id: 'm-1', title: 'System Architecture & Database Schema Design', completed: false, targetWeek: 'Week 1' },
        { id: 'm-2', title: 'Core REST/GraphQL API implementation', completed: false, targetWeek: 'Week 2' }
      ],
      techStack: ['TypeScript', 'Node.js', 'PostgreSQL'],
      githubUrl: pGithub.trim() || undefined,
      demoUrl: pDemo.trim() || undefined
    };

    await saveProject(newProj);
    setPName('');
    setPDesc('');
    setPGithub('');
    setPDemo('');
    setShowAddProject(false);
    setSelectedProjId(newProj.id);
  };

  const handleAddMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProj || !mTitle.trim()) return;

    const newMs: ProjectMilestone = {
      id: 'm-' + Date.now().toString(36),
      title: mTitle.trim(),
      completed: false,
      targetWeek: mTargetWeek
    };

    const updatedMilestones = [...activeProj.milestones, newMs];
    const completedCount = updatedMilestones.filter(m => m.completed).length;
    const newPerc = Math.round((completedCount / updatedMilestones.length) * 100);

    const updatedProj: Project = {
      ...activeProj,
      milestones: updatedMilestones,
      completionPercentage: newPerc
    };

    await saveProject(updatedProj);
    setMTitle('');
    setShowAddMilestone(false);
  };

  const toggleMilestone = async (msId: string) => {
    if (!activeProj) return;

    const updatedMilestones = activeProj.milestones.map(m => {
      if (m.id === msId) return { ...m, completed: !m.completed };
      return m;
    });

    const completedCount = updatedMilestones.filter(m => m.completed).length;
    const newPerc = updatedMilestones.length > 0 ? Math.round((completedCount / updatedMilestones.length) * 100) : 0;

    const updatedProj: Project = {
      ...activeProj,
      milestones: updatedMilestones,
      completionPercentage: newPerc,
      status: newPerc === 100 ? 'Completed' : 'In Progress'
    };

    await saveProject(updatedProj);
  };

  return (
    <div className="flex flex-col gap-6 animate__animated animate__fadeIn">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left column: Projects list */}
        <div className="md:col-span-4 flex flex-col gap-6">
          <div className="brutal-card p-5 border-3 border-border shadow-[6px_6px_0px_var(--shadow-color)] bg-bg-surface relative">
            <div className="absolute top-0 right-0 w-6 h-6 bg-accent-pink border-l-3 border-b-3 border-border"></div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="brutal-title text-sm font-black m-0 text-text-primary">ACTIVE PROJECTS</h3>
              <button
                className="brutal-btn py-1 px-3 text-[10px] bg-accent-pink text-text-primary font-bold border-2 border-border"
                onClick={() => setShowAddProject(!showAddProject)}
              >
                {showAddProject ? 'CANCEL' : '+ ADD'}
              </button>
            </div>

            {showAddProject && (
              <form onSubmit={handleAddProject} className="border-3 border-border p-4 bg-bg-surface-alt mb-4 flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-extrabold uppercase text-text-primary">Project Name</label>
                  <input type="text" value={pName} onChange={e => setPName(e.target.value)} required className="brutal-input text-xs p-2" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-extrabold uppercase text-text-primary">Description</label>
                  <input type="text" value={pDesc} onChange={e => setPDesc(e.target.value)} className="brutal-input text-xs p-2" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-extrabold uppercase text-text-primary">Priority</label>
                    <select value={pPriority} onChange={e => setPPriority(e.target.value as any)} className="brutal-select text-xs">
                      <option>High</option>
                      <option>Medium</option>
                      <option>Low</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-extrabold uppercase text-text-primary">Commitment hrs</label>
                    <input type="number" value={pCommitment} onChange={e => setPCommitment(e.target.value)} className="brutal-input text-xs p-2" />
                  </div>
                </div>
                <button type="submit" className="w-full brutal-btn brutal-btn-primary py-2 text-xs font-black">
                  CREATE PROJECT
                </button>
              </form>
            )}

            <div className="flex flex-col gap-2">
              {projects.map(p => (
                <button
                  key={p.id}
                  onClick={() => setSelectedProjId(p.id)}
                  className={`w-full text-left p-3 border-2 border-border brutal-title text-xs font-black transition-all cursor-pointer flex justify-between items-center ${
                    selectedProjId === p.id ? 'bg-accent-pink text-text-primary' : 'bg-bg-surface text-text-primary hover:translate-x-0.5'
                  }`}
                >
                  <span>{p.name}</span>
                  <span className="brutal-mono text-[10px] font-bold bg-bg-surface-alt text-text-primary px-2 py-0.5 border border-border">
                    {p.completionPercentage}%
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Milestones & tasks */}
        <div className="md:col-span-8">
          {activeProj ? (
            <div className="brutal-card p-6 border-3 border-border shadow-[6px_6px_0px_var(--shadow-color)] bg-bg-surface relative">
              <div className="absolute top-0 right-0 w-8 h-8 bg-accent-green border-l-3 border-b-3 border-border"></div>

              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="brutal-title text-xl font-black m-0 leading-none text-text-primary">{activeProj.name}</h2>
                  <span className="brutal-mono text-xs text-text-secondary block mt-2">
                    Priority: {activeProj.priority} · Target: {activeProj.weekCommitment} hours/week
                  </span>
                </div>
                <button
                  className="brutal-btn py-1 px-3 text-[10px] bg-status-danger text-text-primary font-bold border-2 border-border"
                  onClick={() => deleteProject(activeProj.id)}
                >
                  DELETE PROJECT
                </button>
              </div>

              <div className="border-2 border-border bg-bg-surface-alt p-4 brutal-mono text-xs mb-6 text-text-primary">
                <p className="m-0 font-medium">{activeProj.description}</p>
                <div className="flex gap-4 mt-3">
                  {activeProj.githubUrl && (
                    <a href={activeProj.githubUrl} target="_blank" rel="noopener noreferrer" className="brutal-title text-[10px] font-black text-accent-blue">
                      🐙 GITHUB REPO ↗
                    </a>
                  )}
                  {activeProj.demoUrl && (
                    <a href={activeProj.demoUrl} target="_blank" rel="noopener noreferrer" className="brutal-title text-[10px] font-black text-accent-pink">
                      🚀 DEMO LINK ↗
                    </a>
                  )}
                </div>
              </div>

              {/* Progress gauge */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2 text-xs font-bold uppercase text-text-primary">
                  <span>Sprint Completion</span>
                  <span>{activeProj.completionPercentage}%</span>
                </div>
                <div className="w-full h-4 border-3 border-border bg-bg-surface-alt relative">
                  <div
                    className="h-full bg-accent-green"
                    style={{ width: `${activeProj.completionPercentage}%` }}
                  />
                </div>
              </div>

              {/* Milestones Checklists */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h4 className="brutal-title text-sm font-black m-0 text-text-primary">PROJECT MILESTONES</h4>
                  <button
                    className="brutal-btn py-1 px-3 text-[10px] bg-accent-green text-text-primary font-bold border-2 border-border"
                    onClick={() => setShowAddMilestone(!showAddMilestone)}
                  >
                    {showAddMilestone ? 'CANCEL' : '+ ADD MILESTONE'}
                  </button>
                </div>

                {showAddMilestone && (
                  <form onSubmit={handleAddMilestone} className="border-3 border-border p-4 bg-bg-surface-alt mb-4 flex flex-col gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] font-extrabold uppercase text-text-primary">Milestone Goal</label>
                      <input type="text" value={mTitle} onChange={e => setMTitle(e.target.value)} required placeholder="e.g. Implement OAuth logic" className="brutal-input text-xs p-2" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] font-extrabold uppercase text-text-primary">Target Week</label>
                      <input type="text" value={mTargetWeek} onChange={e => setMTargetWeek(e.target.value)} placeholder="Week 2" className="brutal-input text-xs p-2" />
                    </div>
                    <button type="submit" className="brutal-btn brutal-btn-primary py-2 text-xs font-black">
                      SAVE MILESTONE
                    </button>
                  </form>
                )}

                <div className="flex flex-col gap-2">
                  {activeProj.milestones.map(m => (
                    <div
                      key={m.id}
                      onClick={() => toggleMilestone(m.id)}
                      className={`border-2 border-border p-3 flex justify-between items-center cursor-pointer transition-all ${
                        m.completed ? 'bg-bg-surface-alt opacity-70 line-through' : 'bg-bg-surface'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-4 h-4 border-2 border-border flex items-center justify-center text-[10px] font-black ${m.completed ? 'bg-status-success text-text-primary' : 'bg-bg-surface'}`}>
                          {m.completed ? '✓' : ''}
                        </span>
                        <span className="brutal-title text-xs font-bold text-text-primary">{m.title}</span>
                      </div>
                      <span className="brutal-mono text-[9px] uppercase font-bold text-text-secondary">{m.targetWeek}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center brutal-mono text-xs text-text-secondary p-12 border-3 border-dashed border-border bg-bg-surface brutal-card">
              Select a capstone project on the left.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
