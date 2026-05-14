"use client";

import type { ComponentPropsWithoutRef, CSSProperties } from "react";
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

interface AutoScrollTextContextValue {
  registerContent: (node: HTMLSpanElement | null) => void;
  notifyContentChange: (text: string) => void;
  isOverflowing: boolean;
}

const AutoScrollTextContext =
  createContext<AutoScrollTextContextValue | null>(null);

function useAutoScrollText(component: string): AutoScrollTextContextValue {
  const ctx = useContext(AutoScrollTextContext);
  if (!ctx) {
    throw new Error(
      `${component} must be rendered inside <AutoScrollText.Root>.`,
    );
  }
  return ctx;
}

interface AutoScrollTextRootProps
  extends ComponentPropsWithoutRef<"div"> {
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

const Root = forwardRef<HTMLDivElement, AutoScrollTextRootProps>(
  function AutoScrollTextRoot(
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

    const [measurements, setMeasurements] = useState<{
      containerW: number;
      textW: number;
    } | null>(null);

    const [scrollProgress, setScrollProgress] = useState(0);
    const [isScrolling, setIsScrolling] = useState(false);

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

    const measure = useCallback(() => {
      const container = containerRef.current;
      const text = textRef.current;
      if (!(container && text)) return;
      const containerW = containerWidth ?? container.offsetWidth;
      const textW = text.scrollWidth;
      setMeasurements((prev) => {
        if (prev && prev.containerW === containerW && prev.textW === textW) {
          return prev;
        }
        return { containerW, textW };
      });
    }, [containerWidth]);

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
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
        const textEl = textRef.current;
        if (textEl) {
          textEl.style.transform = "translateX(0)";
        }
        setIsScrolling(false);
        setScrollProgress(0);
        measure();
      },
      [measure],
    );

    const isOverflowing = measurements
      ? measurements.textW > measurements.containerW
      : false;
    const overflowAmount = measurements
      ? Math.max(0, measurements.textW - measurements.containerW)
      : 0;

    const runScrollAnimation = useCallback(async () => {
      const textEl = textRef.current;
      if (!(isOverflowing && textEl) || overflowAmount === 0) return;

      abortControllerRef.current = new AbortController();
      const signal = abortControllerRef.current.signal;

      const scrollDuration = (overflowAmount / scrollSpeed) * 1000;

      const sleep = (ms: number) =>
        new Promise<void>((resolve, reject) => {
          const timeoutId = setTimeout(resolve, ms);
          signal.addEventListener("abort", () => {
            clearTimeout(timeoutId);
            reject(new Error("Aborted"));
          });
        });

      const animateScroll = (direction: "left" | "right"): Promise<void> => {
        return new Promise((resolve, reject) => {
          if (signal.aborted) {
            reject(new Error("Aborted"));
            return;
          }

          const startTime = performance.now();
          const startProgress = direction === "left" ? 0 : 1;
          const endProgress = direction === "left" ? 1 : 0;

          const tick = (currentTime: number) => {
            if (signal.aborted) {
              reject(new Error("Aborted"));
              return;
            }

            const elapsed = currentTime - startTime;
            const t = Math.min(elapsed / scrollDuration, 1);
            const progress =
              startProgress + (endProgress - startProgress) * t;

            const translateX = -progress * overflowAmount;
            textEl.style.transform = `translateX(${translateX}px)`;
            setScrollProgress(progress);

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
      };

      try {
        textEl.style.transform = "translateX(0)";
        setScrollProgress(0);
        setIsScrolling(true);

        while (!signal.aborted) {
          await sleep(startDelay);
          if (signal.aborted) break;
          await animateScroll("left");
          if (signal.aborted) break;
          await sleep(endDelay);
          if (signal.aborted) break;
          await animateScroll("right");
          if (signal.aborted) break;
        }
      } catch {
        // Loop was aborted - expected.
      }
    }, [isOverflowing, overflowAmount, scrollSpeed, startDelay, endDelay]);

    useEffect(() => {
      if (isOverflowing) {
        runScrollAnimation();
      } else {
        setIsScrolling(false);
        setScrollProgress(0);
        const textEl = textRef.current;
        if (textEl) {
          textEl.style.transform = "translateX(0)";
        }
      }

      return () => {
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    }, [isOverflowing, runScrollAnimation]);

    const fadePercent = measurements
      ? Math.min((fadeWidth / measurements.containerW) * 100, 20)
      : 10;

    const leftFadeEnd = scrollProgress * fadePercent;
    const rightFadeStart = 100 - fadePercent + scrollProgress * fadePercent;

    const maskGradient =
      isOverflowing && isScrolling
        ? `linear-gradient(to right, transparent 0%, black ${leftFadeEnd}%, black ${rightFadeStart}%, transparent 100%)`
        : undefined;

    const maskStyle: CSSProperties = maskGradient
      ? {
          WebkitMaskImage: maskGradient,
          maskImage: maskGradient,
          transition: `-webkit-mask-image ${fadeTransitionDuration}ms ease-out, mask-image ${fadeTransitionDuration}ms ease-out`,
        }
      : {};

    const ctx = useMemo<AutoScrollTextContextValue>(
      () => ({
        registerContent,
        notifyContentChange,
        isOverflowing,
      }),
      [registerContent, notifyContentChange, isOverflowing],
    );

    return (
      <AutoScrollTextContext.Provider value={ctx}>
        <div
          ref={setContainerRef}
          aria-live="polite"
          data-slot="autoscroll-text-root"
          data-state={isScrolling ? "scrolling" : "idle"}
          data-overflowing={isOverflowing ? "" : undefined}
          className={cn(
            "relative overflow-hidden whitespace-nowrap",
            className,
          )}
          style={{
            width: containerWidth ? `${containerWidth}px` : undefined,
            ...maskStyle,
            ...style,
          }}
          {...rest}
        >
          {children}
        </div>
      </AutoScrollTextContext.Provider>
    );
  },
);

interface AutoScrollTextContentProps
  extends Omit<ComponentPropsWithoutRef<"span">, "children"> {
  /** The text content to display and potentially scroll. */
  children: string;
}

const Content = forwardRef<HTMLSpanElement, AutoScrollTextContentProps>(
  function AutoScrollTextContent(
    { className, children, style, ...rest },
    forwardedRef,
  ) {
    const { registerContent, notifyContentChange, isOverflowing } =
      useAutoScrollText("AutoScrollText.Content");

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
        data-slot="autoscroll-text-content"
        className={cn("inline-block", className)}
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

type AutoScrollTextComposition = {
  /**
   * Root container for AutoScrollText. Measures its width and the inner
   * `Content` to decide whether the text overflows, then runs a smooth
   * back-and-forth scroll animation with fade masks on the edges.
   *
   * @example
   *
   * ```tsx
   * <AutoScrollText.Root scrollSpeed={40}>
   *   <AutoScrollText.Content>
   *     Some long text that may overflow…
   *   </AutoScrollText.Content>
   * </AutoScrollText.Root>
   * ```
   */
  Root: typeof Root;
  /**
   * The scrolling text node. Must be a direct (or nested) child of `Root`
   * and receive a `string` child — the text to scroll.
   */
  Content: typeof Content;
};

export const AutoScrollText: AutoScrollTextComposition = {
  Root,
  Content,
};

export type { AutoScrollTextContentProps, AutoScrollTextRootProps };
