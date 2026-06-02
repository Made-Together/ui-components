---
name: accordion
parent: togetheragency-ui
description: Rules for using @togetheragency/ui/accordion — a headless WAI-ARIA disclosure primitive. Use when building FAQs, expandable detail panels, settings sections, or any collapsible UI.
---

# Accordion

Headless, accessible disclosure primitive. Renders semantic `ul > li > h3 >
button` markup with the full WAI-ARIA accordion pattern wired up:
`aria-expanded`, `aria-controls`, `role="region"` on the panel, and
Arrow / Home / End keyboard navigation between triggers. Open state is exposed
via `data-state` on every part so transitions are pure CSS.

## Import

```tsx
import { Accordion } from "@togetheragency/ui/accordion";
```

## When to use

- FAQ / Q&A sections
- Expandable detail panels (specs, more-info, "show details")
- Settings sections that collapse
- Nested disclosure groups

## When *not* to use

- One-off "show more" toggle with a single panel → just use local state +
  a button. Accordion's overhead is for *groups* of disclosures.
- Tabbed content where exactly one panel is always visible → use **Tabs**.
- Scroll-pinned reveal of related sections → use **ScrollStack**.

## Composition tree

```
Accordion.Root              <ul>
  Accordion.Item            <li>
    Accordion.Heading       <h3> (configurable level)
      Accordion.Trigger     <button>
        children + optional Accordion.Indicator
    Accordion.Content       <section role="region">
```

`Heading` is required by the ARIA spec — the trigger must live inside a
heading so screen readers expose the structure. `Content` is a **sibling of
Heading**, both inside `Item`.

## Sub-components

### `Accordion.Root`

```ts
type Props = {
  type: "single" | "multiple";          // required
  value?: string | string[];            // controlled
  defaultValue?: string | string[];     // uncontrolled
  onValueChange?: (value: string | string[]) => void;
  collapsible?: boolean;                // default true; only affects type="single"
  disabled?: boolean;                   // disables the whole accordion
} & React.HTMLAttributes<HTMLUListElement>;
```

- `type="single"` → `value` is `string | undefined`. `collapsible: false`
  means once an item is open it can't be closed by clicking its trigger.
- `type="multiple"` → `value` is `string[]`. `collapsible` is ignored.
- `disabled` cascades; individual items can also be disabled.

Data attributes: `data-slot="accordion-root"`, `data-orientation="vertical"`.

### `Accordion.Item`

```ts
type Props = {
  value: string;     // required, unique within Root
  disabled?: boolean;
} & React.LiHTMLAttributes<HTMLLIElement>;
```

Data attributes: `data-slot="accordion-item"`, `data-state="open" | "closed"`,
`data-disabled` (present when disabled).

### `Accordion.Heading`

```ts
type Props = {
  level?: 1 | 2 | 3 | 4 | 5 | 6;   // default 3
} & React.HTMLAttributes<HTMLHeadingElement>;
```

Renders `<h{level}>`. Pick the level that fits the surrounding page outline
— do not default to `h3` if the accordion sits inside an `h2` section that's
already nested.

Data attributes: `data-slot="accordion-heading"`,
`data-state="open" | "closed"`.

### `Accordion.Trigger`

```ts
type Props = React.ButtonHTMLAttributes<HTMLButtonElement>;
```

Already wired with `aria-expanded`, `aria-controls`, and keyboard handlers
(ArrowDown / ArrowUp / Home / End move between triggers in the same Root).
Do not override these.

Data attributes: `data-slot="accordion-trigger"`,
`data-state="open" | "closed"`, `data-disabled` (when disabled).

### `Accordion.Content`

```ts
type Props = React.HTMLAttributes<HTMLDivElement>;
```

Renders `<section role="region">` labelled by the trigger. Default styles
animate `grid-template-rows` from `0fr` → `1fr` over 300ms — no JS height
measurement, no layout thrash. Content is mounted in the DOM but hidden when
closed (the grid row collapses to 0). Use `data-[state=open]:` and
`data-[state=closed]:` Tailwind selectors to layer your own transitions.

Data attributes: `data-slot="accordion-content"`,
`data-state="open" | "closed"`.

### `Accordion.Indicator`

```ts
type Props = {
  children?: React.ReactNode | ((args: { open: boolean }) => React.ReactNode);
} & React.HTMLAttributes<HTMLSpanElement>;
```

Decorative `<span>` that mirrors the item's `data-state`. Applies **no
transform by default** — rotate, swap, or scale yourself.

Data attributes: `data-slot="accordion-indicator"`,
`data-state="open" | "closed"`.

## Controlled vs uncontrolled

```tsx
// Uncontrolled — single, default-open, collapsible
<Accordion.Root type="single" defaultValue="faq-1" collapsible>…</Accordion.Root>

// Uncontrolled — multiple, default-all-closed
<Accordion.Root type="multiple" defaultValue={[]}>…</Accordion.Root>

// Controlled — single
const [open, setOpen] = useState<string | undefined>("faq-1");
<Accordion.Root type="single" value={open} onValueChange={setOpen} collapsible>…</Accordion.Root>

// Controlled — multiple
const [open, setOpen] = useState<string[]>(["faq-1"]);
<Accordion.Root
  type="multiple"
  value={open}
  onValueChange={(v) => setOpen(v as string[])}
>…</Accordion.Root>
```

When controlled with `type="single"`, the value type is `string | undefined`.
With `type="multiple"`, it's `string[]`. The `onValueChange` payload mirrors
that.

## Data-attribute styling reference

| Attribute        | Where                         | Values                    |
| ---------------- | ----------------------------- | ------------------------- |
| `data-slot`      | every part                    | identifier per part       |
| `data-state`     | Item, Heading, Trigger, Content, Indicator | `"open"` / `"closed"` |
| `data-disabled`  | Item, Trigger                 | present when disabled     |
| `data-orientation` | Root                        | `"vertical"`              |

Standard Tailwind targeting:

```tsx
<Accordion.Trigger
  className="
    flex w-full items-center justify-between py-4
    data-[state=open]:text-foreground
    data-[disabled]:opacity-50 data-[disabled]:cursor-not-allowed
  "
>
  Question
  <Accordion.Indicator className="transition-transform duration-300 data-[state=open]:rotate-180">
    <ChevronDown className="size-4" />
  </Accordion.Indicator>
</Accordion.Trigger>

<Accordion.Content
  className="
    grid overflow-hidden transition-[grid-template-rows] duration-300
    data-[state=closed]:grid-rows-[0fr] data-[state=open]:grid-rows-[1fr]
  "
>
  <div className="min-h-0">
    <p className="pb-4 text-muted-foreground">Answer.</p>
  </div>
</Accordion.Content>
```

The inner `<div className="min-h-0">` is the standard workaround for
`grid-template-rows` transitions — without it the inner content does not
collapse.

## Canonical code shapes

### Basic FAQ (single, collapsible)

```tsx
<Accordion.Root type="single" collapsible defaultValue="q1" className="divide-y">
  {faqs.map((faq) => (
    <Accordion.Item key={faq.id} value={faq.id} className="py-2">
      <Accordion.Heading level={3}>
        <Accordion.Trigger className="flex w-full items-center justify-between py-3 text-left">
          <span className="font-medium">{faq.question}</span>
          <Accordion.Indicator className="transition-transform data-[state=open]:rotate-180">
            <ChevronDown className="size-4" />
          </Accordion.Indicator>
        </Accordion.Trigger>
      </Accordion.Heading>
      <Accordion.Content className="grid overflow-hidden transition-[grid-template-rows] duration-300 data-[state=closed]:grid-rows-[0fr] data-[state=open]:grid-rows-[1fr]">
        <div className="min-h-0">
          <p className="pb-3 text-muted-foreground">{faq.answer}</p>
        </div>
      </Accordion.Content>
    </Accordion.Item>
  ))}
</Accordion.Root>
```

### Multiple panels, plus/minus indicator

```tsx
<Accordion.Root type="multiple" defaultValue={[]}>
  {items.map((item) => (
    <Accordion.Item key={item.id} value={item.id}>
      <Accordion.Heading>
        <Accordion.Trigger className="flex w-full justify-between py-3">
          {item.title}
          <Accordion.Indicator>
            {({ open }) => (open ? <Minus className="size-4" /> : <Plus className="size-4" />)}
          </Accordion.Indicator>
        </Accordion.Trigger>
      </Accordion.Heading>
      <Accordion.Content className="grid transition-[grid-template-rows] duration-300 data-[state=closed]:grid-rows-[0fr] data-[state=open]:grid-rows-[1fr]">
        <div className="min-h-0 pb-3">{item.body}</div>
      </Accordion.Content>
    </Accordion.Item>
  ))}
</Accordion.Root>
```

### Controlled — sync with URL or external state

```tsx
const [open, setOpen] = useState<string | undefined>(searchParams.get("section") ?? undefined);

useEffect(() => {
  if (open) router.replace(`?section=${open}`, { scroll: false });
}, [open, router]);

<Accordion.Root
  type="single"
  value={open}
  onValueChange={(v) => setOpen(v as string | undefined)}
  collapsible
>
  …
</Accordion.Root>
```

### Disabled items

```tsx
<Accordion.Root type="single" collapsible>
  <Accordion.Item value="locked" disabled>
    <Accordion.Heading>
      <Accordion.Trigger>Coming soon</Accordion.Trigger>
    </Accordion.Heading>
    <Accordion.Content>Hidden behind disabled.</Accordion.Content>
  </Accordion.Item>
</Accordion.Root>
```

### Render-prop indicator with custom transition

```tsx
<Accordion.Indicator>
  {({ open }) => (
    <motion.span
      animate={{ rotate: open ? 180 : 0 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
    >
      <ChevronDown className="size-4" />
    </motion.span>
  )}
</Accordion.Indicator>
```

## Accessibility

- **Keyboard:** ArrowDown / ArrowUp move focus between triggers in the same
  Root. Home / End jump to first / last. Space / Enter toggle. Tab leaves
  the accordion.
- **Screen readers:** Triggers report `aria-expanded` and `aria-controls`.
  Each content panel is a `role="region"` labelled by its trigger.
- **Heading level:** Pick `level` to match the surrounding outline. Do not
  break heading order with default `h3` if you're inside an `h2`.
- **Reduced motion:** The default CSS transition is short (300ms) and pure
  property animation; it is gentle enough that `prefers-reduced-motion`
  users tolerate it. If you add a more elaborate motion-based indicator,
  guard it with `useReducedMotion`.

## Gotchas

- **`grid-template-rows` needs `min-h-0` inside.** Without an inner wrapper
  set to `min-h-0`, the content's intrinsic min-height prevents collapse.
- **`collapsible` only applies to `type="single"`.** With `type="multiple"`
  individual items always collapse on click.
- **Do not put non-Item elements inside Root.** Root is a `<ul>`; only
  `<li>`-rendering children (i.e. `Accordion.Item`) belong there.
- **Do not nest a Trigger outside a Heading.** ARIA requires the heading
  wrapper. The Trigger asserts `aria-expanded`, but the heading is what
  gives screen-reader users navigability between sections.
- **Content is mounted by default** (only visually collapsed). Avoid
  expensive renders inside closed panels if list is large; lazy-render with
  `data-state` if needed.
- **`onValueChange` payload type depends on `type`.** Narrow before
  consuming (`v as string | undefined` vs `v as string[]`).
