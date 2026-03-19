# kanban-todo 구현 계획

## Architecture Decisions

| 결정 사항 | 선택 | 사유 |
|-----------|------|------|
| 드래그&드롭 | `@dnd-kit/core` + `@dnd-kit/sortable` | 접근성(aria-*) 자동 처리, 다중 컨테이너 지원, shadcn kanban 블록 활용 가능 |
| 상태 관리 | `useReducer` + React Context | 외부 의존성 없음, 단일 reducer로 localStorage 동기화 단순화 |
| 더보기 패널 | `Sheet`(desktop) / `Drawer`(mobile) | shadcn 기본 제공, 접근성 Title 자동 포함 |
| 우선순위 선택 | `ToggleGroup` (3개 선택지) | shadcn 규칙: 2–5개 선택지는 ToggleGroup 사용 |
| 다크모드 | `class` 전략 + inline script | 깜빡임 방지: rendering-hydration-no-flicker 적용 |
| localStorage 키 | `kanban-board:v1` | 버전 접두사로 스키마 진화 대비 |

---

## Required Skills

| 스킬 | 용도 |
|------|------|
| `vercel-react-best-practices` | React 리렌더링 최적화, localStorage 스키마, 다크모드 깜빡임 방지 |
| `web-design-guidelines` | 접근성·UX 준수 검토 |
| `shadcn` | 컴포넌트 설치·사용 규칙 준수 |

---

## UI Components

### 설치 필요

| 컴포넌트 | 설치 명령 |
|----------|-----------|
| Sheet | `bunx shadcn@latest add sheet` |
| Drawer | `bunx shadcn@latest add drawer` |
| Progress | `bunx shadcn@latest add progress` |
| ScrollArea | `bunx shadcn@latest add scroll-area` |
| ToggleGroup | `bunx shadcn@latest add toggle-group` |

> 설치 전 `npx shadcn@latest search -q "kanban"` 로 커뮤니티 kanban 블록을 확인한다. 적합한 블록이 있으면 커스텀 컴포넌트 대신 활용한다.

### 커스텀 컴포넌트

| 컴포넌트 | 역할 |
|----------|------|
| `KanbanBoard` | 3컬럼 그리드 + DnDContext 최상위 |
| `KanbanColumn` | SortableContext 컬럼 컨테이너 + 컬럼 헤더(이름 편집) |
| `KanbanCard` | useSortable 카드 + 인라인 제목 편집 + 더보기 트리거 |
| `CardDetailPanel` | Sheet(desktop)/Drawer(mobile) — 설명·우선순위·태그·서브태스크 |
| `SubtaskList` | 체크리스트 + 진행률 Progress |
| `SearchFilterBar` | 검색창 + 우선순위 Select + 태그 Select + 초기화 |

---

## 실행 프로토콜

- 각 task 시작 전, **참조 규칙**에 나열된 파일을 반드시 읽고 규칙을 준수하며 구현한다
- shadcn 컴포넌트 추가 후 항상 `npx shadcn@latest docs <component>` 로 공식 문서를 확인한다

---

## Tasks

### Task 1: 데이터 모델 및 타입 정의 *(spec 테스트 선행 작업)*

- **시나리오**: 전체 (타입 기반)
- **참조 규칙**: 없음 (순수 TypeScript)
- **구현 대상**:
  - `types/kanban.ts` — Card, Column, KanbanState, Action 타입
  - Card: `{ id, title, description?, priority: 'High'|'Medium'|'Low'|null, tags: string[], subtasks: Subtask[], order: number }`
  - Column: `{ id, name, cardIds: string[] }`
  - KanbanState: `{ columns: Column[], cards: Record<string, Card>, darkMode: boolean }`
  - Action 유니온 타입 전체 (ADD_CARD, UPDATE_CARD, DELETE_CARD, MOVE_CARD, REORDER_CARD, ADD_SUBTASK, TOGGLE_SUBTASK, DELETE_SUBTASK, RENAME_COLUMN, TOGGLE_DARK_MODE)
- **수용 기준**:
  - [ ] TypeScript 컴파일 오류 없음
  - [ ] 모든 Action 타입에 payload 타입 명시됨
- **커밋**: `chore: add kanban data model types`

---

### Task 2: Spec 테스트 작성 (*.spec.test.tsx)

- **시나리오**: KANBAN-001~027 전체
- **참조 규칙**: 없음 (테스트 코드)
- **구현 대상**:
  - `app/__tests__/kanban.spec.test.tsx` — spec.yaml의 27개 시나리오를 수용 기준 테스트로 작성
  - `getByRole`, `getByLabelText` 등 구현 구조에 의존하지 않는 안정적 선택자 사용
  - 각 시나리오 ID를 `describe` 블록 제목에 명시 (예: `describe('KANBAN-001')`)
- **수용 기준**:
  - [ ] `bun run test` 실행 시 27개 테스트 모두 Red(실패) 상태
  - [ ] 각 테스트가 spec.yaml examples의 input/expect 값을 직접 사용
- **커밋**: `test: add kanban spec tests (KANBAN-001~027)`

---

### Task 3: KanbanContext + useReducer 상태 관리

- **시나리오**: KANBAN-001, 006, 007, 008, 017 (모든 상태 변경의 기반)
- **참조 규칙**:
  - `rules/rerender-functional-setstate.md` — 이전 상태 기반 업데이트 시 함수형 setState
  - `rules/rerender-lazy-state-init.md` — localStorage에서 초기 상태 로드 시 lazy init 사용
  - `rules/rerender-derived-state-no-effect.md` — 파생 상태는 렌더 중 계산, effect 불필요
- **구현 대상**:
  - `contexts/KanbanContext.tsx` — KanbanProvider, useKanban 훅
  - `reducers/kanbanReducer.ts` — 모든 Action 처리, 불변 업데이트
  - 초기 상태: `{ columns: ['할 일', '진행 중', '완료'], cards: {}, darkMode: false }`
- **수용 기준**:
  - [ ] `useKanban()` 호출 시 `state`, `dispatch` 반환
  - [ ] 모든 Action이 reducer에 처리됨 (switch 완전 처리)
- **커밋**: `feat: add KanbanContext and useReducer state management`

---

### Task 4: localStorage 저장·복원 (KANBAN-021, 022, 024)

- **시나리오**: KANBAN-021, 022, 024
- **참조 규칙**:
  - `rules/client-localstorage-schema.md` — 키 `kanban-board:v1`, try-catch 래핑, 최소 필드만 저장
  - `rules/js-cache-storage.md` — localStorage 읽기 캐싱
  - `rules/rendering-hydration-no-flicker.md` — 다크모드 초기값을 inline script로 적용
- **구현 대상**:
  - `lib/storage.ts` — `saveBoard(state)`, `loadBoard()` (키: `kanban-board:v1`, try-catch)
  - KanbanProvider에서 state 변경 시 자동 저장 (`useEffect` → dispatch 후 저장)
  - 초기 로드 시 `loadBoard()`로 복원 (lazy init)
- **수용 기준**:
  - [ ] 카드 추가 후 새로고침 → 카드 유지 (KANBAN-021)
  - [ ] 컬럼 이름 변경 후 새로고침 → 이름 유지 (KANBAN-022)
  - [ ] 드래그 이동 후 새로고침 → 위치 유지 (KANBAN-024)
- **커밋**: `feat: add localStorage persistence (kanban-board:v1)`

---

### Task 5: 칸반 보드 기본 레이아웃

- **시나리오**: (기본 화면)
- **참조 규칙**:
  - `rules/rerender-no-inline-components.md` — 컴포넌트를 컴포넌트 내부에 정의하지 않음
  - `rules/rendering-conditional-render.md` — 조건부 렌더링은 `&&` 대신 삼항 사용
  - `shadcn/rules/composition.md` — Card, ScrollArea, Separator 올바른 구성
  - `shadcn/rules/styling.md` — semantic color 사용, className으로 레이아웃만
  - `web-design-guidelines` — 접근성 검토 (aria-label, role)
- **구현 대상**:
  - `app/page.tsx` — KanbanProvider 래핑, SearchFilterBar + KanbanBoard 배치
  - `components/KanbanBoard.tsx` — 3컬럼 그리드 (`grid grid-cols-3 gap-4`)
  - `components/KanbanColumn.tsx` — 컬럼 헤더 + ScrollArea 카드 목록 + "카드 추가" 버튼
  - `components/KanbanCard.tsx` — 카드 UI (제목, 우선순위 Badge, 태그 Badge, 진행률 Progress, 더보기/삭제 버튼, **"아래로 이동" 접근성 버튼** [KANBAN-008 테스트 요구])
  - 모바일: `grid grid-cols-1 @md:grid-cols-3` 반응형
- **수용 기준**:
  - [ ] 3개 컬럼이 초기 이름 "할 일 / 진행 중 / 완료"로 표시됨
  - [ ] 카드에 제목, 우선순위 Badge, 태그 Badge, 더보기/삭제 버튼이 표시됨
  - [ ] 모바일(375px)에서 단일 컬럼 스택으로 표시됨
- **커밋**: `feat: add kanban board layout`

---

### Task 6: 카드 CRUD (KANBAN-001, 002, 006)

- **시나리오**: KANBAN-001, 002, 006
- **참조 규칙**:
  - `shadcn/rules/forms.md` — FieldGroup + Field + FieldLabel, 유효성: `data-invalid` on Field + `aria-invalid` on Input
  - `shadcn/rules/composition.md` — Alert 대신 Field validation 패턴 사용
  - `rules/rerender-move-effect-to-event.md` — 폼 제출 로직은 이벤트 핸들러에
- **구현 대상**:
  - KanbanColumn 내 "카드 추가" 버튼 클릭 시 인라인 폼 표시
  - 제목 필수 검증: 빈 값 제출 시 `data-invalid` 상태로 "제목을 입력해주세요" FieldDescription 표시
  - 카드 삭제: 삭제 버튼 클릭 시 DELETE_CARD 디스패치
- **수용 기준**:
  - [ ] "회의록 작성" 입력 → "할 일" 컬럼에 카드 표시 (KANBAN-001)
  - [ ] 빈 제목 제출 → "제목을 입력해주세요" 메시지, 카드 미추가 (KANBAN-002)
  - [ ] 삭제 버튼 클릭 → 카드 제거, 컬럼 카드 수 1 감소 (KANBAN-006)
- **커밋**: `feat: add card CRUD`

---

### Task 7: 카드 인라인 편집 + 더보기 패널 (KANBAN-003, 004, 005, 023, 026)

- **시나리오**: KANBAN-003, 004, 005, 023, 026
- **참조 규칙**:
  - `rules/rerender-use-ref-transient-values.md` — 인라인 편집 중 임시 제목값은 ref 사용
  - `rules/rerender-move-effect-to-event.md` — blur 시 저장 로직은 이벤트 핸들러에
  - `shadcn/rules/composition.md` — Sheet(desktop)/Drawer(mobile)는 SheetTitle/DrawerTitle 필수
  - `shadcn/rules/forms.md` — ToggleGroup으로 우선순위(High/Medium/Low) 선택
- **구현 대상**:
  - `components/KanbanCard.tsx` — 제목 클릭 시 `<input>` 인라인 편집, blur 시 빈 값이면 원래 값 복원 (KANBAN-026)
  - `components/CardDetailPanel.tsx` — Sheet(desktop) + Drawer(mobile)
    - 설명: Textarea
    - 우선순위: ToggleGroup (High/Medium/Low + 미선택)
    - 태그: Input + 추가 버튼 + 제거 가능한 Badge 목록
    - **"컬럼 이동" Select** [KANBAN-007/024 테스트 요구] — 현재 컬럼 외 다른 컬럼으로 이동
  - 우선순위/태그 변경 시 카드에 즉시 반영
- **수용 기준**:
  - [ ] 제목 클릭 → 인라인 input 전환 (KANBAN-003)
  - [ ] "기획 미팅 정리" 수정 후 blur → 카드에 표시 (KANBAN-003)
  - [ ] 더보기 버튼 → 설명/우선순위/태그/서브태스크 모두 표시 (KANBAN-023)
  - [ ] ToggleGroup "High" 선택 → 카드에 "High" Badge 표시 (KANBAN-004)
  - [ ] "#업무" 태그 추가 → 카드에 표시 (KANBAN-005)
  - [ ] 제목 빈 값으로 blur → 기존 제목 복원 (KANBAN-026)
- **커밋**: `feat: add card inline edit and detail panel`

---

### Task 8: 서브태스크 체크리스트 (KANBAN-009, 010, 011)

- **시나리오**: KANBAN-009, 010, 011
- **참조 규칙**:
  - `rules/rerender-functional-setstate.md` — 체크 토글 시 이전 상태 기반 업데이트
  - `shadcn/rules/composition.md` — Progress 컴포넌트 사용 (커스텀 animate-pulse 금지)
  - `shadcn/rules/forms.md` — Checkbox 올바른 사용
- **구현 대상**:
  - `components/SubtaskList.tsx` — 서브태스크 추가 Input, Checkbox 목록, 삭제 버튼
  - KanbanCard에 서브태스크 진행률 Progress + `{checked}/{total}` 텍스트 표시 (서브태스크 있을 때만)
  - ADD_SUBTASK, TOGGLE_SUBTASK, DELETE_SUBTASK Action 구현
- **수용 기준**:
  - [ ] "자료 조사" 추가 → 체크리스트에 표시 (KANBAN-009)
  - [ ] 3개 중 1개 체크 → 카드에 "1/3" 표시 (KANBAN-010)
  - [ ] 3개 중 3개 체크 → "3/3" 표시 (KANBAN-010)
  - [ ] 삭제 버튼 → 항목 제거 (KANBAN-011)
- **커밋**: `feat: add subtask checklist`

---

### Task 9: 드래그&드롭 (KANBAN-007, 008, 024)

- **시나리오**: KANBAN-007, 008, 024
- **참조 규칙**:
  - `rules/advanced-event-handler-refs.md` — DnD 이벤트 핸들러는 ref에 저장
  - `rules/client-passive-event-listeners.md` — 드래그 시 passive 리스너 활용
  - `rules/rendering-usetransition-loading.md` — 드롭 후 UI 업데이트는 startTransition
  - `rules/rerender-use-ref-transient-values.md` — 드래그 중 active item은 ref로 추적
- **구현 대상**:
  - `bun add @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities`
  - KanbanBoard에 `DndContext` + `onDragEnd` 핸들러
  - KanbanColumn에 `SortableContext`
  - KanbanCard에 `useSortable` — 드래그 중 ghost(반투명), 드롭 대상 컬럼 점선 강조
  - onDragEnd: 컬럼 간 이동(MOVE_CARD) / 같은 컬럼 내 순서 변경(REORDER_CARD) 구분 처리
- **수용 기준**:
  - [ ] "할 일" → "진행 중" 드래그 → 컬럼 이동 (KANBAN-007)
  - [ ] 같은 컬럼 내 순서 드래그 → 순서 변경 (KANBAN-008)
  - [ ] 이동 후 새로고침 → 위치 유지 (KANBAN-024)
- **커밋**: `feat: add drag-and-drop with @dnd-kit`

---

### Task 10: 검색·필터 (KANBAN-012, 013, 014, 015, 016, 025)

- **시나리오**: KANBAN-012, 013, 014, 015, 016, 025
- **참조 규칙**:
  - `rules/rerender-derived-state-no-effect.md` — 필터된 카드 목록은 렌더 중 계산 (effect X)
  - `rules/rerender-derived-state.md` — 파생 불리언을 구독
  - `rules/js-combine-iterations.md` — 검색 + 필터를 단일 pass로 처리
  - `rules/js-set-map-lookups.md` — 태그 필터 O(1) 조회에 Set 사용
  - `shadcn/rules/composition.md` — 빈 결과: Empty 컴포넌트 사용
- **구현 대상**:
  - `components/SearchFilterBar.tsx` — 검색 Input, 우선순위 Select, 태그 Select, "전체 초기화" Button
  - 필터 상태: `useReducer` state에 `filter: { query, priority, tags[] }` 추가 또는 local useState
  - `filteredCardIds` — 렌더 중 파생 (검색 + 우선순위 + 태그 단일 pass)
  - 검색 결과 없는 컬럼: Empty 컴포넌트 표시
- **수용 기준**:
  - [ ] "회의" 검색 → 제목에 "회의" 포함 카드만 표시 (KANBAN-012)
  - [ ] "xyz" 검색 → 전체 Empty 상태 + "검색 결과가 없습니다" (KANBAN-012)
  - [ ] 검색 지우기 → 전체 복원 (KANBAN-013)
  - [ ] 우선순위 "High" 필터 → High 카드만 (KANBAN-014)
  - [ ] 태그 "#업무" 필터 → #업무 카드만 (KANBAN-015)
  - [ ] High + #업무 복합 → 두 조건 만족 카드만 (KANBAN-016)
  - [ ] "전체 초기화" → 전체 카드 복원 (KANBAN-025)
- **커밋**: `feat: add search and filter`

---

### Task 11: 컬럼 이름 편집 (KANBAN-017, 018)

- **시나리오**: KANBAN-017, 018
- **참조 규칙**:
  - `rules/rerender-use-ref-transient-values.md` — 편집 중 임시 이름값은 ref
  - `rules/rerender-move-effect-to-event.md` — blur 시 저장은 이벤트 핸들러에
- **구현 대상**:
  - KanbanColumn 헤더: 더블클릭 시 `<input>`으로 전환
  - blur 시: 빈 값이면 원래 이름 복원, 값이 있으면 RENAME_COLUMN 디스패치
- **수용 기준**:
  - [ ] "할 일" 더블클릭 → input 전환 (KANBAN-017)
  - [ ] "백로그" 입력 후 blur → 헤더에 "백로그" 표시 (KANBAN-017)
  - [ ] 빈 값 blur → 기존 이름 "할 일" 유지 (KANBAN-018)
- **커밋**: `feat: add column rename`

---

### Task 12: 다크모드 토글 (KANBAN-019, 020, 027)

- **시나리오**: KANBAN-019, 020, 027
- **참조 규칙**:
  - `rules/rendering-hydration-no-flicker.md` — inline script로 초기 다크모드 적용 (깜빡임 방지)
  - `rules/client-localstorage-schema.md` — 다크모드 상태를 `kanban-board:v1` 키에 포함하여 저장
  - `shadcn/rules/styling.md` — semantic token(`bg-background` 등) 사용, raw color 금지
- **구현 대상**:
  - `app/layout.tsx` — `<html>` 클래스(`dark`) 제어 + inline script (깜빡임 방지)
  - SearchFilterBar에 Switch 컴포넌트 토글 버튼
  - TOGGLE_DARK_MODE Action → `document.documentElement.classList.toggle('dark')` + localStorage 저장
- **수용 기준**:
  - [ ] 토글 클릭 → UI 다크모드 전환, Switch On 상태 (KANBAN-019)
  - [ ] 다크모드 상태 새로고침 → 다크모드 유지, 깜빡임 없음 (KANBAN-020)
  - [ ] 토글 재클릭 → 라이트모드 복귀, Switch Off 상태 (KANBAN-027)
- **커밋**: `feat: add dark mode toggle`

---

## 미결정 사항

- (없음)
