# Ticker

A Spotify-style ticker for long text. The component measures both its
container and its content; when the text overflows, it scrolls
back-and-forth at a configurable speed with gradient fade masks on the
edges. When it fits, the component does nothing; no animation, no mask,
no layout cost.

## Import

```tsx
import { Ticker } from "@togetheragency/ui/ticker";
```

The component is exported as a compound object; both sub-components are
properties of `Ticker`:

```tsx
Ticker.Root;
Ticker.Content;
```

## Composition

Ticker is a two-part component. `Root` measures and animates;
`Content` renders the actual text.

```tsx
<Ticker.Root>
  <Ticker.Content>Some long text that may overflow…</Ticker.Content>
</Ticker.Root>
```

- **`Ticker.Root`** renders a `<div>` with
  `overflow: hidden; white-space: nowrap`. Watches its width and the inner
  content's width via a `ResizeObserver`; when content exceeds container,
  it kicks off the scroll loop.
- **`Ticker.Content`** renders a `<span>` that receives a **string**
  child. The string is required (not arbitrary JSX) so the component can
  detect content changes and reset the animation cleanly.

## Documentation

Find the detailed [documentation with examples here](https://ui.bytogether.agency/docs/components/ticker).