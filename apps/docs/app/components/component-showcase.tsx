"use client";

import {
  createContext,
  type ReactNode,
  type RefObject,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

const COLLAPSED_HEIGHT = 128;
const DEFAULT_SCROLLABLE_PREVIEW_HEIGHT = 600;

const ShowcaseScrollContainerContext =
  createContext<RefObject<HTMLDivElement | null> | null>(null);

/**
 * Read the scroll container exposed by an enclosing `ComponentShowcase` when
 * it was rendered with `scrollablePreview`. Returns `null` outside that mode —
 * callers should pass the ref through only when defined.
 */
export function useShowcaseScrollContainer() {
  return useContext(ShowcaseScrollContainerContext);
}

interface ComponentShowcaseProps {
  /**
   * Live, rendered preview of the component being demonstrated. Rendered into
   * the top section with horizontal overflow clipped and `bg-background`.
   */
  preview: ReactNode;
  /**
   * Source code shown in the bottom section. Pass a Markdown/MDX fenced code
   * block as children so Nextra's syntax highlighter formats it.
   */
  children: ReactNode;
  className?: string;
  /**
   * When `true`, the preview area becomes a fixed-height, vertically
   * scrollable container. Children rendered inside `preview` can read the
   * underlying scroll element via `useShowcaseScrollContainer()` and pass it
   * to scroll-driven primitives (e.g. `TextReveal.Root`'s `container` prop).
   */
  scrollablePreview?: boolean;
  /**
   * Height (in px) of the preview area when `scrollablePreview` is `true`.
   * @default 600
   */
  previewHeight?: number;
}

const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

export function ComponentShowcase({
  preview,
  children,
  className,
  scrollablePreview = false,
  previewHeight = DEFAULT_SCROLLABLE_PREVIEW_HEIGHT,
}: ComponentShowcaseProps) {
  const [expanded, setExpanded] = useState(false);
  const [overflows, setOverflows] = useState(false);
  const [fullHeight, setFullHeight] = useState<number | null>(null);
  const codeRef = useRef<HTMLDivElement>(null);
  const previewScrollRef = useRef<HTMLDivElement | null>(null);

  const measure = useCallback(() => {
    const node = codeRef.current;
    if (!node) return;
    const height = node.scrollHeight;
    setFullHeight(height);
    setOverflows(height > COLLAPSED_HEIGHT + 1);
  }, []);

  useIsomorphicLayoutEffect(() => {
    measure();
  }, [measure]);

  useEffect(() => {
    if (typeof ResizeObserver === "undefined") return;
    const node = codeRef.current;
    if (!node) return;
    const observer = new ResizeObserver(() => measure());
    observer.observe(node);
    return () => observer.disconnect();
  }, [measure]);

  const collapsed = overflows && !expanded;
  const maxHeight = collapsed
    ? `${COLLAPSED_HEIGHT}px`
    : fullHeight
      ? `${fullHeight}px`
      : "none";

  return (
    <div
      className={[
        "not-prose my-6 overflow-hidden rounded-md border border-border bg-card",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      data-slot="component-showcase"
      data-state={expanded ? "expanded" : "collapsed"}
    >
      {scrollablePreview ? (
        <ShowcaseScrollContainerContext.Provider value={previewScrollRef}>
          <div
            ref={previewScrollRef}
            data-slot="component-showcase-preview"
            data-scrollable=""
            style={{ height: previewHeight }}
            className="overflow-y-auto overflow-x-hidden bg-background"
          >
            {preview}
          </div>
        </ShowcaseScrollContainerContext.Provider>
      ) : (
        <div className="overflow-x-hidden bg-background min-h-56 p-6 flex items-center justify-center">
          {preview}
        </div>
      )}
      <div className="relative border-t border-border [&_pre]:rounded-t-none">
        <div
          ref={codeRef}
          style={{ maxHeight }}
          className="overflow-hidden transition-[max-height] outline-none! duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] [&_div_pre]:ring-none!"
        >
          {children}
        </div>
        {collapsed ? (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 flex h-24 items-end justify-center bg-linear-to-t from-card via-card/90 to-transparent pb-3">
            <button
              type="button"
              onClick={() => setExpanded(true)}
              className="pointer-events-auto rounded-full border border-border bg-background px-3.5 py-1.5 text-xs font-medium text-foreground shadow-sm transition hover:bg-secondary"
            >
              Expand code
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
