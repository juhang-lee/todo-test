export interface Subtask {
  id: string;
  text: string;
  done: boolean;
}

export interface Card {
  id: string;
  title: string;
  description?: string;
  priority: 'High' | 'Medium' | 'Low' | null;
  tags: string[];
  subtasks: Subtask[];
}

export interface Column {
  id: string;
  name: string;
  cardIds: string[];
}

export interface KanbanFilter {
  query: string;
  priority: 'High' | 'Medium' | 'Low' | null;
  tags: string[];
}

export interface KanbanState {
  columns: Column[];
  cards: Record<string, Card>;
  darkMode: boolean;
}

export type Action =
  | { type: 'ADD_CARD'; payload: { columnId: string; title: string } }
  | { type: 'UPDATE_CARD'; payload: { id: string; changes: Partial<Omit<Card, 'id'>> } }
  | { type: 'DELETE_CARD'; payload: { id: string } }
  | { type: 'MOVE_CARD'; payload: { cardId: string; fromColumnId: string; toColumnId: string } }
  | { type: 'REORDER_CARD'; payload: { columnId: string; cardId: string; overCardId: string } }
  | { type: 'ADD_SUBTASK'; payload: { cardId: string; text: string } }
  | { type: 'TOGGLE_SUBTASK'; payload: { cardId: string; subtaskId: string } }
  | { type: 'DELETE_SUBTASK'; payload: { cardId: string; subtaskId: string } }
  | { type: 'RENAME_COLUMN'; payload: { columnId: string; name: string } }
  | { type: 'TOGGLE_DARK_MODE' };
