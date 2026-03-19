"use client";

import { useState } from "react";
import { KanbanFilter } from "@/types/kanban";
import { SearchFilterBar } from "@/components/SearchFilterBar";

const DEFAULT_FILTER: KanbanFilter = { query: "", priority: null, tags: [] };

export function SearchFilterBarWrapper() {
  const [filter, setFilter] = useState<KanbanFilter>(DEFAULT_FILTER);
  return <SearchFilterBar filter={filter} onFilterChange={setFilter} />;
}
