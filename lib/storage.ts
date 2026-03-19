import { KanbanState } from "@/types/kanban";

const KEY = "kanban-board:v1";

// Map cache — localStorage 읽기를 캐싱하여 반복 I/O 방지
const storageCache = new Map<string, string | null>();

function getLocalStorage(key: string): string | null {
  if (!storageCache.has(key)) {
    try {
      storageCache.set(key, localStorage.getItem(key));
    } catch {
      return null;
    }
  }
  return storageCache.get(key) ?? null;
}

function setLocalStorage(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
    storageCache.set(key, value);
  } catch {
    // incognito, quota exceeded, disabled 환경에서 무시
  }
}

export function saveBoard(state: KanbanState): void {
  // 최소 필드만 저장 (cards, columns, darkMode)
  const payload = {
    columns: state.columns,
    cards: state.cards,
    darkMode: state.darkMode,
  };
  setLocalStorage(KEY, JSON.stringify(payload));
}

export function clearStorageCache(): void {
  storageCache.clear();
}

export function loadBoard(): KanbanState | null {
  try {
    const raw = getLocalStorage(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as KanbanState;
    return parsed;
  } catch {
    return null;
  }
}
