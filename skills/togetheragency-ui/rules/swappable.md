---
name: swappable
parent: togetheragency-ui
description: Rules for using @togetheragency/ui/swappable — a headless rotating grid that periodically swaps random visible cells with off-screen items. Use when building logo walls, partner showcases, portfolio grids, or any "rotating" grid display.
---

# Swappable

Headless rotating grid. Hand it an array of items and a grid shape
(`rows × cols`); it renders the first `rows × cols` items, then, while
`items.length > gridSize`, periodically swaps a random visible cell with a
random off-screen item. Uniqueness is preserved — the same item is never
visible twice.

## Import

```tsx
import { Swappable } from "@togetheragency/ui/swappable";
```

## When to use

- Partner / client logo grids ("trusted by")
- Team headshot grids
- Portfolio thumbnails that rotate
- Any "X out of Y, refreshed every few seconds" display

## When *not* to use

- One-direction infinite scrolling row of items → use **Marquee**.
- Drag/swipe content navigation → use **Carousel**.
- Static grid where nothing rotates → just use a normal CSS grid.

## Composition tree

```
Swappable.Root<Item>           (state + rotation timer + grid scope)
  Swappable.Grid<Item>         (renders cells via render-prop)
    Swappable.Item             (motion.div; per-cell animation wrapper)
```

The `Grid` child is a render-prop component; you return a single
`Swappable.Item` (which can wrap any content).

## Sub-components

### `Swappable.Root<T>`

```ts
type Props<T> = {
  items: readonly T[];                            // required; duplicates de-duped
  rows?: number;                                  // default 1
  cols?: number | Partial<Record<Breakpoint, number>>; // default 1
  rotationInterval?: { min: number; max: number };// default {min: 2000, max: 5000}
  pauseOnHover?: boolean;                         // default false
  transition?: Transition;                        // motion transition for every Item
  initial?: HTMLMotionProps<"div">["initial"];    // default {opacity: 0, scale: 0.92}
  animate?: HTMLMotionProps<"div">["animate"];    // default {opacity: 1, scale: 1}
  exit?: HTMLMotionProps<"div">["exit"];          // default {opacity: 0, scale: 0.92}
  children: React.ReactNode;
} & Omit<React.HTMLAttributes<HTMLDivElement>, "children">;
```

- `items`: deduplicated by reference (for objects) or value (for primitives).
  Items don't need an explicit `id`.
- `cols` accepts a number or a Tailwind-aligned breakpoint map:
  - `base` (always applied)
  - `sm` (≥640px)
  - `md` (≥768px)
  - `lg` (≥1024px)
  - `xl` (≥1280px)
  - `2xl` (≥1536px)
- `rotationInterval` is a uniform-random delay between swaps.
- Rotation **only runs** when `items.length > rows × resolvedCols`. With
  fewer items than cells, the grid is static.
- Default `transition`: `{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }`.
- `pauseOnHover` pauses the timer while the grid is hovered/focused.

Data attributes: `data-slot="swappable-root"`,
`data-swappable-instance={scope}`.

### `Swappable.Grid<T>`

```ts
type Props<T> = {
  children: (item: T, index: number) => React.ReactNode;
};
```

A typed render-prop. The child function receives one item per visible cell
and the cell index. Return a single `Swappable.Item` (which can wrap any
content).

Data attributes: `data-slot="swappable-grid"`,
`data-swappable-grid={scope}`.

### `Swappable.Item`

```ts
type Props = HTMLMotionProps<"div">;
```

A `motion.div` that inherits Root's `initial` / `animate` / `exit` /
`transition`. Per-instance props win over defaults.

Data attribute: `data-slot="swappable-item"`.

## Canonical code shapes

### Basic logo grid (1 row, responsive cols)

```tsx
type Logo = (props: React.SVGProps<SVGSVGElement>) => React.JSX.Element;

<Swappable.Root<Logo>
  items={logos}
  rows={1}
  cols={{ base: 2, sm: 3, md: 4, lg: 5 }}
  className="rounded-2xl border bg-background p-3"
>
  <Swappable.Grid<Logo>>
    {(Logo) => (
      <Swappable.Item className="flex items-center justify-center p-4">
        <Logo className="h-8 w-auto" />
      </Swappable.Item>
    )}
  </Swappable.Grid>
</Swappable.Root>
```

### Multi-row with pause-on-hover

```tsx
<Swappable.Root<Item>
  items={items}
  rows={2}
  cols={{ base: 2, md: 3, lg: 4 }}
  pauseOnHover
>
  <Swappable.Grid<Item>>
    {(item) => (
      <Swappable.Item>
        <Card data={item} />
      </Swappable.Item>
    )}
  </Swappable.Grid>
</Swappable.Root>
```

### Fast rotation

```tsx
<Swappable.Root
  items={items}
  rows={1}
  cols={4}
  rotationInterval={{ min: 600, max: 1400 }}
>
  …
</Swappable.Root>
```

### Custom transition (blur + translate)

```tsx
<Swappable.Root
  items={items}
  rows={2}
  cols={3}
  initial={{ opacity: 0, y: 16, filter: "blur(8px)" }}
  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
  exit={{ opacity: 0, y: -16, filter: "blur(8px)" }}
  transition={{ duration: 0.4, ease: "easeOut" }}
>
  <Swappable.Grid>
    {(item) => <Swappable.Item>{render(item)}</Swappable.Item>}
  </Swappable.Grid>
</Swappable.Root>
```

### Per-item motion override

```tsx
<Swappable.Grid>
  {(item, i) => (
    <Swappable.Item
      // override defaults for this cell
      transition={{ duration: 0.5, delay: i * 0.02 }}
    >
      {render(item)}
    </Swappable.Item>
  )}
</Swappable.Grid>
```

### Static grid (no rotation when all items fit)

```tsx
// items.length === rows * cols → grid renders once, no rotation.
<Swappable.Root items={smallList} rows={2} cols={3}>
  <Swappable.Grid>
    {(item) => <Swappable.Item>{render(item)}</Swappable.Item>}
  </Swappable.Grid>
</Swappable.Root>
```

## Accessibility

- The grid is a `<div>` — wrap with a `<section aria-label>` or precede
  with a heading if the content is meaningful.
- Rotation respects `prefers-reduced-motion`: rotation is disabled, items
  appear in their final state.
- For static, label-bearing content (e.g. partner names), make sure the
  swap animation doesn't strip context — keep the alt text/labels static
  per item, not per cell.

## Gotchas

- **Items must be unique.** Duplicates are silently de-duped (by reference
  for objects, by value for primitives). Don't pass `[logoA, logoA, logoB]`
  expecting two `logoA` cells.
- **`Grid` is a render-prop, not a slot.** Pass a function as children:
  `{(item) => …}`. Returning a fragment instead of a single
  `Swappable.Item` breaks `AnimatePresence` orchestration.
- **The render-prop must return a single element** with a stable identity
  — `Swappable.Item` is the simplest choice and it carries the internal
  `key` automatically.
- **Rotation only runs when there's surplus.** `items.length <= rows ×
  cols` → no rotation. This is intentional.
- **Responsive `cols` uses Tailwind breakpoints** (`base`/`sm`/`md`/`lg`/`xl`/`2xl`).
  The component handles the media-query CSS generation internally via a
  scoped `<style>` block.
- **Don't render expensive content inside Items unless memoized.** Each
  swap triggers `enter` / `exit` for the affected cell — keep the render
  pure or memo'd.
- **Generic typing:** use `<Swappable.Root<MyType>>` and
  `<Swappable.Grid<MyType>>` so the render-prop argument is typed
  correctly. TypeScript can usually infer from `items`, but the explicit
  form is clearer.
- **`pauseOnHover` pauses the timer**, not the in-flight transition. A
  swap that's mid-animation still completes.
