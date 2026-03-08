# Prismate Design Principles (GRIP-Method Identity)

## 1. Core Philosophy: Extreme Technical Sobriety

Prismate is built for focus. We avoid "UI noise" and "creative invention".

- **Mantine is Truth**: If a component isn't in Mantine, it doesn't exist.
- **GRIP First**: Every pixel supports the Cycle (Agenda -> Tasks -> Reflection).

---

## 2. The 7 Principles in Prismate

### 1. Hierarchy (Semantic Mantine)

- **Zero-Tailwind Typography**: Use only Mantine components for text.
- **Title Orders**:
  - `order={1}`: Page level (one per page).
  - `order={2}`: Major sections/cards.
  - `order={3}`: Sub-sections inside cards.
- **Action Hierarchy**:
  - `variant="filled"`: Only for the single "True North" action on a screen (e.g., "Nieuwe Taak").
  - `variant="light"` or `variant="outline"`: Secondary actions.
  - `variant="subtle"`: Tertiary/Utility actions (sync, filter).

### 2. Progressive Disclosure (Contextual Clarity)

- **Task Details**: Keep task rows clean. Use drawers or modals for metadata (labels, projects, reminders).
- **Navigation**: Sidebar for high-level "Work Contexts", not for micro-management.

### 3. Consistency (Standardized Tokens)

- **Radius**: Use `radius="md"` for standard elements (Paper, Button) and `radius="xl"` for circular elements (Avatar, specialized Badges).
- **Spacing**: Use Mantine tokens (`xs`, `sm`, `md`, `lg`, `xl`) in `Stack` and `Group`. Hardcoded pixel values are prohibited.

### 4. Contrast (Visual Depth)

- **The Inset Content Look**:
  - Main Background: `gray.0` (var(--mantine-color-gray-0)).
  - Interactive Surfaces: `white`.
  - This creates the Microsoft/SaaS "premium" depth.

### 5. Alignment & Flow

- **Grid Strategy**: Use `flex` and `grid` patterns that allow content to "stretch" where appropriate (e.g., Agenda views).
- **Interactive States**: Every clickable element must have a hover state (usually a subtle background shift).

### 6. Iconography (Heroicons)

- **Variant**: `@heroicons/react/24/outline`.
- **Size**:
  - Sidebar: `size-[20px]`.
  - Inline Actions: `size-4` / `size-5`.
- **Logic**: Use the same icon for the same concept everywhere (e.g., `BriefcaseIcon` for Projects).

### 7. Accessibility

- All inputs must have associated `<Text>` labels.
- Color alone is never the only indicator of status.

---

## 3. The "No-Invention" Rules

1. **No custom CSS**: Use Mantine props (`bg`, `p`, `m`, `fw`) or functional Tailwind classes (`flex`, `grid`, `hidden`) inside `classNames` only if props fail.
2. **Standardized Colors**: Use theme colors (`indigo`, `gray`, `red`) - never hex codes in code.
