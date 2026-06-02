---
name: marquee
parent: togetheragency-ui
description: Rules for using @togetheragency/ui/marquee — a headless seamless scrolling strip of items. Use when building logo walls, scrolling banners, infinite testimonial loops, badge strips, or any horizontal/vertical infinite loop of content.
---

# Marquee

Headless, seamless marquee. Scrolls a list of items at a configurable speed.
Horizontal or vertical, reversible, pause-on-hover, and resilient to viewport
size — the component duplicates content automatically so the loop reset is
invisible regardless of container width.

## Import

```tsx
import { Marquee } from "@togetheragency/ui/marquee";
```

## When to use

- Logo walls / "as seen in" strips
- Scrolling testimonial or review banners
- Repeating badge / chip rows
- Activity feed loops (visual decoration)
- Vertical scrolling sidebars of repeating content

## When *not* to use

- Drag/swipe content navigation → use **Carousel**.
- A single overflowing line of text → use **Ticker**.
- A grid where occasional items swap in/out at random → use **Swappable**.

## Composition tree

```
Marquee.Root
  Marquee.Item
  Marquee.Item
  …
```

Two parts. `Root` owns scrolling and content duplication; `Item` wraps each
cell.

## Sub-components

### `Marquee.Root`

```ts
type Props = {
  reverse?: boolean;        // default false; reverses animation direction
  pauseOnHover?: boolean;   // default false
  vertical?: boolean;       // default false; scrolls top→bottom (or reverse)
  repeat?: number;          // default 4; minimum number of content copies
} & React.HTMLAttributes<HTMLDivElement>;
```

- `repeat` is the *minimum* number of copies. The component measures both
  the root and a single copy and increases the copy count automatically so
  the strip is always wider/taller than its container — your seam is never
  visible.
- Vertical mode automatically wraps children in a column layout. The Root
  needs an explicit height when `vertical` is `true`.

Data attributes on Root:

| Attribute                       | Values        |
| ------------------------------- | ------------- |
| `data-marquee-root`             | empty (marker) |
| `data-marquee-instance`         | scoped id      |
| `data-marquee-vertical`         | `"true"` / `"false"` |
| `data-marquee-reverse`          | `"true"` / `"false"` |
| `data-marquee-pause-hover`      | `"true"` / `"false"` |

Internal data attributes (rarely targeted): `data-marquee-track`,
`data-marquee-copy`, `data-marquee-item`.

### `Marquee.Item`

```ts
type Props = React.HTMLAttributes<HTMLDivElement>;
```

Wraps each cell. The component auto-applies `flex-shrink: 0` so items keep
their intrinsic size.

## CSS variables — the public knobs

Set these on `Marquee.Root` to tune behavior. Override with Tailwind
arbitrary values or inline `style`.

| Variable     | Default | Description                                                  |
| ------------ | ------- | ------------------------------------------------------------ |
| `--duration` | `40s`   | One full loop. Lower = faster.                               |
| `--gap`      | `1rem`  | Space between items. Drives both layout gap and shift dist.  |

```tsx
<Marquee.Root className="[--duration:20s] [--gap:2rem]">…</Marquee.Root>
```

Or inline:

```tsx
<Marquee.Root style={{ ['--duration' as string]: '20s' }}>…</Marquee.Root>
```

## Canonical code shapes

### Basic horizontal logo strip

```tsx
<Marquee.Root className="[--duration:30s] [--gap:3rem]" pauseOnHover>
  {logos.map((logo) => (
    <Marquee.Item key={logo.id}>
      <img src={logo.src} alt={logo.alt} className="h-8 w-auto opacity-60 hover:opacity-100" />
    </Marquee.Item>
  ))}
</Marquee.Root>
```

### Reverse direction (e.g. second row of a two-row layout)

```tsx
<div className="flex flex-col gap-4">
  <Marquee.Root className="[--duration:30s]">
    {row1.map((item) => <Marquee.Item key={item.id}>{item.label}</Marquee.Item>)}
  </Marquee.Root>
  <Marquee.Root reverse className="[--duration:30s]">
    {row2.map((item) => <Marquee.Item key={item.id}>{item.label}</Marquee.Item>)}
  </Marquee.Root>
</div>
```

### Vertical marquee

```tsx
<Marquee.Root vertical className="h-96 [--duration:25s] [--gap:1.5rem]">
  {messages.map((m) => (
    <Marquee.Item key={m.id}>
      <Card>{m.body}</Card>
    </Marquee.Item>
  ))}
</Marquee.Root>
```

Vertical mode needs explicit height on the Root.

### Tight, fast badge strip

```tsx
<Marquee.Root className="[--duration:12s] [--gap:0.5rem]">
  {badges.map((b) => (
    <Marquee.Item key={b.id}>
      <span className="rounded-full border px-3 py-1 text-xs">{b.label}</span>
    </Marquee.Item>
  ))}
</Marquee.Root>
```

### With edge fade masks (consumer adds the mask)

```tsx
<div className="relative">
  <Marquee.Root className="[--duration:30s]">…</Marquee.Root>
  <div className="pointer-events-none absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-background to-transparent" />
  <div className="pointer-events-none absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-background to-transparent" />
</div>
```

The library does not bake in fade masks — they are easy to add on the
consumer side and styling-system agnostic.

## Accessibility

- Duplicated copies are marked `aria-hidden` so screen readers do not read
  the same content twice.
- The animation respects `prefers-reduced-motion` — when the user prefers
  reduced motion, the strip does not scroll.
- Pause-on-hover is not a substitute for an explicit pause control if the
  content is meaningful (e.g. news headlines). Marquees work best for
  decorative content — for legible feeds, use **Ticker** or a static list.

## Gotchas

- **Vertical needs explicit height.** Without it the Root collapses to 0
  and you see nothing.
- **`--duration` and `--gap` set behavior** — not `prop:duration` or
  `prop:gap`. Pass them via `className`/`style`.
- **Hover pause requires `pauseOnHover`.** Setting `:hover { animation-play-state: paused }`
  yourself won't work because the keyframes are scoped to the instance.
- **Don't put state inside items that re-renders frequently** — copies are
  generated by cloning, and frequent re-renders defeat the duplication
  optimization. Keep items pure/memoized.
- **`repeat` is a minimum.** The component will increase it; you can't
  reduce below what fits the container.
- **Item width is yours.** Items don't stretch — they take their intrinsic
  size. If you want equal-width cards, size them on the item or its child.
