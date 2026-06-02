---
name: scroll-stack
parent: togetheragency-ui
description: Rules for using @togetheragency/ui/scroll-stack — a headless sticky card-stacking primitive driven by scroll progress. Use when building pinned hero sections, layered scroll-driven case studies, feature walkthroughs, or any stacked-cards effect.
---

# ScrollStack

Headless layered-stack primitive. Every `ScrollStack.Item` is a sticky card
sharing the Viewport as its positioning ancestor. As the user scrolls, each
card pins on top of the previous one and the earlier cards scale down,
producing the familiar stacked-cards transition.

## Import

```tsx
import { ScrollStack } from "@togetheragency/ui/scroll-stack";
```

## When to use

- Hero / landing sections with multiple pinned cards
- Case-study walkthroughs (one card per phase)
- Feature lists where each item gets a dedicated scroll moment
- Timeline-style scrollytelling

## When *not* to use

- Reveal of text on scroll → use **TextReveal**.
- Drag/swipe navigation → use **Carousel**.
- Just a row of cards → use a normal grid or **Marquee**.

## Composition tree

```
ScrollStack.Root
  ScrollStack.Viewport
    ScrollStack.Item
      <your card markup>
    ScrollStack.Item
      <your card markup>
    …
```

Items **must** be direct children of `Viewport`. They share the Viewport as
their sticky positioning ancestor.

## Sub-components

### `ScrollStack.Root`

```ts
type Props = {
  topOffset?: number;          // px, default 0; where the first card pins
  stackGap?: number;           // px, default 16; per-item step added to topOffset
  scaleStep?: number;          // default 0.04; how much each deeper card shrinks
  itemDistance?: number;       // px, default 160; scroll distance between pin events
  useViewportScroll?: boolean; // default false; if true, Viewport scrolls itself
  spring?: SpringOptions | false; // default {stiffness:200, damping:40, mass:0.5}
} & React.HTMLAttributes<HTMLDivElement>;
```

- `topOffset` + `stackGap × index` is each item's effective `top` value.
- `scaleStep`: a card at depth `N` (`N` items have pinned above it) scales
  to `1 - N × scaleStep`.
- `itemDistance` is the `margin-bottom` placed on every item except the
  last — that gap *is* the scroll distance between pin events.
- `useViewportScroll: false` (default) → page scroll drives animation,
  Viewport is a passive wrapper. `true` → Viewport gains `relative
  overflow-y-auto` and scrolls itself; you must give it a height.
- `spring: false` disables smoothing; raw scroll drives scale.

Data attribute: `data-slot="scroll-stack-root"`.

### `ScrollStack.Viewport`

```ts
type Props = React.HTMLAttributes<HTMLDivElement>;
```

The scroll container and the shared sticky positioning ancestor. When
`useViewportScroll` is on, gains `relative overflow-y-auto` automatically —
you still need to provide a height (`h-80`, `h-[80vh]`, etc.).

Data attributes: `data-slot="scroll-stack-viewport"`,
`data-scroll-container` (empty marker when `useViewportScroll` is on).

### `ScrollStack.Item`

```ts
type Props = HTMLMotionProps<"div">;   // motion.div props
```

The visual card. Renders as `motion.div` with `position: sticky` and a
top of `topOffset + index × stackGap`. Scale is driven by Root scroll
progress.

Data attributes: `data-slot="scroll-stack-item"`, `data-index={index}`.

## Canonical code shapes

### Page-scroll driven (default)

```tsx
<ScrollStack.Root topOffset={24} stackGap={12} scaleStep={0.04} itemDistance={200}>
  <ScrollStack.Viewport>
    {cases.map((c) => (
      <ScrollStack.Item key={c.id}>
        <div className="rounded-2xl bg-card p-8 shadow-lg">
          <h3 className="text-2xl font-semibold">{c.title}</h3>
          <p className="mt-2 text-muted-foreground">{c.body}</p>
        </div>
      </ScrollStack.Item>
    ))}
  </ScrollStack.Viewport>
</ScrollStack.Root>
```

### Viewport-scoped scroll (the Viewport itself scrolls)

```tsx
<ScrollStack.Root useViewportScroll topOffset={16} stackGap={8} itemDistance={140}>
  <ScrollStack.Viewport className="h-[80vh] rounded-2xl border">
    {items.map((it) => (
      <ScrollStack.Item key={it.id}>
        <div className="h-64 rounded-xl bg-background p-6">{it.body}</div>
      </ScrollStack.Item>
    ))}
  </ScrollStack.Viewport>
</ScrollStack.Root>
```

The Viewport must have an explicit height when `useViewportScroll` is on.

### Snappier spring tuning

```tsx
<ScrollStack.Root spring={{ stiffness: 400, damping: 60, mass: 0.4 }}>
  …
</ScrollStack.Root>
```

### Raw scroll, no smoothing

```tsx
<ScrollStack.Root spring={false}>…</ScrollStack.Root>
```

### Per-item motion overrides

```tsx
<ScrollStack.Item
  initial={{ opacity: 0 }}
  whileInView={{ opacity: 1 }}
  transition={{ duration: 0.4 }}
>
  …
</ScrollStack.Item>
```

`ScrollStack.Item` accepts the full `HTMLMotionProps<"div">` surface — but
note its `style.scale` and `style.top` are managed by the Root.

### Composed with TextReveal inside each card

```tsx
<ScrollStack.Root useViewportScroll>
  <ScrollStack.Viewport className="h-screen">
    <ScrollStack.Item>
      <TextReveal.Root className="relative min-h-[120vh]">
        <div className="sticky top-0 flex h-screen items-center px-8">
          <TextReveal.Text className="text-3xl">
            Phase one: discovery.
          </TextReveal.Text>
        </div>
      </TextReveal.Root>
    </ScrollStack.Item>
  </ScrollStack.Viewport>
</ScrollStack.Root>
```

## Tuning guide

Common feel adjustments:

| Want…              | Adjust                                                          |
| ------------------ | --------------------------------------------------------------- |
| Tighter stack      | Decrease `stackGap` (smaller `top` step)                        |
| More dramatic scale | Increase `scaleStep` (e.g. 0.08)                               |
| Longer scroll between pins | Increase `itemDistance` (more scroll distance per card)  |
| Snappier motion    | Spring with higher `stiffness`, higher `damping`                |
| Raw, no-smoothing  | `spring={false}`                                                |
| First card lower from top | Increase `topOffset`                                     |

## Gotchas

- **`useViewportScroll` requires explicit height** on the Viewport. Without
  it the Viewport collapses; nothing scrolls.
- **Items must be direct children of Viewport.** Wrapping each Item in an
  extra `<div>` breaks `position: sticky` because the inner wrapper becomes
  the sticky containing block.
- **Each item's intrinsic height is the card content's height.** The
  component doesn't size the card — that's your job.
- **`itemDistance` is what gives you scroll distance between pin events.**
  Setting it to 0 will make all cards pin instantly with no scroll between
  them, which feels broken.
- **A `ResizeObserver` updates scale ranges on resize.** Don't worry about
  mobile vs desktop heights.
- **`prefers-reduced-motion`** is respected: scale animation collapses to
  scale=1 and there's no movement beyond stickiness. Don't bypass it.
- **Don't nest ScrollStacks** — the inner Items would compete with the
  outer's sticky behavior. If you need layered effects, compose with
  **TextReveal** inside an Item instead.
