# Tabs

A headless, accessible tabs primitive. Renders semantic
`role="tablist" / "tab" / "tabpanel"` markup with the full WAI-ARIA tabs
pattern wired up; `aria-selected`, `aria-controls`, `aria-labelledby`,
roving `tabIndex`, and orientation-aware arrow-key navigation. The optional
`Tabs.Indicator` rides on motion's shared `layoutId`, so the active marker
slides smoothly between triggers when selection changes.

## Import

```tsx
import { Tabs } from "@togetheragency/ui/tabs";
```

The component is exported as a compound object; every sub-component is a
property of `Tabs`:

```tsx
Tabs.Root;
Tabs.Container;
Tabs.List;
Tabs.Trigger;
Tabs.Indicator;
Tabs.Progress;
Tabs.Separator;
Tabs.Content;
```

## Composition

Tabs follows the WAI-ARIA pattern strictly. The minimum viable tabs widget
nests four parts — `Root → Container → List → Trigger`, with `Content`
siblings of `Container`:

```tsx
<Tabs.Root defaultValue="one">
  <Tabs.Container>
    <Tabs.List aria-label="Sections">
      <Tabs.Trigger id="one">
        One
        <Tabs.Indicator />
      </Tabs.Trigger>
      <Tabs.Trigger id="two">
        Two
        <Tabs.Indicator />
      </Tabs.Trigger>
    </Tabs.List>
  </Tabs.Container>
  <Tabs.Content id="one">Panel one</Tabs.Content>
  <Tabs.Content id="two">Panel two</Tabs.Content>
</Tabs.Root>
```

- **`Tabs.Root`** renders a `<div>` and owns selection. Pass `defaultValue`
  or `value` + `onValueChange` to choose between uncontrolled and
  controlled.
- **`Tabs.Container`** is a `position: relative` wrapper around `Tabs.List`.
  It provides the positioning context the absolutely-rendered
  `Tabs.Indicator` needs — required whenever you use an indicator.
- **`Tabs.List`** is the `role="tablist"` group, with
  `aria-orientation` derived from the root.
- **`Tabs.Trigger`** is the real `role="tab"` `<button>`. Each one carries an
  `id` that ties it to a `Tabs.Content` with the same `id`.
- **`Tabs.Indicator`** is an optional sliding marker. Rendered only inside
  the currently selected trigger; motion's shared `layoutId` animates the
  marker between triggers when selection moves.
- **`Tabs.Progress`** is an optional CSS-driven progress indicator. Renders
  only when `Tabs.Root` has `autoplay` enabled and only inside the currently
  selected trigger. Its animation duration tracks `autoplayDelay` via the
  `--tabs-autoplay-duration` custom property — no React state per frame.
- **`Tabs.Separator`** is an optional decorative divider between adjacent
  triggers. Fades out on the active tab so the indicator can take its
  place.
- **`Tabs.Content`** is the `role="tabpanel"` for an id. By default,
  inactive panels are unmounted — pass `forceMount` to keep them in the DOM.

## Documentation

Find the detailed [documentation with examples here](https://ui.bytogether.agency/docs/components/tabs).