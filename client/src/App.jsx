import { useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import './App.css';

const defaultDSASheets = [
  {
    id: 'striver-dsa',
    title: 'Striver DSA Sheet',
    link: 'https://takeuforward.org/strivers-a2z-dsa-course/strivers-a2z-dsa-course-sheet-2/',
    notes: 'A highly recommended sheet for structured DSA revision.'
  },
  {
    id: 'neetcode',
    title: 'NeetCode Patterns',
    link: 'https://neetcode.io/practice',
    notes: 'Great for problem-solving patterns and interview prep.'
  },
  {
    id: 'algomaster',
    title: 'AlgoMaster DSA Sheet',
    link: 'https://algomaster.io/',
    notes: 'Excellent for curated topic-wise problem lists.'
  }
];

const defaultCPSheets = [
  {
    id: 'tle-cp',
    title: 'TLE Eliminators CP Sheet',
    link: 'https://www.tle-eliminators.com/',
    notes: 'A strong competitive programming roadmap and practice guide.'
  },
  {
    id: 'striver-cp',
    title: 'Striver CP Sheet',
    link: 'https://takeuforward.org/interview-experience/strivers-cp-sheet/',
    notes: 'A practical, topic-focused CP learning path.'
  }
];

function App() {
  const [user, setUser] = useState(null);
  const [authMode, setAuthMode] = useState('login');
  const [authForm, setAuthForm] = useState({ email: '', password: '' });
  const [sheetView, setSheetView] = useState('dsa');
  const [sheetConfig, setSheetConfig] = useState({ dsa: defaultDSASheets, cp: defaultCPSheets });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) {
      setSheetConfig({ dsa: defaultDSASheets, cp: defaultCPSheets });
      return;
    }

    const ref = doc(db, 'users', user.uid, 'preferences', 'sheets');
    const unsubscribe = onSnapshot(ref, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setSheetConfig({
          dsa: data.dsa || defaultDSASheets,
          cp: data.cp || defaultCPSheets
        });
      } else {
        setSheetConfig({ dsa: defaultDSASheets, cp: defaultCPSheets });
      }
    });

    return () => unsubscribe();
  }, [user]);

  const handleAuthSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (authMode === 'signup') {
        await createUserWithEmailAndPassword(auth, authForm.email, authForm.password);
      } else {
        await signInWithEmailAndPassword(auth, authForm.email, authForm.password);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
  };

  const saveSheets = async (nextConfig) => {
    if (!user) return;
    const ref = doc(db, 'users', user.uid, 'preferences', 'sheets');
    await setDoc(ref, { dsa: nextConfig.dsa, cp: nextConfig.cp }, { merge: true });
    setSheetConfig(nextConfig);
  };

  const updateSheetField = async (view, index, field, value) => {
    const nextConfig = {
      ...sheetConfig,
      [view]: sheetConfig[view].map((sheet, sheetIndex) =>
        sheetIndex === index ? { ...sheet, [field]: value } : sheet
      )
    };

    setSheetConfig(nextConfig);
    await saveSheets(nextConfig);
  };

  const resetSheets = async () => {
    const nextConfig = { dsa: defaultDSASheets, cp: defaultCPSheets };
    setSheetConfig(nextConfig);
    await saveSheets(nextConfig);
  };

  const activeSheets = sheetView === 'dsa' ? sheetConfig.dsa : sheetConfig.cp;

  return (
    <div className="app-shell">
      <header className="hero-card">
        <div>
          <p className="eyebrow">MERN + Firebase</p>
          <h1>The Box</h1>
          <p className="subtext">A sheet planner for DSA and competitive programming, with Firebase-backed customization.</p>
        </div>
        {user ? <button className="button secondary" onClick={handleSignOut}>Sign out</button> : null}
      </header>

      {error ? <div className="error">{error}</div> : null}

      {!user ? (
        <section className="card auth-card">
          <div className="tabs">
            <button className={authMode === 'login' ? 'active' : ''} onClick={() => setAuthMode('login')}>Login</button>
            <button className={authMode === 'signup' ? 'active' : ''} onClick={() => setAuthMode('signup')}>Sign up</button>
          </div>
          <form onSubmit={handleAuthSubmit} className="stack">
            <label>Email</label>
            <input value={authForm.email} onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })} />
            <label>Password</label>
            <input type="password" value={authForm.password} onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })} />
            <button className="button primary" disabled={loading}>{loading ? 'Working...' : authMode === 'login' ? 'Login' : 'Create account'}</button>
          </form>
        </section>
      ) : (
        <section className="card">
          <div className="section-heading">
            <div>
              <h2>Sheets</h2>
              <p>Switch between DSA and competitive programming resources, then customize the list to match your plan.</p>
            </div>
            <button className="button secondary" onClick={resetSheets}>Reset to defaults</button>
          </div>

          <div className="tabs">
            <button className={sheetView === 'dsa' ? 'active' : ''} onClick={() => setSheetView('dsa')}>DSA</button>
            <button className={sheetView === 'cp' ? 'active' : ''} onClick={() => setSheetView('cp')}>Competitive Programming</button>
          </div>

          <div className="sheet-grid">
            {activeSheets.map((sheet, index) => (
              <article className="sheet-card" key={sheet.id || `${sheetView}-${index}`}>
                <div className="sheet-header">
                  <h3>{sheet.title}</h3>
                  <span className="pill">{sheetView === 'dsa' ? 'DSA' : 'CP'}</span>
                </div>

                <label>Sheet title</label>
                <input value={sheet.title} onChange={(event) => updateSheetField(sheetView, index, 'title', event.target.value)} />

                <label>Sheet link</label>
                <input value={sheet.link} onChange={(event) => updateSheetField(sheetView, index, 'link', event.target.value)} />

                <label>Notes</label>
                <textarea value={sheet.notes} onChange={(event) => updateSheetField(sheetView, index, 'notes', event.target.value)} />

                <a className="button primary" href={sheet.link} target="_blank" rel="noreferrer">
                  Open sheet
                </a>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default App;
