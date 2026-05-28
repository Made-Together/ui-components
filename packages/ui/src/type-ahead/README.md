# TypeAhead

A headless typewriter effect. Compose static and animated text inline; the
whole tree is rendered as `<span>` elements, so it sits safely inside a `<p>`
or any other text container. Cycles through one or many strings, with full
control over typing speed, deletion speed, pause duration and the blinking
caret. Honors `prefers-reduced-motion` by snapping to the final string.

## Import

```tsx
import { TypeAhead } from "@togetheragency/ui/type-ahead";
```

The component is exported as a compound object; every sub-component is a
property of `TypeAhead`:

```tsx
TypeAhead.Root;
TypeAhead.Static;
TypeAhead.Animated;
```

## Composition

`TypeAhead.Root` provides default animation settings to descendant
`TypeAhead.Animated` parts via context. Mix and match `Static` and `Animated`
segments freely:

```tsx
<p>
  <TypeAhead.Root typingSpeed={28}>
    <TypeAhead.Static>I love </TypeAhead.Static>
    <TypeAhead.Animated texts={["React", "Vue", "Svelte"]} />
    <TypeAhead.Static> for building UIs.</TypeAhead.Static>
  </TypeAhead.Root>
</p>
```

- **`TypeAhead.Root`** renders a `<span>` and seeds defaults for descendants.
  Because it's an inline element, it can be nested inside `<p>`, headings,
  list items — anywhere text belongs.
- **`TypeAhead.Static`** renders an inert `<span>` of text. Use it to weave
  static copy through an animated sentence without breaking the inline flow.
- **`TypeAhead.Animated`** runs the typing state machine. Accepts a single
  string or an array of strings to cycle through. All `Root` settings can be
  overridden per instance.

## Documentation

Find the detailed [documentation with examples here](https://ui.bytogether.agency/docs/components/type-ahead).