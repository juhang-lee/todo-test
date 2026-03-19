"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { KanbanFilter } from "@/types/kanban";
import { useKanban } from "@/contexts/KanbanContext";

interface SearchFilterBarProps {
  filter: KanbanFilter;
  onFilterChange: (filter: KanbanFilter) => void;
  availableTags?: string[];
}

const DEFAULT_FILTER: KanbanFilter = { query: "", priority: null, tags: [] };

export function SearchFilterBar({ filter, onFilterChange, availableTags = [] }: SearchFilterBarProps) {
  const { state, dispatch } = useKanban();
  const [showPriorityList, setShowPriorityList] = useState(false);
  const [showTagList, setShowTagList] = useState(false);

  const handleReset = () => {
    onFilterChange(DEFAULT_FILTER);
    setShowPriorityList(false);
    setShowTagList(false);
  };

  return (
    <div className="flex flex-wrap items-center gap-2 px-4 py-2 border-b">
      <Input
        role="searchbox"
        placeholder="검색..."
        value={filter.query}
        onChange={(e) => onFilterChange({ ...filter, query: e.target.value })}
        className="max-w-xs"
        aria-label="검색"
      />

      {/* 우선순위 필터 — custom combobox */}
      <div className="relative">
        <button
          role="combobox"
          aria-label="우선순위"
          aria-haspopup="listbox"
          aria-expanded={showPriorityList}
          onClick={() => { setShowPriorityList((v) => !v); setShowTagList(false); }}
          className="h-8 rounded-lg border border-input bg-transparent px-2 text-sm"
        >
          {filter.priority || "우선순위"}
        </button>
        {showPriorityList && (
          <ul
            role="listbox"
            className="absolute z-50 mt-1 min-w-full rounded-md border bg-popover shadow-md"
          >
            <li
              role="option"
              aria-selected={!filter.priority}
              className="cursor-pointer px-3 py-1.5 text-sm hover:bg-accent"
              onClick={() => { onFilterChange({ ...filter, priority: null }); setShowPriorityList(false); }}
            >
              전체
            </li>
            {(["High", "Medium", "Low"] as const).map((p) => (
              <li
                key={p}
                role="option"
                aria-selected={filter.priority === p}
                className="cursor-pointer px-3 py-1.5 text-sm hover:bg-accent"
                onClick={() => { onFilterChange({ ...filter, priority: p }); setShowPriorityList(false); }}
              >
                {p}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 태그 필터 — custom combobox */}
      <div className="relative">
        <button
          role="combobox"
          aria-label="태그"
          aria-haspopup="listbox"
          aria-expanded={showTagList}
          onClick={() => { setShowTagList((v) => !v); setShowPriorityList(false); }}
          className="h-8 rounded-lg border border-input bg-transparent px-2 text-sm"
        >
          {filter.tags[0] || "태그"}
        </button>
        {showTagList && (
          <ul
            role="listbox"
            className="absolute z-50 mt-1 min-w-full rounded-md border bg-popover shadow-md"
          >
            <li
              role="option"
              aria-selected={filter.tags.length === 0}
              className="cursor-pointer px-3 py-1.5 text-sm hover:bg-accent"
              onClick={() => { onFilterChange({ ...filter, tags: [] }); setShowTagList(false); }}
            >
              전체
            </li>
            {availableTags.map((tag) => (
              <li
                key={tag}
                role="option"
                aria-selected={filter.tags.includes(tag)}
                className="cursor-pointer px-3 py-1.5 text-sm hover:bg-accent"
                onClick={() => { onFilterChange({ ...filter, tags: [tag] }); setShowTagList(false); }}
              >
                {tag}
              </li>
            ))}
          </ul>
        )}
      </div>

      <Button variant="ghost" size="sm" onClick={handleReset} aria-label="필터 초기화">
        필터 초기화
      </Button>

      <div className="flex items-center gap-2 ml-auto">
        <Switch
          id="dark-mode"
          role="switch"
          aria-label="다크모드"
          aria-checked={state.darkMode}
          checked={state.darkMode}
          onCheckedChange={() => dispatch({ type: "TOGGLE_DARK_MODE" })}
        />
        <Label htmlFor="dark-mode" className="text-sm">다크모드</Label>
      </div>
    </div>
  );
}
