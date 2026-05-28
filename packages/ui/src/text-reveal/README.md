# TextReveal

A word-by-word reveal primitive. By default the reveal is scroll-driven;
the words animate in as the section moves through the viewport. Pass
`progress` and the component flips into a fully controlled mode where you
own the value (perfect for sliders, programmatic playback, hero entrances,
or anything that shouldn't depend on scroll).

The component owns the per-word splitting and motion plumbing; you own
the typography, the layout, and the per-word transform.

## Import

```tsx
import { TextReveal } from "@togetheragency/ui/text-reveal";
```

The component is exported as a compound object; every sub-component is a
property of `TextReveal`:

```tsx
TextReveal.Root;
TextReveal.Text;
TextReveal.Word;
```

## Composition

`TextReveal.Root` is the orchestrator. In its **default scroll mode** give
it a tall height; the height determines how much scroll distance the
reveal occupies — and place a `sticky` child inside to pin the words while
the user scrolls past:

```tsx
<TextReveal.Root className="relative min-h-[200vh]">
  <div className="sticky top-0 flex h-screen items-center">
    <TextReveal.Text className="text-4xl">
      The quick brown fox jumps over the lazy dog.
    </TextReveal.Text>
  </div>
</TextReveal.Root>
```

In **controlled mode** the layout is up to you; the Root is just a
container that propagates `progress` to descendants via context; no height
or sticky wrapper required.

- **`TextReveal.Root`** wires up `motion`'s `useScroll` against itself
  (scroll mode) or normalizes the `progress` prop to a `MotionValue`
  (controlled mode). Either way, it exposes the resulting progress to
  descendants via context.
- **`TextReveal.Text`** accepts a plain string, splits it on whitespace,
  and renders each word through `TextReveal.Word`. Use the `transform`
  prop to customise the reveal.
- **`TextReveal.Word`** is the lower-level primitive; one animated word
  that reads its slice of the root progress. Compose words manually when
  you need arbitrary surrounding markup (links, highlights, mixed
  elements).

## Documentation

Find the detailed [documentation with examples here](https://ui.bytogether.agency/docs/components/text-reveal).