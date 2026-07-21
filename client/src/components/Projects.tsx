import React, { useState } from 'react';
import { Project, ProjectMilestone } from '../types/learningOS';
import { dbService } from '../services/db';

interface ProjectsProps {
  projects: Project[];
  projectMilestones: ProjectMilestone[];
  setProjectMilestones: React.Dispatch<React.SetStateAction<ProjectMilestone[]>>;
  saveProject: (project: Project) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
}

export default function Projects({
  projects,
  projectMilestones,
  setProjectMilestones,
  saveProject,
  deleteProject
}: ProjectsProps) {
  const [selectedProjId, setSelectedProjId] = useState<string | null>(projects.length > 0 ? projects[0].id : null);

  // Add Project Form
  const [showAddProject, setShowAddProject] = useState(false);
  const [pName, setPName] = useState('');
  const [pDesc, setPDesc] = useState('');
  const [pPriority, setPPriority] = useState<'High' | 'Medium' | 'Low'>('Medium');
  const [pCommitment, setPCommitment] = useState('5');
  const [pGithub, setPGithub] = useState('');
  const [pDemo, setPDemo] = useState('');

  // Add Milestone Form
  const [showAddMilestone, setShowAddMilestone] = useState(false);
  const [mTitle, setMTitle] = useState('');
  const [mDate, setMDate] = useState('');

  const activeProj = projects.find(p => p.id === selectedProjId);
  const activeMilestones = projectMilestones.filter(m => m.projectId === selectedProjId);

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pName.trim()) return;

    const p: Project = {
      id: 'proj-' + Date.now().toString(36),
      userId: 'guest',
      name: pName.trim(),
      description: pDesc.trim(),
      status: 'In Progress',
      priority: pPriority,
      weekCommitment: parseInt(pCommitment) || 5,
      githubUrl: pGithub.trim() || undefined,
      demoUrl: pDemo.trim() || undefined,
      completionPercentage: 0
    };

    await saveProject(p);
    setPName('');
    setPDesc('');
    setPGithub('');
    setPDemo('');
    setShowAddProject(false);
    setSelectedProjId(p.id);
  };

  const handleAddMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mTitle.trim() || !selectedProjId) return;

    const m: ProjectMilestone = {
      id: 'mile-' + Date.now().toString(36),
      projectId: selectedProjId,
      title: mTitle.trim(),
      dueDate: mDate || new Date().toISOString().split('T')[0],
      status: 'pending'
    };

    const updated = [...projectMilestones, m];
    setProjectMilestones(updated);
    await dbService.saveDoc('projectMilestones', m.id, m);

    setMTitle('');
    setMDate('');
    setShowAddMilestone(false);

    updateCompletionPercentage(selectedProjId, updated);
  };

  const toggleMilestoneStatus = async (m: ProjectMilestone) => {
    const status = m.status === 'completed' ? 'pending' : 'completed';
    const updated = projectMilestones.map(item => {
      if (item.id === m.id) return { ...item, status };
      return item;
    });
    setProjectMilestones(updated);
    await dbService.saveDoc('projectMilestones', m.id, { ...m, status });

    if (selectedProjId) {
      updateCompletionPercentage(selectedProjId, updated);
    }
  };

  const updateCompletionPercentage = async (projId: string, allMilestones: ProjectMilestone[]) => {
    const proj = projects.find(p => p.id === projId);
    if (!proj) return;

    const miles = allMilestones.filter(x => x.projectId === projId);
    if (miles.length === 0) return;

    const completed = miles.filter(x => x.status === 'completed').length;
    const pct = Math.round((completed / miles.length) * 100);

    const updatedProj: Project = {
      ...proj,
      completionPercentage: pct,
      status: pct === 100 ? 'Completed' : 'In Progress'
    };
    await saveProject(updatedProj);
  };

  return (
    <div className="flex flex-col gap-6 animate__animated animate__fadeIn">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left column: Projects list */}
        <div className="md:col-span-4 flex flex-col gap-6">
          <div className="brutal-card p-5 border-3 border-ink shadow-[6px_6px_0px_var(--ink)] bg-bg-white relative">
            <div className="absolute top-0 right-0 w-6 h-6 bg-accent-pink border-l-3 border-b-3 border-ink"></div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="brutal-title text-sm font-black m-0">ACTIVE PROJECTS</h3>
              <button
                className="brutal-btn py-1 px-3 text-[10px] bg-accent-pink font-bold border-2"
                onClick={() => setShowAddProject(!showAddProject)}
              >
                {showAddProject ? 'CANCEL' : '+ ADD'}
              </button>
            </div>

            {showAddProject && (
              <form onSubmit={handleAddProject} className="border-3 border-ink p-4 bg-bg-light mb-4 flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-extrabold uppercase">Project Name</label>
                  <input type="text" value={pName} onChange={e => setPName(e.target.value)} required className="brutal-input text-xs p-2" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-extrabold uppercase">Description</label>
                  <input type="text" value={pDesc} onChange={e => setPDesc(e.target.value)} className="brutal-input text-xs p-2" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-extrabold uppercase">Priority</label>
                    <select value={pPriority} onChange={e => setPPriority(e.target.value as any)} className="brutal-select text-xs">
                      <option>High</option>
                      <option>Medium</option>
                      <option>Low</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-extrabold uppercase">Commitment hrs</label>
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
                  className={`w-full text-left p-3 border-2 border-ink brutal-title text-xs font-black transition-all cursor-pointer flex justify-between items-center ${
                    selectedProjId === p.id ? 'bg-accent-pink text-ink' : 'bg-bg-white text-ink hover:translate-x-0.5'
                  }`}
                >
                  <span>{p.name}</span>
                  <span className="brutal-mono text-[10px] font-bold bg-bg-light px-2 py-0.5 border border-ink">
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
            <div className="brutal-card p-6 border-3 border-ink shadow-[6px_6px_0px_var(--ink)] bg-bg-white relative">
              <div className="absolute top-0 right-0 w-8 h-8 bg-accent-green border-l-3 border-b-3 border-ink"></div>

              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="brutal-title text-xl font-black m-0 leading-none">{activeProj.name}</h2>
                  <span className="brutal-mono text-xs text-muted block mt-2">
                    Priority: {activeProj.priority} · Target: {activeProj.weekCommitment} hours/week
                  </span>
                </div>
                <button
                  className="brutal-btn py-1 px-3 text-[10px] bg-status-danger text-ink font-bold border-2"
                  onClick={() => deleteProject(activeProj.id)}
                >
                  DELETE PROJECT
                </button>
              </div>

              <div className="border-2 border-ink bg-bg-light p-4 brutal-mono text-xs mb-6">
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
                <div className="flex justify-between items-center mb-2 text-xs font-bold uppercase">
                  <span>Sprint Completion</span>
                  <span>{activeProj.completionPercentage}%</span>
                </div>
                <div className="w-full h-4 border-3 border-ink bg-bg-light relative">
                  <div
                    className="h-full bg-accent-green"
                    style={{ width: `${activeProj.completionPercentage}%` }}
                  />
                </div>
              </div>

              {/* Milestones Checklists */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h4 className="brutal-title text-sm font-black m-0">PROJECT MILESTONES</h4>
                  <button
                    className="brutal-btn py-1 px-3 text-[10px] bg-accent-green font-bold border-2"
                    onClick={() => setShowAddMilestone(!showAddMilestone)}
                  >
                    {showAddMilestone ? 'CANCEL' : '+ ADD MILESTONE'}
                  </button>
                </div>

                {showAddMilestone && (
                  <form onSubmit={handleAddMilestone} className="border-3 border-ink p-4 bg-bg-light mb-4 flex flex-col gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] font-extrabold uppercase">Milestone Title</label>
                      <input type="text" value={mTitle} onChange={e => setMTitle(e.target.value)} required className="brutal-input text-xs p-2" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] font-extrabold uppercase">Target Date</label>
                      <input type="date" value={mDate} onChange={e => setMDate(e.target.value)} className="brutal-input text-xs p-2" />
                    </div>
                    <button type="submit" className="w-full brutal-btn brutal-btn-primary py-2 text-xs font-black">
                      ADD MILESTONE
                    </button>
                  </form>
                )}

                {activeMilestones.length === 0 ? (
                  <div className="text-center brutal-mono text-xs text-muted p-6 border-3 border-dashed border-ink bg-bg-light">
                    No active sprints or milestones configured for this project commitment.
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {activeMilestones.map(m => (
                      <div
                        key={m.id}
                        onClick={() => toggleMilestoneStatus(m)}
                        className={`border-2 border-ink p-3 flex items-center gap-3 cursor-pointer transition-all ${
                          m.status === 'completed' ? 'bg-status-success/20 opacity-70' : 'bg-bg-white hover:translate-x-0.5'
                        }`}
                      >
                        <input type="checkbox" checked={m.status === 'completed'} readOnly className="w-4 h-4 cursor-pointer" />
                        <div className="flex-1 flex justify-between items-center">
                          <span className={`text-xs font-bold ${m.status === 'completed' ? 'line-through' : ''}`}>
                            {m.title}
                          </span>
                          <span className="brutal-mono text-[9px] font-bold opacity-60">
                            Due: {m.dueDate}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center brutal-mono text-xs text-muted p-12 border-3 border-dashed border-ink bg-bg-white brutal-card">
              Select projects on the left to configure sprints.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
