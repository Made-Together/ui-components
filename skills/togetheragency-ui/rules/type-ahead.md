---
name: type-ahead
parent: togetheragency-ui
description: Rules for using @togetheragency/ui/type-ahead — a headless typewriter effect that mixes static and animated inline text. Use when building animated hero headlines, cycling taglines, typewriter intros, or any character-by-character typing animation.
---

# TypeAhead

Headless typewriter effect. Compose static and animated text inline; the
whole tree is rendered as `<span>` elements, so it sits safely inside a
`<p>`, heading, or list item. Cycles through one or many strings, with full
control over typing speed, deletion speed, pause duration, and the blinking
caret. Honors `prefers-reduced-motion` by snapping to the final string.

## Import

```tsx
import { TypeAhead } from "@togetheragency/ui/type-ahead";
```

## When to use

- Hero headlines that cycle through phrases ("I love **React / Vue /
  Svelte** for building UIs")
- Animated taglines / value props
- Interactive demos and onboarding moments
- Terminal-style sequences

## When *not* to use

- Word-by-word reveal (whole words at once) → use **TextReveal**.
- Scrolling a single overflowing line → use **Ticker**.
- Multi-line / block content → TypeAhead is inline only.

## Composition tree

```
TypeAhead.Root                (seeds defaults via context; <span>)
  TypeAhead.Static            (inert text segment; <span>)
  TypeAhead.Animated          (typing state machine; <span>)
```

All three render `<span>` elements — TypeAhead is always inline.

## Sub-components

### `TypeAhead.Root`

Provides default animation settings to descendant `TypeAhead.Animated`
parts via context.

```ts
type Props = {
  typingSpeed?: number;          // default 24 (chars/sec)
  deletionSpeed?: number;        // default 36 (chars/sec)
  pauseDuration?: number;        // default 1500 (ms after fully typed)
  startDelay?: number;           // default 0 (ms before first char)
  showCursor?: boolean;          // default true
  cursorCharacter?: string;      // default "|"
  loop?: boolean;                // default true
} & React.HTMLAttributes<HTMLSpanElement>;
```

All values are seeded for every descendant `TypeAhead.Animated` unless that
instance overrides them.

Data attribute: `data-slot="type-ahead-root"`.

### `TypeAhead.Static`

```ts
type Props = React.HTMLAttributes<HTMLSpanElement>;
```

Inert `<span>` of text. Use it to weave static copy through an animated
sentence without breaking the inline flow.

Data attribute: `data-slot="type-ahead-static"`.

### `TypeAhead.Animated`

```ts
type Props = {
  texts: string | string[];                            // required
  typingSpeed?: number;
  deletionSpeed?: number;
  pauseDuration?: number;
  startDelay?: number;
  showCursor?: boolean;
  cursorCharacter?: string;
  loop?: boolean;                                      // default: true for arrays, false for single string
  render?: (state: {
    text: string;
    fullText: string;
    index: number;
    phase: "idle" | "typing" | "pausing" | "deleting" | "done";
    done: boolean;
  }) => React.ReactNode;
  onType?: (text: string, index: number) => void;      // fires when a string is fully typed
  onDelete?: (text: string, index: number) => void;    // fires when a string is fully deleted
  onComplete?: () => void;                             // fires when terminal state reached (loop=false)
} & Omit<React.HTMLAttributes<HTMLSpanElement>, "children">;
```

- `texts` may be a single string (typed once by default) or an array (cycles
  with type → pause → delete → next).
- `loop` defaults: `true` when `texts` is an array, `false` when it's a
  single string. Override explicitly when needed.
- `render` is a render-prop for fully custom output — it **bypasses the
  built-in cursor**. Use it when you need to render the typed substring
  inside a different element or apply custom highlighting.
- `onType` / `onDelete` / `onComplete` are callbacks for phase transitions.
- All per-instance settings override the Root context.

Data attributes: `data-slot="type-ahead-animated"`,
`data-phase="idle" | "typing" | "pausing" | "deleting" | "done"`.

## Canonical code shapes

### Cycling array of phrases inside a paragraph

```tsx
<p className="text-3xl">
  <TypeAhead.Root typingSpeed={28} deletionSpeed={48} pauseDuration={1800}>
    I love{" "}
    <TypeAhead.Animated
      texts={["React", "Vue", "Svelte"]}
      className="font-semibold text-accent"
    />
    {" "}for building UIs.
  </TypeAhead.Root>
</p>
```

### Single string, type once and stop

```tsx
<TypeAhead.Root>
  <TypeAhead.Animated texts="Welcome to the platform." />
</TypeAhead.Root>
```

Single strings default `loop: false` — the string is typed once, the cursor
stops blinking, and `onComplete` fires.

### Custom cursor

```tsx
<TypeAhead.Root cursorCharacter="▌">
  <TypeAhead.Animated texts={["Hello", "World"]} />
</TypeAhead.Root>
```

Or hide it entirely:

```tsx
<TypeAhead.Animated texts="No cursor here." showCursor={false} />
```

### Mixing several Animated instances

```tsx
<p>
  <TypeAhead.Root>
    <TypeAhead.Animated texts={["The fastest"]} />
    {" "}way to ship{" "}
    <TypeAhead.Animated texts={["beautiful", "delightful", "performant"]} />
    {" "}interfaces.
  </TypeAhead.Root>
</p>
```

Each `Animated` runs an independent state machine.

### Phase callbacks (e.g. analytics)

```tsx
<TypeAhead.Animated
  texts={taglines}
  onType={(text, i) => analytics.track("tagline_typed", { text, i })}
  onComplete={() => console.log("sequence finished")}
/>
```

### Custom render prop

```tsx
<TypeAhead.Animated
  texts={["alpha", "beta", "gamma"]}
  render={({ text, phase }) => (
    <span>
      <span className="font-mono">{text}</span>
      {phase === "typing" && <span aria-hidden>_</span>}
    </span>
  )}
/>
```

The default cursor is not rendered when `render` is provided.

### Long initial delay

```tsx
<TypeAhead.Animated texts="Loading…" startDelay={1000} />
```

## Data-attribute styling reference

| Attribute     | Where                | Values                                                |
| ------------- | -------------------- | ----------------------------------------------------- |
| `data-slot`   | every part           | identifier per part                                   |
| `data-phase`  | Animated             | `"idle"`, `"typing"`, `"pausing"`, `"deleting"`, `"done"` |

```tsx
<TypeAhead.Animated
  texts={…}
  className="data-[phase=done]:opacity-80"
/>
```

## Accessibility

- The caret is `aria-hidden`. Screen readers read the actual text.
- Animation respects `prefers-reduced-motion` — the component snaps to the
  final string (the last entry of `texts` for arrays, or the single string)
  and stops the animation.
- For headlines, ensure the surrounding element has appropriate semantics
  (`<h1>`, `<p>`). TypeAhead itself is a `<span>`.
- Do not type out critical interactive labels — keyboard users may try to
  interact before the label is fully present. Use TypeAhead for decorative
  copy, not for buttons or form labels.

## Gotchas

- **All parts are `<span>`s.** Don't try to put block content inside —
  TypeAhead is inline-only. Wrap with a `<p>`, `<h1>`, etc. for block
  context.
- **`texts` is required.** Empty arrays / empty strings are not valid.
- **`loop` default depends on `texts` shape.** Single string → `false`;
  array → `true`. Set explicitly if your intent differs.
- **`render` bypasses the built-in cursor.** Recreate it yourself if you
  use `render` and still want a caret.
- **State machine is `setTimeout`-driven.** Do not pass functions that
  recreate every render — they would trigger excessive re-arms. Wrap with
  `useCallback` or keep stable refs.
- **`prefers-reduced-motion`** snaps to the final string and does not
  invoke `onType`/`onDelete`/`onComplete` mid-animation. Don't rely on those
  callbacks for non-decorative behavior.
- **Don't nest `TypeAhead.Animated` inside another `TypeAhead.Animated`** —
  the inner one's state machine cannot run while the outer is rewriting it.
