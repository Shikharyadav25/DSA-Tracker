import React, { useState } from 'react';
import { UserPreference } from '../types/learningOS';
import { Sun, Moon, Check } from 'lucide-react';

interface SettingsProps {
  preferences: UserPreference | null;
  savePreferences: (pref: UserPreference) => Promise<void>;
  reseedMockData: () => Promise<void>;
  theme?: 'light' | 'dark';
  toggleTheme?: () => void;
}

export default function Settings({
  preferences,
  savePreferences,
  reseedMockData,
  theme,
  toggleTheme
}: SettingsProps) {
  const [hours, setHours] = useState(preferences?.targetHoursPerWeek?.toString() || '15');
  const [intensity, setIntensity] = useState(preferences?.dailyIntensity || 'balanced');
  const [workload, setWorkload] = useState(preferences?.collegeWorkload || 'Low');
  const [wakeTime, setWakeTime] = useState(preferences?.wakeTime || '07:00');
  const [activeTracks, setActiveTracks] = useState<string[]>(preferences?.activeTracks || ['dsa', 'backend', 'projects']);
  const [studyDays, setStudyDays] = useState<number[]>(preferences?.studyDays || [1, 2, 3, 4, 5, 6]);

  const [reseeding, setReseeding] = useState(false);
  const [msg, setMsg] = useState('');

  const trackLabels = [
    { id: 'dsa', label: 'Data Structures & Algorithms' },
    { id: 'backend', label: 'Backend Engineering' },
    { id: 'projects', label: 'Capstone Projects' },
    { id: 'aptitude', label: 'Aptitude & Logical Reasoning' },
    { id: 'core_cs', label: 'CS Core Fundamentals (OS/DBMS/CN)' }
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

  const handleTrackToggle = (id: string) => {
    if (activeTracks.includes(id)) {
      setActiveTracks(activeTracks.filter(t => t !== id));
    } else {
      setActiveTracks([...activeTracks, id]);
    }
  };

  const handleDayToggle = (dayNum: number) => {
    if (studyDays.includes(dayNum)) {
      setStudyDays(studyDays.filter(d => d !== dayNum));
    } else {
      setStudyDays([...studyDays, dayNum]);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const updatedPref: UserPreference = {
      userId: preferences?.userId || 'u-1',
      targetHoursPerWeek: parseInt(hours) || 15,
      dailyIntensity: intensity,
      collegeWorkload: workload,
      wakeTime,
      sleepTime: preferences?.sleepTime || '23:00',
      activeTracks,
      studyDays
    };

    await savePreferences(updatedPref);
    setMsg('SETTINGS SAVED SUCCESSFULLY');
    setTimeout(() => setMsg(''), 3000);
  };

  const handleReseed = async () => {
    if (!window.confirm('Reset local database with default sample syllabus data?')) return;
    setReseeding(true);
    await reseedMockData();
    setReseeding(false);
    setMsg('DATABASE RE-SEEDED');
    setTimeout(() => setMsg(''), 3000);
  };

  return (
    <div className="flex flex-col gap-6 animate__animated animate__fadeIn max-w-[800px] mx-auto">
      <div className="brutal-card p-8 border-3 border-border shadow-[6px_6px_0px_var(--shadow-color)] bg-bg-surface relative">
        <div className="absolute top-0 right-0 w-8 h-8 bg-accent-blue border-l-3 border-b-3 border-border"></div>

        <h2 className="brutal-title text-xl font-black mb-1 text-text-primary">SETTINGS & PARAMETERS</h2>
        <p className="brutal-mono text-xs text-text-secondary mb-6">
          Configure active tracks, capacity constraints, and database resets.
        </p>

        {msg && (
          <div className="border-2 border-border p-3 bg-status-success text-text-primary font-bold text-xs mb-4 uppercase">
            {msg}
          </div>
        )}

        <form onSubmit={handleSave} className="flex flex-col gap-4">
          {toggleTheme && (
            <div className="flex flex-col gap-1 mb-2">
              <label className="text-[10px] font-extrabold uppercase text-text-primary">App Theme</label>
              <div className="flex items-center justify-between border-3 border-border p-4 bg-bg-surface-alt shadow-[3px_3px_0px_var(--shadow-color)]">
                <div>
                  <div className="font-extrabold text-xs uppercase brutal-title flex items-center gap-2 text-text-primary">
                    Current Mode: {theme === 'dark' ? (
                      <span className="flex items-center gap-1">Dark Mode <Moon className="w-3.5 h-3.5 text-slate-700 inline" /></span>
                    ) : (
                      <span className="flex items-center gap-1">Light Mode <Sun className="w-3.5 h-3.5 text-amber-400 inline" /></span>
                    )}
                  </div>
                  <div className="brutal-mono text-[10px] text-text-secondary">Toggle application visual color theme</div>
                </div>
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="brutal-btn py-2 px-4 text-xs font-black flex items-center gap-2"
                >
                  {theme === 'dark' ? (
                    <><Sun className="w-4 h-4 text-amber-400" /><span>Switch to Light</span></>
                  ) : (
                    <><Moon className="w-4 h-4 text-slate-700" /><span>Switch to Dark</span></>
                  )}
                </button>
              </div>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-extrabold uppercase text-text-primary">Target Hours/Week</label>
              <input type="number" min="1" max="100" value={hours} onChange={e => setHours(e.target.value)} className="brutal-input text-xs" required />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-extrabold uppercase text-text-primary">Daily intensity</label>
              <select value={intensity} onChange={e => setIntensity(e.target.value as any)} className="brutal-select text-xs">
                <option value="chill">Chill (Max 2 tasks)</option>
                <option value="balanced">Balanced (Max 3 tasks)</option>
                <option value="hardcore">Hardcore (Max 5 tasks)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-extrabold uppercase text-text-primary">College Workload Capacity</label>
              <select value={workload} onChange={e => setWorkload(e.target.value as any)} className="brutal-select text-xs">
                <option value="Low">Low (No adjustments)</option>
                <option value="Medium">Medium (Slight reduction)</option>
                <option value="High">High (Adapts to prevent burnout)</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-extrabold uppercase text-text-primary">Wake Time</label>
              <input type="time" value={wakeTime} onChange={e => setWakeTime(e.target.value)} className="brutal-input text-xs" required />
            </div>
          </div>

          <div className="flex flex-col gap-2 mt-2">
            <label className="text-[10px] font-extrabold uppercase text-text-primary">Active Study Syllabus Tracks</label>
            <div className="grid grid-cols-1 gap-2 border-2 border-border p-4 bg-bg-surface-alt">
              {trackLabels.map(t => {
                const isActive = activeTracks.includes(t.id);
                return (
                  <label key={t.id} className="flex items-center gap-3 cursor-pointer text-xs font-bold uppercase m-0 text-text-primary">
                    <input type="checkbox" checked={isActive} onChange={() => handleTrackToggle(t.id)} className="w-4 h-4 cursor-pointer" />
                    {t.label}
                  </label>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-1.5 mt-2">
            <label className="text-[10px] font-extrabold uppercase text-text-primary">Syllabus Study Days</label>
            <div className="flex gap-2 flex-wrap">
              {weekDays.map(d => {
                const isSel = studyDays.includes(d.num);
                return (
                  <button
                    key={d.num}
                    type="button"
                    onClick={() => handleDayToggle(d.num)}
                    className={`py-2 px-3 border-2 border-border brutal-title text-xs font-black cursor-pointer transition-all duration-75 ${
                      isSel ? 'bg-accent-blue text-text-primary shadow-[0px_0px_0px_var(--shadow-color)] translate-x-[2px] translate-y-[2px]' : 'bg-bg-surface text-text-primary hover:-translate-y-0.5 hover:shadow-[2px_2px_0px_var(--shadow-color)]'
                    }`}
                  >
                    {d.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t-3 border-border flex justify-between items-center">
            <button type="submit" className="brutal-btn brutal-btn-primary py-3 px-8 text-xs font-black">
              SAVE CONFIGURATION
            </button>
            <button
              type="button"
              onClick={handleReseed}
              disabled={reseeding}
              className="brutal-btn py-3 px-6 text-xs bg-status-danger text-text-primary font-black border-3 border-border"
            >
              {reseeding ? 'RE-SEEDING...' : 'RE-SEED DEMO DATA'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
