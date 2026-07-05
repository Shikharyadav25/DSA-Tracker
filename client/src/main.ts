import './styles/main.css';
import './styles/layout.css';
import './styles/components.css';

import { state, loadState, loadSheets } from './services/storage';
import { 
  currentUser, 
  setAuthMode as authTab, 
  submitAuth as authSubmit, 
  logout as authLogout, 
  loginAsGuest, 
  loginWithGoogle, 
  registerAuthObserver 
} from './services/auth';
import { seedStarter, rate } from './components/questionsData';
import { renderSheets, toggleHideSheet, addCustomTopic, resetSheetProgress, updateTopicProgress, switchSheetRoute } from './components/sheetsUI';
import { renderStats, renderStreak, renderTopicBars, renderBoxes, renderRevise, renderQuestions, openModal, closeModal, saveQuestion, deleteQuestion, advanceStage } from './components/dashboardUI';

// Make functions globally available for HTML onclick handlers
declare global {
  interface Window {
    switchAuthTab: (mode: 'login'|'signup') => void;
    submitAuth: () => Promise<void>;
    submitGoogleAuth: () => Promise<void>;
    continueAsGuest: () => Promise<void>;
    logout: () => void;
    switchSheetRoute: (route: string) => void;
    toggleHideSheet: (id: string) => void;
    addCustomTopic: (id: string) => void;
    resetSheetProgress: (id: string) => void;
    updateTopicProgress: (id: string, topic: string, field: 'solved'|'total', val: string, otherVal: number) => void;
    renderQuestions: () => void;
    openModal: (id?: string) => void;
    closeModal: () => void;
    saveQuestion: () => void;
    deleteQuestion: (id: string) => void;
    advanceStage: (q: any, stage: string) => void;
    rate: (q: any, grade: any) => void;
    seedStarter: () => void;
    state: any;
    toggleTheme: () => void;
  }
}

// Theme management
window.toggleTheme = () => {
  const isDark = document.body.classList.toggle('dark-mode');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
};

function initTheme() {
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const isDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
  document.body.classList.toggle('dark-mode', isDark);
}
initTheme();

// Global exposes
window.switchAuthTab = (mode) => {
  authTab(mode);
  const tabLogin = document.getElementById('tab-login');
  const tabSignup = document.getElementById('tab-signup');
  if (tabLogin) tabLogin.classList.toggle('active', mode === 'login');
  if (tabSignup) tabSignup.classList.toggle('active', mode === 'signup');
  
  const signupField = document.getElementById('signup-name-field');
  if (signupField) signupField.style.display = mode === 'signup' ? 'block' : 'none';
  
  const submitBtn = document.getElementById('auth-submit-btn');
  if (submitBtn) submitBtn.textContent = mode === 'login' ? 'Log in' : 'Create account';
  
  const authSwitch = document.getElementById('auth-switch-text');
  if (authSwitch) {
    authSwitch.innerHTML = mode === 'login'
      ? 'New here? <a onclick="switchAuthTab(\'signup\')">Create an account</a>'
      : 'Already have an account? <a onclick="switchAuthTab(\'login\')">Log in</a>';
  }
  const errorEl = document.getElementById('auth-error');
  if (errorEl) errorEl.classList.remove('show');
};

window.submitAuth = async () => {
  const email = (document.getElementById('a-email') as HTMLInputElement)?.value.trim();
  const password = (document.getElementById('a-password') as HTMLInputElement)?.value;
  const name = (document.getElementById('a-name') as HTMLInputElement)?.value.trim();
  
  const errorEl = document.getElementById('auth-error');
  if (errorEl) errorEl.classList.remove('show');
  
  const res = await authSubmit(email, password, name);
  if (!res.success && errorEl) {
    errorEl.textContent = res.error!;
    errorEl.classList.add('show');
  }
};

window.submitGoogleAuth = async () => {
  const errorEl = document.getElementById('auth-error');
  if (errorEl) errorEl.classList.remove('show');
  const res = await loginWithGoogle();
  if (!res.success && errorEl) {
    errorEl.textContent = res.error!;
    errorEl.classList.add('show');
  }
};

window.continueAsGuest = async () => {
  await loginAsGuest();
  // registerAuthObserver will catch localStorage state and log in guest automatically
};

window.logout = async () => {
  await authLogout();
};

// UI Exports
window.switchSheetRoute = switchSheetRoute;
window.toggleHideSheet = toggleHideSheet;
window.addCustomTopic = addCustomTopic;
window.resetSheetProgress = resetSheetProgress;
window.updateTopicProgress = updateTopicProgress;
window.renderQuestions = renderQuestions;
window.openModal = openModal;
window.closeModal = closeModal;
window.saveQuestion = saveQuestion;
window.deleteQuestion = deleteQuestion;
window.advanceStage = advanceStage;
window.rate = rate;
window.seedStarter = seedStarter;
window.state = state;

export function renderAll() {
  renderStats();
  renderStreak();
  renderTopicBars();
  renderBoxes();
  renderRevise();
  renderQuestions();
}

async function showApp() {
  document.getElementById('login-screen')!.style.display = 'none';
  document.getElementById('app-wrap')!.style.display = 'block';
  
  const user = currentUser!;
  const initialsStr = user.name ? user.name.trim().split(/\s+/).map(p=>p[0]).slice(0,2).join('').toUpperCase() : user.email.slice(0,2).toUpperCase();
  
  document.getElementById('user-avatar')!.textContent = initialsStr;
  document.getElementById('user-name')!.textContent = user.name || user.email;
  
  await loadState();
  await loadSheets();
  renderSheets();
  renderAll();
}

// Navigation Tabs
document.querySelectorAll('nav.tabs button').forEach(btn => {
  btn.addEventListener('click', (e) => {
    const target = e.currentTarget as HTMLElement;
    document.querySelectorAll('nav.tabs button').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('section.view').forEach(v => v.classList.remove('active'));
    target.classList.add('active');
    document.getElementById('view-' + target.dataset.view!)?.classList.add('active');
  });
});

async function boot() {
  registerAuthObserver(async (user) => {
    if (user) {
      // Toggle Guest elements
      const guestAlertBanner = document.getElementById('guest-alert-banner');
      if (guestAlertBanner) {
        guestAlertBanner.style.display = user.isGuest ? 'block' : 'none';
      }
      
      const btnQuickAdd = document.getElementById('btn-quick-add');
      const btnSeedStarter = document.getElementById('btn-seed-starter');
      if (btnQuickAdd) btnQuickAdd.style.opacity = user.isGuest ? '0.6' : '1';
      if (btnSeedStarter) btnSeedStarter.style.opacity = user.isGuest ? '0.6' : '1';

      await showApp();
    } else {
      document.getElementById('app-wrap')!.style.display = 'none';
      document.getElementById('login-screen')!.style.display = 'flex';
      
      const emailField = document.getElementById('a-email') as HTMLInputElement;
      const passField = document.getElementById('a-password') as HTMLInputElement;
      const nameField = document.getElementById('a-name') as HTMLInputElement;
      if (emailField) emailField.value = '';
      if (passField) passField.value = '';
      if (nameField) nameField.value = '';
    }
  });
}

// Start
boot();
