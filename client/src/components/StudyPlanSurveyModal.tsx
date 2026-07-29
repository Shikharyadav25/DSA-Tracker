import React, { useState } from 'react';
import { Topic, Subtopic } from '../types/learningOS';
import { Sparkles, Calendar, BookOpen, Code, Trophy, Zap, X, RefreshCw } from 'lucide-react';

export interface SurveyParams {
  primaryTopicId: string;
  revisionTopicId: string;
  weekdayFocus: 'leetcode_topic' | 'mixed';
  weekendFocus: 'projects_contests' | 'mixed';
  includeContests: boolean;
  intensity: 'chill' | 'balanced' | 'hardcore';
}

interface StudyPlanSurveyModalProps {
  isOpen: boolean;
  onClose: () => void;
  topics: Topic[];
  subtopics: Subtopic[];
  onGeneratePlan: (params: SurveyParams) => Promise<void>;
}

export default function StudyPlanSurveyModal({
  isOpen,
  onClose,
  topics = [],
  subtopics = [],
  onGeneratePlan
}: StudyPlanSurveyModalProps) {
  const [primaryTopicId, setPrimaryTopicId] = useState(topics[0]?.id || '');
  const [revisionTopicId, setRevisionTopicId] = useState(topics[1]?.id || topics[0]?.id || '');
  const [weekdayFocus, setWeekdayFocus] = useState<'leetcode_topic' | 'mixed'>('leetcode_topic');
  const [weekendFocus, setWeekendFocus] = useState<'projects_contests' | 'mixed'>('projects_contests');
  const [includeContests, setIncludeContests] = useState(true);
  const [intensity, setIntensity] = useState<'chill' | 'balanced' | 'hardcore'>('balanced');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onGeneratePlan({
        primaryTopicId: primaryTopicId || (topics[0]?.id || ''),
        revisionTopicId: revisionTopicId || (topics[0]?.id || ''),
        weekdayFocus,
        weekendFocus,
        includeContests,
        intensity
      });
      onClose();
    } catch (err) {
      console.error('Failed to generate plan from survey', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate__animated animate__fadeIn">
      <div className="brutal-card p-6 sm:p-8 max-w-[650px] w-full bg-bg-surface border-3 border-border shadow-[8px_8px_0px_var(--shadow-color)] relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          type="button"
          className="absolute top-4 right-4 text-text-secondary hover:text-text-primary p-1 border-2 border-border brutal-btn text-xs"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-accent-blue border-2 border-border">
            <Sparkles className="w-6 h-6 text-text-primary" />
          </div>
          <div>
            <h2 className="brutal-title text-xl font-black text-text-primary m-0">CUSTOM STUDY PLAN SURVEY</h2>
            <p className="brutal-mono text-xs text-text-secondary m-0 mt-0.5">
              Personalize your weekly schedule based on topics, weekdays & weekends
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-5">
          {/* 1. Primary Studying Topic */}
          <div className="flex flex-col gap-1.5">
            <label className="brutal-mono text-xs font-black uppercase text-text-primary flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-accent-blue" />
              <span>1. What topic are you currently studying? (DSA)</span>
            </label>
            <p className="text-[11px] brutal-mono text-text-secondary m-0">
              Weekdays will sequentially pull unsolved problems under this curriculum topic.
            </p>
            <select
              value={primaryTopicId}
              onChange={e => setPrimaryTopicId(e.target.value)}
              className="brutal-select text-xs w-full mt-1"
              required
            >
              {topics.map(t => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          {/* 2. Revision Topic */}
          <div className="flex flex-col gap-1.5 border-t border-border pt-4">
            <label className="brutal-mono text-xs font-black uppercase text-text-primary flex items-center gap-1.5">
              <RefreshCw className="w-4 h-4 text-accent-pink" />
              <span>2. What topic do you want to revise?</span>
            </label>
            <select
              value={revisionTopicId}
              onChange={e => setRevisionTopicId(e.target.value)}
              className="brutal-select text-xs w-full mt-1"
            >
              <option value="">-- Auto-select from Spaced Repetition --</option>
              {topics.map(t => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          {/* 3. Weekday vs Weekend Routine */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-border pt-4">
            <div className="flex flex-col gap-2">
              <label className="brutal-mono text-xs font-black uppercase text-text-primary flex items-center gap-1.5">
                <Code className="w-4 h-4 text-accent-green" />
                <span>Weekdays (Mon - Fri)</span>
              </label>
              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs brutal-mono">
                  <input
                    type="radio"
                    name="weekdayFocus"
                    checked={weekdayFocus === 'leetcode_topic'}
                    onChange={() => setWeekdayFocus('leetcode_topic')}
                    className="accent-accent-primary"
                  />
                  <span>LeetCode Sequential Topic</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-xs brutal-mono">
                  <input
                    type="radio"
                    name="weekdayFocus"
                    checked={weekdayFocus === 'mixed'}
                    onChange={() => setWeekdayFocus('mixed')}
                    className="accent-accent-primary"
                  />
                  <span>Mixed LeetCode & Skills</span>
                </label>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="brutal-mono text-xs font-black uppercase text-text-primary flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-accent-orange" />
                <span>Weekends (Sat - Sun)</span>
              </label>
              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs brutal-mono">
                  <input
                    type="radio"
                    name="weekendFocus"
                    checked={weekendFocus === 'projects_contests'}
                    onChange={() => setWeekendFocus('projects_contests')}
                    className="accent-accent-primary"
                  />
                  <span>Development & Contests</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-xs brutal-mono">
                  <input
                    type="radio"
                    name="weekendFocus"
                    checked={weekendFocus === 'mixed'}
                    onChange={() => setWeekendFocus('mixed')}
                    className="accent-accent-primary"
                  />
                  <span>Equal DSA & Projects</span>
                </label>
              </div>
            </div>
          </div>

          {/* 4. Options & Intensity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-border pt-4">
            <div className="flex flex-col gap-2">
              <label className="brutal-mono text-xs font-black uppercase text-text-primary">Weekend Contests</label>
              <label className="flex items-center gap-2 cursor-pointer text-xs brutal-mono">
                <input
                  type="checkbox"
                  checked={includeContests}
                  onChange={e => setIncludeContests(e.target.checked)}
                  className="accent-accent-primary w-4 h-4"
                />
                <span>Schedule Weekly Contest on Weekend</span>
              </label>
            </div>

            <div className="flex flex-col gap-2">
              <label className="brutal-mono text-xs font-black uppercase text-text-primary">Daily Pace / Intensity</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'chill', label: 'Chill (2)' },
                  { id: 'balanced', label: 'Balanced (3)' },
                  { id: 'hardcore', label: 'Hardcore (5)' }
                ].map(opt => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setIntensity(opt.id as any)}
                    className={`py-1.5 px-2 brutal-title text-[10px] border-2 border-border font-black ${
                      intensity === opt.id ? 'bg-accent-blue text-text-primary' : 'bg-bg-surface-alt hover:bg-bg-surface'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Submit Action Button */}
          <div className="mt-4 pt-4 border-t-3 border-border flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="brutal-btn py-2.5 px-5 text-xs bg-bg-surface-alt text-text-primary"
              disabled={loading}
            >
              CANCEL
            </button>
            <button
              type="submit"
              className="brutal-btn brutal-btn-accent py-2.5 px-6 text-xs flex items-center gap-2"
              disabled={loading}
            >
              <Zap className="w-4 h-4 shrink-0" />
              <span>{loading ? 'GENERATING SCHEDULE...' : 'BUILD MY SCHEDULE'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
