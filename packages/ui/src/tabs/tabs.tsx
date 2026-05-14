"use client";

import { type HTMLMotionProps, motion, useReducedMotion } from "motion/react";
import type {
  ComponentPropsWithoutRef,
  KeyboardEvent,
  MouseEvent,
} from "react";
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

type Orientation = "horizontal" | "vertical";

interface TabsContextValue {
  scope: string;
  orientation: Orientation;
  disabled: boolean;
  activationMode: "automatic" | "manual";
  isSelected: (id: string) => boolean;
  setSelected: (id: string) => void;
  subscribe: (id: string, listener: () => void) => () => void;
  registerTab: (id: string, node: HTMLButtonElement | null) => void;
  focusTab: (
    fromId: string,
    direction: "next" | "prev" | "first" | "last",
  ) => void;
}

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabs(component: string): TabsContextValue {
  const ctx = useContext(TabsContext);
  if (!ctx) {
    throw new Error(`${component} must be rendered inside <Tabs.Root>.`);
  }
  return ctx;
}

interface TabItemContextValue {
  id: string;
  selected: boolean;
  disabled: boolean;
}

const TabItemContext = createContext<TabItemContextValue | null>(null);

function useTabItem(component: string): TabItemContextValue {
  const ctx = useContext(TabItemContext);
  if (!ctx) {
    throw new Error(`${component} must be rendered inside <Tabs.Trigger>.`);
  }
  return ctx;
}

function triggerDomId(scope: string, id: string): string {
  return `tabs-trigger-${scope}-${id}`;
}

function panelDomId(scope: string, id: string): string {
  return `tabs-panel-${scope}-${id}`;
}

function sanitizeScope(raw: string): string {
  return raw.replace(/[^a-zA-Z0-9_-]/g, "") || "t0";
}

interface TabsRootProps extends ComponentPropsWithoutRef<"div"> {
  /**
   * Controlled selected tab id.
   */
  value?: string;
  /**
   * Initial selected tab id when uncontrolled.
   */
  defaultValue?: string;
  /**
   * Fired when the selected tab changes.
   */
  onValueChange?: (value: string) => void;
  /**
   * Tab list orientation. `vertical` lays the list out as a column to the
   * side of the panel; `horizontal` stacks list-then-panel.
   * @default "horizontal"
   */
  orientation?: Orientation;
  /**
   * Disables every trigger inside the tabs.
   * @default false
   */
  disabled?: boolean;
  /**
   * When `automatic`, focusing a trigger via arrow keys also activates it.
   * When `manual`, the user must press Space/Enter to activate after moving
   * focus.
   * @default "automatic"
   */
  activationMode?: "automatic" | "manual";
}

const Root = forwardRef<HTMLDivElement, TabsRootProps>(function TabsRoot(
  {
    value: controlledValue,
    defaultValue,
    onValueChange,
    orientation = "horizontal",
    disabled = false,
    activationMode = "automatic",
    className,
    children,
    ...rest
  },
  ref,
) {
  const scope = sanitizeScope(useId());
  const isControlled = controlledValue !== undefined;

  // Selected value lives in a ref + per-key listener map so changing the
  // selection does NOT re-render Root. Each Trigger / Content subscribes only
  // to its own id via `useSyncExternalStore`, mirroring the Accordion.
  const valueRef = useRef<string | null>(
    isControlled ? (controlledValue ?? null) : (defaultValue ?? null),
  );
  const listenersRef = useRef(new Map<string, Set<() => void>>());

  const subscribe = useCallback((id: string, listener: () => void) => {
    let set = listenersRef.current.get(id);
    if (!set) {
      set = new Set();
      listenersRef.current.set(id, set);
    }
    set.add(listener);
    return () => {
      set?.delete(listener);
      if (set && set.size === 0) {
        listenersRef.current.delete(id);
      }
    };
  }, []);

  const isSelected = useCallback((id: string) => valueRef.current === id, []);

  const applyValue = useCallback((next: string | null) => {
    const prev = valueRef.current;
    if (prev === next) return;
    valueRef.current = next;
    const affected: Array<string | null> = [prev, next];
    for (const key of affected) {
      if (!key) continue;
      const set = listenersRef.current.get(key);
      if (!set) continue;
      for (const listener of set) listener();
    }
  }, []);

  const onValueChangeRef = useRef(onValueChange);
  useIsoLayoutEffect(() => {
    onValueChangeRef.current = onValueChange;
  }, [onValueChange]);

  const setSelected = useCallback(
    (id: string) => {
      if (isControlled) {
        onValueChangeRef.current?.(id);
        return;
      }
      applyValue(id);
      onValueChangeRef.current?.(id);
    },
    [applyValue, isControlled],
  );

  useIsoLayoutEffect(() => {
    if (!isControlled) return;
    applyValue(controlledValue ?? null);
  }, [controlledValue, isControlled, applyValue]);

  const triggersRef = useRef(new Map<string, HTMLButtonElement>());
  const orderRef = useRef<string[]>([]);

  const registerTab = useCallback(
    (id: string, node: HTMLButtonElement | null) => {
      const map = triggersRef.current;
      if (node) {
        map.set(id, node);
        if (!orderRef.current.includes(id)) {
          orderRef.current.push(id);
        }
      } else {
        map.delete(id);
        orderRef.current = orderRef.current.filter((v) => v !== id);
      }
    },
    [],
  );

  const focusTab = useCallback(
    (fromId: string, direction: "next" | "prev" | "first" | "last") => {
      const map = triggersRef.current;
      const ordered = orderRef.current
        .map((id) => ({ id, node: map.get(id) }))
        .filter(
          (entry): entry is { id: string; node: HTMLButtonElement } =>
            !!entry.node && !entry.node.disabled,
        );
      if (ordered.length === 0) return;
      if (direction === "first") {
        ordered[0]?.node.focus();
        return;
      }
      if (direction === "last") {
        ordered[ordered.length - 1]?.node.focus();
        return;
      }
      const idx = ordered.findIndex((entry) => entry.id === fromId);
      if (idx === -1) return;
      const delta = direction === "next" ? 1 : -1;
      const nextIdx = (idx + delta + ordered.length) % ordered.length;
      ordered[nextIdx]?.node.focus();
    },
    [],
  );

  const ctx = useMemo<TabsContextValue>(
    () => ({
      scope,
      orientation,
      disabled,
      activationMode,
      isSelected,
      setSelected,
      subscribe,
      registerTab,
      focusTab,
    }),
    [
      scope,
      orientation,
      disabled,
      activationMode,
      isSelected,
      setSelected,
      subscribe,
      registerTab,
      focusTab,
    ],
  );

  return (
    <TabsContext.Provider value={ctx}>
      <style>{TABS_BEHAVIORAL_CSS}</style>
      <div
        ref={ref}
        data-slot="tabs-root"
        data-orientation={orientation}
        className={cn(className)}
        {...rest}
      >
        {children}
      </div>
    </TabsContext.Provider>
  );
});

const TABS_BEHAVIORAL_CSS = `
[data-slot="tabs-root"] {
  display: flex;
  gap: 0.5rem;
}
[data-slot="tabs-root"][data-orientation="horizontal"] {
  flex-direction: column;
}
[data-slot="tabs-root"][data-orientation="vertical"] {
  flex-direction: row;
}
[data-slot="tabs-list-container"] {
  position: relative;
}
[data-slot="tabs-list"] {
  display: inline-flex;
  padding: 0.25rem;
}
[data-slot="tabs-list"][data-orientation="horizontal"] {
  width: 100%;
  flex-direction: row;
}
[data-slot="tabs-list"][data-orientation="vertical"] {
  flex-direction: column;
  gap: 0.25rem;
}
[data-slot="tabs-trigger"] {
  position: relative;
  z-index: 1;
  cursor: pointer;
}
[data-slot="tabs-trigger"]:disabled {
  cursor: not-allowed;
}
[data-slot="tabs-indicator"] {
  position: absolute;
  inset: 0;
  z-index: -1;
}
[data-slot="tabs-separator"] {
  pointer-events: none;
  position: absolute;
  transition: opacity 150ms ease-out;
}
[data-slot="tabs-trigger"][data-state="active"] [data-slot="tabs-separator"] {
  opacity: 0;
}
[data-slot="tabs-list"][data-orientation="horizontal"] [data-slot="tabs-separator"] {
  top: 25%;
  left: 0;
  height: 50%;
  width: 1px;
}
[data-slot="tabs-list"][data-orientation="vertical"] [data-slot="tabs-separator"] {
  top: 0;
  left: 5%;
  height: 1px;
  width: 90%;
}
@media (prefers-reduced-motion: reduce) {
  [data-slot="tabs-separator"] {
    transition: none;
  }
}
`;

type TabsContainerProps = ComponentPropsWithoutRef<"div">;

const Container = forwardRef<HTMLDivElement, TabsContainerProps>(
  function TabsContainer({ className, ...rest }, ref) {
    return (
      <div
        ref={ref}
        data-slot="tabs-list-container"
        className={cn(className)}
        {...rest}
      />
    );
  },
);

type TabsListProps = ComponentPropsWithoutRef<"div">;

const List = forwardRef<HTMLDivElement, TabsListProps>(function TabsList(
  { className, children, ...rest },
  ref,
) {
  const root = useTabs("Tabs.List");
  return (
    <div
      ref={ref}
      role="tablist"
      aria-orientation={root.orientation}
      data-slot="tabs-list"
      data-orientation={root.orientation}
      className={cn(className)}
      {...rest}
    >
      {children}
    </div>
  );
});

interface TabsTriggerProps
  extends Omit<ComponentPropsWithoutRef<"button">, "id"> {
  /**
   * Logical id of the tab. Matches the `id` of the corresponding
   * `Tabs.Content` and identifies this trigger to keyboard navigation and
   * controlled selection.
   */
  id: string;
  /**
   * Disables this trigger only.
   * @default false
   */
  disabled?: boolean;
}

const Trigger = forwardRef<HTMLButtonElement, TabsTriggerProps>(
  function TabsTrigger(
    {
      id,
      disabled,
      onClick,
      onKeyDown,
      onFocus,
      type,
      className,
      children,
      ...rest
    },
    forwardedRef,
  ) {
    const root = useTabs("Tabs.Trigger");
    const subscribe = useCallback(
      (listener: () => void) => root.subscribe(id, listener),
      [root, id],
    );
    const getSnapshot = useCallback(() => root.isSelected(id), [root, id]);
    const selected = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
    const isDisabled = disabled || root.disabled;

    const setRef = useCallback(
      (node: HTMLButtonElement | null) => {
        root.registerTab(id, node);
        if (typeof forwardedRef === "function") forwardedRef(node);
        else if (forwardedRef) forwardedRef.current = node;
      },
      [forwardedRef, id, root],
    );

    const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
      onClick?.(event);
      if (event.defaultPrevented || isDisabled) return;
      root.setSelected(id);
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
      onKeyDown?.(event);
      if (event.defaultPrevented) return;
      const horizontal = root.orientation === "horizontal";
      const nextKey = horizontal ? "ArrowRight" : "ArrowDown";
      const prevKey = horizontal ? "ArrowLeft" : "ArrowUp";
      switch (event.key) {
        case nextKey:
          event.preventDefault();
          root.focusTab(id, "next");
          break;
        case prevKey:
          event.preventDefault();
          root.focusTab(id, "prev");
          break;
        case "Home":
          event.preventDefault();
          root.focusTab(id, "first");
          break;
        case "End":
          event.preventDefault();
          root.focusTab(id, "last");
          break;
        default:
          break;
      }
    };

    const handleFocus = (event: React.FocusEvent<HTMLButtonElement>) => {
      onFocus?.(event);
      if (event.defaultPrevented || isDisabled) return;
      if (root.activationMode === "automatic" && !root.isSelected(id)) {
        root.setSelected(id);
      }
    };

    const itemCtx = useMemo<TabItemContextValue>(
      () => ({ id, selected, disabled: isDisabled }),
      [id, selected, isDisabled],
    );

    return (
      <TabItemContext.Provider value={itemCtx}>
        <button
          ref={setRef}
          id={triggerDomId(root.scope, id)}
          type={type ?? "button"}
          role="tab"
          aria-selected={selected}
          aria-controls={panelDomId(root.scope, id)}
          tabIndex={selected ? 0 : -1}
          disabled={isDisabled}
          data-slot="tabs-trigger"
          data-state={selected ? "active" : "inactive"}
          data-disabled={isDisabled ? "" : undefined}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          className={cn(
            "inline-flex h-8 min-w-0 items-center justify-center rounded-3xl px-4 text-center text-sm font-medium text-neutral-500 outline-none transition-colors duration-150 ease-out hover:text-neutral-700 focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2 disabled:opacity-40 data-[state=active]:text-neutral-900 motion-reduce:transition-none",
            className,
          )}
          {...rest}
        >
          {children}
        </button>
      </TabItemContext.Provider>
    );
  },
);

type TabsIndicatorProps = Omit<
  HTMLMotionProps<"span">,
  "layoutId" | "children"
>;

const Indicator = forwardRef<HTMLSpanElement, TabsIndicatorProps>(
  function TabsIndicator({ className, transition, ...rest }, ref) {
    const root = useTabs("Tabs.Indicator");
    const item = useTabItem("Tabs.Indicator");
    const reduceMotion = useReducedMotion();
    // Only the selected tab renders an indicator. Motion's shared `layoutId`
    // ties every Indicator in this Root together: when selection moves, the
    // previous one unmounts and the new one mounts under the same layoutId,
    // so motion animates position+size from old to new for a smooth slide.
    if (!item.selected) return null;
    return (
      <motion.span
        ref={ref}
        layoutId={`tabs-indicator-${root.scope}`}
        aria-hidden="true"
        data-slot="tabs-indicator"
        transition={
          reduceMotion
            ? { duration: 0 }
            : (transition ?? {
                type: "spring",
                stiffness: 380,
                damping: 32,
              })
        }
        className={cn(
          "rounded-3xl bg-white shadow-sm ring-1 ring-black/5",
          className,
        )}
        {...rest}
      />
    );
  },
);

type TabsSeparatorProps = ComponentPropsWithoutRef<"span">;

const Separator = forwardRef<HTMLSpanElement, TabsSeparatorProps>(
  function TabsSeparator({ className, ...rest }, ref) {
    return (
      <span
        ref={ref}
        aria-hidden="true"
        data-slot="tabs-separator"
        className={cn("rounded-sm bg-neutral-300/60", className)}
        {...rest}
      />
    );
  },
);

interface TabsContentProps extends Omit<ComponentPropsWithoutRef<"div">, "id"> {
  /**
   * Id of the tab this panel belongs to. Must match a `Tabs.Trigger` id.
   */
  id: string;
  /**
   * Keep the panel mounted in the DOM when its tab is not selected. Useful
   * for preserving form state or for transition libraries.
   * @default false
   */
  forceMount?: boolean;
}

const Content = forwardRef<HTMLDivElement, TabsContentProps>(
  function TabsContent(
    { id, forceMount = false, className, children, ...rest },
    ref,
  ) {
    const root = useTabs("Tabs.Content");
    const subscribe = useCallback(
      (listener: () => void) => root.subscribe(id, listener),
      [root, id],
    );
    const getSnapshot = useCallback(() => root.isSelected(id), [root, id]);
    const selected = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

    if (!(selected || forceMount)) return null;

    return (
      <div
        ref={ref}
        id={panelDomId(root.scope, id)}
        role="tabpanel"
        aria-labelledby={triggerDomId(root.scope, id)}
        hidden={!selected}
        data-slot="tabs-content"
        data-state={selected ? "active" : "inactive"}
        data-orientation={root.orientation}
        className={cn("outline-none", className)}
        {...rest}
      >
        {children}
      </div>
    );
  },
);

type TabsComposition = {
  /**
   * Root of the Tabs. Manages selection and orientation.
   *
   * @example
   *
   * ```tsx
   * <Tabs.Root defaultValue="account" orientation="vertical">
   *   <Tabs.Container>
   *     <Tabs.List aria-label="Settings">
   *       <Tabs.Trigger id="account">
   *         Account
   *         <Tabs.Indicator />
   *       </Tabs.Trigger>
   *     </Tabs.List>
   *   </Tabs.Container>
   *   <Tabs.Content id="account">{ ... }</Tabs.Content>
   * </Tabs.Root>
   * ```
   */
  Root: typeof Root;
  /**
   * Positioning context for the `Tabs.List` and its absolutely-positioned
   * `Tabs.Indicator`. Required when using `Tabs.Indicator`.
   */
  Container: typeof Container;
  /**
   * The `role="tablist"` group of triggers.
   */
  List: typeof List;
  /**
   * A `role="tab"` button that selects the tab whose `id` it carries.
   * Provides context to `Tabs.Indicator` and `Tabs.Separator`.
   */
  Trigger: typeof Trigger;
  /**
   * Sliding selection indicator. Rendered only inside the currently selected
   * `Tabs.Trigger`; motion's shared `layoutId` animates it from the previous
   * trigger's position to the new one.
   */
  Indicator: typeof Indicator;
  /**
   * Decorative divider between adjacent triggers. Fades out on the selected
   * tab so the indicator can take its place.
   */
  Separator: typeof Separator;
  /**
   * Panel whose visibility is tied to the trigger with the same `id`.
   */
  Content: typeof Content;
};

export const Tabs: TabsComposition = {
  Root,
  Container,
  List,
  Trigger,
  Indicator,
  Separator,
  Content,
};

export type {
  Orientation as TabsOrientation,
  TabsContainerProps,
  TabsContentProps,
  TabsIndicatorProps,
  TabsListProps,
  TabsRootProps,
  TabsSeparatorProps,
  TabsTriggerProps,
};
