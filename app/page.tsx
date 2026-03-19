import { KanbanProvider } from "@/contexts/KanbanContext";
import KanbanBoard from "@/components/kanban/KanbanBoard";
import { SearchFilterBarWrapper } from "@/components/SearchFilterBarWrapper";

export default function Page() {
  return (
    <KanbanProvider>
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <SearchFilterBarWrapper />
        <main className="flex-1">
          <KanbanBoard />
        </main>
      </div>
    </KanbanProvider>
  );
}
