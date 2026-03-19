/**
 * kanban.spec.test.tsx
 * spec.yaml KANBAN-001~027 수용 기준 테스트
 * 현재 구현 없음 → 모든 테스트 Red(실패) 상태
 */
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, beforeEach } from "vitest";

// 아직 구현되지 않은 컴포넌트 — import 시 실패하여 Red 상태 유도
import KanbanBoard from "@/components/kanban/KanbanBoard";

// ── KANBAN-001: 카드 추가 - 제목 입력 ──────────────────────────
describe("KANBAN-001: 카드 추가 - 제목 입력", () => {
  it("'할 일' 컬럼에 '회의록 작성' 카드가 표시된다", async () => {
    const user = userEvent.setup();
    render(<KanbanBoard />);

    const column = screen.getByRole("region", { name: "할 일" });
    await user.click(within(column).getByRole("button", { name: /카드 추가/i }));
    await user.type(screen.getByRole("textbox", { name: /제목/i }), "회의록 작성");
    await user.click(screen.getByRole("button", { name: /확인/i }));

    expect(within(column).getByText("회의록 작성")).toBeInTheDocument();
    expect(within(column).getAllByRole("article")).toHaveLength(1);
  });

  it("'진행 중' 컬럼에 'API 연동' 카드가 표시된다", async () => {
    const user = userEvent.setup();
    render(<KanbanBoard />);

    const column = screen.getByRole("region", { name: "진행 중" });
    await user.click(within(column).getByRole("button", { name: /카드 추가/i }));
    await user.type(screen.getByRole("textbox", { name: /제목/i }), "API 연동");
    await user.click(screen.getByRole("button", { name: /확인/i }));

    expect(within(column).getByText("API 연동")).toBeInTheDocument();
    expect(within(column).getAllByRole("article")).toHaveLength(1);
  });
});

// ── KANBAN-002: 카드 추가 - 제목 빈 값 검증 ────────────────────
describe("KANBAN-002: 카드 추가 - 제목 빈 값 검증", () => {
  it("빈 제목으로 확인 시 오류 메시지가 표시되고 카드는 추가되지 않는다", async () => {
    const user = userEvent.setup();
    render(<KanbanBoard />);

    const column = screen.getByRole("region", { name: "할 일" });
    await user.click(within(column).getByRole("button", { name: /카드 추가/i }));
    await user.click(screen.getByRole("button", { name: /확인/i }));

    expect(screen.getByText("제목을 입력해주세요")).toBeInTheDocument();
    expect(within(column).queryAllByRole("article")).toHaveLength(0);
  });
});

// ── KANBAN-003: 카드 제목 인라인 편집 ─────────────────────────
describe("KANBAN-003: 카드 제목 인라인 편집", () => {
  it("'회의록 작성' 클릭 후 '기획 미팅 정리'로 수정하면 카드에 반영된다", async () => {
    const user = userEvent.setup();
    render(<KanbanBoard />);

    // 카드 추가
    const column = screen.getByRole("region", { name: "할 일" });
    await user.click(within(column).getByRole("button", { name: /카드 추가/i }));
    await user.type(screen.getByRole("textbox", { name: /제목/i }), "회의록 작성");
    await user.click(screen.getByRole("button", { name: /확인/i }));

    // 인라인 편집
    await user.click(within(column).getByText("회의록 작성"));
    const input = screen.getByRole("textbox", { name: /카드 제목/i });
    await user.clear(input);
    await user.type(input, "기획 미팅 정리");
    await user.tab();

    expect(within(column).getByText("기획 미팅 정리")).toBeInTheDocument();
  });
});

// ── KANBAN-004: 카드 우선순위 설정 ────────────────────────────
describe("KANBAN-004: 카드 우선순위 설정", () => {
  it("더보기 패널에서 'High' 선택 시 카드에 'High' 배지가 표시된다", async () => {
    const user = userEvent.setup();
    render(<KanbanBoard />);

    const column = screen.getByRole("region", { name: "할 일" });
    await user.click(within(column).getByRole("button", { name: /카드 추가/i }));
    await user.type(screen.getByRole("textbox", { name: /제목/i }), "테스트 카드");
    await user.click(screen.getByRole("button", { name: /확인/i }));

    await user.click(within(column).getByRole("button", { name: /더보기/i }));
    await user.click(screen.getByRole("button", { name: /^High$/i }));

    expect(within(column).getByText("High")).toBeInTheDocument();
  });

  it("더보기 패널에서 'Low' 선택 시 카드에 'Low' 배지가 표시된다", async () => {
    const user = userEvent.setup();
    render(<KanbanBoard />);

    const column = screen.getByRole("region", { name: "할 일" });
    await user.click(within(column).getByRole("button", { name: /카드 추가/i }));
    await user.type(screen.getByRole("textbox", { name: /제목/i }), "테스트 카드");
    await user.click(screen.getByRole("button", { name: /확인/i }));

    await user.click(within(column).getByRole("button", { name: /더보기/i }));
    await user.click(screen.getByRole("button", { name: /^Low$/i }));

    expect(within(column).getByText("Low")).toBeInTheDocument();
  });
});

// ── KANBAN-005: 카드 태그 추가 ────────────────────────────────
describe("KANBAN-005: 카드 태그 추가", () => {
  it("더보기 패널에서 '#업무' 태그 추가 시 카드에 태그가 표시된다", async () => {
    const user = userEvent.setup();
    render(<KanbanBoard />);

    const column = screen.getByRole("region", { name: "할 일" });
    await user.click(within(column).getByRole("button", { name: /카드 추가/i }));
    await user.type(screen.getByRole("textbox", { name: /제목/i }), "테스트 카드");
    await user.click(screen.getByRole("button", { name: /확인/i }));

    await user.click(within(column).getByRole("button", { name: /더보기/i }));
    await user.type(screen.getByRole("textbox", { name: /태그/i }), "#업무");
    await user.click(screen.getByRole("button", { name: /태그 추가/i }));

    expect(screen.getByText("#업무")).toBeInTheDocument();
  });

  it("더보기 패널에서 '#개인' 태그 추가 시 카드에 태그가 표시된다", async () => {
    const user = userEvent.setup();
    render(<KanbanBoard />);

    const column = screen.getByRole("region", { name: "할 일" });
    await user.click(within(column).getByRole("button", { name: /카드 추가/i }));
    await user.type(screen.getByRole("textbox", { name: /제목/i }), "테스트 카드");
    await user.click(screen.getByRole("button", { name: /확인/i }));

    await user.click(within(column).getByRole("button", { name: /더보기/i }));
    await user.type(screen.getByRole("textbox", { name: /태그/i }), "#개인");
    await user.click(screen.getByRole("button", { name: /태그 추가/i }));

    expect(screen.getByText("#개인")).toBeInTheDocument();
  });
});

// ── KANBAN-006: 카드 삭제 ─────────────────────────────────────
describe("KANBAN-006: 카드 삭제", () => {
  it("첫 번째 카드 삭제 버튼 클릭 시 해당 카드가 사라지고 1개만 남는다", async () => {
    const user = userEvent.setup();
    render(<KanbanBoard />);

    const column = screen.getByRole("region", { name: "할 일" });

    // 카드 2개 추가
    for (const title of ["회의록 작성", "두 번째 카드"]) {
      await user.click(within(column).getByRole("button", { name: /카드 추가/i }));
      await user.type(screen.getByRole("textbox", { name: /제목/i }), title);
      await user.click(screen.getByRole("button", { name: /확인/i }));
    }

    const cards = within(column).getAllByRole("article");
    expect(cards).toHaveLength(2);

    // 첫 번째 카드 삭제
    await user.click(within(cards[0]).getByRole("button", { name: /삭제/i }));

    expect(within(column).queryByText("회의록 작성")).not.toBeInTheDocument();
    expect(within(column).getAllByRole("article")).toHaveLength(1);
  });
});

// ── KANBAN-007: 카드를 다른 컬럼으로 이동 ─────────────────────
describe("KANBAN-007: 카드를 다른 컬럼으로 이동", () => {
  it("'회의록 작성' 카드를 '진행 중' 컬럼으로 이동하면 해당 컬럼에 표시된다", async () => {
    const user = userEvent.setup();
    render(<KanbanBoard />);

    const todoColumn = screen.getByRole("region", { name: "할 일" });
    await user.click(within(todoColumn).getByRole("button", { name: /카드 추가/i }));
    await user.type(screen.getByRole("textbox", { name: /제목/i }), "회의록 작성");
    await user.click(screen.getByRole("button", { name: /확인/i }));

    // 컬럼 이동 버튼(더보기 패널 또는 드래그 대리 UI)
    await user.click(within(todoColumn).getByRole("button", { name: /더보기/i }));
    await user.click(screen.getByRole("button", { name: /컬럼 이동/i }));
    await user.click(screen.getByRole("option", { name: "진행 중" }));

    const inProgressColumn = screen.getByRole("region", { name: "진행 중" });
    expect(within(inProgressColumn).getAllByRole("article")).toHaveLength(1);
    expect(within(todoColumn).queryAllByRole("article")).toHaveLength(0);
  });
});

// ── KANBAN-008: 같은 컬럼 내 카드 순서 변경 ───────────────────
describe("KANBAN-008: 같은 컬럼 내 카드 순서 변경", () => {
  it("'A' 카드를 'C' 아래로 이동하면 순서가 B, C, A가 된다", async () => {
    const user = userEvent.setup();
    render(<KanbanBoard />);

    const column = screen.getByRole("region", { name: "할 일" });

    for (const title of ["A", "B", "C"]) {
      await user.click(within(column).getByRole("button", { name: /카드 추가/i }));
      await user.type(screen.getByRole("textbox", { name: /제목/i }), title);
      await user.click(screen.getByRole("button", { name: /확인/i }));
    }

    const cards = within(column).getAllByRole("article");
    const cardA = cards[0];
    const cardC = cards[2];

    // 키보드 드래그 시뮬레이션: A 카드의 드래그 핸들로 C 아래로 이동
    await user.click(within(cardA).getByRole("button", { name: /드래그/i }));
    await user.keyboard("{Space}");
    await user.keyboard("{ArrowDown}");
    await user.keyboard("{ArrowDown}");
    await user.keyboard("{Space}");

    const reorderedCards = within(column).getAllByRole("article");
    expect(reorderedCards[0]).toHaveTextContent("B");
    expect(reorderedCards[1]).toHaveTextContent("C");
    expect(reorderedCards[2]).toHaveTextContent("A");
  });
});

// ── KANBAN-009: 서브태스크 추가 ───────────────────────────────
describe("KANBAN-009: 서브태스크 추가", () => {
  it("서브태스크 입력란에 '자료 조사' 입력 후 추가하면 체크리스트에 표시된다", async () => {
    const user = userEvent.setup();
    render(<KanbanBoard />);

    const column = screen.getByRole("region", { name: "할 일" });
    await user.click(within(column).getByRole("button", { name: /카드 추가/i }));
    await user.type(screen.getByRole("textbox", { name: /제목/i }), "테스트 카드");
    await user.click(screen.getByRole("button", { name: /확인/i }));

    await user.click(within(column).getByRole("button", { name: /더보기/i }));
    await user.type(screen.getByRole("textbox", { name: /서브태스크/i }), "자료 조사");
    await user.click(screen.getByRole("button", { name: /서브태스크 추가/i }));

    expect(screen.getByText("자료 조사")).toBeInTheDocument();
    expect(screen.getAllByRole("checkbox")).toHaveLength(1);
  });
});

// ── KANBAN-010: 서브태스크 진행률 표시 ───────────────────────
describe("KANBAN-010: 서브태스크 진행률 표시", () => {
  it("서브태스크 3개 중 1개 체크 시 '1/3' 진행률이 표시된다", async () => {
    const user = userEvent.setup();
    render(<KanbanBoard />);

    const column = screen.getByRole("region", { name: "할 일" });
    await user.click(within(column).getByRole("button", { name: /카드 추가/i }));
    await user.type(screen.getByRole("textbox", { name: /제목/i }), "테스트 카드");
    await user.click(screen.getByRole("button", { name: /확인/i }));

    await user.click(within(column).getByRole("button", { name: /더보기/i }));
    for (const text of ["항목1", "항목2", "항목3"]) {
      await user.type(screen.getByRole("textbox", { name: /서브태스크/i }), text);
      await user.click(screen.getByRole("button", { name: /서브태스크 추가/i }));
    }

    const checkboxes = screen.getAllByRole("checkbox");
    await user.click(checkboxes[0]);

    expect(screen.getByText("1/3")).toBeInTheDocument();
  });

  it("서브태스크 3개 모두 체크 시 '3/3' 진행률이 표시된다", async () => {
    const user = userEvent.setup();
    render(<KanbanBoard />);

    const column = screen.getByRole("region", { name: "할 일" });
    await user.click(within(column).getByRole("button", { name: /카드 추가/i }));
    await user.type(screen.getByRole("textbox", { name: /제목/i }), "테스트 카드");
    await user.click(screen.getByRole("button", { name: /확인/i }));

    await user.click(within(column).getByRole("button", { name: /더보기/i }));
    for (const text of ["항목1", "항목2", "항목3"]) {
      await user.type(screen.getByRole("textbox", { name: /서브태스크/i }), text);
      await user.click(screen.getByRole("button", { name: /서브태스크 추가/i }));
    }

    for (const checkbox of screen.getAllByRole("checkbox")) {
      await user.click(checkbox);
    }

    expect(screen.getByText("3/3")).toBeInTheDocument();
  });
});

// ── KANBAN-011: 서브태스크 삭제 ───────────────────────────────
describe("KANBAN-011: 서브태스크 삭제", () => {
  it("'자료 조사' 서브태스크 삭제 버튼 클릭 시 체크리스트에서 사라진다", async () => {
    const user = userEvent.setup();
    render(<KanbanBoard />);

    const column = screen.getByRole("region", { name: "할 일" });
    await user.click(within(column).getByRole("button", { name: /카드 추가/i }));
    await user.type(screen.getByRole("textbox", { name: /제목/i }), "테스트 카드");
    await user.click(screen.getByRole("button", { name: /확인/i }));

    await user.click(within(column).getByRole("button", { name: /더보기/i }));
    await user.type(screen.getByRole("textbox", { name: /서브태스크/i }), "자료 조사");
    await user.click(screen.getByRole("button", { name: /서브태스크 추가/i }));

    const subtaskItem = screen.getByText("자료 조사").closest("li")!;
    await user.click(within(subtaskItem).getByRole("button", { name: /삭제/i }));

    expect(screen.queryByText("자료 조사")).not.toBeInTheDocument();
  });
});

// ── KANBAN-012: 제목 실시간 검색 ─────────────────────────────
describe("KANBAN-012: 제목 실시간 검색", () => {
  it("'회의' 입력 시 '회의록 작성', '팀 회의 준비'만 표시되고 'API 연동'은 숨겨진다", async () => {
    const user = userEvent.setup();
    render(<KanbanBoard />);

    // 카드 3개 추가
    for (const [col, title] of [
      ["할 일", "회의록 작성"],
      ["할 일", "팀 회의 준비"],
      ["할 일", "API 연동"],
    ]) {
      const column = screen.getByRole("region", { name: col });
      await user.click(within(column).getByRole("button", { name: /카드 추가/i }));
      await user.type(screen.getByRole("textbox", { name: /제목/i }), title);
      await user.click(screen.getByRole("button", { name: /확인/i }));
    }

    await user.type(screen.getByRole("searchbox"), "회의");

    expect(screen.getByText("회의록 작성")).toBeInTheDocument();
    expect(screen.getByText("팀 회의 준비")).toBeInTheDocument();
    expect(screen.queryByText("API 연동")).not.toBeInTheDocument();
  });

  it("'xyz' 입력 시 카드가 0개이고 '검색 결과가 없습니다' 메시지가 표시된다", async () => {
    const user = userEvent.setup();
    render(<KanbanBoard />);

    const column = screen.getByRole("region", { name: "할 일" });
    await user.click(within(column).getByRole("button", { name: /카드 추가/i }));
    await user.type(screen.getByRole("textbox", { name: /제목/i }), "회의록 작성");
    await user.click(screen.getByRole("button", { name: /확인/i }));

    await user.type(screen.getByRole("searchbox"), "xyz");

    expect(screen.getByText("검색 결과가 없습니다")).toBeInTheDocument();
    expect(screen.queryAllByRole("article")).toHaveLength(0);
  });
});

// ── KANBAN-013: 검색어 삭제 시 전체 카드 복원 ─────────────────
describe("KANBAN-013: 검색어 삭제 시 전체 카드 복원", () => {
  it("검색창을 비우면 모든 카드(3개)가 다시 표시된다", async () => {
    const user = userEvent.setup();
    render(<KanbanBoard />);

    const column = screen.getByRole("region", { name: "할 일" });
    for (const title of ["회의록 작성", "팀 회의 준비", "API 연동"]) {
      await user.click(within(column).getByRole("button", { name: /카드 추가/i }));
      await user.type(screen.getByRole("textbox", { name: /제목/i }), title);
      await user.click(screen.getByRole("button", { name: /확인/i }));
    }

    const searchbox = screen.getByRole("searchbox");
    await user.type(searchbox, "회의");
    await user.clear(searchbox);

    expect(screen.getAllByRole("article")).toHaveLength(3);
  });
});

// ── KANBAN-014: 우선순위 필터 ─────────────────────────────────
describe("KANBAN-014: 우선순위 필터", () => {
  it("'High' 필터 선택 시 High 우선순위 카드 1개만 표시된다", async () => {
    const user = userEvent.setup();
    render(<KanbanBoard />);

    const column = screen.getByRole("region", { name: "할 일" });

    // High 카드
    await user.click(within(column).getByRole("button", { name: /카드 추가/i }));
    await user.type(screen.getByRole("textbox", { name: /제목/i }), "High 카드");
    await user.click(screen.getByRole("button", { name: /확인/i }));
    await user.click(within(column).getAllByRole("button", { name: /더보기/i })[0]);
    await user.click(screen.getByRole("button", { name: /^High$/i }));
    await user.keyboard("{Escape}");

    // Medium 카드
    await user.click(within(column).getByRole("button", { name: /카드 추가/i }));
    await user.type(screen.getByRole("textbox", { name: /제목/i }), "Medium 카드");
    await user.click(screen.getByRole("button", { name: /확인/i }));
    await user.click(within(column).getAllByRole("button", { name: /더보기/i })[1]);
    await user.click(screen.getByRole("button", { name: /^Medium$/i }));
    await user.keyboard("{Escape}");

    // Low 카드
    await user.click(within(column).getByRole("button", { name: /카드 추가/i }));
    await user.type(screen.getByRole("textbox", { name: /제목/i }), "Low 카드");
    await user.click(screen.getByRole("button", { name: /확인/i }));
    await user.click(within(column).getAllByRole("button", { name: /더보기/i })[2]);
    await user.click(screen.getByRole("button", { name: /^Low$/i }));
    await user.keyboard("{Escape}");

    // 필터 적용
    await user.click(screen.getByRole("combobox", { name: /우선순위/i }));
    await user.click(screen.getByRole("option", { name: "High" }));

    expect(screen.getAllByRole("article")).toHaveLength(1);
    expect(screen.getByText("High 카드")).toBeInTheDocument();
  });
});

// ── KANBAN-015: 태그 필터 ─────────────────────────────────────
describe("KANBAN-015: 태그 필터", () => {
  it("'#업무' 태그 필터 선택 시 해당 태그 카드 2개만 표시된다", async () => {
    const user = userEvent.setup();
    render(<KanbanBoard />);

    const column = screen.getByRole("region", { name: "할 일" });

    const addCardWithTag = async (title: string, tag: string) => {
      await user.click(within(column).getByRole("button", { name: /카드 추가/i }));
      await user.type(screen.getByRole("textbox", { name: /제목/i }), title);
      await user.click(screen.getByRole("button", { name: /확인/i }));
      const cards = within(column).getAllByRole("article");
      await user.click(within(cards[cards.length - 1]).getByRole("button", { name: /더보기/i }));
      await user.type(screen.getByRole("textbox", { name: /태그/i }), tag);
      await user.click(screen.getByRole("button", { name: /태그 추가/i }));
      await user.keyboard("{Escape}");
    };

    await addCardWithTag("업무 카드1", "#업무");
    await addCardWithTag("업무 카드2", "#업무");
    await addCardWithTag("개인 카드", "#개인");

    await user.click(screen.getByRole("combobox", { name: /태그/i }));
    await user.click(screen.getByRole("option", { name: "#업무" }));

    expect(screen.getAllByRole("article")).toHaveLength(2);
  });
});

// ── KANBAN-016: 우선순위 + 태그 복합 필터 ────────────────────
describe("KANBAN-016: 우선순위 + 태그 복합 필터", () => {
  it("'High' + '#업무' 복합 필터 시 두 조건을 모두 만족하는 카드 1개만 표시된다", async () => {
    const user = userEvent.setup();
    render(<KanbanBoard />);

    const column = screen.getByRole("region", { name: "할 일" });

    const addCardWithPriorityAndTag = async (title: string, priority: string, tag: string) => {
      await user.click(within(column).getByRole("button", { name: /카드 추가/i }));
      await user.type(screen.getByRole("textbox", { name: /제목/i }), title);
      await user.click(screen.getByRole("button", { name: /확인/i }));
      const cards = within(column).getAllByRole("article");
      await user.click(within(cards[cards.length - 1]).getByRole("button", { name: /더보기/i }));
      await user.click(screen.getByRole("button", { name: new RegExp(`^${priority}$`, "i") }));
      await user.type(screen.getByRole("textbox", { name: /태그/i }), tag);
      await user.click(screen.getByRole("button", { name: /태그 추가/i }));
      await user.keyboard("{Escape}");
    };

    await addCardWithPriorityAndTag("High 업무", "High", "#업무");
    await addCardWithPriorityAndTag("High 개인", "High", "#개인");
    await addCardWithPriorityAndTag("Low 업무", "Low", "#업무");

    await user.click(screen.getByRole("combobox", { name: /우선순위/i }));
    await user.click(screen.getByRole("option", { name: "High" }));
    await user.click(screen.getByRole("combobox", { name: /태그/i }));
    await user.click(screen.getByRole("option", { name: "#업무" }));

    expect(screen.getAllByRole("article")).toHaveLength(1);
    expect(screen.getByText("High 업무")).toBeInTheDocument();
  });
});

// ── KANBAN-017: 컬럼 이름 더블클릭 편집 ──────────────────────
describe("KANBAN-017: 컬럼 이름 더블클릭 편집", () => {
  it("'할 일' 헤더 더블클릭 후 '백로그'로 수정하면 헤더가 변경된다", async () => {
    const user = userEvent.setup();
    render(<KanbanBoard />);

    const column = screen.getByRole("region", { name: "할 일" });
    const header = within(column).getByRole("heading", { name: "할 일" });
    await user.dblClick(header);

    const input = screen.getByRole("textbox", { name: /컬럼 이름/i });
    await user.clear(input);
    await user.type(input, "백로그");
    await user.tab();

    expect(screen.getByRole("heading", { name: "백로그" })).toBeInTheDocument();
  });
});

// ── KANBAN-018: 컬럼 이름 빈 값 방지 ─────────────────────────
describe("KANBAN-018: 컬럼 이름 빈 값 방지", () => {
  it("컬럼 이름 편집 중 빈 값으로 포커스 해제 시 기존 이름 '할 일'이 유지된다", async () => {
    const user = userEvent.setup();
    render(<KanbanBoard />);

    const column = screen.getByRole("region", { name: "할 일" });
    const header = within(column).getByRole("heading", { name: "할 일" });
    await user.dblClick(header);

    const input = screen.getByRole("textbox", { name: /컬럼 이름/i });
    await user.clear(input);
    await user.tab();

    expect(screen.getByRole("heading", { name: "할 일" })).toBeInTheDocument();
  });
});

// ── KANBAN-019: 다크모드 토글 ─────────────────────────────────
describe("KANBAN-019: 다크모드 토글", () => {
  it("다크모드 토글 클릭 시 UI가 다크모드로 전환되고 토글이 활성 상태가 된다", async () => {
    const user = userEvent.setup();
    render(<KanbanBoard />);

    const toggle = screen.getByRole("switch", { name: /다크모드/i });
    await user.click(toggle);

    expect(document.documentElement).toHaveClass("dark");
    expect(toggle).toHaveAttribute("aria-checked", "true");
  });
});

// ── KANBAN-020: 다크모드 새로고침 후 유지 ────────────────────
describe("KANBAN-020: 다크모드 새로고침 후 유지", () => {
  it("다크모드 활성화 후 localStorage를 통해 다크모드가 유지된다", async () => {
    const user = userEvent.setup();
    const { unmount } = render(<KanbanBoard />);

    const toggle = screen.getByRole("switch", { name: /다크모드/i });
    await user.click(toggle);
    unmount();

    render(<KanbanBoard />);
    expect(document.documentElement).toHaveClass("dark");
    expect(screen.getByRole("switch", { name: /다크모드/i })).toHaveAttribute("aria-checked", "true");
  });
});

// ── KANBAN-021: 카드 데이터 새로고침 후 복원 ─────────────────
describe("KANBAN-021: 카드 데이터 새로고침 후 복원", () => {
  it("'진행 중'에 카드 추가 후 재렌더링 시 카드가 유지된다", async () => {
    const user = userEvent.setup();
    const { unmount } = render(<KanbanBoard />);

    const column = screen.getByRole("region", { name: "진행 중" });
    await user.click(within(column).getByRole("button", { name: /카드 추가/i }));
    await user.type(screen.getByRole("textbox", { name: /제목/i }), "회의록 작성");
    await user.click(screen.getByRole("button", { name: /확인/i }));
    unmount();

    render(<KanbanBoard />);
    const restoredColumn = screen.getByRole("region", { name: "진행 중" });
    expect(within(restoredColumn).getByText("회의록 작성")).toBeInTheDocument();
  });
});

// ── KANBAN-022: 컬럼 이름 새로고침 후 복원 ───────────────────
describe("KANBAN-022: 컬럼 이름 새로고침 후 복원", () => {
  it("'할 일' 컬럼을 '백로그'로 변경 후 재렌더링 시 이름이 유지된다", async () => {
    const user = userEvent.setup();
    const { unmount } = render(<KanbanBoard />);

    const column = screen.getByRole("region", { name: "할 일" });
    await user.dblClick(within(column).getByRole("heading", { name: "할 일" }));
    const input = screen.getByRole("textbox", { name: /컬럼 이름/i });
    await user.clear(input);
    await user.type(input, "백로그");
    await user.tab();
    unmount();

    render(<KanbanBoard />);
    expect(screen.getByRole("heading", { name: "백로그" })).toBeInTheDocument();
  });
});

// ── KANBAN-023: 더보기 패널 열기 - 편집 필드 표시 ────────────
describe("KANBAN-023: 더보기 패널 열기 - 편집 필드 표시", () => {
  it("카드의 더보기 버튼 클릭 시 패널에 설명, 우선순위, 태그, 서브태스크 필드가 표시된다", async () => {
    const user = userEvent.setup();
    render(<KanbanBoard />);

    const column = screen.getByRole("region", { name: "할 일" });
    await user.click(within(column).getByRole("button", { name: /카드 추가/i }));
    await user.type(screen.getByRole("textbox", { name: /제목/i }), "테스트 카드");
    await user.click(screen.getByRole("button", { name: /확인/i }));

    await user.click(within(column).getByRole("button", { name: /더보기/i }));

    expect(screen.getByRole("textbox", { name: /설명/i })).toBeInTheDocument();
    expect(screen.getByRole("group", { name: /우선순위/i })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: /태그/i })).toBeInTheDocument();
    expect(screen.getByRole("list", { name: /서브태스크/i })).toBeInTheDocument();
  });
});

// ── KANBAN-024: 드래그&드롭 이동 위치 새로고침 후 유지 ────────
describe("KANBAN-024: 드래그&드롭 이동 위치 새로고침 후 유지", () => {
  it("'완료' 컬럼으로 이동한 카드가 재렌더링 후에도 '완료' 컬럼에 있다", async () => {
    const user = userEvent.setup();
    const { unmount } = render(<KanbanBoard />);

    const todoColumn = screen.getByRole("region", { name: "할 일" });
    await user.click(within(todoColumn).getByRole("button", { name: /카드 추가/i }));
    await user.type(screen.getByRole("textbox", { name: /제목/i }), "회의록 작성");
    await user.click(screen.getByRole("button", { name: /확인/i }));

    await user.click(within(todoColumn).getByRole("button", { name: /더보기/i }));
    await user.click(screen.getByRole("button", { name: /컬럼 이동/i }));
    await user.click(screen.getByRole("option", { name: "완료" }));
    unmount();

    render(<KanbanBoard />);
    const doneColumn = screen.getByRole("region", { name: "완료" });
    expect(within(doneColumn).getByText("회의록 작성")).toBeInTheDocument();
    expect(within(screen.getByRole("region", { name: "할 일" })).queryAllByRole("article")).toHaveLength(0);
  });
});

// ── KANBAN-025: 필터 초기화 후 전체 카드 복원 ────────────────
describe("KANBAN-025: 필터 초기화 후 전체 카드 복원", () => {
  it("'High' 필터 적용 후 초기화 시 카드 3개가 모두 표시된다", async () => {
    const user = userEvent.setup();
    render(<KanbanBoard />);

    const column = screen.getByRole("region", { name: "할 일" });

    for (const [title, priority] of [
      ["High 카드", "High"],
      ["Medium 카드", "Medium"],
      ["Low 카드", "Low"],
    ]) {
      await user.click(within(column).getByRole("button", { name: /카드 추가/i }));
      await user.type(screen.getByRole("textbox", { name: /제목/i }), title);
      await user.click(screen.getByRole("button", { name: /확인/i }));
      const cards = within(column).getAllByRole("article");
      await user.click(within(cards[cards.length - 1]).getByRole("button", { name: /더보기/i }));
      await user.click(screen.getByRole("button", { name: new RegExp(`^${priority}$`, "i") }));
      await user.keyboard("{Escape}");
    }

    await user.click(screen.getByRole("combobox", { name: /우선순위/i }));
    await user.click(screen.getByRole("option", { name: "High" }));
    expect(screen.getAllByRole("article")).toHaveLength(1);

    await user.click(screen.getByRole("button", { name: /필터 초기화/i }));
    expect(screen.getAllByRole("article")).toHaveLength(3);
  });
});

// ── KANBAN-026: 카드 제목 인라인 편집 - 빈 값 방지 ───────────
describe("KANBAN-026: 카드 제목 인라인 편집 - 빈 값 방지", () => {
  it("인라인 편집 중 빈 값으로 포커스 해제 시 기존 제목 '회의록 작성'이 유지된다", async () => {
    const user = userEvent.setup();
    render(<KanbanBoard />);

    const column = screen.getByRole("region", { name: "할 일" });
    await user.click(within(column).getByRole("button", { name: /카드 추가/i }));
    await user.type(screen.getByRole("textbox", { name: /제목/i }), "회의록 작성");
    await user.click(screen.getByRole("button", { name: /확인/i }));

    await user.click(within(column).getByText("회의록 작성"));
    const input = screen.getByRole("textbox", { name: /카드 제목/i });
    await user.clear(input);
    await user.tab();

    expect(within(column).getByText("회의록 작성")).toBeInTheDocument();
  });
});

// ── KANBAN-027: 다크모드에서 라이트모드로 복귀 ────────────────
describe("KANBAN-027: 다크모드에서 라이트모드로 복귀", () => {
  it("다크모드 상태에서 토글 클릭 시 라이트모드로 전환되고 토글이 비활성 상태가 된다", async () => {
    const user = userEvent.setup();
    render(<KanbanBoard />);

    const toggle = screen.getByRole("switch", { name: /다크모드/i });

    // 다크모드 활성화
    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-checked", "true");

    // 라이트모드로 복귀
    await user.click(toggle);

    expect(document.documentElement).not.toHaveClass("dark");
    expect(toggle).toHaveAttribute("aria-checked", "false");
  });
});
