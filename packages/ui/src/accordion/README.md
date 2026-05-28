# Accordion

A headless, accessible disclosure primitive. Renders semantic
`ul > li > h3 > button` markup with the full WAI-ARIA accordion pattern wired
up — `aria-expanded`, `aria-controls`, panel `region`, and Arrow / Home / End
keyboard navigation between triggers. Open state is exposed via `data-state`
on every part so you can drive transitions purely from CSS.

## Import

```tsx
import { Accordion } from "@togetheragency/ui/accordion";
```

The component is exported as a compound object — every sub-component is a
property of `Accordion`:

```tsx
Accordion.Root;
Accordion.Item;
Accordion.Heading;
Accordion.Trigger;
Accordion.Content;
Accordion.Indicator;
```

## Composition

Accordion follows the WAI-ARIA pattern strictly. The minimum viable accordion
nests five parts; `Root → Item → Heading → Trigger`, plus `Content` as a
sibling of `Heading`:

```tsx
<Accordion.Root type="single" defaultValue="one" collapsible>
  <Accordion.Item value="one">
    <Accordion.Heading>
      <Accordion.Trigger>
        Title
        <Accordion.Indicator>
          <ChevronDown />
        </Accordion.Indicator>
      </Accordion.Trigger>
    </Accordion.Heading>
    <Accordion.Content>Panel content</Accordion.Content>
  </Accordion.Item>
</Accordion.Root>
```

- **`Accordion.Root`** renders a `<ul>` and owns the open-state store. Pass
  `type="single"` or `type="multiple"` to choose between exclusive and
  multi-open behavior.
- **`Accordion.Item`** renders an `<li>`. Each item needs a unique `value`
  prop — that string is what `defaultValue` / `value` / `onValueChange`
  reference.
- **`Accordion.Heading`** renders an `<h3>` by default (configurable via
  `level`). This is required by the ARIA accordion pattern — the trigger must
  live inside a heading so screen readers expose the structure correctly.
- **`Accordion.Trigger`** is the real `<button>`. Already wired with
  `aria-expanded`, `aria-controls`, and keyboard navigation
  (ArrowDown / ArrowUp / Home / End move between triggers).
- **`Accordion.Content`** is the `<section role="region">` labelled by the
  trigger. The default styles animate `grid-template-rows` from `0fr` to
  `1fr`, giving you a smooth height transition without measuring anything.
- **`Accordion.Indicator`** is an optional decorative `<span>` that mirrors
  the item's `data-state`. It applies no transform by default — drive
  transitions yourself via `data-[state=open]:…` classes, or pass a function
  as children (`{({ open }) => …}`) to render different content per state
  (great for plus/minus pairs).

## Documentation

Find the detailed [documentation with examples here](https://ui.bytogether.agency/docs/components/accordion).