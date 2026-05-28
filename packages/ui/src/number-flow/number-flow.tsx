"use client";

import NumberFlowPrimitive, {
  continuous,
  type NumberFlowElement,
  NumberFlowGroup,
  type NumberFlowProps as PrimitiveNumberFlowProps,
} from "@number-flow/react";
import type {
  ForwardRefExoticComponent,
  ReactNode,
  RefAttributes,
} from "react";
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";

import { cn } from "../../lib/utils.js";

interface AnimateInViewOptions {
  /** Enables in-view animation. */
  enabled: boolean;
  /** Stop observing after the first intersection. Defaults to `true`. */
  once?: boolean;
  /** Called every time the element enters the viewport. */
  onIntersect?: (entry: IntersectionObserverEntry) => void;
  /** Forwarded to `IntersectionObserver`. */
  root?: Element | Document | null;
  /** Forwarded to `IntersectionObserver`. */
  rootMargin?: string;
  /** Forwarded to `IntersectionObserver`. */
  threshold?: number | number[];
}

type NumberFlowRootProps = PrimitiveNumberFlowProps & {
  /**
   * When enabled, the component renders `0` until it scrolls into view, then
   * animates to `value`. Pass `true` for defaults or an options object to
   * customize the `IntersectionObserver` and callback.
   */
  animateInView?: boolean | AnimateInViewOptions;
};

function normalizeAnimateInView(
  input: NumberFlowRootProps["animateInView"],
): Required<Pick<AnimateInViewOptions, "enabled" | "once">> &
  Omit<AnimateInViewOptions, "enabled" | "once"> {
  if (typeof input === "boolean" || input == null) {
    return { enabled: input === true, once: true };
  }
  return { once: true, ...input };
}

const Root: ForwardRefExoticComponent<
  NumberFlowRootProps & RefAttributes<NumberFlowElement>
> = forwardRef<NumberFlowElement, NumberFlowRootProps>(function NumberFlowRoot(
  { className, plugins, animateInView, value, ...rest },
  ref,
) {
  const opts = normalizeAnimateInView(animateInView);
  const { enabled, once, onIntersect, root, rootMargin, threshold } = opts;

  const localRef = useRef<NumberFlowElement | null>(null);
  const onIntersectRef = useRef(onIntersect);
  onIntersectRef.current = onIntersect;

  const [inView, setInView] = useState(false);

  useImperativeHandle(ref, () => localRef.current as NumberFlowElement, []);

  useEffect(() => {
    if (!enabled) return;
    const el = localRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setInView(true);
            onIntersectRef.current?.(entry);
            if (once) observer.disconnect();
          } else if (!once) {
            setInView(false);
          }
        }
      },
      { root: root ?? null, rootMargin, threshold },
    );
    observer.observe(el as unknown as Element);
    return () => observer.disconnect();
  }, [enabled, once, root, rootMargin, threshold]);

  const effectiveValue = enabled && !inView ? 0 : value;

  return (
    <NumberFlowPrimitive
      ref={localRef}
      data-slot="number-flow-root"
      data-in-view={enabled ? inView : undefined}
      className={cn(className)}
      plugins={plugins ?? [continuous]}
      value={effectiveValue}
      {...rest}
    />
  );
});

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
   *
   * @example animate when scrolled into view
   *
   * ```tsx
   * <NumberFlow.Root value={1234} animateInView />
   * <NumberFlow.Root
   *   value={1234}
   *   animateInView={{ enabled: true, threshold: 0.5, once: false }}
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

export type { AnimateInViewOptions, NumberFlowGroupProps, NumberFlowRootProps };
