# Carousel

A headless, composable carousel built on top of
[Embla Carousel](https://www.embla-carousel.com). Ships drag-to-scroll, snap
points, autoplay, looping, multi-slide layouts, and keyboard-accessible
navigation; with every visual choice left to you.

## Import

```tsx
import { Carousel, useCarousel } from "@togetheragency/ui/carousel";
```

The component is exported as a compound object; every sub-component is a
property of `Carousel`:

```tsx
Carousel.Root;
Carousel.Viewport;
Carousel.Container;
Carousel.Slide;
Carousel.Previous;
Carousel.Next;
Carousel.Navigation;
Carousel.NavigationItem;
```

The `useCarousel` hook returns the Embla API and scroll helpers from the
nearest `Carousel.Root` and is intended for custom controls or telemetry.

## Composition

Carousel follows a strict, composable structure. The minimum viable carousel is
three nested parts; `Root → Viewport → Container → Slide`:

```tsx
<Carousel.Root>
  <Carousel.Viewport>
    <Carousel.Container>
      <Carousel.Slide index={0}>…</Carousel.Slide>
      <Carousel.Slide index={1}>…</Carousel.Slide>
      <Carousel.Slide index={2}>…</Carousel.Slide>
    </Carousel.Container>
  </Carousel.Viewport>

  <Carousel.Previous>Prev</Carousel.Previous>
  <Carousel.Next>Next</Carousel.Next>

  <Carousel.Navigation />
</Carousel.Root>
```

- **`Carousel.Root`** owns the Embla instance, the autoplay plugin, and
  context. Wraps everything.
- **`Carousel.Viewport`** is the clipped window. Apply `overflow: hidden` here
  (Tailwind: `overflow-hidden`). The Embla ref attaches to this element.
- **`Carousel.Container`** is the horizontal flex track that holds slides.
  Apply `display: flex` here.
- **`Carousel.Slide`** wraps each item. Pass `index` so the slide can reflect
  its selected state via `data-state="active" | "inactive"`.
- **`Carousel.Previous` / `Carousel.Next`** are real `<button>` elements wired
  to the Embla API. They auto-disable at edges (unless `options.loop` is
  true).
- **`Carousel.Navigation`** wraps dot/number indicators. When passed no
  children, it renders one `Carousel.NavigationItem` per scroll snap
  automatically. Pass children for full control.

## Documentation

Find the detailed [documentation with examples here](https://ui.bytogether.agency/docs/components/carousel).