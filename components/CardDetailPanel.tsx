"use client";

import { useState } from "react";
import { Card as CardType } from "@/types/kanban";
import { useKanban } from "@/contexts/KanbanContext";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Toggle } from "@/components/ui/toggle";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface CardDetailPanelProps {
  card: CardType;
  fromColumnId: string;
  open: boolean;
  onClose: () => void;
}

export function CardDetailPanel({ card, fromColumnId, open, onClose }: CardDetailPanelProps) {
  const { state, dispatch } = useKanban();
  const [tagInput, setTagInput] = useState("");
  const [subtaskInput, setSubtaskInput] = useState("");
  const [showMoveList, setShowMoveList] = useState(false);

  const liveCard = state.cards[card.id] ?? card;

  const handleDescriptionBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    dispatch({ type: "UPDATE_CARD", payload: { id: card.id, changes: { description: e.target.value } } });
  };

  const handlePriorityChange = (value: string) => {
    dispatch({
      type: "UPDATE_CARD",
      payload: { id: card.id, changes: { priority: (value as "High" | "Medium" | "Low") || null } },
    });
  };

  const handleAddTag = () => {
    const tag = tagInput.trim();
    if (!tag || liveCard.tags.includes(tag)) return;
    dispatch({ type: "UPDATE_CARD", payload: { id: card.id, changes: { tags: [...liveCard.tags, tag] } } });
    setTagInput("");
  };

  const handleMoveCard = (toColumnId: string) => {
    dispatch({ type: "MOVE_CARD", payload: { cardId: card.id, fromColumnId, toColumnId } });
    onClose();
  };

  const handleAddSubtask = () => {
    const text = subtaskInput.trim();
    if (!text) return;
    dispatch({ type: "ADD_SUBTASK", payload: { cardId: card.id, text } });
    setSubtaskInput("");
  };

  const handleToggleSubtask = (subtaskId: string) => {
    dispatch({ type: "TOGGLE_SUBTASK", payload: { cardId: card.id, subtaskId } });
  };

  const handleDeleteSubtask = (subtaskId: string) => {
    dispatch({ type: "DELETE_SUBTASK", payload: { cardId: card.id, subtaskId } });
  };

  const otherColumns = state.columns.filter((col) => col.id !== fromColumnId);

  return (
    <Sheet open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose(); }}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{liveCard.title}</SheetTitle>
        </SheetHeader>

        <div className="flex flex-col gap-4 p-4">
          {/* 설명 */}
          <div className="flex flex-col gap-1">
            <Label htmlFor={`desc-${card.id}`}>설명</Label>
            <Textarea
              id={`desc-${card.id}`}
              aria-label="설명"
              defaultValue={liveCard.description ?? ""}
              onBlur={handleDescriptionBlur}
              placeholder="설명을 입력하세요"
            />
          </div>

          {/* 우선순위 */}
          <div className="flex flex-col gap-1">
            <Label>우선순위</Label>
            <div role="group" aria-label="우선순위" className="flex gap-1">
              {(["High", "Medium", "Low"] as const).map((p) => (
                <Toggle
                  key={p}
                  pressed={liveCard.priority === p}
                  onPressedChange={(pressed) => handlePriorityChange(pressed ? p : "")}
                  variant="outline"
                  size="sm"
                >
                  {p}
                </Toggle>
              ))}
            </div>
          </div>

          {/* 태그 */}
          <div className="flex flex-col gap-2">
            <Label htmlFor={`tag-${card.id}`}>태그</Label>
            <div className="flex gap-2">
              <Input
                id={`tag-${card.id}`}
                aria-label="태그"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleAddTag(); }}
                placeholder="#태그"
              />
              <Button variant="outline" onClick={handleAddTag}>
                태그 추가
              </Button>
            </div>
          </div>

          {/* 컬럼 이동 */}
          {otherColumns.length > 0 && (
            <div className="flex flex-col gap-1">
              <Label>컬럼 이동</Label>
              <div className="relative">
                <Button
                  variant="outline"
                  size="sm"
                  aria-label="컬럼 이동"
                  aria-haspopup="listbox"
                  aria-expanded={showMoveList}
                  onClick={() => setShowMoveList((v) => !v)}
                >
                  컬럼 이동
                </Button>
                {showMoveList && (
                  <ul
                    role="listbox"
                    className="absolute z-50 mt-1 min-w-full rounded-md border bg-popover shadow-md"
                  >
                    {otherColumns.map((col) => (
                      <li
                        key={col.id}
                        role="option"
                        aria-selected={false}
                        className="cursor-pointer px-3 py-1.5 text-sm hover:bg-accent"
                        onClick={() => handleMoveCard(col.id)}
                      >
                        {col.name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}

          {/* 서브태스크 */}
          <div className="flex flex-col gap-2">
            <Label htmlFor={`subtask-${card.id}`}>서브태스크</Label>
            <div className="flex gap-2">
              <Input
                id={`subtask-${card.id}`}
                aria-label="서브태스크"
                value={subtaskInput}
                onChange={(e) => setSubtaskInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleAddSubtask(); }}
                placeholder="서브태스크 추가"
              />
              <Button variant="outline" onClick={handleAddSubtask}>
                서브태스크 추가
              </Button>
            </div>
            <ul aria-label="서브태스크" className="flex flex-col gap-1">
              {liveCard.subtasks.map((st) => (
                <li key={st.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    role="checkbox"
                    checked={st.done}
                    onChange={() => handleToggleSubtask(st.id)}
                    aria-label={st.text}
                  />
                  <span className="text-sm flex-1">{st.text}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-6"
                    aria-label="삭제"
                    onClick={() => handleDeleteSubtask(st.id)}
                  />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
