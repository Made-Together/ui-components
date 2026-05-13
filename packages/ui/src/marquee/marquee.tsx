"use client";

import type { ComponentPropsWithoutRef, ReactNode } from "react";
import {
  forwardRef,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import { cn } from "../../lib/utils.js";

const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

/** Sanitize `useId()` for use in CSS selectors and keyframe names. */
function cssScopeToken(raw: string): string {
  const s = raw.replace(/[^a-zA-Z0-9_-]/g, "");
  if (s.length === 0) {
    return "m0";
  }
  if (/^[0-9-]/.test(s)) {
    return `m${s}`;
  }
  return s;
}

function marqueeScopedCss(scope: string): string {
  return `@keyframes bt-marquee-x-${scope} {
  from {
    transform: translate3d(0, 0, 0);
  }
  to {
    transform: translate3d(calc(-1 * var(--bt-shift, 100%)), 0, 0);
  }
}
@keyframes bt-marquee-y-${scope} {
  from {
    transform: translate3d(0, 0, 0);
  }
  to {
    transform: translate3d(0, calc(-1 * var(--bt-shift, 100%)), 0);
  }
}
[data-marquee-instance="${scope}"][data-marquee-vertical="false"] > [data-marquee-track] {
  animation: bt-marquee-x-${scope} var(--duration) infinite linear;
}
[data-marquee-instance="${scope}"][data-marquee-vertical="true"] > [data-marquee-track] {
  animation: bt-marquee-y-${scope} var(--duration) linear infinite;
}
[data-marquee-instance="${scope}"][data-marquee-reverse="true"] > [data-marquee-track] {
  animation-direction: reverse;
}
[data-marquee-instance="${scope}"][data-marquee-pause-hover="true"]:hover > [data-marquee-track] {
  animation-play-state: paused;
}
[data-marquee-instance="${scope}"] > [data-marquee-track] {
  will-change: transform;
  backface-visibility: hidden;
}
[data-marquee-instance="${scope}"] [data-marquee-item] {
  flex-shrink: 0;
}
@media (prefers-reduced-motion: reduce) {
  [data-marquee-instance="${scope}"] > [data-marquee-track] {
    animation: none;
  }
}`;
}

export interface MarqueeRootProps extends ComponentPropsWithoutRef<"div"> {
  /**
   * Optional CSS class name to apply custom styles
   */
  className?: string;
  /**
   * Whether to reverse the animation direction
   * @default false
   */
  reverse?: boolean;
  /**
   * Whether to pause the animation on hover
   * @default false
   */
  pauseOnHover?: boolean;
  /**
   * One or more `Marquee.Item` nodes (or other content) rendered inside each scrolling copy
   */
  children?: ReactNode;
  /**
   * Whether to animate vertically instead of horizontally
   * @default false
   */
  vertical?: boolean;
  /**
   * Minimum number of identical children copies inside the scrolling track.
   * The component renders more if the viewport is larger than the rendered
   * content so the loop reset stays seamless.
   * @default 4
   */
  repeat?: number;
}

export type MarqueeItemProps = ComponentPropsWithoutRef<"div">;

export const Root = forwardRef<HTMLDivElement, MarqueeRootProps>(
  (
    {
      className,
      reverse = false,
      pauseOnHover = false,
      children,
      vertical = false,
      repeat = 4,
      ...props
    },
    forwardedRef,
  ) => {
    const scope = cssScopeToken(useId());
    const rootRef = useRef<HTMLDivElement>(null);
    const trackRef = useRef<HTMLDivElement>(null);
    const copyRef = useRef<HTMLDivElement>(null);
    const [copies, setCopies] = useState(repeat);

    const setRootRef = (el: HTMLDivElement | null) => {
      rootRef.current = el;
      if (typeof forwardedRef === "function") {
        forwardedRef(el);
      } else if (forwardedRef) {
        forwardedRef.current = el;
      }
    };

    useIsoLayoutEffect(() => {
      const root = rootRef.current;
      const track = trackRef.current;
      const copy = copyRef.current;
      if (!root || !track || !copy) return;

      const update = () => {
        const rootSize = vertical ? root.clientHeight : root.clientWidth;
        const copySize = vertical ? copy.offsetHeight : copy.offsetWidth;
        if (!rootSize || !copySize) return;
        const gap =
          Number.parseFloat(getComputedStyle(track).gap || "0") || 0;
        // Fixed pixel shift = one copy + one gap. Setting it on the track means
        // adding more copies later doesn't change the animation distance, so
        // the loop reset stays perfectly seamless.
        track.style.setProperty("--bt-shift", `${copySize + gap}px`);
        // Enough copies so visible content covers the viewport even at the
        // end of a cycle: (n - 1) * (copy + gap) >= viewport + gap.
        const needed = Math.ceil((rootSize + gap) / (copySize + gap)) + 1;
        setCopies((prev) => {
          const next = Math.max(repeat, needed);
          return next === prev ? prev : next;
        });
      };

      update();
      const ro = new ResizeObserver(update);
      ro.observe(root);
      ro.observe(copy);
      return () => ro.disconnect();
    }, [repeat, vertical]);

    return (
      <div
        ref={setRootRef}
        data-marquee-root=""
        data-marquee-instance={scope}
        data-marquee-vertical={vertical ? "true" : "false"}
        data-marquee-reverse={reverse ? "true" : "false"}
        data-marquee-pause-hover={pauseOnHover ? "true" : "false"}
        {...props}
        className={cn(
          "group flex overflow-hidden p-2 [--duration:40s] [--gap:1rem]",
          {
            "flex-row": !vertical,
            "flex-col": vertical,
          },
          className,
        )}
      >
        <style>{marqueeScopedCss(scope)}</style>
        <div
          ref={trackRef}
          data-marquee-track=""
          className={cn("flex h-max w-max gap-(--gap)", {
            "flex-row": !vertical,
            "flex-col": vertical,
          })}
        >
          {Array.from({ length: copies }, (_, i) => (
            <div
              // biome-ignore lint/suspicious/noArrayIndexKey: index is the key
              key={i}
              ref={i === 0 ? copyRef : undefined}
              data-marquee-copy=""
              aria-hidden={i > 0 ? "true" : undefined}
              className={cn("flex shrink-0 justify-around gap-(--gap)", {
                "flex-row": !vertical,
                "flex-col": vertical,
              })}
            >
              {children}
            </div>
          ))}
        </div>
      </div>
    );
  },
);

Root.displayName = "Marquee.Root";

export const Item = forwardRef<HTMLDivElement, MarqueeItemProps>(
  ({ children, className, ...props }, ref) => (
    <div ref={ref} data-marquee-item="" {...props} className={className}>
      {children}
    </div>
  ),
);

Item.displayName = "Marquee.Item";

type MarqueeComposition = {
  Root: typeof Root;
  Item: typeof Item;
};

export const Marquee: MarqueeComposition = {
  Root,
  Item,
};

export type { MarqueeComposition };
