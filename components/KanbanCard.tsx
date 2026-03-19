"use client";

import { useState, useRef } from "react";
import { Card as CardType } from "@/types/kanban";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useKanban } from "@/contexts/KanbanContext";
import { CardDetailPanel } from "@/components/CardDetailPanel";

interface KanbanCardProps {
  card: CardType;
  columnId: string;
  onDelete: (id: string) => void;
  onMoveDown: (id: string) => void;
}

export function KanbanCard({ card, columnId, onDelete, onMoveDown }: KanbanCardProps) {
  const { dispatch } = useKanban();
  const doneCount = card.subtasks.filter((s) => s.done).length;
  const totalCount = card.subtasks.length;

  const [isEditing, setIsEditing] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);

  // 편집 중 임시값은 ref로 — 렌더 트리거 불필요
  const editRef = useRef(card.title);

  const handleTitleClick = () => {
    editRef.current = card.title;
    setIsEditing(true);
  };

  const handleTitleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const newTitle = e.target.value.trim();
    if (newTitle) {
      dispatch({ type: "UPDATE_CARD", payload: { id: card.id, changes: { title: newTitle } } });
    }
    setIsEditing(false);
  };

  return (
    <>
      <article className="rounded-lg border bg-card p-3 flex flex-col gap-2 shadow-sm">
        <div className="flex items-start justify-between gap-2">
          {isEditing ? (
            <Input
              aria-label="카드 제목"
              defaultValue={card.title}
              onBlur={handleTitleBlur}
              onKeyDown={(e) => {
                if (e.key === "Enter") e.currentTarget.blur();
                if (e.key === "Escape") setIsEditing(false);
              }}
              autoFocus
              className="h-7 text-sm"
            />
          ) : (
            <span
              className="text-sm font-medium cursor-pointer hover:underline"
              onClick={handleTitleClick}
            >
              {card.title}
            </span>
          )}
          <div className="flex gap-1 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              aria-label="더보기"
              onClick={() => setDetailOpen(true)}
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

      <CardDetailPanel
        card={card}
        fromColumnId={columnId}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
      />
    </>
  );
}
