"use client";

import {
  type HTMLMotionProps,
  type MotionStyle,
  type MotionValue,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import type {
  ComponentPropsWithoutRef,
  ElementType,
  ReactNode,
  RefObject,
} from "react";
import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { cn } from "../../lib/utils.js";

type ScrollOffset = NonNullable<Parameters<typeof useScroll>[0]>["offset"];

interface TextRevealContextValue {
  progress: MotionValue<number>;
  once: boolean;
}

const TextRevealContext = createContext<TextRevealContextValue | null>(null);

function useTextReveal(component: string): TextRevealContextValue {
  const ctx = useContext(TextRevealContext);
  if (!ctx) {
    throw new Error(`${component} must be rendered inside <TextReveal.Root>.`);
  }
  return ctx;
}

interface TextRevealRootProps extends ComponentPropsWithoutRef<"div"> {
  /**
   * Controlled progress, expressed as a percentage `0–100`. When defined,
   * the root runs in **controlled mode** and `progress` drives the reveal
   * directly — scroll plumbing is bypassed entirely. When `undefined`
   * (default), the root falls back to **scroll mode** and `useScroll`
   * drives the reveal as the section moves through the viewport.
   *
   * Values outside `0–100` are clamped. Internally normalized to `0–1`
   * before being exposed to descendant `transform` builders, so existing
   * `useTransform([0, 1], …)` math keeps working unchanged.
   */
  progress?: number;
  /**
   * When `true`, words stay revealed once they pass the threshold and never
   * fade back out. In scroll mode this latches `scrollYProgress` so the
   * outro never plays. In controlled mode it prevents `progress` from ever
   * decreasing — useful when the consumer wants a one-way reveal driven by
   * an external timeline.
   * @default false
   */
  once?: boolean;
  /**
   * Scroll-mode only. Scroll offset passed straight to `motion`'s
   * `useScroll`. Controls which portion of the page scroll drives the
   * reveal. Ignored when `progress` is provided.
   * @default ["start end", "end start"]
   */
  offset?: ScrollOffset;
  /**
   * Scroll-mode only. Optional scroll container to track instead of the
   * window. When provided, `offset` is interpreted relative to this
   * element's scroll position. Ignored when `progress` is provided.
   */
  container?: RefObject<HTMLElement | null>;
  /**
   * Scroll-mode only. Delays the **start** of the reveal — by default it
   * fires the moment the root touches the viewport bottom. A margin moves
   * that trigger further into the viewport, so the reveal only begins
   * once the section is `startMargin` deep on screen.
   *
   * - `number` → percentage of the total scroll range (`0–100`).
   * - `string` → any CSS length (`"100px"`, `"20vh"`, `"30dvh"`, `"5rem"`,
   *   `"15%"`). Measured at runtime by the browser, so all units work.
   *
   * @default 20
   */
  startMargin?: number | string;
  /**
   * Scroll-mode only. Advances the **end** of the reveal — by default it
   * completes only when the root has fully exited the top. A margin
   * brings completion closer so the reveal hits 100% while the section is
   * still `endMargin` away from the viewport top.
   *
   * Same shape as `startMargin` — number percentage or any CSS length.
   *
   * @default 20
   */
  endMargin?: number | string;
}

function clampPercent(value: number) {
  if (value < 0) return 0;
  if (value > 100) return 100;
  return value;
}

interface MarginMeasureProps {
  value: string;
  onMeasure: (px: number) => void;
}

function MarginMeasure({ value, onMeasure }: MarginMeasureProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const report = () => onMeasure(node.offsetHeight);
    report();
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(report);
    ro.observe(node);
    return () => ro.disconnect();
  }, [onMeasure]);
  return (
    <div
      ref={ref}
      aria-hidden="true"
      style={{
        position: "fixed",
        top: -9999,
        left: -9999,
        width: 0,
        height: value,
        pointerEvents: "none",
        visibility: "hidden",
      }}
    />
  );
}

const ScrollRoot = forwardRef<
  HTMLDivElement,
  Omit<TextRevealRootProps, "progress">
>(function TextRevealScrollRoot(
  {
    once = false,
    offset,
    container,
    startMargin = 20,
    endMargin = 20,
    className,
    children,
    ...rest
  },
  forwardedRef,
) {
  const innerRef = useRef<HTMLDivElement | null>(null);

  const setRefs = useCallback(
    (node: HTMLDivElement | null) => {
      innerRef.current = node;
      if (typeof forwardedRef === "function") forwardedRef(node);
      else if (forwardedRef) forwardedRef.current = node;
    },
    [forwardedRef],
  );

  const { scrollYProgress } = useScroll({
    target: innerRef,
    container: container as RefObject<HTMLElement> | undefined,
    offset: offset ?? ["start end", "end start"],
  });

  // Scroll range = how many pixels of scroll cover the default
  // "start end" → "end start" offset window: target height + container
  // (viewport) height.
  const [scrollRangePx, setScrollRangePx] = useState(0);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const update = () => {
      const el = innerRef.current;
      const containerEl = container?.current;
      const viewport = containerEl?.clientHeight ?? window.innerHeight;
      setScrollRangePx((el?.offsetHeight ?? 0) + viewport);
    };
    update();
    const ro =
      typeof ResizeObserver !== "undefined" ? new ResizeObserver(update) : null;
    const targetEl = innerRef.current;
    const containerEl = container?.current;
    if (ro && targetEl) ro.observe(targetEl);
    if (ro && containerEl) ro.observe(containerEl);
    window.addEventListener("resize", update);
    return () => {
      ro?.disconnect();
      window.removeEventListener("resize", update);
    };
  }, [container]);

  const [startMarginPx, setStartMarginPx] = useState(0);
  const [endMarginPx, setEndMarginPx] = useState(0);

  const startFrac = useMemo(() => {
    if (typeof startMargin === "number") {
      return clampPercent(startMargin) / 100;
    }
    if (scrollRangePx === 0) return 0;
    return Math.max(0, startMarginPx / scrollRangePx);
  }, [startMargin, startMarginPx, scrollRangePx]);

  const endFrac = useMemo(() => {
    if (typeof endMargin === "number") {
      return clampPercent(endMargin) / 100;
    }
    if (scrollRangePx === 0) return 0;
    return Math.max(0, endMarginPx / scrollRangePx);
  }, [endMargin, endMarginPx, scrollRangePx]);

  const startFracMV = useMotionValue(startFrac);
  const endFracMV = useMotionValue(endFrac);
  useEffect(() => {
    startFracMV.set(startFrac);
  }, [startFrac, startFracMV]);
  useEffect(() => {
    endFracMV.set(endFrac);
  }, [endFrac, endFracMV]);

  const adjustedProgress = useTransform<number, number>(
    [scrollYProgress, startFracMV, endFracMV],
    (inputs) => {
      const raw = inputs[0] ?? 0;
      const sf = inputs[1] ?? 0;
      const ef = inputs[2] ?? 0;
      const span = 1 - sf - ef;
      if (span <= 0) return raw;
      const remapped = (raw - sf) / span;
      if (remapped < 0) return 0;
      if (remapped > 1) return 1;
      return remapped;
    },
  );

  // Latched progress: equals adjustedProgress when not `once`, otherwise
  // monotonically increases so the outro is suppressed.
  const progress = useMotionValue(0);
  useMotionValueEvent(adjustedProgress, "change", (value) => {
    const next = value ?? 0;
    if (once) {
      if (next > progress.get()) progress.set(next);
    } else {
      progress.set(next);
    }
  });

  const ctx = useMemo<TextRevealContextValue>(
    () => ({ progress, once }),
    [progress, once],
  );

  return (
    <TextRevealContext.Provider value={ctx}>
      <div
        ref={setRefs}
        data-slot="text-reveal-root"
        data-mode="scroll"
        data-once={once ? "" : undefined}
        className={cn(className)}
        {...rest}
      >
        {children}
      </div>
      {typeof startMargin === "string" ? (
        <MarginMeasure value={startMargin} onMeasure={setStartMarginPx} />
      ) : null}
      {typeof endMargin === "string" ? (
        <MarginMeasure value={endMargin} onMeasure={setEndMarginPx} />
      ) : null}
    </TextRevealContext.Provider>
  );
});

interface ControlledRootProps
  extends Omit<TextRevealRootProps, "progress" | "offset" | "container"> {
  progress: number;
}

const ControlledRoot = forwardRef<HTMLDivElement, ControlledRootProps>(
  function TextRevealControlledRoot(
    { progress: progressProp, once = false, className, children, ...rest },
    forwardedRef,
  ) {
    const normalized = clampPercent(progressProp) / 100;
    const progress = useMotionValue(normalized);

    useEffect(() => {
      if (once) {
        if (normalized > progress.get()) progress.set(normalized);
      } else {
        progress.set(normalized);
      }
    }, [normalized, once, progress]);

    const ctx = useMemo<TextRevealContextValue>(
      () => ({ progress, once }),
      [progress, once],
    );

    return (
      <TextRevealContext.Provider value={ctx}>
        <div
          ref={forwardedRef}
          data-slot="text-reveal-root"
          data-mode="controlled"
          data-once={once ? "" : undefined}
          className={cn(className)}
          {...rest}
        >
          {children}
        </div>
      </TextRevealContext.Provider>
    );
  },
);

const Root = forwardRef<HTMLDivElement, TextRevealRootProps>(
  function TextRevealRoot({ progress, ...rest }, ref) {
    if (progress !== undefined) {
      const {
        offset: _offset,
        container: _container,
        startMargin: _startMargin,
        endMargin: _endMargin,
        ...controlledRest
      } = rest;
      return (
        <ControlledRoot ref={ref} progress={progress} {...controlledRest} />
      );
    }
    return <ScrollRoot ref={ref} {...rest} />;
  },
);

/**
 * Transform builder for a single word. Receives a `MotionValue<number>` that
 * runs `0 → 1` while the word's slice of the root progress is active (and
 * back to `0` when the root progress retreats, unless the root has `once`).
 * Return a `MotionStyle` — opacity, transform, filter, anything `motion`
 * accepts.
 */
type TextRevealTransform = (localProgress: MotionValue<number>) => MotionStyle;

const defaultTransform: TextRevealTransform = (localProgress) => ({
  opacity: localProgress,
});

interface TextRevealTextProps
  extends Omit<ComponentPropsWithoutRef<"span">, "children"> {
  /**
   * The text to reveal. Must be a plain string — it is split on whitespace
   * and each word is animated independently. For richer trees, compose with
   * `<TextReveal.Word>` directly.
   */
  children: string;
  /**
   * Element rendered as the outer wrapper. Defaults to `<span>` so the
   * component can sit inline inside a paragraph.
   * @default "span"
   */
  as?: ElementType;
  /**
   * Per-word transform builder. Receives the word's local progress and
   * returns a `MotionStyle`. Replace this to drive any reveal — opacity,
   * translate, blur, scale, color — without touching the root plumbing.
   *
   * @default `({ opacity: localProgress })`
   */
  transform?: TextRevealTransform;
  /**
   * Local-progress threshold (0–1) at which a word flips its
   * `data-state` from `"hidden"` to `"revealed"`. Drives CSS hooks only —
   * the visual reveal is governed by `transform`.
   * @default 0.5
   */
  revealAt?: number;
  /**
   * Class applied to every word `<motion.span>`. Useful for shared typography
   * defaults; per-word classes can still be added via a custom `transform`.
   */
  wordClassName?: string;
}

const Text = forwardRef<HTMLSpanElement, TextRevealTextProps>(
  function TextRevealText(
    {
      children,
      as,
      transform,
      revealAt = 0.5,
      wordClassName,
      className,
      ...rest
    },
    ref,
  ) {
    const segments = useMemo(() => {
      const parts = children.split(/(\s+)/);
      const total = parts.filter(
        (p) => p.length > 0 && !/^\s+$/.test(p),
      ).length;
      let wordIndex = 0;
      return parts.map((text, i) => {
        if (text.length === 0) return null;
        if (/^\s+$/.test(text)) {
          return { kind: "space" as const, text, key: `s-${i}` };
        }
        const entry = {
          kind: "word" as const,
          text,
          index: wordIndex,
          total,
          key: `w-${i}`,
        };
        wordIndex += 1;
        return entry;
      });
    }, [children]);

    const Tag = (as ?? "span") as ElementType;

    return (
      <Tag
        ref={ref}
        data-slot="text-reveal-text"
        className={cn(className)}
        {...rest}
      >
        {segments.map((seg) => {
          if (!seg) return null;
          if (seg.kind === "space") return seg.text;
          return (
            <Word
              key={seg.key}
              index={seg.index}
              total={seg.total}
              transform={transform}
              revealAt={revealAt}
              className={wordClassName}
            >
              {seg.text}
            </Word>
          );
        })}
      </Tag>
    );
  },
);

interface TextRevealWordProps
  extends Omit<HTMLMotionProps<"span">, "children"> {
  /**
   * Zero-based position of this word inside the overall reveal. Together with
   * `total`, determines which slice of the root progress drives the
   * animation.
   */
  index: number;
  /**
   * Total number of words participating in the reveal. Used to compute the
   * `[index / total, (index + 1) / total]` slice that maps to local progress.
   */
  total: number;
  /**
   * Per-word transform builder. See `TextReveal.Text` for the default.
   */
  transform?: TextRevealTransform;
  /**
   * Local-progress threshold (0–1) for the `data-state` flip.
   * @default 0.5
   */
  revealAt?: number;
  children: ReactNode;
}

const Word = forwardRef<HTMLSpanElement, TextRevealWordProps>(
  function TextRevealWord(
    {
      index,
      total,
      transform = defaultTransform,
      revealAt = 0.5,
      className,
      children,
      style,
      ...rest
    },
    ref,
  ) {
    const root = useTextReveal("TextReveal.Word");
    const reducedMotion = useReducedMotion();

    const safeTotal = Math.max(total, 1);
    const start = index / safeTotal;
    const end = (index + 1) / safeTotal;

    const localProgress = useTransform(root.progress, [start, end], [0, 1], {
      clamp: true,
    });

    const motionStyle = reducedMotion ? {} : transform(localProgress);

    const [state, setState] = useState<"hidden" | "revealed">(
      reducedMotion ? "revealed" : "hidden",
    );
    useMotionValueEvent(localProgress, "change", (v) => {
      if (reducedMotion) return;
      const next = v >= revealAt ? "revealed" : "hidden";
      setState((prev) => (prev === next ? prev : next));
    });

    return (
      <motion.span
        ref={ref}
        data-slot="text-reveal-word"
        data-state={state}
        data-index={index}
        className={cn(className)}
        style={{ ...style, ...motionStyle }}
        {...rest}
      >
        {children}
      </motion.span>
    );
  },
);

type TextRevealComposition = {
  /**
   * Root container. By default wires up `motion`'s `useScroll` against
   * itself so the reveal is driven by the section's intersection with the
   * viewport. Pass `progress` (0–100) to switch to controlled mode — the
   * reveal is driven directly by that value, with no scroll plumbing.
   *
   * Exposes the resulting progress MotionValue to descendant
   * `<TextReveal.Text>` / `<TextReveal.Word>` parts via context.
   *
   * @example Scroll-driven (default)
   *
   * ```tsx
   * <TextReveal.Root className="min-h-[150vh]" once>
   *   <div className="sticky top-0 flex h-screen items-center">
   *     <TextReveal.Text className="text-4xl">
   *       The quick brown fox jumps over the lazy dog.
   *     </TextReveal.Text>
   *   </div>
   * </TextReveal.Root>
   * ```
   *
   * @example Controlled
   *
   * ```tsx
   * const [progress, setProgress] = useState(0);
   *
   * <TextReveal.Root progress={progress}>
   *   <TextReveal.Text className="text-4xl">
   *     The quick brown fox jumps over the lazy dog.
   *   </TextReveal.Text>
   * </TextReveal.Root>
   * ```
   */
  Root: typeof Root;
  /**
   * Splits a plain-string child into words and animates each via the shared
   * root progress. Pass `transform` for full control over the per-word
   * reveal (opacity, translate, blur, etc.).
   */
  Text: typeof Text;
  /**
   * Lower-level primitive — one animated word. Use when you need to compose
   * words with arbitrary surrounding markup (links, highlights, etc.) rather
   * than passing a single string to `TextReveal.Text`.
   */
  Word: typeof Word;
};

export const TextReveal: TextRevealComposition = {
  Root,
  Text,
  Word,
};

export type {
  TextRevealRootProps,
  TextRevealTextProps,
  TextRevealTransform,
  TextRevealWordProps,
};
