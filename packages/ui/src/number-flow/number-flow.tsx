"use client";

import NumberFlowPrimitive, {
  type NumberFlowElement,
  NumberFlowGroup,
  type NumberFlowProps as PrimitiveNumberFlowProps,
} from "@number-flow/react";
import type { ForwardRefExoticComponent, ReactNode, RefAttributes } from "react";
import { forwardRef } from "react";

import { cn } from "../../lib/utils.js";

type NumberFlowRootProps = PrimitiveNumberFlowProps;

const Root: ForwardRefExoticComponent<
  NumberFlowRootProps & RefAttributes<NumberFlowElement>
> = forwardRef<NumberFlowElement, NumberFlowRootProps>(
  function NumberFlowRoot({ className, ...rest }, ref) {
    return (
      <NumberFlowPrimitive
        ref={ref}
        data-slot="number-flow-root"
        className={cn(className)}
        {...rest}
      />
    );
  },
);

interface NumberFlowGroupProps {
  children?: ReactNode;
}

function Group({ children }: NumberFlowGroupProps) {
  return <NumberFlowGroup>{children}</NumberFlowGroup>;
}

type NumberFlowComposition = {
  /**
   * Animated number primitive. Wraps `@number-flow/react`'s custom element and
   * transitions smoothly whenever `value` changes.
   *
   * Styling is exposed via [CSS shadow parts](https://developer.mozilla.org/en-US/docs/Web/CSS/::part)
   * (`::part(number)`, `::part(digit)`, etc.) and the
   * `--number-flow-mask-height` / `--number-flow-mask-width` custom properties.
   *
   * @example
   *
   * ```tsx
   * <NumberFlow.Root
   *   value={amount}
   *   format={{ style: "currency", currency: "USD" }}
   *   locales="en-US"
   * />
   * ```
   */
  Root: typeof Root;
  /**
   * Groups multiple `<NumberFlow.Root>` instances so their transitions stay in
   * sync when one affects another's layout. Renders no DOM of its own.
   *
   * @example
   *
   * ```tsx
   * <NumberFlow.Group>
   *   <NumberFlow.Root value={price} />
   *   <NumberFlow.Root value={delta} format={{ style: "percent" }} />
   * </NumberFlow.Group>
   * ```
   */
  Group: typeof Group;
};

export const NumberFlow: NumberFlowComposition = {
  Root,
  Group,
};

export {
  continuous,
  useCanAnimate,
  useIsSupported,
  usePrefersReducedMotion,
} from "@number-flow/react";

export type { NumberFlowGroupProps, NumberFlowRootProps };
