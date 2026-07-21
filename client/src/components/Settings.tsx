import React, { useState } from 'react';
import { UserPreference } from '../types/learningOS';

interface SettingsProps {
  preferences: UserPreference | null;
  savePrefs: (newPrefs: UserPreference) => Promise<void>;
  triggerReset: () => Promise<void>;
}

export default function Settings({
  preferences,
  savePrefs,
  triggerReset
}: SettingsProps) {
  const [hours, setHours] = useState(preferences?.targetWeeklyHours.toString() || '15');
  const [intensity, setIntensity] = useState<'chill' | 'balanced' | 'hardcore'>(preferences?.intensity || 'balanced');
  const [workload, setWorkload] = useState<'Low' | 'Medium' | 'High'>(preferences?.collegeWorkload || 'Low');
  const [activeTracks, setActiveTracks] = useState<string[]>(preferences?.activeTracks || ['dsa', 'backend', 'projects']);
  const [studyDays, setStudyDays] = useState<number[]>(preferences?.studyDays || [1, 2, 3, 4, 5, 6, 0]);
  const [wakeTime, setWakeTime] = useState(preferences?.wakeTime || '08:00');

  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const handleTrackToggle = (id: string) => {
    if (activeTracks.includes(id)) {
      setActiveTracks(activeTracks.filter(x => x !== id));
    } else {
      setActiveTracks([...activeTracks, id]);
    }
  };

  const handleDayToggle = (day: number) => {
    if (studyDays.includes(day)) {
      setStudyDays(studyDays.filter(d => d !== day));
    } else {
      setStudyDays([...studyDays, day].sort());
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!preferences) return;
    setSaving(true);
    setMsg(null);

    const updated: UserPreference = {
      ...preferences,
      targetWeeklyHours: parseInt(hours) || 15,
      intensity,
      collegeWorkload: workload,
      activeTracks,
      studyDays,
      wakeTime
    };

    await savePrefs(updated);
    setSaving(false);
    setMsg('✓ PREFERENCES UPDATED. AUTOPILOT COORDINATES.');
    setTimeout(() => setMsg(null), 4000);
  };

  const trackLabels = [
    { id: 'dsa', label: 'Data Structures & Algorithms' },
    { id: 'backend', label: 'Backend Engineering Tracks' },
    { id: 'projects', label: 'Capstone Projects' },
    { id: 'aptitude', label: 'Quantitative Aptitude' },
    { id: 'core_cs', label: 'Core CS (OS, DBMS, CN)' },
    { id: 'resume', label: 'Branding & Resume tailoring' }
  ];

  const weekDays = [
    { num: 1, label: 'Mon' },
    { num: 2, label: 'Tue' },
    { num: 3, label: 'Wed' },
    { num: 4, label: 'Thu' },
    { num: 5, label: 'Fri' },
    { num: 6, label: 'Sat' },
    { num: 0, label: 'Sun' }
  ];

  return (
    <div className="flex flex-col gap-6 animate__animated animate__fadeIn max-w-[600px] mx-auto">
      <div className="brutal-card p-8 border-3 border-ink shadow-[6px_6px_0px_var(--ink)] bg-bg-white relative">
        <div className="absolute top-0 right-0 w-8 h-8 bg-accent-blue border-l-3 border-b-3 border-ink"></div>

        <h2 className="brutal-title text-xl font-black mb-1">SETTINGS & PARAMETERS</h2>
        <p className="brutal-mono text-xs text-muted mb-6">
          Configure active tracks, capacity constraints, and database resets.
        </p>

        {msg && (
          <div className="border-2 border-ink p-3 bg-status-success font-bold text-xs mb-4 uppercase">
            {msg}
          </div>
        )}

        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-extrabold uppercase">Target Hours/Week</label>
              <input type="number" min="1" max="100" value={hours} onChange={e => setHours(e.target.value)} className="brutal-input text-xs" required />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-extrabold uppercase">Daily intensity</label>
              <select value={intensity} onChange={e => setIntensity(e.target.value as any)} className="brutal-select text-xs">
                <option value="chill">Chill (Max 2 tasks)</option>
                <option value="balanced">Balanced (Max 3 tasks)</option>
                <option value="hardcore">Hardcore (Max 5 tasks)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-extrabold uppercase">College Workload Capacity</label>
              <select value={workload} onChange={e => setWorkload(e.target.value as any)} className="brutal-select text-xs">
                <option value="Low">Low (No adjustments)</option>
                <option value="Medium">Medium (Slight reduction)</option>
                <option value="High">High (Adapts to prevent burnout)</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-extrabold uppercase">Wake Time</label>
              <input type="time" value={wakeTime} onChange={e => setWakeTime(e.target.value)} className="brutal-input text-xs" required />
            </div>
          </div>

          <div className="flex flex-col gap-2 mt-2">
            <label className="text-[10px] font-extrabold uppercase">Active Study Syllabus Tracks</label>
            <div className="grid grid-cols-1 gap-2 border-2 border-ink p-4 bg-bg-light">
              {trackLabels.map(t => {
                const isActive = activeTracks.includes(t.id);
                return (
                  <label key={t.id} className="flex items-center gap-3 cursor-pointer text-xs font-bold uppercase m-0">
                    <input type="checkbox" checked={isActive} onChange={() => handleTrackToggle(t.id)} className="w-4 h-4 cursor-pointer" />
                    {t.label}
                  </label>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-1.5 mt-2">
            <label className="text-[10px] font-extrabold uppercase">Syllabus Study Days</label>
            <div className="flex gap-2 flex-wrap">
              {weekDays.map(d => {
                const isSel = studyDays.includes(d.num);
                return (
                  <button
                    key={d.num}
                    type="button"
                    onClick={() => handleDayToggle(d.num)}
                    className={`py-2 px-3 border-2 border-ink brutal-title text-xs font-black cursor-pointer transition-all duration-75 ${
                      isSel ? 'bg-accent-blue text-ink shadow-[0px_0px_0px_var(--ink)] translate-x-[2px] translate-y-[2px]' : 'bg-bg-white text-ink hover:-translate-y-0.5 hover:shadow-[2px_2px_0px_var(--ink)]'
                    }`}
                  >
                    {d.label}
                  </button>
                );
              })}
            </div>
          </div>

          <button type="submit" className="w-full brutal-btn brutal-btn-primary py-3.5 text-xs font-black mt-3" disabled={saving}>
            {saving ? 'SAVING...' : '✓ SAVE PREFERENCES'}
          </button>
        </form>

        <div className="border-t-3 border-ink mt-8 pt-6">
          <h4 className="brutal-title text-sm font-black text-status-danger m-0 mb-1">FACTORY RESET</h4>
          <p className="brutal-mono text-xs text-muted mb-4">
            Delete all tracking logs and rebuild structural seeds.
          </p>
          <button className="brutal-btn border-status-danger text-status-danger py-2 px-6 text-xs font-black bg-bg-white" onClick={triggerReset}>
            RESEED DATABASE
          </button>
        </div>
      </div>
    </div>
  );
}
