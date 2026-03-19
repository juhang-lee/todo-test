"use client";

import { Card as CardType } from "@/types/kanban";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

interface KanbanCardProps {
  card: CardType;
  onDelete: (id: string) => void;
  onOpenDetail: (id: string) => void;
  onMoveDown: (id: string) => void;
}

export function KanbanCard({ card, onDelete, onOpenDetail, onMoveDown }: KanbanCardProps) {
  const doneCount = card.subtasks.filter((s) => s.done).length;
  const totalCount = card.subtasks.length;

  return (
    <article className="rounded-lg border bg-card p-3 flex flex-col gap-2 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <span className="text-sm font-medium">{card.title}</span>
        <div className="flex gap-1 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            aria-label="더보기"
            onClick={() => onOpenDetail(card.id)}
            className="size-7"
          />
          <Button
            variant="ghost"
            size="icon"
            aria-label="삭제"
            onClick={() => onDelete(card.id)}
            className="size-7"
          />
          <Button
            variant="ghost"
            size="icon"
            aria-label="아래로 이동"
            onClick={() => onMoveDown(card.id)}
            className="size-7"
          />
        </div>
      </div>

      {card.priority !== null && (
        <Badge variant="secondary">{card.priority}</Badge>
      )}

      {card.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {card.tags.map((tag) => (
            <Badge key={tag} variant="outline">{tag}</Badge>
          ))}
        </div>
      )}

      {totalCount > 0 && (
        <div className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground">{doneCount}/{totalCount}</span>
          <Progress value={(doneCount / totalCount) * 100} className="h-1" />
        </div>
      )}
    </article>
  );
}
