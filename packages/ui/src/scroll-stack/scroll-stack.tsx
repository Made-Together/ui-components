"use client";

import {
  type HTMLMotionProps,
  type MotionValue,
  motion,
  type SpringOptions,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import type { ComponentPropsWithoutRef, RefObject } from "react";
import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useSyncExternalStore,
} from "react";

import { cn } from "../../lib/utils.js";

const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

const DEFAULT_SPRING: SpringOptions = {
  stiffness: 200,
  damping: 40,
  mass: 0.5,
};

interface ScrollStackContextValue {
  viewportRef: RefObject<HTMLDivElement | null>;
  useViewportScroll: boolean;
  scrollY: MotionValue<number>;
  register: (id: string) => void;
  unregister: (id: string) => void;
  setPosition: (id: string, value: number) => void;
  subscribe: (listener: () => void) => () => void;
  getOrder: () => string[];
  getPosition: (id: string) => number | undefined;
  topOffset: number;
  stackGap: number;
  scaleStep: number;
  itemDistance: number;
}

const ScrollStackContext = createContext<ScrollStackContextValue | null>(null);

function useScrollStack(component: string): ScrollStackContextValue {
  const ctx = useContext(ScrollStackContext);
  if (!ctx) {
    throw new Error(`${component} must be rendered inside <ScrollStack.Root>.`);
  }
  return ctx;
}

interface ScrollStackRootProps extends ComponentPropsWithoutRef<"div"> {
  /**
   * Distance in pixels from the top of the scroll container where each card
   * pins.
   * @default 0
   */
  topOffset?: number;
  /**
   * Per-item offset added to `topOffset`, producing a visible step between
   * stacked cards so earlier ones peek out behind later ones.
   * @default 16
   */
  stackGap?: number;
  /**
   * How much each card scales down once another card stacks on top. The card
   * at depth `N` ends at `1 - N * scaleStep`.
   * @default 0.04
   */
  scaleStep?: number;
  /**
   * Pixel distance between consecutive cards in the flow. Drives both the
   * `margin-bottom` between cards and how much scroll separates each card's
   * pin event from the next.
   * @default 160
   */
  itemDistance?: number;
  /**
   * When `true`, `ScrollStack.Viewport` becomes the scroll container (it
   * gets `relative overflow-y-auto` applied). Otherwise the page scroll
   * drives the animation.
   * @default false
   */
  useViewportScroll?: boolean;
  /**
   * Spring config used to smooth scroll progress before it drives the scale.
   * Pass `false` to drive scale directly from raw scroll progress (no
   * smoothing).
   */
  spring?: SpringOptions | false;
}

const Root = forwardRef<HTMLDivElement, ScrollStackRootProps>(
  function ScrollStackRoot(
    {
      topOffset = 0,
      stackGap = 16,
      scaleStep = 0.04,
      itemDistance = 160,
      useViewportScroll = false,
      spring = DEFAULT_SPRING,
      className,
      children,
      ...rest
    },
    ref,
  ) {
    const viewportRef = useRef<HTMLDivElement | null>(null);
    const orderRef = useRef<string[]>([]);
    const positionsRef = useRef(new Map<string, number>());
    const listenersRef = useRef(new Set<() => void>());

    const notify = useCallback(() => {
      for (const listener of listenersRef.current) listener();
    }, []);

    const register = useCallback(
      (id: string) => {
        if (orderRef.current.includes(id)) return;
        orderRef.current = [...orderRef.current, id];
        notify();
      },
      [notify],
    );

    const unregister = useCallback(
      (id: string) => {
        if (!orderRef.current.includes(id)) return;
        orderRef.current = orderRef.current.filter((v) => v !== id);
        positionsRef.current.delete(id);
        notify();
      },
      [notify],
    );

    const setPosition = useCallback(
      (id: string, value: number) => {
        if (positionsRef.current.get(id) === value) return;
        positionsRef.current.set(id, value);
        notify();
      },
      [notify],
    );

    const subscribe = useCallback((listener: () => void) => {
      listenersRef.current.add(listener);
      return () => {
        listenersRef.current.delete(listener);
      };
    }, []);

    const getOrder = useCallback(() => orderRef.current, []);
    const getPosition = useCallback(
      (id: string) => positionsRef.current.get(id),
      [],
    );

    const { scrollY: rawScrollY } = useScroll({
      container: useViewportScroll ? viewportRef : undefined,
    });
    const springConfig = spring === false ? DEFAULT_SPRING : spring;
    const smoothedScrollY = useSpring(rawScrollY, springConfig);
    const scrollY: MotionValue<number> =
      spring === false ? rawScrollY : smoothedScrollY;

    const ctx = useMemo<ScrollStackContextValue>(
      () => ({
        viewportRef,
        useViewportScroll,
        scrollY,
        register,
        unregister,
        setPosition,
        subscribe,
        getOrder,
        getPosition,
        topOffset,
        stackGap,
        scaleStep,
        itemDistance,
      }),
      [
        useViewportScroll,
        scrollY,
        register,
        unregister,
        setPosition,
        subscribe,
        getOrder,
        getPosition,
        topOffset,
        stackGap,
        scaleStep,
        itemDistance,
      ],
    );

    return (
      <ScrollStackContext.Provider value={ctx}>
        <div
          ref={ref}
          data-slot="scroll-stack-root"
          className={cn(className)}
          {...rest}
        >
          {children}
        </div>
      </ScrollStackContext.Provider>
    );
  },
);

type ScrollStackViewportProps = ComponentPropsWithoutRef<"div">;

const Viewport = forwardRef<HTMLDivElement, ScrollStackViewportProps>(
  function ScrollStackViewport({ className, children, ...rest }, ref) {
    const root = useScrollStack("ScrollStack.Viewport");

    const setRef = useCallback(
      (node: HTMLDivElement | null) => {
        root.viewportRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
      },
      [ref, root.viewportRef],
    );

    return (
      <div
        ref={setRef}
        data-slot="scroll-stack-viewport"
        data-scroll-container={root.useViewportScroll ? "" : undefined}
        className={cn(
          root.useViewportScroll && "relative overflow-y-auto",
          className,
        )}
        {...rest}
      >
        {children}
      </div>
    );
  },
);

type ScrollStackItemProps = HTMLMotionProps<"div">;

const Item = forwardRef<HTMLDivElement, ScrollStackItemProps>(
  function ScrollStackItem({ className, children, style, ...rest }, ref) {
    const root = useScrollStack("ScrollStack.Item");
    const id = useId();
    const itemRef = useRef<HTMLDivElement | null>(null);
    const reducedMotion = useReducedMotion();

    useIsoLayoutEffect(() => {
      root.register(id);
      return () => root.unregister(id);
    }, [id, root]);

    const order = useSyncExternalStore(
      root.subscribe,
      root.getOrder,
      root.getOrder,
    );
    const rawIndex = order.indexOf(id);
    const index = rawIndex === -1 ? 0 : rawIndex;
    const count = order.length;
    const isLast = count > 0 && index === count - 1;
    const lastId = count > 0 ? order[count - 1] : undefined;
    const remainingAfter = Math.max(0, count - 1 - index);
    const targetScale = Math.max(0, 1 - remainingAfter * root.scaleStep);
    const stickyTop = root.topOffset + index * root.stackGap;

    useIsoLayoutEffect(() => {
      const node = itemRef.current;
      if (!node) return;

      const measure = () => {
        const rect = node.getBoundingClientRect();
        let scrollTop = 0;
        let containerTop = 0;
        if (root.useViewportScroll) {
          const v = root.viewportRef.current;
          if (!v) return;
          scrollTop = v.scrollTop;
          containerTop = v.getBoundingClientRect().top;
        } else if (typeof window !== "undefined") {
          scrollTop = window.scrollY;
        }
        const offsetTop = rect.top - containerTop + scrollTop;
        root.setPosition(id, offsetTop - stickyTop);
      };

      measure();

      if (typeof ResizeObserver === "undefined") return;
      const ro = new ResizeObserver(measure);
      ro.observe(node);
      if (root.viewportRef.current) ro.observe(root.viewportRef.current);
      return () => ro.disconnect();
    }, [id, root, stickyTop, index, count]);

    const pinStart = root.getPosition(id) ?? 0;
    const lastPin =
      lastId !== undefined ? (root.getPosition(lastId) ?? pinStart) : pinStart;
    const pinEnd = Math.max(lastPin, pinStart + 1);

    const scale = useTransform(
      root.scrollY,
      [pinStart, pinEnd],
      [1, reducedMotion ? 1 : targetScale],
    );

    const setRef = useCallback(
      (node: HTMLDivElement | null) => {
        itemRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
      },
      [ref],
    );

    return (
      <motion.div
        ref={setRef}
        data-slot="scroll-stack-item"
        data-index={index}
        style={{
          position: "sticky",
          top: stickyTop,
          scale,
          transformOrigin: "top center",
          willChange: "transform",
          marginBottom: isLast ? undefined : root.itemDistance,
          ...style,
        }}
        className={cn(className)}
        {...rest}
      >
        {children}
      </motion.div>
    );
  },
);

type ScrollStackComposition = {
  /**
   * Root component for ScrollStack. Holds shared configuration, tracks item
   * order and measured positions, and exposes a shared (optionally smoothed)
   * `scrollY` to drive each card's scale.
   *
   * @example
   *
   * ```tsx
   * <ScrollStack.Root useViewportScroll>
   *   <ScrollStack.Viewport className="h-[80vh]">
   *     <ScrollStack.Item>
   *       <div className="rounded-3xl bg-card p-8">Card one</div>
   *     </ScrollStack.Item>
   *     <ScrollStack.Item>
   *       <div className="rounded-3xl bg-card p-8">Card two</div>
   *     </ScrollStack.Item>
   *   </ScrollStack.Viewport>
   * </ScrollStack.Root>
   * ```
   */
  Root: typeof Root;
  /**
   * Scroll container for the stack. By default it's a passive wrapper and
   * the page scroll drives the animation; pass `useViewportScroll` on Root
   * and the Viewport becomes the scroll container itself (gaining
   * `relative overflow-y-auto`). Items must be direct children — they share
   * this element as their sticky-positioning ancestor.
   */
  Viewport: typeof Viewport;
  /**
   * A single card. Rendered as a `position: sticky` motion `<div>` whose
   * `scale` is driven by the Root's scroll progress. Cards pin in order
   * (`top: topOffset + index * stackGap`), and `itemDistance` provides the
   * scroll separation between consecutive pin events.
   */
  Item: typeof Item;
};

export const ScrollStack: ScrollStackComposition = {
  Root,
  Viewport,
  Item,
};

export type {
  ScrollStackItemProps,
  ScrollStackRootProps,
  ScrollStackViewportProps,
};
