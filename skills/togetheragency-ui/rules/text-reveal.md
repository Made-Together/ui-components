---
name: text-reveal
parent: togetheragency-ui
description: Rules for using @togetheragency/ui/text-reveal — a headless word-by-word reveal primitive. Use when building scroll-driven hero text, progress-driven animated headlines, scroll-triggered storytelling, or any per-word reveal.
---

# TextReveal

Word-by-word reveal primitive. By default the reveal is scroll-driven; words
animate in as the section moves through the viewport. Pass `progress` and
the component flips into **fully controlled** mode where the consumer owns
the value (perfect for sliders, programmatic playback, intro animations).

The component owns per-word splitting and motion plumbing; the consumer owns
typography, layout, and the per-word transform.

## Import

```tsx
import { TextReveal } from "@togetheragency/ui/text-reveal";
```

## When to use

- Scroll-triggered hero copy
- Storytelling pages where text reveals as you scroll
- Programmatic / slider-driven word animations
- Composed inside **ScrollStack** items for layered reveals

## When *not* to use

- A single overflowing line of text → use **Ticker**.
- Typewriter effect (character-by-character) → use **TypeAhead**.
- A reveal that animates *blocks* not words → just use motion directly.

## Composition tree

```
TextReveal.Root              (orchestrator; provides progress via context)
  [layout you choose — usually a sticky inner wrapper for scroll mode]
    TextReveal.Text          (auto-splits string by whitespace into words)
      or
    TextReveal.Word          (manual; use for arbitrary surrounding markup)
```

### Scroll mode (default)

Give `Root` a tall height so it occupies scroll distance, and pin a child
with `sticky`:

```tsx
<TextReveal.Root className="relative min-h-[200vh]">
  <div className="sticky top-0 flex h-screen items-center">
    <TextReveal.Text className="text-4xl">
      The quick brown fox jumps over the lazy dog.
    </TextReveal.Text>
  </div>
</TextReveal.Root>
```

### Controlled mode

When `progress` is passed, layout is up to you — no height or sticky needed:

```tsx
const [p, setP] = useState(0);
<TextReveal.Root progress={p}>
  <TextReveal.Text>Reveal me</TextReveal.Text>
</TextReveal.Root>
```

## Sub-components

### `TextReveal.Root`

```ts
type Props = {
  progress?: number;                            // 0–100; presence flips to controlled mode
  once?: boolean;                               // default false; latch once revealed
  // Scroll-mode only (ignored when progress is provided):
  offset?: UseScrollOptions["offset"];          // default ["start end", "end start"]
  container?: RefObject<HTMLElement | null>;    // optional scroll container
  startMargin?: number | string;                // default 20 (% of scroll range); or CSS length
  endMargin?: number | string;                  // default 20 (% of scroll range); or CSS length
} & React.HTMLAttributes<HTMLDivElement>;
```

- `progress` is `0–100`. Internally normalized to a `MotionValue<number>`
  on `[0, 1]`.
- `once: true` latches words at revealed once they cross the threshold —
  scrolling back does not hide them.
- `startMargin` / `endMargin` shift the reveal window inside the scroll
  range. Number = percentage; string = any CSS length (e.g. `"10rem"`,
  `"100px"`).
- `container` lets the scroll be tracked against a specific element instead
  of the window — useful inside scroll containers.

Data attributes: `data-slot="text-reveal-root"`,
`data-mode="scroll" | "controlled"`, `data-once` (empty when `once`).

### `TextReveal.Text`

```ts
type Props = {
  children: string;                             // required, plain string
  as?: ElementType;                             // default "span"
  transform?: (localProgress: MotionValue<number>) => MotionStyle;
  revealAt?: number;                            // default 0.5 (0–1)
  wordClassName?: string;
} & Omit<React.HTMLAttributes<HTMLSpanElement>, "children">;
```

- Children **must be a plain string**. Whitespace is the split delimiter.
  For mixed markup (links, highlights, mixed elements), use
  `TextReveal.Word` directly.
- `transform` builds the per-word `MotionStyle` from local progress. Default
  is `{ opacity: localProgress }`.
- `revealAt` flips each word's `data-state` from `"hidden"` to `"revealed"`
  — for CSS hooks only; the visual reveal is whatever `transform` returns.
- `wordClassName` applies to every internal `motion.span`.

Data attribute: `data-slot="text-reveal-text"`.

### `TextReveal.Word`

```ts
type Props = {
  index: number;                                // required, 0-based position
  total: number;                                // required, total participating words
  transform?: (localProgress: MotionValue<number>) => MotionStyle;
  revealAt?: number;                            // default 0.5
  children: React.ReactNode;
} & Omit<HTMLMotionProps<"span">, "children">;
```

The lower-level primitive. Use when you need arbitrary surrounding markup
(links, highlighted spans, mixed elements). You compute `index` and `total`
yourself.

Data attributes: `data-slot="text-reveal-word"`,
`data-state="hidden" | "revealed"`, `data-index={index}`.

## Canonical code shapes

### Scroll-driven opacity reveal (default)

```tsx
<TextReveal.Root className="relative min-h-[200vh]">
  <div className="sticky top-0 flex h-screen items-center justify-center">
    <TextReveal.Text className="max-w-4xl text-center text-5xl font-semibold">
      We build interfaces that move with intention.
    </TextReveal.Text>
  </div>
</TextReveal.Root>
```

### Scroll-driven with custom transform (opacity + translate + blur)

```tsx
import { useTransform } from "motion/react";

<TextReveal.Root className="relative min-h-[180vh]">
  <div className="sticky top-0 flex h-screen items-center px-8">
    <TextReveal.Text
      className="text-4xl"
      transform={(p) => ({
        opacity: p,
        y: useTransform(p, [0, 1], [24, 0]),
        filter: useTransform(p, [0, 1], ["blur(8px)", "blur(0px)"]),
      })}
    >
      Smooth. Composable. Honest.
    </TextReveal.Text>
  </div>
</TextReveal.Root>
```

`useTransform` calls are safe inside the `transform` prop because it runs
inside `motion.span` for each word.

### Controlled mode driven by a slider

```tsx
const [p, setP] = useState(50);

return (
  <>
    <TextReveal.Root progress={p}>
      <TextReveal.Text className="text-3xl">
        Drag the slider to reveal me.
      </TextReveal.Text>
    </TextReveal.Root>
    <input
      type="range"
      min={0}
      max={100}
      value={p}
      onChange={(e) => setP(Number(e.target.value))}
    />
  </>
);
```

### Color reveal (ink-in effect)

```tsx
<TextReveal.Text
  className="text-4xl text-muted-foreground"
  transform={(p) => ({
    color: useTransform(p, [0, 1], ["var(--color-muted)", "var(--color-foreground)"]),
  })}
>
  Read me as you scroll.
</TextReveal.Text>
```

### Composed words for inline markup

```tsx
const words = ["We", "build", "for", "speed."];

<TextReveal.Root className="relative min-h-[160vh]">
  <div className="sticky top-0 flex h-screen items-center">
    <p className="text-4xl">
      {words.map((w, i) => (
        <TextReveal.Word key={i} index={i} total={words.length}>
          {w === "speed." ? <a href="/performance">{w}</a> : w}
          {i < words.length - 1 ? " " : ""}
        </TextReveal.Word>
      ))}
    </p>
  </div>
</TextReveal.Root>
```

### Latched (once revealed, stay revealed)

```tsx
<TextReveal.Root once className="relative min-h-[200vh]">…</TextReveal.Root>
```

### Tracking a scroll container instead of window

```tsx
const containerRef = useRef<HTMLDivElement>(null);

<div ref={containerRef} className="h-[80vh] overflow-y-auto">
  <TextReveal.Root container={containerRef} className="min-h-[200vh]">
    <div className="sticky top-0">
      <TextReveal.Text>…</TextReveal.Text>
    </div>
  </TextReveal.Root>
</div>
```

### Tighter trigger window via margins

```tsx
<TextReveal.Root startMargin={30} endMargin={10}>…</TextReveal.Root>
// or with CSS length
<TextReveal.Root startMargin="20rem" endMargin="5rem">…</TextReveal.Root>
```

## Gotchas

- **Scroll mode needs both a tall `Root` height and a `sticky` inner
  wrapper.** The Root height defines scroll distance; the sticky child
  pins the words. Without sticky, the words scroll past too fast.
- **`children` of `TextReveal.Text` must be a plain string.** Use
  `TextReveal.Word` for mixed markup.
- **`progress` is `0–100`, not `0–1`.** Internally normalized.
- **`revealAt` only flips `data-state`** — it does not control the visual
  reveal. The `transform` prop owns visuals.
- **`useTransform` is safe inside the `transform` prop** — it runs inside
  each word's `motion.span`. Don't memoize the `transform` result yourself.
- **`prefers-reduced-motion`** snaps words to their final state instantly;
  the `transform` is skipped. Don't bypass it.
- **Don't nest `TextReveal.Root`** — they would compete for scroll context.
- **For very long passages**, split into multiple `TextReveal.Text`
  instances or use `TextReveal.Word` so each block has its own scroll
  window.
