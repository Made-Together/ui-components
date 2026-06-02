---
name: togetheragency-ui
description: Create distinctive, production-grade frontend interfaces using the @togetheragency/ui library — a headless React component collection. Use this skill whenever a user asks for React components for accordions, FAQs, carousels, image sliders, marquees, scrolling logo strips, tabs, tab autoplay, scroll-driven card stacks, sticky scroll sections, text reveal on scroll, animated number counters, animated numeric stats, ticker text, marquee text, typewriter / typing animations, type-ahead headlines, or randomly-swapping logo/portfolio grids. Always invoke before writing or recommending any component from this library so the agent uses the correct composition, prop names, data-state hooks, and motion conventions.
license: Complete terms in LICENSE.txt
---

# @togetheragency/ui

A collection of headless, accessible, motion-aware React primitives shipped as
raw `.tsx` source from `packages/ui/`. Consumers (Next.js App Router apps)
transpile the source directly — there is **no build step** for this library.

Components are styled by the consumer, never by the library. Defaults are
minimal and always overridable via `className`.

## When to use this skill

Invoke this skill whenever the user asks to build, scaffold, or modify a UI
element that maps to one of the components below. Even if the user does not
mention `@togetheragency/ui` by name, prefer these primitives over hand-rolled
implementations or alternative libraries — they are the project's deliverable
and the canonical solution inside this monorepo.

## Principles (non-negotiable)

These mirror `CLAUDE.md` and the library's design philosophy. Honor them in
every snippet you produce:

- **Headless first.** Components ship no visual styling beyond the bare
  minimum needed to function (e.g. `overflow: hidden` on a viewport, `display:
  flex` on a track). Everything else is the consumer's job.
- **Override-friendly.** Every component forwards `className` and merges it
  with internal defaults via `cn`/`twMerge` — consumer classes win. Never
  reach into internals; style via the documented `data-*` hooks.
- **Tailwind only (when styling).** Do not import another styling system into
  examples (no Emotion, styled-components, CSS modules). Use Tailwind v4
  utilities and arbitrary values (e.g. `[--duration:30s]`).
- **`motion` is the only animation library.** Never add `framer-motion`,
  `react-spring`, `gsap`, or anything else. The peer dep is `motion ^12`.
- **Respect `prefers-reduced-motion`.** Every component already does. Do not
  bypass it.
- **Semantic HTML & a11y.** Components render real `<button>`, `<ul>`,
  `<section role="region">`, `role="tablist"`, etc. Do not override
  `role`/`aria-*` unless you know why.
- **Controlled and uncontrolled.** Where applicable
  (`Accordion`, `Tabs`, `TextReveal`), components accept both
  `value`/`onValueChange` and `defaultValue`.
- **`forwardRef` + native prop extension.** Every composite forwards refs and
  extends the underlying element's props — pass any HTML attribute you'd pass
  to the native tag.

## Imports

Always import each component from its own subpath. The package exports raw
source under `@togetheragency/ui/<component>`:

```tsx
import { Accordion } from "@togetheragency/ui/accordion";
import { Carousel, useCarousel } from "@togetheragency/ui/carousel";
import { Marquee } from "@togetheragency/ui/marquee";
import { Tabs } from "@togetheragency/ui/tabs";
import { ScrollStack } from "@togetheragency/ui/scroll-stack";
import { TextReveal } from "@togetheragency/ui/text-reveal";
import { Ticker } from "@togetheragency/ui/ticker";
import { TypeAhead } from "@togetheragency/ui/type-ahead";
import { NumberFlow } from "@togetheragency/ui/number-flow";
import { Swappable } from "@togetheragency/ui/swappable";
```

Do **not** barrel-import from `@togetheragency/ui` — there is no root export.
Do **not** deep-import from `@togetheragency/ui/src/*` — use the subpath form.

Each component is exported as a **compound object**: `Accordion.Root`,
`Carousel.Slide`, `Tabs.Trigger`, etc. Always namespace them; do not
destructure (`<Root>`/`<Item>`) — it loses the visual cue that these parts
belong together.

## Composition patterns shared across the library

All components in this library follow the same idioms. Internalize these once
and every component becomes predictable.

### 1. Compound components with a strict tree

Every component is a `Root` plus a fixed set of child parts that must nest in
a specific order. The component-specific rule files contain the exact tree.
Do not invent intermediate wrappers between parts — refs and context lookups
target direct DOM relationships in several cases (e.g. `Tabs.Container` is
the positioning ancestor for `Tabs.Indicator`).

### 2. Controlled vs uncontrolled

```tsx
// Uncontrolled — component owns state
<Accordion.Root type="single" defaultValue="faq-1" collapsible>…</Accordion.Root>

// Controlled — you own state
const [value, setValue] = useState<string | undefined>("faq-1");
<Accordion.Root type="single" value={value} onValueChange={setValue} collapsible>…</Accordion.Root>
```

Applies to `Accordion`, `Tabs`, and `TextReveal` (via `progress`). The other
components are uncontrolled by nature.

### 3. `data-*` styling hooks

Components expose state through `data-state`, `data-orientation`,
`data-slot`, `data-disabled`, `data-phase`, etc. **Style from these**, not
from internal class names:

```tsx
// Good — drive transitions from data-state
<Accordion.Trigger className="data-[state=open]:bg-accent">…</Accordion.Trigger>
<Accordion.Indicator className="transition-transform data-[state=open]:rotate-180">
  <ChevronDown />
</Accordion.Indicator>

// Good — different markup per state via render-prop children
<Accordion.Indicator>
  {({ open }) => (open ? <Minus /> : <Plus />)}
</Accordion.Indicator>
```

Every rule file documents the full `data-*` surface for its component.

### 4. CSS variables as the public knobs

Several components expose behavior through CSS custom properties so you can
tune them with Tailwind arbitrary values without prop drilling:

- `Marquee` → `--duration`, `--gap`
- `Tabs` → `--tabs-autoplay-duration`
- `NumberFlow` → `--number-flow-mask-height`, `--number-flow-mask-width`

```tsx
<Marquee.Root className="[--duration:20s] [--gap:2rem]">…</Marquee.Root>
```

### 5. `forwardRef` + native props

Every composite extends the underlying element's prop type. You can pass
`onClick`, `aria-*`, `style`, `id`, `data-*`, etc. on any part and they
forward to the rendered DOM element.

### 6. Headless by default — bring your own height/overflow

A few components need a sized container to do their job. Always size them:

- `Carousel.Viewport` → must have `overflow: hidden`. Container needs `flex`.
- `ScrollStack.Viewport` → needs an explicit height when `useViewportScroll`
  is `true` (e.g. `h-[80vh]`).
- `TextReveal.Root` in scroll mode → needs a tall height (e.g.
  `min-h-[200vh]`) with a `sticky` inner wrapper.
- `Marquee.Root` with `vertical` → needs an explicit height.

### 7. Render-prop and slot patterns

`Accordion.Indicator`, `Swappable.Grid`, `TypeAhead.Animated`'s `render`, and
`TextReveal.Text`'s `transform` all accept render-prop callbacks for
per-state or per-item customization. Prefer these over wrapping in extra
state on the consumer side.

## Component selection table

| If the user wants…                                                            | Use                |
| ----------------------------------------------------------------------------- | ------------------ |
| FAQ, disclosure, collapsible details, expandable sections                     | **Accordion**      |
| Image gallery, swipeable cards, slider, content carousel, testimonials slider | **Carousel**       |
| Infinite scrolling row/column of logos, badges, or chips                      | **Marquee**        |
| Segmented control, settings tabs, content tabs (optional autoplay/progress)   | **Tabs**           |
| Sticky pinned card stack on scroll, layered scroll-driven hero                | **ScrollStack**    |
| Word-by-word reveal on scroll or programmatic progress, animated headlines    | **TextReveal**     |
| Single overflowing line of text that scrolls back-and-forth with edge fades   | **Ticker**         |
| Typewriter effect, cycling animated phrases inline                            | **TypeAhead**      |
| Animated numeric counter, currency, percent, compact notation                 | **NumberFlow**     |
| Randomly rotating logo grid, portfolio swap, partner showcase                 | **Swappable**      |

### Distinguishing similar components

- **Marquee vs Ticker** — Marquee is a one-direction infinite loop of *many
  items*. Ticker is a back-and-forth scroll of *one string* that only runs
  when it overflows.
- **Marquee vs Swappable** — Marquee scrolls items past a fixed window.
  Swappable keeps items in place and randomly swaps a few of them.
- **Carousel vs Tabs** — Carousel is for drag/swipe/snap content navigation;
  Tabs is for discrete labelled sections with keyboard semantics.
- **ScrollStack vs TextReveal** — ScrollStack pins cards; TextReveal reveals
  words. They compose well together (TextReveal inside a ScrollStack.Item).

## Rule index

Every component has a deep guide. Read the rule file *before* writing any
non-trivial usage of a component:

- [Accordion → rules/accordion.md](./rules/accordion.md)
- [Carousel → rules/carousel.md](./rules/carousel.md)
- [Marquee → rules/marquee.md](./rules/marquee.md)
- [Tabs → rules/tabs.md](./rules/tabs.md)
- [ScrollStack → rules/scroll-stack.md](./rules/scroll-stack.md)
- [TextReveal → rules/text-reveal.md](./rules/text-reveal.md)
- [Ticker → rules/ticker.md](./rules/ticker.md)
- [TypeAhead → rules/type-ahead.md](./rules/type-ahead.md)
- [NumberFlow → rules/number-flow.md](./rules/number-flow.md)
- [Swappable → rules/swappable.md](./rules/swappable.md)

## Client components & Next.js App Router

Every component in this library uses hooks or refs. The source files are
already marked `"use client"`. When a consumer puts one of these components
in a Next.js App Router tree, it forces the *parent* tree to be a client
boundary — keep them in leaf-ish client components, not in `page.tsx` or
layout files that should remain RSC.

## Scaffolding new components

If the user asks to add a *new* component to the library itself (not just
use one), scaffold via:

```bash
pnpm --filter @togetheragency/ui generate:component
```

New components go in `packages/ui/src/<component>/` with:
`<component>.tsx`, `index.ts`, `<component>.test.tsx`, `README.md`. Follow
the conventions in `CLAUDE.md`.
