"use client";

import { Column, Card as CardType } from "@/types/kanban";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { KanbanCard } from "@/components/KanbanCard";

interface KanbanColumnProps {
  column: Column;
  cards: CardType[];
  onAddCard: (columnId: string) => void;
  onDeleteCard: (id: string) => void;
  onOpenDetail: (id: string) => void;
  onMoveCardDown: (cardId: string, columnId: string) => void;
}

export function KanbanColumn({
  column,
  cards,
  onAddCard,
  onDeleteCard,
  onOpenDetail,
  onMoveCardDown,
}: KanbanColumnProps) {
  return (
    <section role="region" aria-label={column.name} className="flex flex-col gap-2">
      <h2 className="text-sm font-semibold px-1">{column.name}</h2>
      <ScrollArea className="flex-1 max-h-[calc(100vh-12rem)]">
        <div className="flex flex-col gap-2 pr-3">
          {cards.map((card) => (
            <KanbanCard
              key={card.id}
              card={card}
              onDelete={onDeleteCard}
              onOpenDetail={onOpenDetail}
              onMoveDown={(id) => onMoveCardDown(id, column.id)}
            />
          ))}
        </div>
      </ScrollArea>
      <Button
        variant="ghost"
        className="w-full justify-start text-muted-foreground"
        onClick={() => onAddCard(column.id)}
        aria-label="카드 추가"
      >
        + 카드 추가
      </Button>
    </section>
  );
}
