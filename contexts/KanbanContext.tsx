"use client";

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  type Dispatch,
  type ReactNode,
} from "react";
import { KanbanState, Action } from "@/types/kanban";
import { kanbanReducer } from "@/reducers/kanbanReducer";
import { saveBoard, loadBoard } from "@/lib/storage";
import { nanoid } from "nanoid";

const INITIAL_STATE: KanbanState = {
  columns: [
    { id: nanoid(), name: "할 일", cardIds: [] },
    { id: nanoid(), name: "진행 중", cardIds: [] },
    { id: nanoid(), name: "완료", cardIds: [] },
  ],
  cards: {},
  darkMode: false,
};

interface KanbanContextValue {
  state: KanbanState;
  dispatch: Dispatch<Action>;
}

const KanbanContext = createContext<KanbanContextValue | null>(null);

export function KanbanProvider({ children }: { children: ReactNode }) {
  // lazy init: localStorage에서 복원, 실패 시 INITIAL_STATE 사용
  const [state, dispatch] = useReducer(
    kanbanReducer,
    undefined,
    () => loadBoard() ?? INITIAL_STATE
  );

  // state 변경 시 자동 저장
  useEffect(() => {
    saveBoard(state);
  }, [state]);

  // 다크모드 DOM 동기화
  useEffect(() => {
    if (state.darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [state.darkMode]);

  return (
    <KanbanContext.Provider value={{ state, dispatch }}>
      {children}
    </KanbanContext.Provider>
  );
}

export function useKanban(): KanbanContextValue {
  const ctx = useContext(KanbanContext);
  if (!ctx) {
    throw new Error("useKanban must be used within a KanbanProvider");
  }
  return ctx;
}
