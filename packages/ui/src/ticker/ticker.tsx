"use client";

import type { ComponentPropsWithoutRef } from "react";
import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { cn } from "../../lib/utils.js";

const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

interface TickerContextValue {
  registerContent: (node: HTMLSpanElement | null) => void;
  notifyContentChange: (text: string) => void;
  isOverflowing: boolean;
}

const TickerContext = createContext<TickerContextValue | null>(null);

function useTicker(component: string): TickerContextValue {
  const ctx = useContext(TickerContext);
  if (!ctx) {
    throw new Error(`${component} must be rendered inside <Ticker.Root>.`);
  }
  return ctx;
}

interface TickerRootProps extends ComponentPropsWithoutRef<"div"> {
  /** Optional fixed container width in pixels. If not set, width is auto-inferred from parent. */
  containerWidth?: number;
  /** Duration in ms to wait before starting scroll animation. @default 2000 */
  startDelay?: number;
  /** Duration in ms to pause at the end before scrolling back. @default 2000 */
  endDelay?: number;
  /** Animation speed in pixels per second. @default 50 */
  scrollSpeed?: number;
  /** Width of the gradient fade masks in pixels. @default 24 */
  fadeWidth?: number;
  /** Duration in ms for the mask fade transition when scrolling starts/stops. @default 300 */
  fadeTransitionDuration?: number;
}

const Root = forwardRef<HTMLDivElement, TickerRootProps>(function TickerRoot(
  {
    containerWidth,
    startDelay = 2000,
    endDelay = 2000,
    scrollSpeed = 50,
    fadeWidth = 24,
    fadeTransitionDuration = 300,
    className,
    style,
    children,
    ...rest
  },
  forwardedRef,
) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const textRef = useRef<HTMLSpanElement | null>(null);

  // The only state we keep: overflow status. It changes on resize / text
  // change — never per animation frame — so it does NOT cause tick
  // rerenders. Everything else (scroll progress, mask gradient, transform)
  // is driven imperatively through refs + direct DOM writes below.
  const [isOverflowing, setIsOverflowing] = useState(false);

  const measurementsRef = useRef<{ containerW: number; textW: number } | null>(
    null,
  );
  const overflowAmountRef = useRef(0);
  const fadePercentRef = useRef(10);

  // Live prop refs so the long-lived rAF loop reads the latest values
  // without having to tear down + restart on every prop change.
  const optionsRef = useRef({
    startDelay,
    endDelay,
    scrollSpeed,
    fadeWidth,
  });
  optionsRef.current = { startDelay, endDelay, scrollSpeed, fadeWidth };

  const animationRef = useRef<number | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  const setContainerRef = useCallback(
    (node: HTMLDivElement | null) => {
      containerRef.current = node;
      if (typeof forwardedRef === "function") {
        forwardedRef(node);
      } else if (forwardedRef) {
        forwardedRef.current = node;
      }
    },
    [forwardedRef],
  );

  const applyMask = useCallback((progress: number) => {
    const container = containerRef.current;
    if (!container) return;
    const fadePercent = fadePercentRef.current;
    const leftFadeEnd = progress * fadePercent;
    const rightFadeStart = 100 - fadePercent + progress * fadePercent;
    const gradient = `linear-gradient(to right, transparent 0%, black ${leftFadeEnd}%, black ${rightFadeStart}%, transparent 100%)`;
    container.style.maskImage = gradient;
    (container.style as CSSStyleDeclaration & {
      webkitMaskImage: string;
    }).webkitMaskImage = gradient;
  }, []);

  const clearMask = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    container.style.maskImage = "";
    (container.style as CSSStyleDeclaration & {
      webkitMaskImage: string;
    }).webkitMaskImage = "";
  }, []);

  const stopAnimation = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
  }, []);

  const resetVisuals = useCallback(() => {
    const textEl = textRef.current;
    if (textEl) textEl.style.transform = "translateX(0)";
    clearMask();
    const container = containerRef.current;
    if (container) container.dataset.state = "idle";
  }, [clearMask]);

  const runScrollAnimation = useCallback(() => {
    const textEl = textRef.current;
    const container = containerRef.current;
    const overflowAmount = overflowAmountRef.current;
    if (!(textEl && container) || overflowAmount === 0) return;

    stopAnimation();
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    const sleep = (ms: number) =>
      new Promise<void>((resolve, reject) => {
        const timeoutId = setTimeout(resolve, ms);
        signal.addEventListener("abort", () => {
          clearTimeout(timeoutId);
          reject(new Error("Aborted"));
        });
      });

    const animateScroll = (direction: "left" | "right"): Promise<void> =>
      new Promise((resolve, reject) => {
        if (signal.aborted) {
          reject(new Error("Aborted"));
          return;
        }
        const startTime = performance.now();
        const startProgress = direction === "left" ? 0 : 1;
        const endProgress = direction === "left" ? 1 : 0;
        const scrollDuration =
          (overflowAmount / optionsRef.current.scrollSpeed) * 1000;

        const tick = (currentTime: number) => {
          if (signal.aborted) {
            reject(new Error("Aborted"));
            return;
          }
          const t = Math.min((currentTime - startTime) / scrollDuration, 1);
          const progress = startProgress + (endProgress - startProgress) * t;

          // Direct DOM writes — no React rerender per frame.
          textEl.style.transform = `translateX(${-progress * overflowAmount}px)`;
          applyMask(progress);

          if (t < 1) {
            animationRef.current = requestAnimationFrame(tick);
          } else {
            resolve();
          }
        };

        animationRef.current = requestAnimationFrame(tick);
        signal.addEventListener("abort", () => {
          if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
          }
          reject(new Error("Aborted"));
        });
      });

    (async () => {
      try {
        textEl.style.transform = "translateX(0)";
        applyMask(0);
        container.dataset.state = "scrolling";

        while (!signal.aborted) {
          await sleep(optionsRef.current.startDelay);
          if (signal.aborted) break;
          await animateScroll("left");
          if (signal.aborted) break;
          await sleep(optionsRef.current.endDelay);
          if (signal.aborted) break;
          await animateScroll("right");
          if (signal.aborted) break;
        }
      } catch {
        // Aborted — expected.
      }
    })();
  }, [applyMask, stopAnimation]);

  const measure = useCallback(() => {
    const container = containerRef.current;
    const text = textRef.current;
    if (!(container && text)) return;
    const containerW = containerWidth ?? container.offsetWidth;
    const textW = text.scrollWidth;

    const prev = measurementsRef.current;
    if (prev && prev.containerW === containerW && prev.textW === textW) {
      return;
    }
    measurementsRef.current = { containerW, textW };
    overflowAmountRef.current = Math.max(0, textW - containerW);
    fadePercentRef.current = Math.min(
      (optionsRef.current.fadeWidth / containerW) * 100,
      20,
    );

    const overflowing = textW > containerW;
    setIsOverflowing((cur) => (cur === overflowing ? cur : overflowing));

    // If we're already scrolling, keep going but with fresh measurements
    // baked into the next frame (overflowAmountRef is read live).
    if (overflowing && abortControllerRef.current) {
      // Restart cleanly so the running tick doesn't undershoot/overshoot
      // when overflowAmount changes mid-flight.
      runScrollAnimation();
    }
  }, [containerWidth, runScrollAnimation]);

  const observeAll = useCallback(() => {
    resizeObserverRef.current?.disconnect();
    const container = containerRef.current;
    const text = textRef.current;
    if (!(container && text)) return;
    const observer = new ResizeObserver(measure);
    observer.observe(container);
    if (containerWidth === undefined) {
      observer.observe(text);
    }
    resizeObserverRef.current = observer;
    measure();
  }, [containerWidth, measure]);

  const registerContent = useCallback(
    (node: HTMLSpanElement | null) => {
      textRef.current = node;
      observeAll();
    },
    [observeAll],
  );

  useIsoLayoutEffect(() => {
    observeAll();
    return () => {
      resizeObserverRef.current?.disconnect();
      resizeObserverRef.current = null;
    };
  }, [observeAll]);

  const notifyContentChange = useCallback(
    (_text: string) => {
      stopAnimation();
      resetVisuals();
      measure();
    },
    [measure, resetVisuals, stopAnimation],
  );

  // Start / stop the animation when overflow status changes.
  useEffect(() => {
    if (isOverflowing) {
      runScrollAnimation();
    } else {
      stopAnimation();
      resetVisuals();
    }
    return () => {
      stopAnimation();
    };
  }, [isOverflowing, runScrollAnimation, resetVisuals, stopAnimation]);

  const ctx = useMemo<TickerContextValue>(
    () => ({ registerContent, notifyContentChange, isOverflowing }),
    [registerContent, notifyContentChange, isOverflowing],
  );

  return (
    <TickerContext.Provider value={ctx}>
      <style>{TICKER_BEHAVIORAL_CSS}</style>
      <div
        ref={setContainerRef}
        aria-live="polite"
        data-slot="ticker-root"
        data-state="idle"
        data-overflowing={isOverflowing ? "" : undefined}
        className={cn(className)}
        style={{
          width: containerWidth ? `${containerWidth}px` : undefined,
          transition: `-webkit-mask-image ${fadeTransitionDuration}ms ease-out, mask-image ${fadeTransitionDuration}ms ease-out`,
          ...style,
        }}
        {...rest}
      >
        {children}
      </div>
    </TickerContext.Provider>
  );
});

interface TickerContentProps
  extends Omit<ComponentPropsWithoutRef<"span">, "children"> {
  /** The text content to display and potentially scroll. */
  children: string;
}

const Content = forwardRef<HTMLSpanElement, TickerContentProps>(
  function TickerContent(
    { className, children, style, ...rest },
    forwardedRef,
  ) {
    const { registerContent, notifyContentChange, isOverflowing } =
      useTicker("Ticker.Content");

    const setRef = useCallback(
      (node: HTMLSpanElement | null) => {
        registerContent(node);
        if (typeof forwardedRef === "function") {
          forwardedRef(node);
        } else if (forwardedRef) {
          forwardedRef.current = node;
        }
      },
      [forwardedRef, registerContent],
    );

    useEffect(() => {
      notifyContentChange(children);
    }, [children, notifyContentChange]);

    return (
      <span
        ref={setRef}
        data-slot="ticker-content"
        className={cn(className)}
        style={{
          willChange: isOverflowing ? "transform" : undefined,
          ...style,
        }}
        {...rest}
      >
        {children}
      </span>
    );
  },
);

const TICKER_BEHAVIORAL_CSS = `
[data-slot="ticker-root"] {
  position: relative;
  overflow: hidden;
  white-space: nowrap;
}
[data-slot="ticker-content"] {
  display: inline-block;
}
`;

type TickerComposition = {
  /**
   * Root container for Ticker. Measures its width and the inner
   * `Content` to decide whether the text overflows, then runs a smooth
   * back-and-forth scroll animation with fade masks on the edges.
   *
   * The animation loop drives `transform` and the CSS mask via direct DOM
   * writes — no React state updates per frame.
   *
   * @example
   *
   * ```tsx
   * <Ticker.Root scrollSpeed={40}>
   *   <Ticker.Content>
   *     Some long text that may overflow…
   *   </Ticker.Content>
   * </Ticker.Root>
   * ```
   */
  Root: typeof Root;
  /**
   * The scrolling text node. Must be a (nested) child of `Root` and receive
   * a `string` child — the text to scroll.
   */
  Content: typeof Content;
};

export const Ticker: TickerComposition = {
  Root,
  Content,
};

export type { TickerContentProps, TickerRootProps };
