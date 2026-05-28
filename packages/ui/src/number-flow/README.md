# NumberFlow

A thin, headless wrapper around [`@number-flow/react`](https://number-flow.barvian.me/).
Renders a custom element that animates digit transitions whenever `value`
changes. Formatting is driven by standard `Intl.NumberFormatOptions`, so
currencies, percentages, compact notations, and locales work out of the box.

## Import

```tsx
import { NumberFlow } from "@togetheragency/ui/number-flow";
```

The component is exported as a compound object:

```tsx
NumberFlow.Root;
NumberFlow.Group;
```

The animation hooks from the underlying library are re-exported as well:

```tsx
import {
  useCanAnimate,
  useIsSupported,
  usePrefersReducedMotion,
} from "@togetheragency/ui/number-flow";
```

## Composition

NumberFlow is a single primitive (`Root`) plus an optional grouping wrapper
(`Group`). `Root` renders a custom element that lays out and animates its
digits internally — there is no separate trigger or content slot.

```tsx
<NumberFlow.Group>
  <NumberFlow.Root value={price} format={{ style: "currency", currency: "USD" }} />
  <NumberFlow.Root value={delta} format={{ style: "percent" }} />
</NumberFlow.Group>
```

## Documentation

Find the detailed [documentation with examples here](https://ui.bytogether.agency/docs/components/number-flow).