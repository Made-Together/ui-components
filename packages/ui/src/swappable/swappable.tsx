"use client";

import {
  AnimatePresence,
  type HTMLMotionProps,
  motion,
  type Transition,
  useReducedMotion,
} from "motion/react";
import type {
  ComponentPropsWithoutRef,
  ReactElement,
  ReactNode,
  Ref,
} from "react";
import {
  cloneElement,
  createContext,
  forwardRef,
  isValidElement,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { cn } from "../../lib/utils.js";

const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

type Breakpoint = "base" | "sm" | "md" | "lg" | "xl" | "2xl";

const BREAKPOINT_PX: Record<Exclude<Breakpoint, "base">, number> = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
};

const BREAKPOINT_ORDER: Breakpoint[] = ["base", "sm", "md", "lg", "xl", "2xl"];

type ResponsiveCols = number | Partial<Record<Breakpoint, number>>;

type RotationInterval = {
  /** Lower bound for the random delay between swaps, in ms. */
  min: number;
  /** Upper bound for the random delay between swaps, in ms. */
  max: number;
};

const DEFAULT_INTERVAL: RotationInterval = { min: 2000, max: 5000 };

const DEFAULT_TRANSITION: Transition = {
  duration: 0.35,
  ease: [0.32, 0.72, 0, 1],
};

const DEFAULT_INITIAL: HTMLMotionProps<"div">["initial"] = {
  opacity: 0,
  scale: 0.92,
};
const DEFAULT_ANIMATE: HTMLMotionProps<"div">["animate"] = {
  opacity: 1,
  scale: 1,
};
const DEFAULT_EXIT: HTMLMotionProps<"div">["exit"] = {
  opacity: 0,
  scale: 0.92,
};

function normalizeCols(
  cols: ResponsiveCols,
): Partial<Record<Breakpoint, number>> {
  if (typeof cols === "number") {
    return { base: cols };
  }
  return cols;
}

function resolveColsForWidth(
  cols: Partial<Record<Breakpoint, number>>,
  width: number,
): number {
  let resolved = cols.base ?? 1;
  for (const bp of BREAKPOINT_ORDER) {
    if (bp === "base") {
      continue;
    }
    if (width >= BREAKPOINT_PX[bp] && cols[bp] !== undefined) {
      resolved = cols[bp] as number;
    }
  }
  return resolved;
}

/** Sanitize `useId()` for use in CSS selectors. */
function cssScopeToken(raw: string): string {
  const s = raw.replace(/[^a-zA-Z0-9_-]/g, "");
  if (s.length === 0) {
    return "s0";
  }
  if (/^[0-9-]/.test(s)) {
    return `s${s}`;
  }
  return s;
}

function colsScopedCss(
  scope: string,
  cols: Partial<Record<Breakpoint, number>>,
  rows: number,
): string {
  const base = cols.base ?? 1;
  let css = `[data-swappable-grid="${scope}"] {
  display: grid;
  grid-template-columns: repeat(${base}, minmax(0, 1fr));
  grid-template-rows: repeat(${rows}, minmax(0, 1fr));
}`;
  for (const bp of BREAKPOINT_ORDER) {
    if (bp === "base") {
      continue;
    }
    const value = cols[bp];
    if (value === undefined) {
      continue;
    }
    css += `
@media (min-width: ${BREAKPOINT_PX[bp]}px) {
  [data-swappable-grid="${scope}"] {
    grid-template-columns: repeat(${value}, minmax(0, 1fr));
  }
}`;
  }
  return css;
}

interface SwappableContextValue {
  cells: readonly unknown[];
  getId: (item: unknown) => string;
  transition: Transition;
  initial: HTMLMotionProps<"div">["initial"];
  animate: HTMLMotionProps<"div">["animate"];
  exit: HTMLMotionProps<"div">["exit"];
  scope: string;
  cols: Partial<Record<Breakpoint, number>>;
  rows: number;
  pauseOnHover: boolean;
  setHovered: (hovered: boolean) => void;
}

const SwappableContext = createContext<SwappableContextValue | null>(null);

function useSwappable(component: string): SwappableContextValue {
  const ctx = useContext(SwappableContext);
  if (!ctx) {
    throw new Error(`${component} must be rendered inside <Swappable.Root>.`);
  }
  return ctx;
}

interface SwappableRootProps<T>
  extends Omit<ComponentPropsWithoutRef<"div">, "children"> {
  /**
   * Source array of items to display and rotate. Items are assumed to be
   * unique; duplicates will be deduplicated by reference (objects) or value
   * (primitives) before being placed in the grid.
   */
  items: readonly T[];
  /**
   * Number of grid rows.
   * @default 1
   */
  rows?: number;
  /**
   * Number of grid columns. Accepts either a fixed number or a per-breakpoint
   * map (Tailwind-aligned breakpoints: `base`, `sm`, `md`, `lg`, `xl`, `2xl`).
   * The total visible cells = `rows * resolvedCols`.
   * @default 1
   */
  cols?: ResponsiveCols;
  /**
   * Lower and upper bounds (in ms) for the random delay between swaps.
   * @default { min: 2000, max: 5000 }
   */
  rotationInterval?: RotationInterval;
  /**
   * Default motion `transition` applied to every `Swappable.Item`. Per-item
   * overrides win over this default.
   * @default { duration: 0.35, ease: [0.32, 0.72, 0, 1] }
   */
  transition?: Transition;
  /**
   * Default motion `initial` variant applied to every `Swappable.Item`.
   * @default { opacity: 0, scale: 0.92 }
   */
  initial?: HTMLMotionProps<"div">["initial"];
  /**
   * Default motion `animate` variant applied to every `Swappable.Item`.
   * @default { opacity: 1, scale: 1 }
   */
  animate?: HTMLMotionProps<"div">["animate"];
  /**
   * Default motion `exit` variant applied to every `Swappable.Item`.
   * @default { opacity: 0, scale: 0.92 }
   */
  exit?: HTMLMotionProps<"div">["exit"];
  /**
   * Pause rotation while the grid is hovered.
   * @default false
   */
  pauseOnHover?: boolean;
  children?: ReactNode;
}

const RootImpl = forwardRef<HTMLDivElement, SwappableRootProps<unknown>>(
  function SwappableRoot(props, ref) {
    const {
      items,
      rows = 1,
      cols = 1,
      rotationInterval = DEFAULT_INTERVAL,
      transition = DEFAULT_TRANSITION,
      initial = DEFAULT_INITIAL,
      animate = DEFAULT_ANIMATE,
      exit = DEFAULT_EXIT,
      pauseOnHover = false,
      className,
      children,
      ...rest
    } = props;

    const scope = cssScopeToken(useId());
    const colsNorm = useMemo(() => normalizeCols(cols), [cols]);
    const reducedMotion = useReducedMotion();

    // Internal id assignment — items are assumed unique. We hand out a stable
    // string id the first time we see an item, keyed by referential (or value
    // for primitives) equality.
    const idMapRef = useRef<Map<unknown, string>>(new Map());
    const idCounterRef = useRef(0);
    const getId = useMemo(
      () => (item: unknown) => {
        const map = idMapRef.current;
        const existing = map.get(item);
        if (existing !== undefined) {
          return existing;
        }
        const next = `i${idCounterRef.current++}`;
        map.set(item, next);
        return next;
      },
      [],
    );

    // Dedupe items up-front so we never seed the grid with the same item twice.
    const uniqueItems = useMemo(() => {
      const seen = new Set<unknown>();
      const out: unknown[] = [];
      for (const item of items) {
        if (seen.has(item)) {
          continue;
        }
        seen.add(item);
        out.push(item);
      }
      return out;
    }, [items]);

    const [resolvedCols, setResolvedCols] = useState<number>(
      () => colsNorm.base ?? 1,
    );

    useEffect(() => {
      const update = () => {
        setResolvedCols(resolveColsForWidth(colsNorm, window.innerWidth));
      };
      update();
      window.addEventListener("resize", update);
      return () => window.removeEventListener("resize", update);
    }, [colsNorm]);

    const cellCount = Math.max(
      0,
      Math.min(rows * resolvedCols, uniqueItems.length),
    );

    const [cells, setCells] = useState<unknown[]>(() =>
      uniqueItems.slice(0, cellCount),
    );

    // Keep the cell array in sync with cellCount / items changes without
    // disturbing already-placed items more than necessary.
    useIsoLayoutEffect(() => {
      setCells((prev) => {
        const stillValid = prev.filter((item) => uniqueItems.includes(item));
        if (stillValid.length > cellCount) {
          return stillValid.slice(0, cellCount);
        }
        if (stillValid.length < cellCount) {
          const inGrid = new Set(stillValid);
          const pool = uniqueItems.filter((item) => !inGrid.has(item));
          return [
            ...stillValid,
            ...pool.slice(0, cellCount - stillValid.length),
          ];
        }
        if (stillValid.length !== prev.length) {
          return stillValid;
        }
        return prev;
      });
    }, [uniqueItems, cellCount]);

    const [hovered, setHovered] = useState(false);
    const hoveredRef = useRef(hovered);
    hoveredRef.current = hovered;

    // Random swap loop. Picks a random visible cell, swaps it with a random
    // off-screen item, and reschedules with a random delay in [min, max].
    useEffect(() => {
      if (reducedMotion) {
        return;
      }
      if (uniqueItems.length <= cellCount) {
        return;
      }
      const { min, max } = rotationInterval;
      const lo = Math.min(min, max);
      const hi = Math.max(min, max);

      let timer: ReturnType<typeof setTimeout> | null = null;
      let cancelled = false;

      const schedule = () => {
        const delay = lo + Math.random() * (hi - lo);
        timer = setTimeout(() => {
          if (cancelled) {
            return;
          }
          if (pauseOnHover && hoveredRef.current) {
            schedule();
            return;
          }
          setCells((prev) => {
            if (prev.length === 0) {
              return prev;
            }
            const inGrid = new Set(prev);
            const pool = uniqueItems.filter((item) => !inGrid.has(item));
            if (pool.length === 0) {
              return prev;
            }
            const cellIdx = Math.floor(Math.random() * prev.length);
            const poolIdx = Math.floor(Math.random() * pool.length);
            const next = prev.slice();
            next[cellIdx] = pool[poolIdx];
            return next;
          });
          schedule();
        }, delay);
      };

      schedule();
      return () => {
        cancelled = true;
        if (timer !== null) {
          clearTimeout(timer);
        }
      };
    }, [uniqueItems, cellCount, rotationInterval, pauseOnHover, reducedMotion]);

    const ctx = useMemo<SwappableContextValue>(
      () => ({
        cells,
        getId,
        transition,
        initial,
        animate,
        exit,
        scope,
        cols: colsNorm,
        rows,
        pauseOnHover,
        setHovered,
      }),
      [
        cells,
        getId,
        transition,
        initial,
        animate,
        exit,
        scope,
        colsNorm,
        rows,
        pauseOnHover,
      ],
    );

    return (
      <SwappableContext.Provider value={ctx}>
        <div
          ref={ref}
          data-slot="swappable-root"
          data-swappable-instance={scope}
          className={cn(className)}
          {...rest}
        >
          <style>{SWAPPABLE_BEHAVIORAL_CSS}</style>
          {children}
        </div>
      </SwappableContext.Provider>
    );
  },
);

/**
 * Type-safe generic wrapper around the forwardRef'd Root so consumers get
 * proper `T` inference on the `items` prop.
 */
const Root = RootImpl as <T>(
  props: SwappableRootProps<T> & { ref?: Ref<HTMLDivElement> },
) => ReactElement;

const SWAPPABLE_BEHAVIORAL_CSS = `
[data-slot="swappable-root"] {
  position: relative;
}
[data-slot="swappable-cell"] {
  position: relative;
  display: grid;
}
[data-slot="swappable-cell"] > * {
  grid-area: 1 / 1;
}
[data-slot="swappable-item"] {
  width: 100%;
  height: 100%;
}
@media (prefers-reduced-motion: reduce) {
  [data-slot="swappable-item"] {
    transition: none !important;
    animation: none !important;
  }
}
`;

type SwappableGridProps<T> = Omit<
  ComponentPropsWithoutRef<"div">,
  "children"
> & {
  /**
   * Render function called once per visible cell. The returned element should
   * have `Swappable.Item` (or any other `motion` component) as its root so the
   * default enter/exit animation runs on swap. `Swappable.Grid` injects the
   * internal item `key` automatically.
   */
  children: (item: T, index: number) => ReactNode;
};

const GridImpl = forwardRef<HTMLDivElement, SwappableGridProps<unknown>>(
  function SwappableGrid({ className, children, ...rest }, ref) {
    const ctx = useSwappable("Swappable.Grid");
    const { cells, getId, scope, cols, rows, pauseOnHover, setHovered } = ctx;

    const css = useMemo(
      () => colsScopedCss(scope, cols, rows),
      [scope, cols, rows],
    );

    const handleMouseEnter = pauseOnHover ? () => setHovered(true) : undefined;
    const handleMouseLeave = pauseOnHover ? () => setHovered(false) : undefined;

    return (
      // biome-ignore lint/a11y/noStaticElementInteractions: hover/focus handlers gate the rotation timer only; they don't add interactive semantics.
      <div
        ref={ref}
        data-slot="swappable-grid"
        data-swappable-grid={scope}
        className={cn(className)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={handleMouseEnter}
        onBlur={handleMouseLeave}
        {...rest}
      >
        <style>{css}</style>
        {cells.map((item, i) => {
          const id = getId(item);
          const rendered = children(item, i);
          const keyed: ReactNode = isValidElement(rendered)
            ? cloneElement(rendered, { key: id })
            : rendered;
          return (
            // biome-ignore lint/suspicious/noArrayIndexKey: cells are position-stable; identity-keyed motion lives one level deeper.
            <div key={i} data-slot="swappable-cell">
              <AnimatePresence initial={false} mode="popLayout">
                {keyed}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    );
  },
);

const Grid = GridImpl as <T>(
  props: SwappableGridProps<T> & { ref?: Ref<HTMLDivElement> },
) => ReactElement;

type SwappableItemProps = Omit<HTMLMotionProps<"div">, "ref">;

const Item = forwardRef<HTMLDivElement, SwappableItemProps>(
  function SwappableItem(
    { className, initial, animate, exit, transition, children, ...rest },
    ref,
  ) {
    const ctx = useSwappable("Swappable.Item");
    return (
      <motion.div
        ref={ref}
        data-slot="swappable-item"
        initial={initial ?? ctx.initial}
        animate={animate ?? ctx.animate}
        exit={exit ?? ctx.exit}
        transition={transition ?? ctx.transition}
        className={cn(className)}
        {...rest}
      >
        {children}
      </motion.div>
    );
  },
);

type SwappableComposition = {
  /**
   * Root component for the Swappable grid. Owns the source `items`, the grid
   * shape (`rows` × `cols`), the rotation timer, and the default motion
   * variants applied to each cell.
   *
   * When `items.length` exceeds the grid size, the component periodically
   * swaps a random visible cell with a random off-screen item — uniqueness is
   * guaranteed, the same item is never visible twice. When `items.length` is
   * less than or equal to the grid size, rotation is disabled and the grid
   * renders statically.
   *
   * @example
   *
   * ```tsx
   * <Swappable.Root
   *   items={logos}
   *   rows={2}
   *   cols={{ base: 2, md: 4, lg: 6 }}
   *   rotationInterval={{ min: 2000, max: 5000 }}
   *   pauseOnHover
   * >
   *   <Swappable.Grid>
   *     {(logo) => (
   *       <Swappable.Item>
   *         <img src={logo.src} alt={logo.name} />
   *       </Swappable.Item>
   *     )}
   *   </Swappable.Grid>
   * </Swappable.Root>
   * ```
   */
  Root: typeof Root;
  /**
   * Renders the visible grid and calls `children` once per cell with the
   * currently-assigned item. The render function should return a
   * `Swappable.Item` (or any motion component) as its root element — the grid
   * injects the per-item `key` so `AnimatePresence` can animate the swap.
   */
  Grid: typeof Grid;
  /**
   * Animated cell wrapper. Renders a `motion.div` and inherits the default
   * `transition` / `initial` / `animate` / `exit` from `Swappable.Root`,
   * which can be overridden per-instance via props.
   */
  Item: typeof Item;
};

export const Swappable: SwappableComposition = {
  Root,
  Grid,
  Item,
};

export type {
  ResponsiveCols,
  RotationInterval,
  SwappableGridProps,
  SwappableItemProps,
  SwappableRootProps,
};
