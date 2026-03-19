"use client";

import {
  createContext,
  useContext,
  useReducer,
  type Dispatch,
  type ReactNode,
} from "react";
import { KanbanState, Action } from "@/types/kanban";
import { kanbanReducer } from "@/reducers/kanbanReducer";
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
  const [state, dispatch] = useReducer(kanbanReducer, INITIAL_STATE);

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
