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
   * When `true`, words stay revealed once they pass the threshold and never
   * fade back out on scroll-up. When `false`, the reveal is reversible — the
   * outro animation plays as the section scrolls back out of view.
   * @default false
   */
  once?: boolean;
  /**
   * Scroll offset passed straight to `motion`'s `useScroll`. Controls which
   * portion of the page scroll drives the reveal. Defaults to running from
   * when the root enters the viewport bottom to when it leaves the top.
   * @default ["start end", "end start"]
   */
  offset?: ScrollOffset;
  /**
   * Optional scroll container to track instead of the window. When provided,
   * `offset` is interpreted relative to this element's scroll position rather
   * than the viewport. Useful when the reveal lives inside a fixed-height,
   * internally-scrollable wrapper (e.g. a documentation preview).
   */
  container?: RefObject<HTMLElement | null>;
}

const Root = forwardRef<HTMLDivElement, TextRevealRootProps>(
  function TextRevealRoot(
    { once = false, offset, container, className, children, ...rest },
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

    // Latched progress: equals scrollYProgress when not `once`, otherwise
    // monotonically increases so the outro is suppressed.
    const progress = useMotionValue(0);
    useMotionValueEvent(scrollYProgress, "change", (v) => {
      if (once) {
        if (v > progress.get()) progress.set(v);
      } else {
        progress.set(v);
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

/**
 * Transform builder for a single word. Receives a `MotionValue<number>` that
 * runs `0 → 1` while the word's slice of the root scroll progress is active
 * (and back to `0` when scrolling away, unless the root has `once`). Return a
 * `MotionStyle` — opacity, transform, filter, anything `motion` accepts.
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
   * Per-word transform builder. Receives the word's local scroll progress and
   * returns a `MotionStyle`. Replace this to drive any reveal — opacity,
   * translate, blur, scale, color — without touching the scroll plumbing.
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

interface TextRevealWordProps extends Omit<HTMLMotionProps<"span">, "children"> {
  /**
   * Zero-based position of this word inside the overall reveal. Together with
   * `total`, determines which slice of the root scroll progress drives the
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
   * Root scroll container. Renders a `<div>` and exposes the scroll progress
   * MotionValue to descendant `<TextReveal.Text>` / `<TextReveal.Word>` parts
   * via context. Give it a tall height (e.g. `min-h-[150vh]`) — the height
   * defines how much scroll distance the reveal takes.
   *
   * @example
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
   */
  Root: typeof Root;
  /**
   * Splits a plain-string child into words and animates each via the shared
   * scroll progress. Pass `transform` for full control over the per-word
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
