import { AppState, Question, SheetsData } from '../types/types';

declare global {
  interface Window {
    storage: {
      get(key: string): Promise<{ value: string } | null>;
      set(key: string, value: string): Promise<boolean>;
      delete(key: string): Promise<boolean>;
    };
  }
}

// Ensure the storage shim is installed
(function installStorageShim() {
  if (window.storage) return;
  window.storage = {
    async get(key: string) {
      const value = window.localStorage.getItem(key);
      return value === null ? null : { value };
    },
    async set(key: string, value: string) {
      window.localStorage.setItem(key, value);
      return true;
    },
    async delete(key: string) {
      window.localStorage.removeItem(key);
      return true;
    }
  };
})();

export let currentUid = 'guest';

export function setCurrentUid(uid: string) {
  currentUid = uid;
}

export function getStoreKey() {
  return `dsa-tracker-state-v1-${currentUid}`;
}

export function getSheetsKey() {
  return `dsa-tracker-sheets-v1-${currentUid}`;
}

export const USER_KEY = 'dsa-tracker-user-v1';

export let state: AppState = { questions: [], activityLog: {} };
export let sheetsData: SheetsData = { progress: {}, hidden: {}, custom: {} };

export async function loadState(): Promise<void> {
  try {
    const res = await window.storage.get(getStoreKey());
    if (res && res.value) {
      state = JSON.parse(res.value);
    } else {
      state = { questions: [], activityLog: {} };
    }
  } catch (e) {
    state = { questions: [], activityLog: {} };
  }
}

export async function saveState(): Promise<void> {
  try {
    await window.storage.set(getStoreKey(), JSON.stringify(state));
  } catch (e) {
    console.error('Storage error', e);
  }
}

export async function loadSheets(): Promise<void> {
  try {
    const res = await window.storage.get(getSheetsKey());
    if (res && res.value) {
      sheetsData = JSON.parse(res.value);
    } else {
      sheetsData = { progress: {}, hidden: {}, custom: {} };
    }
  } catch (e) {
    sheetsData = { progress: {}, hidden: {}, custom: {} };
  }
  sheetsData.progress = sheetsData.progress || {};
  sheetsData.hidden = sheetsData.hidden || {};
  sheetsData.custom = sheetsData.custom || {};
}

export async function saveSheets(): Promise<void> {
  try {
    await window.storage.set(getSheetsKey(), JSON.stringify(sheetsData));
  } catch (e) {
    console.error('Storage error', e);
  }
}

export function logActivity(): void {
  const dayKey = (ts: number) => {
    const d = new Date(ts);
    return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
  };
  state.activityLog[dayKey(Date.now())] = true;
}
