"use client";

import { useRef, useState } from "react";
import { Column, Card as CardType } from "@/types/kanban";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldDescription } from "@/components/ui/field";
import { KanbanCard } from "@/components/KanbanCard";
import { useKanban } from "@/contexts/KanbanContext";

interface KanbanColumnProps {
  column: Column;
  cards: CardType[];
  onAddCard: (columnId: string, title: string) => void;
  onDeleteCard: (id: string) => void;
  onMoveCardDown: (cardId: string, columnId: string) => void;
}

export function KanbanColumn({
  column,
  cards,
  onAddCard,
  onDeleteCard,
  onMoveCardDown,
}: KanbanColumnProps) {
  const { dispatch } = useKanban();
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [isEditingName, setIsEditingName] = useState(false);
  const nameRef = useRef(column.name);
  const [error, setError] = useState("");

  const handleConfirm = () => {
    if (!title.trim()) {
      setError("제목을 입력해주세요");
      return;
    }
    onAddCard(column.id, title.trim());
    setTitle("");
    setError("");
    setIsAdding(false);
  };

  const handleCancel = () => {
    setTitle("");
    setError("");
    setIsAdding(false);
  };

  const handleNameBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const newName = e.target.value.trim();
    if (newName) {
      dispatch({ type: "RENAME_COLUMN", payload: { columnId: column.id, name: newName } });
    }
    setIsEditingName(false);
  };

  return (
    <section role="region" aria-label={column.name} className="flex flex-col gap-2">
      {isEditingName ? (
        <Input
          aria-label="컬럼 이름"
          defaultValue={column.name}
          autoFocus
          className="h-7 text-sm font-semibold"
          onBlur={handleNameBlur}
          onKeyDown={(e) => {
            if (e.key === "Enter") e.currentTarget.blur();
            if (e.key === "Escape") setIsEditingName(false);
          }}
        />
      ) : (
        <h2
          className="text-sm font-semibold px-1 cursor-pointer"
          onDoubleClick={() => {
            nameRef.current = column.name;
            setIsEditingName(true);
          }}
        >
          {column.name}
        </h2>
      )}
      <ScrollArea className="flex-1 max-h-[calc(100vh-12rem)]">
        <div className="flex flex-col gap-2 pr-3">
          {cards.map((card) => (
            <KanbanCard
              key={card.id}
              card={card}
              columnId={column.id}
              onDelete={onDeleteCard}
              onMoveDown={(id) => onMoveCardDown(id, column.id)}
            />
          ))}
        </div>
      </ScrollArea>

      {isAdding ? (
        <div className="flex flex-col gap-2 px-1">
          <Field data-invalid={error ? true : undefined}>
            <FieldLabel htmlFor={`add-card-${column.id}`} className="sr-only">
              제목
            </FieldLabel>
            <Input
              id={`add-card-${column.id}`}
              aria-label="제목"
              aria-invalid={error ? true : undefined}
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (error) setError("");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleConfirm();
                if (e.key === "Escape") handleCancel();
              }}
              autoFocus
              placeholder="카드 제목"
            />
            {error && (
              <FieldDescription className="text-destructive">{error}</FieldDescription>
            )}
          </Field>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleConfirm} aria-label="확인">
              확인
            </Button>
            <Button size="sm" variant="ghost" onClick={handleCancel} aria-label="취소">
              취소
            </Button>
          </div>
        </div>
      ) : (
        <Button
          variant="ghost"
          className="w-full justify-start text-muted-foreground"
          onClick={() => setIsAdding(true)}
          aria-label="카드 추가"
        >
          + 카드 추가
        </Button>
      )}
    </section>
  );
}
