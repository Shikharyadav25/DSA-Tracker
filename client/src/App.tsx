import { useMemo, useState, type FormEvent } from 'react';
import './App.css';

type View = 'dashboard' | 'revise' | 'questions';
type Difficulty = 'Easy' | 'Medium' | 'Hard';
type Stage = 'New' | 'Reading' | 'Attempting' | 'Hint used' | 'Solved';

type Question = {
  id: number;
  title: string;
  topic: string;
  difficulty: Difficulty;
  stage: Stage;
  link: string;
  notes: string;
  box: number;
};

type DraftQuestion = {
  title: string;
  topic: string;
  difficulty: Difficulty;
  stage: Stage;
  link: string;
  notes: string;
};

const starterQuestions: Question[] = [
  {
    id: 1,
    title: 'Two Sum',
    topic: 'Arrays',
    difficulty: 'Easy',
    stage: 'Solved',
    link: 'https://leetcode.com/problems/two-sum/',
    notes: 'Use a hashmap to track seen values.',
    box: 2
  },
  {
    id: 2,
    title: 'Valid Parentheses',
    topic: 'Stack',
    difficulty: 'Easy',
    stage: 'Attempting',
    link: 'https://leetcode.com/problems/valid-parentheses/',
    notes: 'Push opening brackets and pop on closing.',
    box: 1
  },
  {
    id: 3,
    title: 'Longest Substring Without Repeating Characters',
    topic: 'Sliding Window',
    difficulty: 'Medium',
    stage: 'Reading',
    link: 'https://leetcode.com/problems/longest-substring-without-repeating-characters/',
    notes: 'Maintain a window with a hashmap of last seen positions.',
    box: 1
  }
];

const emptyDraft: DraftQuestion = {
  title: '',
  topic: '',
  difficulty: 'Easy',
  stage: 'New',
  link: '',
  notes: ''
};

function App() {
  const [activeView, setActiveView] = useState<View>('dashboard');
  const [questions, setQuestions] = useState<Question[]>(starterQuestions);
  const [showModal, setShowModal] = useState(false);
  const [draft, setDraft] = useState<DraftQuestion>(emptyDraft);
  const [filterTopic, setFilterTopic] = useState('');
  const [filterDiff, setFilterDiff] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const stats = useMemo(() => {
    const total = questions.length;
    const solved = questions.filter((q) => q.stage === 'Solved').length;
    const due = questions.filter((q) => q.stage !== 'Solved').length;
    const hard = questions.filter((q) => q.difficulty === 'Hard').length;

    return [
      { label: 'Questions logged', value: total.toString(), accent: 'accent' },
      { label: 'Solved', value: solved.toString(), accent: 'accent' },
      { label: 'Due for review', value: due.toString(), accent: 'warn' },
      { label: 'Hard', value: hard.toString(), accent: 'danger' }
    ];
  }, [questions]);

  const topicBreakdown = useMemo(() => {
    const counts = questions.reduce<Record<string, number>>((acc, question) => {
      acc[question.topic] = (acc[question.topic] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(counts).map(([name, count]) => ({ name, count }));
  }, [questions]);

  const streakCells = Array.from({ length: 26 }, (_, index) => index < 14);

  const boxCounts = useMemo(() => {
    const counts = [0, 0, 0, 0, 0];
    questions.forEach((question) => {
      const box = Math.min(question.box, 4);
      counts[box] += 1;
    });
    return counts;
  }, [questions]);

  const filteredQuestions = useMemo(() => {
    return questions.filter((question) => {
      const topicMatch = !filterTopic || question.topic === filterTopic;
      const diffMatch = !filterDiff || question.difficulty === filterDiff;
      const statusMatch = !filterStatus || question.stage === filterStatus;
      return topicMatch && diffMatch && statusMatch;
    });
  }, [questions, filterTopic, filterDiff, filterStatus]);

  const openModal = () => {
    setDraft(emptyDraft);
    setShowModal(true);
  };

  const handleAddQuestion = (event: FormEvent) => {
    event.preventDefault();
    const nextQuestion: Question = {
      id: Date.now(),
      title: draft.title,
      topic: draft.topic || 'General',
      difficulty: draft.difficulty,
      stage: draft.stage,
      link: draft.link,
      notes: draft.notes,
      box: draft.stage === 'Solved' ? 2 : 1
    };

    setQuestions((current) => [nextQuestion, ...current]);
    setDraft(emptyDraft);
    setShowModal(false);
    setActiveView('questions');
  };

  const updateQuestionStage = (id: number, stage: Stage) => {
    setQuestions((current) => current.map((question) => question.id === id ? { ...question, stage, box: stage === 'Solved' ? 2 : Math.max(1, question.box - 1) } : question));
  };

  const deleteQuestion = (id: number) => {
    setQuestions((current) => current.filter((question) => question.id !== id));
  };

  const seedStarter = () => {
    setQuestions(starterQuestions);
    setActiveView('questions');
  };

  return (
    <div className="wrap">
      <header className="top">
        <div className="brand">
          <div className="brand-mark">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="3" y="5" width="18" height="14" rx="2" stroke="#fff" strokeWidth="1.6" />
              <line x1="3" y1="10" x2="21" y2="10" stroke="#fff" strokeWidth="1.6" />
              <line x1="8" y1="5" x2="8" y2="10" stroke="#fff" strokeWidth="1.6" />
            </svg>
          </div>
          <div>
            <h1 className="voice">The Box</h1>
            <p>A DSA revision tracker, run on a Leitner box</p>
          </div>
        </div>
        <nav className="tabs">
          <button className={activeView === 'dashboard' ? 'active' : ''} onClick={() => setActiveView('dashboard')}>Dashboard</button>
          <button className={activeView === 'revise' ? 'active' : ''} onClick={() => setActiveView('revise')}>Revise</button>
          <button className={activeView === 'questions' ? 'active' : ''} onClick={() => setActiveView('questions')}>Questions</button>
        </nav>
      </header>

      <section className={`view ${activeView === 'dashboard' ? 'active' : ''}`}>
        <div className="stat-row">
          {stats.map((stat) => (
            <div key={stat.label} className={`stat-card ${stat.accent}`}>
              <div className="num">{stat.value}</div>
              <div className="lbl">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="grid-2">
          <div>
            <div className="panel">
              <h2 className="section-title">Last 26 days</h2>
              <div className="streak-strip">
                {streakCells.map((hit, index) => (
                  <div key={`${hit}${index}`} className={`streak-cell ${hit ? 'hit' : ''}`} />
                ))}
              </div>
              <div className="streak-legend">
                <span style={{ background: 'var(--line)' }} /> no activity
                <span style={{ background: 'var(--moss)' }} /> reviewed or logged a question
              </div>
            </div>
            <div className="panel">
              <h2 className="section-title">By topic</h2>
              {topicBreakdown.map((item) => (
                <div key={item.name} className="bar-row">
                  <div className="name">{item.name}</div>
                  <div className="bar-track">
                    <div className="bar-fill" style={{ width: `${Math.min(item.count * 25, 100)}%` }} />
                  </div>
                  <div className="cnt">{item.count}</div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="panel">
              <h2 className="section-title">The box, right now</h2>
              <p style={{ fontSize: '12.5px', color: 'var(--ink-soft)', marginTop: 0 }}>
                Every solved question lives in a box. Get it right and it moves up, with a longer wait before it comes back. Miss it, and it drops to box 1.
              </p>
              <div className="box-row">
                {boxCounts.map((count, index) => (
                  <div key={`box-${index}`} className="box-tile">
                    <div className="n">{count}</div>
                    <div className="l">Box {index + 1}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="panel">
              <h2 className="section-title">Quick add</h2>
              <button className="btn primary" style={{ width: '100%' }} onClick={openModal}>+ Log a question</button>
              <button className="btn ghost" style={{ width: '100%', marginTop: '8px' }} onClick={seedStarter}>Seed 12 starter questions</button>
            </div>
          </div>
        </div>
      </section>

      <section className={`view ${activeView === 'revise' ? 'active' : ''}`}>
        <h2 className="section-title">Due for revision</h2>
        {questions.filter((question) => question.stage !== 'Solved').length === 0 ? (
          <div className="empty">Nothing due right now.</div>
        ) : (
          questions.filter((question) => question.stage !== 'Solved').map((question) => (
            <div key={question.id} className="rev-card">
              <div className="box-badge">Box {question.box}</div>
              <h3>{question.title}</h3>
              <div className="due-note">{question.topic} • {question.difficulty}</div>
              <div>{question.notes}</div>
              <div className="rate-row">
                {['Again', 'Hard', 'Good', 'Easy'].map((label) => (
                  <button key={label} className={`rate-btn ${label.toLowerCase()}`} onClick={() => updateQuestionStage(question.id, label === 'Again' ? 'New' : label === 'Hard' ? 'Attempting' : label === 'Good' ? 'Reading' : 'Solved')}>
                    {label}
                    <small>{label === 'Again' ? 'retry soon' : label === 'Hard' ? 'needs work' : label === 'Good' ? 'steady' : 'easy win'}</small>
                  </button>
                ))}
              </div>
            </div>
          ))
        )}
      </section>

      <section className={`view ${activeView === 'questions' ? 'active' : ''}`}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
          <h2 className="section-title" style={{ margin: 0 }}>All questions</h2>
          <button className="btn primary" onClick={openModal}>+ Log a question</button>
        </div>
        <div className="filter-bar">
          <select value={filterTopic} onChange={(event) => setFilterTopic(event.target.value)}>
            <option value="">All topics</option>
            {Array.from(new Set(questions.map((question) => question.topic))).map((topic) => (
              <option key={topic} value={topic}>{topic}</option>
            ))}
          </select>
          <select value={filterDiff} onChange={(event) => setFilterDiff(event.target.value)}>
            <option value="">All difficulties</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
          <select value={filterStatus} onChange={(event) => setFilterStatus(event.target.value)}>
            <option value="">All stages</option>
            <option value="New">New</option>
            <option value="Reading">Reading</option>
            <option value="Attempting">Attempting</option>
            <option value="Hint used">Hint used</option>
            <option value="Solved">Solved</option>
          </select>
        </div>
        {filteredQuestions.length === 0 ? (
          <div className="empty">No questions to show yet.</div>
        ) : (
          filteredQuestions.map((question) => (
            <div key={question.id} className="qcard">
              <div className="qcard-top">
                <div>
                  <h3><a href={question.link} target="_blank" rel="noreferrer">{question.title}</a></h3>
                  <div className="meta-row">
                    <span className={`tag ${question.difficulty.toLowerCase()}`}>{question.difficulty}</span>
                    <span className="tag plain">{question.topic}</span>
                    <span className="tag plain">Box {question.box}</span>
                  </div>
                  {question.notes ? <div style={{ marginTop: '8px', color: 'var(--ink-soft)' }}>{question.notes}</div> : null}
                </div>
                <div className="qcard-actions">
                  <button className="icon-btn" type="button" onClick={() => deleteQuestion(question.id)} aria-label="Delete question">✕</button>
                </div>
              </div>
              <div className="stage-select">
                <label style={{ display: 'inline-block', marginRight: '8px' }}>Stage</label>
                <select value={question.stage} onChange={(event) => updateQuestionStage(question.id, event.target.value as Stage)} style={{ width: 'auto', minWidth: '140px' }}>
                  <option>New</option>
                  <option>Reading</option>
                  <option>Attempting</option>
                  <option>Hint used</option>
                  <option>Solved</option>
                </select>
              </div>
            </div>
          ))
        )}
      </section>

      {showModal && (
        <div className="modal-bg open" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(event) => event.stopPropagation()}>
            <h2>Log a question</h2>
            <form className="stack" onSubmit={handleAddQuestion}>
              <div className="field-row">
                <div className="field">
                  <label>Title</label>
                  <input required value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} />
                </div>
                <div className="field">
                  <label>Topic</label>
                  <input value={draft.topic} onChange={(event) => setDraft({ ...draft, topic: event.target.value })} />
                </div>
              </div>
              <div className="field-row">
                <div className="field">
                  <label>Difficulty</label>
                  <select value={draft.difficulty} onChange={(event) => setDraft({ ...draft, difficulty: event.target.value as Difficulty })}>
                    <option>Easy</option>
                    <option>Medium</option>
                    <option>Hard</option>
                  </select>
                </div>
                <div className="field">
                  <label>Status</label>
                  <select value={draft.stage} onChange={(event) => setDraft({ ...draft, stage: event.target.value as Stage })}>
                    <option>New</option>
                    <option>Reading</option>
                    <option>Attempting</option>
                    <option>Hint used</option>
                    <option>Solved</option>
                  </select>
                </div>
              </div>
              <div className="field">
                <label>Link</label>
                <input value={draft.link} onChange={(event) => setDraft({ ...draft, link: event.target.value })} />
              </div>
              <div className="field">
                <label>Notes</label>
                <textarea value={draft.notes} onChange={(event) => setDraft({ ...draft, notes: event.target.value })} />
              </div>
              <div className="field-row">
                <button className="btn primary" type="submit">Save</button>
                <button className="btn ghost" type="button" onClick={() => setShowModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <footer className="note">A DSA revision tracker, run on a Leitner box.</footer>
    </div>
  );
}

export default App;
