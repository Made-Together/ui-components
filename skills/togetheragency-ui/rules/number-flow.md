---
name: number-flow
parent: togetheragency-ui
description: Rules for using @togetheragency/ui/number-flow — a headless animated number display. Use when building animated counters, stats, pricing displays, live data, currency, percentages, or any numeric transitions.
---

# NumberFlow

Thin, headless wrapper around [`@number-flow/react`](https://number-flow.barvian.me/).
Renders a custom element that animates digit transitions whenever `value`
changes. Formatting is driven by standard `Intl.NumberFormatOptions`, so
currencies, percentages, compact notations, and locales work out of the
box.

## Import

```tsx
import {
  NumberFlow,
  continuous,
  useCanAnimate,
  useIsSupported,
  usePrefersReducedMotion,
} from "@togetheragency/ui/number-flow";
```

Re-exports `continuous` (the slot-machine plugin) plus the underlying
library's animation hooks.

## When to use

- Stat dashboards (counters, deltas, KPIs)
- Pricing displays (currency, billing toggles)
- Live data (vote counts, view counters, scores)
- Percentage / compact-notation displays (1.2K, 89M)

## When *not* to use

- Animated text (non-numeric) → use **TypeAhead** or **TextReveal**.
- Static numbers that never change → just render the value.
- Scientific or engineering notation, or RTL locales → unsupported by the
  underlying library.

## Composition tree

```
NumberFlow.Root                 (the animated custom element)

NumberFlow.Group                (optional)
  NumberFlow.Root
  NumberFlow.Root
```

`Root` is a single primitive — no inner slot. `Group` synchronizes the
transition timing of multiple Roots.

## Sub-components

### `NumberFlow.Root`

Wraps `@number-flow/react`. All native props (from the underlying library)
are forwarded; the library adds `animateInView`.

Key props (a subset — see https://number-flow.barvian.me/ for the full
surface):

```ts
type Props = {
  value: number;                            // required; drives the animation
  format?: Intl.NumberFormatOptions;        // e.g. { style: "currency", currency: "USD" }
  locales?: string | string[];              // BCP-47 locale(s)
  prefix?: string;                          // static prefix
  suffix?: string;                          // static suffix
  trend?: 1 | -1 | 0 | ((oldValue: number, newValue: number) => number);
  plugins?: NumberFlowPlugin[];             // default [continuous]
  animated?: boolean;                       // default true
  respectMotionPreference?: boolean;        // default true
  animateInView?: boolean | {
    enabled: boolean;
    once?: boolean;                         // default true
    onIntersect?: (entry: IntersectionObserverEntry) => void;
    root?: Element | Document | null;
    rootMargin?: string;
    threshold?: number | number[];
  };
  nonce?: string;                           // SSR CSP nonce
} & React.HTMLAttributes<NumberFlowElement>;
```

- `plugins` defaults to `[continuous]` (the slot-machine feel). Pass `[]`
  to opt out, or include your own plugins.
- `animateInView` defers animation until the element scrolls into view.
  `true` uses defaults; pass an options object to customize the
  `IntersectionObserver`. While `enabled && !inView`, the displayed value
  is `0`; on intersection it animates to `value`.
- `trend` overrides the implicit "spin up vs spin down" direction. Use
  `0` for non-monotonic data, `1` to force always-up, a function for
  custom logic.

Data attributes: `data-slot="number-flow-root"`, `data-in-view` (empty
marker when `animateInView` is enabled and the element is in view).

### `NumberFlow.Group`

```ts
type Props = { children: React.ReactNode };
```

Synchronizes transition timing for every descendant `NumberFlow.Root`.
Useful when multiple numbers should change "together" (e.g. a pricing toggle
flipping monthly/yearly across several rows).

## Hooks (re-exported)

```ts
useCanAnimate(): boolean;
useIsSupported(): boolean;
usePrefersReducedMotion(): boolean;
```

Useful for gating fallbacks or conditional behavior.

## Canonical code shapes

### Basic counter

```tsx
<NumberFlow.Root value={count} />
```

### Currency

```tsx
<NumberFlow.Root
  value={price}
  format={{ style: "currency", currency: "USD", minimumFractionDigits: 2 }}
/>
```

### Percentage

```tsx
<NumberFlow.Root
  value={delta}
  format={{ style: "percent", maximumFractionDigits: 1 }}
/>
```

`delta` should be `0.123` (not `12.3`) — Intl scales it to `12.3%`.

### Compact notation (1.2K, 89M)

```tsx
<NumberFlow.Root value={1_234_000} format={{ notation: "compact" }} />
```

### Locale override

```tsx
<NumberFlow.Root
  value={1234.5}
  locales="de-DE"
  format={{ style: "currency", currency: "EUR" }}
/>
```

### With prefix / suffix

```tsx
<NumberFlow.Root value={revenue} prefix="$" suffix="/mo" />
```

### Trend control (non-monotonic data)

```tsx
<NumberFlow.Root value={temperature} trend={0} />
// or
<NumberFlow.Root value={score} trend={(prev, next) => (next > prev ? 1 : -1)} />
```

### Animate when scrolled into view

```tsx
<NumberFlow.Root value={hits} animateInView />

// custom IntersectionObserver
<NumberFlow.Root
  value={hits}
  animateInView={{ enabled: true, threshold: 0.5, once: false, rootMargin: "-10%" }}
/>
```

### Synchronized group (e.g. billing toggle)

```tsx
<NumberFlow.Group>
  <NumberFlow.Root value={monthly} format={{ style: "currency", currency: "USD" }} />
  <NumberFlow.Root value={annual} format={{ style: "currency", currency: "USD" }} />
</NumberFlow.Group>
```

When `monthly` and `annual` both change in the same render, their
transitions stay in sync.

### Opt out of the continuous plugin

```tsx
<NumberFlow.Root value={42} plugins={[]} />
```

### SSR with CSP

```tsx
<NumberFlow.Root value={n} nonce={cspNonce} />
```

## Styling — shadow parts

The underlying custom element exposes its internals via `::part()`:

```css
number-flow::part(symbol) { font-feature-settings: "tnum"; }
number-flow::part(digit) { color: var(--color-foreground); }
```

Common parts: `symbol`, `digit`, `pre`, `post`, `widget`. See the
upstream docs for the full list.

CSS variables on the element:

| Variable                       | Default | Description                         |
| ------------------------------ | ------- | ----------------------------------- |
| `--number-flow-mask-height`    | `1em`   | Vertical mask for digit transitions. |
| `--number-flow-mask-width`     | `0.5em` | Horizontal mask for digit transitions. |

## Accessibility

- The rendered text content is the formatted number — screen readers read
  it as a normal numeric string.
- The component respects `prefers-reduced-motion` by default
  (`respectMotionPreference: true`). When the user prefers reduced motion,
  the value updates without animation.
- `animateInView` shows `0` until the element enters the viewport — if the
  number is meaningful for users who never reach the section, consider
  not using `animateInView` (or set `once: false` and a generous
  `rootMargin`).

## Gotchas

- **It's a custom element, not a regular React component.** Pass `nonce`
  when serving under CSP.
- **`format.style: "percent"` expects fractional values.** `0.42` → `42%`.
- **Scientific / engineering notation, RTL locales are unsupported** by
  the underlying library.
- **`animateInView` renders `0` until the element is visible.** This
  matters for shared snapshots or layout that depends on the actual width.
- **`Group` wraps to synchronize**, but Roots inside still need their own
  props — Group is timing-only, not formatting.
- **Don't animate the prop `value` with a state library that batches odd
  things** (e.g. some atomic state managers) — let React drive it directly
  for the smoothest transitions.
- **`continuous` plugin is the default**. Setting `plugins={[customA, customB]}`
  *replaces* it; include `continuous` explicitly if you want both.
