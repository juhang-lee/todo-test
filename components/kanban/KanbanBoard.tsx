"use client";

import { useKanban } from "@/contexts/KanbanContext";
import { KanbanColumn } from "@/components/KanbanColumn";

export default function KanbanBoard() {
  const { state, dispatch } = useKanban();

  const handleAddCard = (columnId: string, title: string) => {
    dispatch({ type: "ADD_CARD", payload: { columnId, title } });
  };

  const handleDeleteCard = (id: string) => {
    dispatch({ type: "DELETE_CARD", payload: { id } });
  };

  const handleOpenDetail = (_id: string) => {
    // CardDetailPanel — Task 7에서 구현
  };

  const handleMoveCardDown = (cardId: string, columnId: string) => {
    const col = state.columns.find((c) => c.id === columnId);
    if (!col) return;
    const idx = col.cardIds.indexOf(cardId);
    if (idx === -1 || idx >= col.cardIds.length - 1) return;
    const overCardId = col.cardIds[idx + 1];
    dispatch({ type: "REORDER_CARD", payload: { columnId, cardId, overCardId } });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
      {state.columns.map((column) => {
        const cards = column.cardIds
          .map((id) => state.cards[id])
          .filter(Boolean);
        return (
          <KanbanColumn
            key={column.id}
            column={column}
            cards={cards}
            onAddCard={handleAddCard}
            onDeleteCard={handleDeleteCard}
            onOpenDetail={handleOpenDetail}
            onMoveCardDown={handleMoveCardDown}
          />
        );
      })}
    </div>
  );
}
