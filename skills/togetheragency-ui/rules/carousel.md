---
name: carousel
parent: togetheragency-ui
description: Rules for using @togetheragency/ui/carousel — a headless Embla-powered carousel. Use when building image galleries, content sliders, swipeable cards, testimonial loops, or any drag/snap content navigation.
---

# Carousel

Headless, composable carousel built on **Embla Carousel**. Ships drag, snap
points, autoplay, looping, multi-slide layouts, wheel-gesture support, and
keyboard-accessible navigation. Every visual choice is yours.

## Import

```tsx
import {
  Carousel,
  useCarousel,
  useIsSelectedSnap,
  useCanScroll,
  useScrollSnaps,
} from "@togetheragency/ui/carousel";
```

## When to use

- Image galleries, hero sliders
- Testimonial / quote carousels
- Multi-card content rows (with snap)
- Vertical image stacks (with `options.axis: "y"`)
- Any swipeable, drag-able content sequence

## When *not* to use

- Discrete labelled sections of content → use **Tabs**.
- Auto-scrolling one-way loop of logos/badges → use **Marquee**.
- Single line of overflowing text → use **Ticker**.

## Composition tree

```
Carousel.Root
  Carousel.Viewport            (must have overflow-hidden)
    Carousel.Container         (must have display:flex)
      Carousel.Slide index={0}
      Carousel.Slide index={1}
      …
  Carousel.Previous   (anywhere inside Root)
  Carousel.Next
  Carousel.Navigation
    [optional Carousel.NavigationItem index={n}]
```

`Previous`, `Next`, and `Navigation` may live anywhere inside `Root`; only
the Viewport → Container → Slide chain is strictly nested.

## Sub-components

### `Carousel.Root`

```ts
type Props = {
  options?: EmblaOptionsType;        // forwarded to useEmblaCarousel
  plugins?: EmblaPluginType[];       // forwarded; if you include Autoplay yourself, the built-in is skipped
  autoplay?: boolean | AutoplayOptionsType;  // default true; pass false to disable
  wheelGestures?: boolean;           // default true; trackpad horizontal scroll → carousel scroll
  onApiChange?: (api: EmblaApi) => void;
} & React.HTMLAttributes<HTMLDivElement>;
```

Notes:
- `options` is the Embla options bag: `{ loop, align, dragFree, axis,
  slidesToScroll, startIndex, … }`. See
  https://www.embla-carousel.com/docs/api/options.
- `autoplay: true` uses Embla's autoplay plugin defaults. Pass an options
  object to tune: `{ delay: 4000, stopOnInteraction: false, stopOnMouseEnter:
  true }`. Pass `false` to disable.
- If you supply your own Autoplay plugin via `plugins`, the built-in auto-add
  is skipped.
- `wheelGestures` adds trackpad/wheel support; set `false` to opt out.
- `onApiChange` fires when the Embla API instance is ready or replaced —
  useful for external controls/telemetry.

Data attribute: `data-slot="carousel-root"`.

### `Carousel.Viewport`

```ts
type Props = React.HTMLAttributes<HTMLDivElement>;
```

The clipped window. **Must** have `overflow-hidden`. The Embla ref attaches
here.

Data attribute: `data-slot="carousel-viewport"`.

### `Carousel.Container`

```ts
type Props = React.HTMLAttributes<HTMLDivElement>;
```

The flex track. Apply `flex` (`flex-col` for vertical). Gap between slides
goes here (`gap-4`, etc.).

Data attribute: `data-slot="carousel-container"`.

### `Carousel.Slide`

```ts
type Props = {
  index: number;            // required, matches the slide's position
} & React.HTMLAttributes<HTMLDivElement>;
```

Width comes from your classes (e.g. `flex-[0_0_100%]`, `md:basis-1/3`).

Data attributes: `data-slot="carousel-slide"`,
`data-state="active" | "inactive"`.

### `Carousel.Previous` / `Carousel.Next`

```ts
type Props = React.ButtonHTMLAttributes<HTMLButtonElement>;
```

Real `<button>`s wired to `scrollPrev` / `scrollNext`. Auto-disable at edges
unless `options.loop` is true. You provide the icon/label.

Data attribute: `data-slot="carousel-previous"` / `"carousel-next"`. Native
`disabled` reflects scrollability.

### `Carousel.Navigation`

```ts
type Props = Omit<React.HTMLAttributes<HTMLElement>, "children"> & {
  children?: React.ReactNode;        // when omitted, auto-generates NavigationItem per snap
};
```

If you pass no children, renders one `Carousel.NavigationItem` per scroll
snap automatically. Pass children for full control.

Data attribute: `data-slot="carousel-navigation"`.

### `Carousel.NavigationItem`

```ts
type Props = {
  index: number;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;
```

Scrolls to `index` on click.

Data attributes: `data-slot="carousel-navigation-item"`,
`data-state="active" | "inactive"`.

## Hooks

All hooks must be called inside a `Carousel.Root` subtree.

```ts
useCarousel(): {
  emblaRef: EmblaRef;
  emblaApi: EmblaApi | undefined;
  scrollPrev: () => void;
  scrollNext: () => void;
  scrollTo: (index: number) => void;
  selectedIndex: number;
  scrollSnaps: number[];
};

useIsSelectedSnap(index: number | undefined): boolean;
useCanScroll(direction: "prev" | "next"): boolean;
useScrollSnaps(): number[];
```

Use these to build custom controls (counters, fancy nav, telemetry).

## Data-attribute styling reference

| Attribute     | Where                                                | Values                       |
| ------------- | ---------------------------------------------------- | ---------------------------- |
| `data-slot`   | every part                                           | identifier per part          |
| `data-state`  | `Carousel.Slide`, `Carousel.NavigationItem`          | `"active"` / `"inactive"`    |
| `disabled`    | `Previous`, `Next`                                   | present when at edge         |

```tsx
<Carousel.NavigationItem
  index={i}
  className="size-2 rounded-full bg-muted data-[state=active]:bg-foreground"
/>
```

## Canonical code shapes

### Basic single-slide carousel with dot nav

```tsx
<Carousel.Root options={{ loop: true, align: "start" }}>
  <Carousel.Viewport className="overflow-hidden">
    <Carousel.Container className="flex">
      {slides.map((slide, i) => (
        <Carousel.Slide key={slide.id} index={i} className="min-w-0 flex-[0_0_100%]">
          <img src={slide.src} alt={slide.alt} className="aspect-video w-full object-cover" />
        </Carousel.Slide>
      ))}
    </Carousel.Container>
  </Carousel.Viewport>

  <div className="mt-4 flex items-center justify-between">
    <Carousel.Previous className="rounded-full border p-2 disabled:opacity-30">
      <ChevronLeft className="size-4" />
    </Carousel.Previous>
    <Carousel.Navigation className="flex gap-2">
      {slides.map((slide, i) => (
        <Carousel.NavigationItem
          key={slide.id}
          index={i}
          aria-label={`Go to slide ${i + 1}`}
          className="size-2 rounded-full bg-muted data-[state=active]:bg-foreground"
        />
      ))}
    </Carousel.Navigation>
    <Carousel.Next className="rounded-full border p-2 disabled:opacity-30">
      <ChevronRight className="size-4" />
    </Carousel.Next>
  </div>
</Carousel.Root>
```

### Multi-slide responsive layout

```tsx
<Carousel.Root options={{ align: "start", dragFree: true }}>
  <Carousel.Viewport className="overflow-hidden">
    <Carousel.Container className="flex gap-4">
      {cards.map((card, i) => (
        <Carousel.Slide
          key={card.id}
          index={i}
          className="min-w-0 flex-[0_0_80%] sm:flex-[0_0_50%] md:flex-[0_0_33.333%] lg:flex-[0_0_25%]"
        >
          <Card data={card} />
        </Carousel.Slide>
      ))}
    </Carousel.Container>
  </Carousel.Viewport>
</Carousel.Root>
```

`dragFree: true` is the right choice when each pointer/wheel gesture should
free-scroll rather than snapping a single slide at a time.

### Autoplay with pause on hover

```tsx
<Carousel.Root
  options={{ loop: true }}
  autoplay={{ delay: 4000, stopOnMouseEnter: true, stopOnInteraction: false }}
>
  <Carousel.Viewport className="overflow-hidden">
    <Carousel.Container className="flex">{/* slides */}</Carousel.Container>
  </Carousel.Viewport>
</Carousel.Root>
```

`stopOnInteraction: false` makes autoplay resume after the user drags;
`stopOnMouseEnter: true` pauses while hovered.

### Vertical carousel

```tsx
<Carousel.Root options={{ axis: "y", loop: true }}>
  <Carousel.Viewport className="h-96 overflow-hidden">
    <Carousel.Container className="flex h-full flex-col">
      {items.map((item, i) => (
        <Carousel.Slide key={item.id} index={i} className="min-h-0 flex-[0_0_100%]">
          {/* item */}
        </Carousel.Slide>
      ))}
    </Carousel.Container>
  </Carousel.Viewport>
</Carousel.Root>
```

Vertical requires explicit height on the Viewport.

### Custom controls with hooks

```tsx
function SlideCounter() {
  const { selectedIndex, scrollSnaps } = useCarousel();
  return <span>{selectedIndex + 1} / {scrollSnaps.length}</span>;
}

<Carousel.Root>
  <Carousel.Viewport className="overflow-hidden">
    <Carousel.Container className="flex">{/* … */}</Carousel.Container>
  </Carousel.Viewport>
  <SlideCounter />
</Carousel.Root>
```

### Disable wheel gestures (e.g. inside a scrollable page section)

```tsx
<Carousel.Root wheelGestures={false}>…</Carousel.Root>
```

## Accessibility

- `Previous` / `Next` are real `<button>` elements with native `disabled`
  state when scrolling to that edge is impossible.
- `NavigationItem` is a `<button>`; pass `aria-label` (e.g. `"Go to slide
  3"`) when the visible content is just a dot.
- Keyboard: Embla provides focus handling on slides; arrow keys do not move
  slides by default — wire your own with the hooks if needed.
- Pause autoplay (`stopOnMouseEnter: true`) for users who hover; consider
  pausing on focus-within for keyboard users.

## Gotchas

- **`Viewport` must have `overflow-hidden`.** Without it the slides spill
  visibly.
- **`Container` must have `display: flex`** (`flex` for horizontal,
  `flex-col` for vertical, plus `h-full` on the container for vertical).
- **Slide width is yours.** `min-w-0` plus `flex-[0_0_<basis>]` is the
  Embla-idiomatic recipe.
- **Vertical axis requires explicit height** on the Viewport.
- **`autoplay: false` actually means false.** Default is `true` — most
  carousels do not need autoplay; pass `autoplay={false}` if the user
  expects manual navigation only.
- **`dragFree: true` for multi-slide with momentum.** Snap-per-drag feels
  wrong when many small slides are visible.
- **Adding your own Autoplay plugin via `plugins`** bypasses the built-in
  auto-injection — fine, but pass `autoplay={false}` or your config will
  collide with the default.
- **Slide indices must be sequential starting at 0** and unique. Don't skip
  numbers.
