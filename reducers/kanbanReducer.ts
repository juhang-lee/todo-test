import { KanbanState, Action, Card, Subtask } from '@/types/kanban';
import { nanoid } from 'nanoid';

export function kanbanReducer(state: KanbanState, action: Action): KanbanState {
  switch (action.type) {
    case 'ADD_CARD': {
      const { columnId, title } = action.payload;
      const id = nanoid();
      const newCard: Card = {
        id,
        title,
        description: undefined,
        priority: null,
        tags: [],
        subtasks: [],
      };
      return {
        ...state,
        cards: { ...state.cards, [id]: newCard },
        columns: state.columns.map((col) =>
          col.id === columnId
            ? { ...col, cardIds: [...col.cardIds, id] }
            : col
        ),
      };
    }

    case 'UPDATE_CARD': {
      const { id, changes } = action.payload;
      const existing = state.cards[id];
      if (!existing) return state;
      return {
        ...state,
        cards: {
          ...state.cards,
          [id]: { ...existing, ...changes },
        },
      };
    }

    case 'DELETE_CARD': {
      const { id } = action.payload;
      const { [id]: _removed, ...remainingCards } = state.cards;
      return {
        ...state,
        cards: remainingCards,
        columns: state.columns.map((col) => ({
          ...col,
          cardIds: col.cardIds.filter((cid) => cid !== id),
        })),
      };
    }

    case 'MOVE_CARD': {
      const { cardId, fromColumnId, toColumnId } = action.payload;
      return {
        ...state,
        columns: state.columns.map((col) => {
          if (col.id === fromColumnId) {
            return { ...col, cardIds: col.cardIds.filter((id) => id !== cardId) };
          }
          if (col.id === toColumnId) {
            return { ...col, cardIds: [...col.cardIds, cardId] };
          }
          return col;
        }),
      };
    }

    case 'REORDER_CARD': {
      const { columnId, cardId, overCardId } = action.payload;
      return {
        ...state,
        columns: state.columns.map((col) => {
          if (col.id !== columnId) return col;
          const ids = [...col.cardIds];
          const oldIndex = ids.findIndex((id) => id === cardId);
          const newIndex = ids.findIndex((id) => id === overCardId);
          if (oldIndex === -1 || newIndex === -1) return col;
          ids.splice(oldIndex, 1);
          ids.splice(newIndex, 0, cardId);
          return { ...col, cardIds: ids };
        }),
      };
    }

    case 'ADD_SUBTASK': {
      const { cardId, text } = action.payload;
      const card = state.cards[cardId];
      if (!card) return state;
      const newSubtask: Subtask = { id: nanoid(), text, done: false };
      return {
        ...state,
        cards: {
          ...state.cards,
          [cardId]: { ...card, subtasks: [...card.subtasks, newSubtask] },
        },
      };
    }

    case 'TOGGLE_SUBTASK': {
      const { cardId, subtaskId } = action.payload;
      const card = state.cards[cardId];
      if (!card) return state;
      return {
        ...state,
        cards: {
          ...state.cards,
          [cardId]: {
            ...card,
            subtasks: card.subtasks.map((st) =>
              st.id === subtaskId ? { ...st, done: !st.done } : st
            ),
          },
        },
      };
    }

    case 'DELETE_SUBTASK': {
      const { cardId, subtaskId } = action.payload;
      const card = state.cards[cardId];
      if (!card) return state;
      return {
        ...state,
        cards: {
          ...state.cards,
          [cardId]: {
            ...card,
            subtasks: card.subtasks.filter((st) => st.id !== subtaskId),
          },
        },
      };
    }

    case 'RENAME_COLUMN': {
      const { columnId, name } = action.payload;
      return {
        ...state,
        columns: state.columns.map((col) =>
          col.id === columnId ? { ...col, name } : col
        ),
      };
    }

    case 'TOGGLE_DARK_MODE': {
      return { ...state, darkMode: !state.darkMode };
    }

    default:
      return state;
  }
}
