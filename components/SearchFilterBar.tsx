"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { KanbanFilter } from "@/types/kanban";
import { useKanban } from "@/contexts/KanbanContext";

interface SearchFilterBarProps {
  filter: KanbanFilter;
  onFilterChange: (filter: KanbanFilter) => void;
}

export function SearchFilterBar({ filter, onFilterChange }: SearchFilterBarProps) {
  const { state, dispatch } = useKanban();

  return (
    <div className="flex items-center gap-4 px-4 py-2 border-b">
      <Input
        role="searchbox"
        placeholder="검색..."
        value={filter.query}
        onChange={(e) => onFilterChange({ ...filter, query: e.target.value })}
        className="max-w-xs"
        aria-label="검색"
      />
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
