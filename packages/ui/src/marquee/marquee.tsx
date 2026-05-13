"use client";

import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { forwardRef, useId } from "react";

import { cn } from "../lib/utils.js";

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
  return `@keyframes bt-marquee-x {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(calc(-100% - var(--gap)));
  }
}
@keyframes bt-marquee-y {
  from {
    transform: translateY(0);
  }
  to {
    transform: translateY(calc(-100% - var(--gap)));
  }
}
[data-marquee-instance="${scope}"][data-marquee-vertical="false"] > [data-marquee-track] {
  animation: bt-marquee-x var(--duration) infinite linear;
}
[data-marquee-instance="${scope}"][data-marquee-vertical="true"] > [data-marquee-track] {
  animation: bt-marquee-y var(--duration) linear infinite;
}
[data-marquee-instance="${scope}"][data-marquee-reverse="true"] > [data-marquee-track] {
  animation-direction: reverse;
}
[data-marquee-instance="${scope}"][data-marquee-pause-hover="true"]:hover > [data-marquee-track] {
  animation-play-state: paused;
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
   * One or more `Marquee.Item` nodes (or other content) rendered inside each scrolling track
   */
  children?: ReactNode;
  /**
   * Whether to animate vertically instead of horizontally
   * @default false
   */
  vertical?: boolean;
  /**
   * Number of identical tracks to render for a seamless loop
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
    ref,
  ) => {
    const scope = cssScopeToken(useId());

    return (
      <div
        ref={ref}
        data-marquee-root=""
        data-marquee-instance={scope}
        data-marquee-vertical={vertical ? "true" : "false"}
        data-marquee-reverse={reverse ? "true" : "false"}
        data-marquee-pause-hover={pauseOnHover ? "true" : "false"}
        {...props}
        className={cn(
          "group flex gap-(--gap) overflow-hidden p-2 [--duration:40s] [--gap:1rem]",
          {
            "flex-row": !vertical,
            "flex-col": vertical,
          },
          className,
        )}
      >
        <style>{marqueeScopedCss(scope)}</style>
        {Array.from({ length: repeat }, (_, i) => (
          <div
            // biome-ignore lint/suspicious/noArrayIndexKey: index is the key
            key={i}
            data-marquee-track=""
            className={cn("flex shrink-0 justify-around gap-(--gap)", {
              "flex-row": !vertical,
              "flex-col": vertical,
            })}
          >
            {children}
          </div>
        ))}
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
