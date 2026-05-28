# ScrollStack

A headless layered-stack primitive. Every `ScrollStack.Item` is a sticky card
sharing the Viewport as its positioning ancestor; as you scroll, each card
pins on top of the previous one and the earlier cards scale down, producing
the familiar stacked-cards transition.

## Import

```tsx
import { ScrollStack } from "@togetheragency/ui/scroll-stack";
```

The component is exported as a compound object; every sub-component is a
property of `ScrollStack`:

```tsx
ScrollStack.Root;
ScrollStack.Viewport;
ScrollStack.Item;
```

## Composition

ScrollStack has three parts: `Root → Viewport → Item`. Items must be direct
children of `Viewport`; they all need to share the same sticky-positioning
ancestor so that they can pin on top of one another instead of each card
disappearing as it leaves its own parent.

```tsx
<ScrollStack.Root useViewportScroll>
  <ScrollStack.Viewport className="h-[80vh]">
    <ScrollStack.Item>
      <div className="rounded-2xl bg-card p-6">Card one</div>
    </ScrollStack.Item>
    <ScrollStack.Item>
      <div className="rounded-2xl bg-card p-6">Card two</div>
    </ScrollStack.Item>
  </ScrollStack.Viewport>
</ScrollStack.Root>
```

- **`ScrollStack.Root`** holds shared configuration — `topOffset`,
  `stackGap`, `scaleStep`, `itemDistance`, `spring`, and the
  `useViewportScroll` switch. It runs a single `useScroll` (against the
  page or the Viewport) and feeds the smoothed scroll position to every Item.
- **`ScrollStack.Viewport`** is the scroll container and the shared
  positioning ancestor for the items. By default it's a passive wrapper and
  the page scroll drives the animation; pass `useViewportScroll` on Root and
  the Viewport gains `relative overflow-y-auto` so it scrolls itself.
- **`ScrollStack.Item`** is the visual card. It renders a motion `<div>`
  with `position: sticky; top: topOffset + index * stackGap`, plus a
  `margin-bottom` of `itemDistance` (except for the last one) to create the
  scroll distance that separates pin events. Its `scale` is driven by the
  Root's scroll progress, mapped from `[pinStart, lastPinStart]` to
  `[1, 1 - depthFromTop * scaleStep]`.

## Documentation

Find the detailed [documentation with examples here](https://ui.bytogether.agency/docs/components/scroll-stack).