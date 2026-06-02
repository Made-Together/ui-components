---
name: ticker
parent: togetheragency-ui
description: Rules for using @togetheragency/ui/ticker — a headless Spotify-style ticker that scrolls a single overflowing string back and forth with gradient fade masks. Use when displaying long names, titles, or status text that may exceed its container.
---

# Ticker

Spotify-style ticker for long text. Measures both container and content;
when the text overflows, it scrolls back-and-forth at a configurable speed
with gradient fade masks on the edges. When it fits, the component does
nothing — no animation, no mask, no layout cost.

## Import

```tsx
import { Ticker } from "@togetheragency/ui/ticker";
```

## When to use

- Now-playing rows (track / artist titles)
- Long ellipsisable titles where you want full text visible over time
- Status banners that may exceed their slot
- Player rows in lists where width is constrained

## When *not* to use

- Continuous one-direction loop of *many items* → use **Marquee**.
- Multiple lines or arbitrary JSX → Ticker only takes a single string.
- Typewriter / typing animation → use **TypeAhead**.

## Composition tree

```
Ticker.Root
  Ticker.Content       (children must be a string)
```

Two parts. Root measures and animates; Content renders the actual text.

## Sub-components

### `Ticker.Root`

```ts
type Props = {
  containerWidth?: number;          // px; optional fixed width
  startDelay?: number;              // ms; default 2000 — pause before scrolling
  endDelay?: number;                // ms; default 2000 — pause at end before reversing
  scrollSpeed?: number;             // px/s; default 50
  fadeWidth?: number;               // px; default 24 (clamped to 20% of container)
  fadeTransitionDuration?: number;  // ms; default 300 (mask in/out fade)
} & React.HTMLAttributes<HTMLDivElement>;
```

- `containerWidth` lets you skip width measurement when the slot is fixed.
  Without it, a `ResizeObserver` watches the container.
- `fadeWidth` is the mask width on each edge. The component clamps it to a
  maximum of 20% of the container width so the masks never crowd the
  visible area on small slots.
- `aria-live="polite"` is set automatically on the Root so screen readers
  pick up the full text.

Data attributes: `data-slot="ticker-root"`, `data-state="idle" | "scrolling"`,
`data-overflowing` (empty marker when content exceeds container).

### `Ticker.Content`

```ts
type Props = {
  children: string;       // required — must be a string
} & React.HTMLAttributes<HTMLSpanElement>;
```

A `<span>` whose text is the only thing animated. Changing the string
resets the animation cleanly.

Data attribute: `data-slot="ticker-content"`.

## Canonical code shapes

### Basic ticker

```tsx
<Ticker.Root className="text-sm">
  <Ticker.Content>{trackName}</Ticker.Content>
</Ticker.Root>
```

### Fixed-width slot, faster scroll, wider fade

```tsx
<Ticker.Root
  containerWidth={240}
  scrollSpeed={80}
  fadeWidth={48}
  className="text-sm font-medium"
>
  <Ticker.Content>{`${artist} — ${title}`}</Ticker.Content>
</Ticker.Root>
```

### In a flex row (player UI)

```tsx
<div className="flex items-center gap-3">
  <Avatar src={trackArt} />
  <Ticker.Root className="min-w-0 flex-1 text-sm">
    <Ticker.Content>{`${artist} — ${title}`}</Ticker.Content>
  </Ticker.Root>
  <button>Play</button>
</div>
```

`min-w-0` on the Ticker is essential — without it the flex parent gives the
ticker its content's intrinsic width and it never overflows.

### Slow, gentle pace for status banners

```tsx
<Ticker.Root
  scrollSpeed={20}
  startDelay={1500}
  endDelay={1500}
  className="rounded-md bg-muted px-3 py-2 text-xs"
>
  <Ticker.Content>{statusMessage}</Ticker.Content>
</Ticker.Root>
```

### Dynamic content (string changes)

```tsx
const [name, setName] = useState(initialName);

<Ticker.Root>
  <Ticker.Content>{name}</Ticker.Content>
</Ticker.Root>
```

The animation resets cleanly whenever the string changes.

## Accessibility

- `aria-live="polite"` is set automatically; the full text is read once
  when the component mounts and when the string changes.
- The animation respects `prefers-reduced-motion` — when the user prefers
  reduced motion, the ticker does not scroll. Long text will be cropped
  visually; the screen reader still receives the full string.
- For multi-paragraph or rich content, do not use Ticker — render the full
  text and let it wrap or scroll the container.

## Gotchas

- **`Ticker.Content` accepts a string, not JSX.** This is by design —
  string identity is what lets the component detect content changes and
  reset cleanly.
- **In flex parents, you need `min-w-0`** on the Ticker (or its wrapper)
  so the flex container actually constrains it. Otherwise it sizes to its
  content and never overflows.
- **No animation when content fits.** This is intentional. The mask also
  does not render in that case.
- **`fadeWidth` is clamped to 20% of container width.** Setting it to 200
  on a 100px-wide slot will still cap at 20px.
- **The animation is RAF-driven, not React-driven.** Don't expect re-renders
  per frame; if you need frame-by-frame state, build a separate mechanism.
- **Don't compose multiple Tickers as a marquee** — use **Marquee** for
  continuous looping of many items.
