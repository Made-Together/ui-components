---
name: tabs
parent: togetheragency-ui
description: Rules for using @togetheragency/ui/tabs — a headless WAI-ARIA tabs primitive with optional motion-driven indicator, autoplay, and progress bar. Use when building segmented controls, settings tabs, dashboard sections, or any discrete labelled content switcher.
---

# Tabs

Headless, accessible tabs primitive. Renders semantic `role="tablist" /
"tab" / "tabpanel"` markup with the full WAI-ARIA tabs pattern wired up:
`aria-selected`, `aria-controls`, `aria-labelledby`, roving `tabIndex`, and
orientation-aware arrow-key navigation. The optional `Tabs.Indicator` rides
on motion's shared `layoutId`, so the active marker slides smoothly between
triggers when selection changes.

## Import

```tsx
import { Tabs } from "@togetheragency/ui/tabs";
```

## When to use

- Settings panels with discrete sections
- Dashboard or analytics tab strips
- Marketing hero with rotating featured tabs (with `autoplay`)
- Form steps where the user can click between sections
- Mobile/segmented controls

## When *not* to use

- Drag/swipe content navigation → use **Carousel**.
- Collapsible Q&A or detail panels → use **Accordion**.
- Auto-progressing content with no user interaction → use a **Carousel**
  with autoplay, or **Marquee** for purely decorative loops.

## Composition tree

```
Tabs.Root
  Tabs.Container               (positioning context for Indicator)
    Tabs.List                  role="tablist"
      Tabs.Trigger id="one"    role="tab"
        children
        [Tabs.Indicator]       (shared layoutId; renders in active trigger)
        [Tabs.Progress]        (only when autoplay; renders in active trigger)
      [Tabs.Separator]
      Tabs.Trigger id="two"
        …
  Tabs.Content id="one"        role="tabpanel"
  Tabs.Content id="two"
```

`Tabs.Container` is required whenever you use `Tabs.Indicator` (it's the
positioning ancestor for the sliding marker). `Tabs.Content` lives outside
`Container`, as a sibling.

## Sub-components

### `Tabs.Root`

```ts
type Props = {
  value?: string;                                  // controlled
  defaultValue?: string;                           // uncontrolled
  onValueChange?: (value: string) => void;
  orientation?: "horizontal" | "vertical";          // default "horizontal"
  disabled?: boolean;                               // disables every trigger
  activationMode?: "automatic" | "manual";          // default "automatic"
  autoplay?: boolean;                               // default false
  autoplayDelay?: number;                           // default 2500 (ms)
  loop?: boolean;                                   // default true; only matters when autoplay
} & React.HTMLAttributes<HTMLDivElement>;
```

- `activationMode: "automatic"` — arrow keys both *move focus and activate*
  the trigger. `"manual"` — arrow keys move focus only; Space/Enter
  activates. Use `"manual"` when activating a tab is expensive (data fetch,
  layout shift).
- `autoplay` advances selection on a timer. Any manual change (click,
  keyboard, controlled value update) re-arms the timer from the new tab.
- `autoplayDelay` is exposed to CSS as `--tabs-autoplay-duration` so
  `Tabs.Progress` and custom CSS can animate in lockstep — no React state
  per frame.
- `loop: true` (default) wraps autoplay at the last trigger.

Data attributes: `data-slot="tabs-root"`, `data-orientation`,
`data-autoplay` (empty marker when autoplay is enabled).

### `Tabs.Container`

```ts
type Props = React.HTMLAttributes<HTMLDivElement>;
```

`position: relative` wrapper around `Tabs.List`. Provides the positioning
context the absolutely-rendered `Tabs.Indicator` needs. Required whenever
you use an indicator; safe to use always.

Data attribute: `data-slot="tabs-container"`.

### `Tabs.List`

```ts
type Props = React.HTMLAttributes<HTMLDivElement>;
```

`role="tablist"` with `aria-orientation` derived from the root. **Pass
`aria-label`** so screen readers can describe the group.

Data attributes: `data-slot="tabs-list"`, `data-orientation`.

### `Tabs.Trigger`

```ts
type Props = {
  id: string;            // required, matches Tabs.Content id
  disabled?: boolean;
} & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "id">;
```

The real `role="tab"` button. Keyboard handlers (arrow, Home, End, Space,
Enter) are wired. Disabled triggers are skipped in keyboard navigation.

Data attributes: `data-slot="tabs-trigger"`,
`data-state="active" | "inactive"`, `data-disabled` (when disabled),
`data-orientation`.

### `Tabs.Indicator`

```ts
type Props = Omit<HTMLMotionProps<"span">, "layoutId">;
```

Optional sliding marker. Rendered **only inside the currently selected
trigger** (the same `layoutId` is reused — motion handles the slide). Place
it as a child of every `Tabs.Trigger`; only the active one will actually
mount. Forward motion props (e.g. `transition`) to tune the slide.

Data attribute: `data-slot="tabs-indicator"`.

### `Tabs.Progress`

```ts
type Props = React.HTMLAttributes<HTMLSpanElement>;
```

Optional CSS-driven progress bar. Renders only when `autoplay` is enabled
and only inside the currently selected trigger. Its `animation-duration`
binds to `--tabs-autoplay-duration` automatically.

Data attribute: `data-slot="tabs-progress"`.

### `Tabs.Separator`

```ts
type Props = React.HTMLAttributes<HTMLSpanElement>;
```

Decorative `<span>` between adjacent triggers. Fades out on the active tab
so the indicator can take its place.

Data attributes: `data-slot="tabs-separator"`.

### `Tabs.Content`

```ts
type Props = {
  id: string;             // required, matches a Trigger id
  forceMount?: boolean;   // default false; keep panel in DOM even when inactive
} & Omit<React.HTMLAttributes<HTMLDivElement>, "id">;
```

`role="tabpanel"`. Inactive panels are unmounted by default. Pass
`forceMount` to keep them in the DOM — required when wrapping with
`AnimatePresence`-style exit animations or when the panel owns expensive
state you don't want to re-create.

Data attributes: `data-slot="tabs-content"`,
`data-state="active" | "inactive"`.

## Controlled vs uncontrolled

```tsx
// Uncontrolled
<Tabs.Root defaultValue="overview">…</Tabs.Root>

// Controlled
const [tab, setTab] = useState("overview");
<Tabs.Root value={tab} onValueChange={setTab}>…</Tabs.Root>
```

## Data-attribute styling reference

| Attribute          | Where                                        | Values                |
| ------------------ | -------------------------------------------- | --------------------- |
| `data-slot`        | every part                                   | identifier per part   |
| `data-state`       | Trigger, Content                             | `"active"` / `"inactive"` |
| `data-disabled`    | Trigger                                      | present when disabled  |
| `data-orientation` | Root, List, Trigger                          | `"horizontal"` / `"vertical"` |
| `data-autoplay`    | Root                                         | empty marker          |

## CSS variables

| Variable                    | Where  | Default          | Description                            |
| --------------------------- | ------ | ---------------- | -------------------------------------- |
| `--tabs-autoplay-duration`  | Root   | `${autoplayDelay}ms` | Drives `Tabs.Progress` and custom CSS. |

## Canonical code shapes

### Basic horizontal pill with sliding indicator

```tsx
<Tabs.Root defaultValue="overview" className="w-fit">
  <Tabs.Container className="rounded-full bg-muted p-1">
    <Tabs.List aria-label="Sections" className="flex gap-1">
      {tabs.map((t) => (
        <Tabs.Trigger
          key={t.id}
          id={t.id}
          className="relative z-10 rounded-full px-4 py-1.5 text-sm data-[state=active]:text-foreground"
        >
          {t.label}
          <Tabs.Indicator className="absolute inset-0 -z-10 rounded-full bg-background shadow" />
        </Tabs.Trigger>
      ))}
    </Tabs.List>
  </Tabs.Container>
  {tabs.map((t) => (
    <Tabs.Content key={t.id} id={t.id} className="mt-4">
      {t.body}
    </Tabs.Content>
  ))}
</Tabs.Root>
```

### Underline indicator

```tsx
<Tabs.Root defaultValue="one">
  <Tabs.Container>
    <Tabs.List aria-label="Sections" className="flex gap-6 border-b">
      <Tabs.Trigger id="one" className="relative pb-2 data-[state=active]:text-foreground">
        One
        <Tabs.Indicator className="absolute inset-x-0 -bottom-px h-0.5 bg-foreground" />
      </Tabs.Trigger>
      <Tabs.Trigger id="two" className="relative pb-2 data-[state=active]:text-foreground">
        Two
        <Tabs.Indicator className="absolute inset-x-0 -bottom-px h-0.5 bg-foreground" />
      </Tabs.Trigger>
    </Tabs.List>
  </Tabs.Container>
  <Tabs.Content id="one">…</Tabs.Content>
  <Tabs.Content id="two">…</Tabs.Content>
</Tabs.Root>
```

### Autoplay with progress bar

```tsx
<Tabs.Root defaultValue="a" autoplay autoplayDelay={4000} loop>
  <Tabs.Container>
    <Tabs.List aria-label="Featured">
      {slides.map((s) => (
        <Tabs.Trigger key={s.id} id={s.id} className="relative px-3 py-2">
          {s.label}
          <Tabs.Indicator className="absolute inset-0 -z-10 rounded-md bg-muted" />
          <Tabs.Progress className="absolute inset-x-0 bottom-0 h-0.5 bg-foreground origin-left" />
        </Tabs.Trigger>
      ))}
    </Tabs.List>
  </Tabs.Container>
  {slides.map((s) => (
    <Tabs.Content key={s.id} id={s.id}>{s.body}</Tabs.Content>
  ))}
</Tabs.Root>
```

`Tabs.Progress` animation duration tracks `autoplayDelay` automatically. Use
Tailwind to style the visible bar; the component handles the animation.

### Vertical tabs

```tsx
<Tabs.Root defaultValue="general" orientation="vertical" className="flex gap-6">
  <Tabs.Container>
    <Tabs.List aria-label="Settings" className="flex flex-col gap-1">
      <Tabs.Trigger id="general">General</Tabs.Trigger>
      <Tabs.Trigger id="billing">Billing</Tabs.Trigger>
      <Tabs.Trigger id="team">Team</Tabs.Trigger>
    </Tabs.List>
  </Tabs.Container>
  <div className="flex-1">
    <Tabs.Content id="general">…</Tabs.Content>
    <Tabs.Content id="billing">…</Tabs.Content>
    <Tabs.Content id="team">…</Tabs.Content>
  </div>
</Tabs.Root>
```

In vertical orientation, arrow keys swap to Up/Down.

### Manual activation (Space/Enter required)

```tsx
<Tabs.Root defaultValue="one" activationMode="manual">…</Tabs.Root>
```

Use this when activating a tab triggers a fetch or expensive render.

### Animated content with `forceMount`

```tsx
<LazyMotion features={domAnimation}>
  <AnimatePresence mode="wait">
    {tabs.map((t) => (
      <Tabs.Content key={t.id} id={t.id} forceMount asChild>
        <m.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          // hidden when inactive
          className="data-[state=inactive]:hidden"
        >
          {t.body}
        </m.div>
      </Tabs.Content>
    ))}
  </AnimatePresence>
</LazyMotion>
```

`forceMount` keeps panels in the DOM; layer `data-[state=inactive]:hidden`
to keep only the active one visible while still allowing exit animations.

## Accessibility

- **Keyboard:**
  - Horizontal: Left/Right move between triggers; vertical: Up/Down.
  - Home / End jump to first / last enabled trigger.
  - Space/Enter activates a trigger when `activationMode="manual"`.
  - Tab leaves the tab list and enters the active panel.
- `aria-selected`, `aria-controls`, `aria-labelledby`, and roving
  `tabIndex` are all wired automatically.
- **Always set `aria-label` on `Tabs.List`** (or `aria-labelledby` if a
  visible heading is nearby).
- The motion-based `Tabs.Indicator` respects `prefers-reduced-motion` via
  motion itself. The `Tabs.Progress` animation is CSS-driven; consider
  disabling autoplay for users who prefer reduced motion if the autoplay
  speed is fast.

## Gotchas

- **`Tabs.Container` is required for `Tabs.Indicator`.** Indicator is
  position: absolute and needs an ancestor with `position: relative`.
- **Trigger `id` must match Content `id`.** This is the only wiring; don't
  also pass `aria-controls`.
- **Place `Tabs.Indicator` inside every `Tabs.Trigger`.** Only the active
  trigger actually renders it (motion's shared `layoutId` handles the
  slide).
- **Disabled triggers are skipped in keyboard navigation.** Don't rely on
  arrow-counting indexes.
- **`forceMount` is opt-in.** Without it, inactive panels are unmounted —
  fine for most cases, expensive components benefit from `forceMount`.
- **Autoplay resets on any selection change** (click, keyboard,
  controlled). It does not pause on hover by default — wrap with your own
  hover handler if you need that behavior.
- **Loop only matters when autoplay.** With manual nav, the user can always
  click any trigger.
