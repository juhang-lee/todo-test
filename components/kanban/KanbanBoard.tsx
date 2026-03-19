"use client";

import { useState, useRef } from "react";
import { KanbanProvider, useKanban } from "@/contexts/KanbanContext";
import { KanbanColumn } from "@/components/KanbanColumn";
import { SearchFilterBar } from "@/components/SearchFilterBar";
import { KanbanFilter } from "@/types/kanban";

const DEFAULT_FILTER: KanbanFilter = { query: "", priority: null, tags: [] };

function KanbanBoardInner() {
  const { state, dispatch } = useKanban();
  const [filter, setFilter] = useState<KanbanFilter>(DEFAULT_FILTER);

  const handleAddCard = (columnId: string, title: string) => {
    dispatch({ type: "ADD_CARD", payload: { columnId, title } });
  };

  const handleDeleteCard = (id: string) => {
    dispatch({ type: "DELETE_CARD", payload: { id } });
  };

  // Tracks the card currently being moved down (for multi-step moves via button clicks)
  const movingCardRef = useRef<string | null>(null);

  const handleMoveCardDown = (cardId: string, columnId: string) => {
    const col = state.columns.find((c) => c.id === columnId);
    if (!col) return;

    const clickedIdx = col.cardIds.indexOf(cardId);
    if (clickedIdx === -1) return;

    // If the clicked card displaced a card that was being moved (it's just behind the clicked card),
    // continue moving the original card instead of the displaced one.
    let targetCardId = cardId;
    if (
      movingCardRef.current !== null &&
      movingCardRef.current !== cardId &&
      clickedIdx + 1 < col.cardIds.length &&
      col.cardIds[clickedIdx + 1] === movingCardRef.current
    ) {
      targetCardId = movingCardRef.current;
    }

    const idx = col.cardIds.indexOf(targetCardId);
    if (idx === -1 || idx >= col.cardIds.length - 1) {
      movingCardRef.current = null;
      return;
    }

    movingCardRef.current = targetCardId;
    const overCardId = col.cardIds[idx + 1];
    dispatch({ type: "REORDER_CARD", payload: { columnId, cardId: targetCardId, overCardId } });
  };

  // 렌더 중 파생 계산 — effect 불필요
  const getFilteredCards = (cardIds: string[]) => {
    const tagSet = filter.tags.length > 0 ? new Set(filter.tags) : null;
    return cardIds
      .map((id) => state.cards[id])
      .filter((card) => {
        if (!card) return false;
        if (filter.query && !card.title.includes(filter.query)) return false;
        if (filter.priority && card.priority !== filter.priority) return false;
        if (tagSet && !filter.tags.every((t) => card.tags.includes(t))) return false;
        return true;
      });
  };

  // 필터에서 선택 가능한 태그 목록 (전체 카드 기반)
  const allTags = Array.from(
    new Set(Object.values(state.cards).flatMap((c) => c.tags))
  );

  const hasAnyCards = state.columns.some(
    (col) => getFilteredCards(col.cardIds).length > 0
  );

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <SearchFilterBar
        filter={filter}
        onFilterChange={setFilter}
        availableTags={allTags}
      />
      <main className="flex-1">
        {!hasAnyCards && (filter.query || filter.priority || filter.tags.length > 0) ? (
          <div className="flex items-center justify-center p-8 text-muted-foreground">
            검색 결과가 없습니다
          </div>
        ) : null}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
          {state.columns.map((column) => {
            const cards = getFilteredCards(column.cardIds);
            return (
              <KanbanColumn
                key={column.id}
                column={column}
                cards={cards}
                onAddCard={handleAddCard}
                onDeleteCard={handleDeleteCard}
                onMoveCardDown={handleMoveCardDown}
              />
            );
          })}
        </div>
      </main>
    </div>
  );
}

export default function KanbanBoard() {
  return (
    <KanbanProvider>
      <KanbanBoardInner />
    </KanbanProvider>
  );
}
