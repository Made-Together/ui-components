# Marquee

A headless, seamless marquee that scrolls a list of items at a configurable
speed. Horizontal or vertical, reversible, pause-on-hover, and resilient to
viewport size; the component duplicates content automatically so the loop
reset is invisible regardless of how wide your container is.

## Import

```tsx
import { Marquee } from "@togetheragency/ui/marquee";
```

The component is exported as a compound object — sub-components are
properties of `Marquee`:

```tsx
Marquee.Root;
Marquee.Item;
```

## Composition

Marquee is a two-part component. `Marquee.Root` owns the scroll behavior, the
scoped animation CSS, and the duplication that keeps the loop seamless.
`Marquee.Item` wraps each individual cell in the strip.

```tsx
<Marquee.Root>
  <Marquee.Item>One</Marquee.Item>
  <Marquee.Item>Two</Marquee.Item>
  <Marquee.Item>Three</Marquee.Item>
</Marquee.Root>
```

- **`Marquee.Root`** renders a clipped `<div>` and injects a `<style>` block
  scoped to the instance via a derived token, so multiple marquees
  on the same page never share keyframes.
- **`Marquee.Item`** renders a `<div>` with `data-marquee-item` and
  `flex-shrink: 0` applied automatically.

Behavior is configured through two CSS custom properties on the root:

| Variable     | Default | Description                                                  |
| ------------ | ------- | ------------------------------------------------------------ |
| `--duration` | `40s`   | One full loop. Lower = faster.                               |
| `--gap`      | `1rem`  | Space between items. Drives both layout gap and the shift distance. |

Override them with Tailwind's arbitrary-value syntax
(`[--duration:20s]`, `[--gap:2rem]`) or with inline `style`.

## Documentation

Find the detailed [documentation with examples here](https://ui.bytogether.agency/docs/components/marquee).