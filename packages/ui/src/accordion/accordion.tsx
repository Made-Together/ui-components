"use client";

import type {
  ComponentPropsWithoutRef,
  KeyboardEvent,
  MouseEvent,
  ReactNode,
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

const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

import { cn } from "../../lib/utils.js";

type AccordionType = "single" | "multiple";

type SingleValue = string | null;
type MultipleValue = string[];

interface AccordionContextValue {
  type: AccordionType;
  collapsible: boolean;
  disabled: boolean;
  toggle: (itemValue: string) => void;
  isOpen: (itemValue: string) => boolean;
  subscribe: (itemValue: string, listener: () => void) => () => void;
  registerTrigger: (itemValue: string, node: HTMLButtonElement | null) => void;
  focusTrigger: (
    fromValue: string,
    direction: "next" | "prev" | "first" | "last",
  ) => void;
}

const AccordionContext = createContext<AccordionContextValue | null>(null);

function useAccordion(component: string): AccordionContextValue {
  const ctx = useContext(AccordionContext);
  if (!ctx) {
    throw new Error(`${component} must be rendered inside <Accordion.Root>.`);
  }
  return ctx;
}

interface AccordionItemContextValue {
  value: string;
  open: boolean;
  disabled: boolean;
  triggerId: string;
  contentId: string;
}

const AccordionItemContext = createContext<AccordionItemContextValue | null>(
  null,
);

function useAccordionItem(component: string): AccordionItemContextValue {
  const ctx = useContext(AccordionItemContext);
  if (!ctx) {
    throw new Error(`${component} must be rendered inside <Accordion.Item>.`);
  }
  return ctx;
}

type AccordionSingleRootProps = {
  type?: "single";
  value?: SingleValue;
  defaultValue?: SingleValue;
  onValueChange?: (value: SingleValue) => void;
  /**
   * When `type` is `"single"`, allows closing the currently open item.
   * @default true
   */
  collapsible?: boolean;
};

type AccordionMultipleRootProps = {
  type: "multiple";
  value?: MultipleValue;
  defaultValue?: MultipleValue;
  onValueChange?: (value: MultipleValue) => void;
  collapsible?: never;
};

type AccordionRootProps = Omit<ComponentPropsWithoutRef<"ul">, "onChange"> & {
  /**
   * Disables all items inside the accordion.
   * @default false
   */
  disabled?: boolean;
} & (AccordionSingleRootProps | AccordionMultipleRootProps);

const Root = forwardRef<HTMLUListElement, AccordionRootProps>(
  function AccordionRoot(props, ref) {
    const {
      type = "single",
      value: controlledValue,
      defaultValue,
      onValueChange,
      collapsible = true,
      disabled = false,
      className,
      children,
      ...rest
    } = props as AccordionRootProps & {
      value?: SingleValue | MultipleValue;
      defaultValue?: SingleValue | MultipleValue;
      onValueChange?: (value: SingleValue | MultipleValue) => void;
    };

    const isMultiple = type === "multiple";
    const isControlled = controlledValue !== undefined;

    const normalize = (
      raw: SingleValue | MultipleValue | undefined,
    ): MultipleValue => {
      if (raw === undefined || raw === null) return [];
      return Array.isArray(raw) ? raw : [raw];
    };

    // Open state lives in a ref + per-key listener map, so toggling does NOT
    // re-render Root. Each Item subscribes only to its own key via
    // useSyncExternalStore, so siblings don't re-render either.
    const valueRef = useRef<MultipleValue>(
      normalize(isControlled ? controlledValue : defaultValue),
    );
    const listenersRef = useRef(new Map<string, Set<() => void>>());

    const subscribe = useCallback((itemValue: string, listener: () => void) => {
      let set = listenersRef.current.get(itemValue);
      if (!set) {
        set = new Set();
        listenersRef.current.set(itemValue, set);
      }
      set.add(listener);
      return () => {
        set?.delete(listener);
        if (set && set.size === 0) {
          listenersRef.current.delete(itemValue);
        }
      };
    }, []);

    const isOpen = useCallback(
      (itemValue: string) => valueRef.current.includes(itemValue),
      [],
    );

    const applyValue = useCallback((next: MultipleValue) => {
      const prev = valueRef.current;
      if (prev.length === next.length && prev.every((v, i) => v === next[i])) {
        return;
      }
      const affected = new Set<string>();
      for (const v of prev) {
        if (!next.includes(v)) affected.add(v);
      }
      for (const v of next) {
        if (!prev.includes(v)) affected.add(v);
      }
      valueRef.current = next;
      for (const key of affected) {
        const set = listenersRef.current.get(key);
        if (!set) continue;
        for (const listener of set) listener();
      }
    }, []);

    // Keep latest onValueChange reachable without bumping `toggle`'s identity.
    const onValueChangeRef = useRef(onValueChange);
    useIsoLayoutEffect(() => {
      onValueChangeRef.current = onValueChange;
    }, [onValueChange]);

    const emitChange = useCallback(
      (next: MultipleValue) => {
        const cb = onValueChangeRef.current;
        if (!cb) return;
        if (isMultiple) {
          (cb as (v: MultipleValue) => void)(next);
        } else {
          (cb as (v: SingleValue) => void)(next[0] ?? null);
        }
      },
      [isMultiple],
    );

    const toggle = useCallback(
      (itemValue: string) => {
        const cur = valueRef.current;
        const open = cur.includes(itemValue);
        let next: MultipleValue;
        if (isMultiple) {
          next = open
            ? cur.filter((v) => v !== itemValue)
            : [...cur, itemValue];
        } else if (open) {
          if (!collapsible) return;
          next = [];
        } else {
          next = [itemValue];
        }
        // Controlled: don't mutate the ref ourselves — defer to the consumer,
        // who will pass a new `value` prop and the sync effect below will
        // commit + notify listeners.
        if (isControlled) {
          emitChange(next);
          return;
        }
        applyValue(next);
        emitChange(next);
      },
      [applyValue, collapsible, emitChange, isControlled, isMultiple],
    );

    // Sync controlled `value` into the ref and notify affected items.
    useIsoLayoutEffect(() => {
      if (!isControlled) return;
      applyValue(normalize(controlledValue));
    }, [controlledValue, isControlled, applyValue]);

    const triggersRef = useRef(new Map<string, HTMLButtonElement>());
    const orderRef = useRef<string[]>([]);

    const registerTrigger = useCallback(
      (itemValue: string, node: HTMLButtonElement | null) => {
        const map = triggersRef.current;
        if (node) {
          map.set(itemValue, node);
          if (!orderRef.current.includes(itemValue)) {
            orderRef.current.push(itemValue);
          }
        } else {
          map.delete(itemValue);
          orderRef.current = orderRef.current.filter((v) => v !== itemValue);
        }
      },
      [],
    );

    const focusTrigger = useCallback(
      (fromValue: string, direction: "next" | "prev" | "first" | "last") => {
        const map = triggersRef.current;
        const ordered = orderRef.current
          .map((v) => ({ v, node: map.get(v) }))
          .filter(
            (entry): entry is { v: string; node: HTMLButtonElement } =>
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
        const idx = ordered.findIndex((entry) => entry.v === fromValue);
        if (idx === -1) return;
        const delta = direction === "next" ? 1 : -1;
        const nextIdx = (idx + delta + ordered.length) % ordered.length;
        ordered[nextIdx]?.node.focus();
      },
      [],
    );

    const ctx = useMemo<AccordionContextValue>(
      () => ({
        type,
        collapsible,
        disabled,
        toggle,
        isOpen,
        subscribe,
        registerTrigger,
        focusTrigger,
      }),
      [
        type,
        collapsible,
        disabled,
        toggle,
        isOpen,
        subscribe,
        registerTrigger,
        focusTrigger,
      ],
    );

    return (
      <AccordionContext.Provider value={ctx}>
        <style>{ACCORDION_BEHAVIORAL_CSS}</style>
        <ul
          ref={ref}
          data-slot="accordion-root"
          data-orientation="vertical"
          className={cn(className)}
          {...rest}
        >
          {children}
        </ul>
      </AccordionContext.Provider>
    );
  },
);

const ACCORDION_BEHAVIORAL_CSS = `
[data-slot="accordion-root"] {
  list-style: none;
  margin: 0;
  padding: 0;
}
[data-slot="accordion-item"] {
  list-style: none;
}
[data-slot="accordion-heading"] {
  margin: 0;
}
[data-slot="accordion-trigger"] {
  cursor: pointer;
  transition: color 150ms ease-out, background-color 150ms ease-out;
}
[data-slot="accordion-trigger"]:disabled {
  cursor: not-allowed;
}
[data-slot="accordion-content"] {
  display: grid;
  grid-template-rows: 0fr;
  opacity: 0;
  transition: grid-template-rows 300ms ease-out, opacity 300ms ease-out;
}
[data-slot="accordion-content"][data-state="open"] {
  grid-template-rows: 1fr;
  opacity: 1;
}
[data-slot="accordion-content"] > [data-slot="accordion-content-inner"] {
  min-height: 0;
  overflow: hidden;
}
[data-slot="accordion-indicator"] {
  display: inline-flex;
  flex-shrink: 0;
  transition:
    transform 200ms ease-out,
    rotate 200ms ease-out,
    scale 200ms ease-out,
    translate 200ms ease-out;
}
@media (prefers-reduced-motion: reduce) {
  [data-slot="accordion-trigger"],
  [data-slot="accordion-content"],
  [data-slot="accordion-indicator"] {
    transition: none;
  }
}
`;

interface AccordionItemProps extends ComponentPropsWithoutRef<"li"> {
  /**
   * Unique identifier for the item. Used to track open state.
   */
  value: string;
  /**
   * Disables interaction with this item.
   * @default false
   */
  disabled?: boolean;
}

const Item = forwardRef<HTMLLIElement, AccordionItemProps>(
  function AccordionItem(
    { value, disabled = false, className, children, ...rest },
    ref,
  ) {
    const root = useAccordion("Accordion.Item");
    const reactId = useId();
    const subscribe = useCallback(
      (listener: () => void) => root.subscribe(value, listener),
      [root, value],
    );
    const getSnapshot = useCallback(() => root.isOpen(value), [root, value]);
    const open = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
    const isDisabled = disabled || root.disabled;

    const ctx = useMemo<AccordionItemContextValue>(
      () => ({
        value,
        open,
        disabled: isDisabled,
        triggerId: `accordion-trigger-${reactId}`,
        contentId: `accordion-content-${reactId}`,
      }),
      [value, open, isDisabled, reactId],
    );

    return (
      <AccordionItemContext.Provider value={ctx}>
        <li
          ref={ref}
          data-slot="accordion-item"
          data-state={open ? "open" : "closed"}
          data-disabled={isDisabled ? "" : undefined}
          className={cn(className)}
          {...rest}
        >
          {children}
        </li>
      </AccordionItemContext.Provider>
    );
  },
);

interface AccordionHeadingProps extends ComponentPropsWithoutRef<"h3"> {
  /**
   * Heading level rendered for the accordion header. Per the WAI-ARIA
   * accordion pattern, each trigger must be wrapped in a heading at the level
   * appropriate for the surrounding document outline.
   * @default 3
   */
  level?: 1 | 2 | 3 | 4 | 5 | 6;
}

const Heading = forwardRef<HTMLHeadingElement, AccordionHeadingProps>(
  function AccordionHeading({ level = 3, className, children, ...rest }, ref) {
    const item = useAccordionItem("Accordion.Heading");
    const Tag = `h${level}` as "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
    return (
      <Tag
        ref={ref}
        data-slot="accordion-heading"
        data-state={item.open ? "open" : "closed"}
        className={cn(className)}
        {...rest}
      >
        {children}
      </Tag>
    );
  },
);

type AccordionTriggerProps = ComponentPropsWithoutRef<"button">;

const Trigger = forwardRef<HTMLButtonElement, AccordionTriggerProps>(
  function AccordionTrigger(
    { onClick, onKeyDown, type, disabled, className, children, ...rest },
    forwardedRef,
  ) {
    const root = useAccordion("Accordion.Trigger");
    const item = useAccordionItem("Accordion.Trigger");
    const isDisabled = disabled || item.disabled;

    const setRef = useCallback(
      (node: HTMLButtonElement | null) => {
        root.registerTrigger(item.value, node);
        if (typeof forwardedRef === "function") forwardedRef(node);
        else if (forwardedRef) forwardedRef.current = node;
      },
      [forwardedRef, item.value, root],
    );

    const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
      onClick?.(event);
      if (event.defaultPrevented || isDisabled) return;
      root.toggle(item.value);
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
      onKeyDown?.(event);
      if (event.defaultPrevented) return;
      switch (event.key) {
        case "ArrowDown":
          event.preventDefault();
          root.focusTrigger(item.value, "next");
          break;
        case "ArrowUp":
          event.preventDefault();
          root.focusTrigger(item.value, "prev");
          break;
        case "Home":
          event.preventDefault();
          root.focusTrigger(item.value, "first");
          break;
        case "End":
          event.preventDefault();
          root.focusTrigger(item.value, "last");
          break;
        default:
          break;
      }
    };

    return (
      <button
        ref={setRef}
        id={item.triggerId}
        type={type ?? "button"}
        aria-expanded={item.open}
        aria-controls={item.contentId}
        disabled={isDisabled}
        data-slot="accordion-trigger"
        data-state={item.open ? "open" : "closed"}
        data-disabled={isDisabled ? "" : undefined}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        className={cn(className)}
        {...rest}
      >
        {children}
      </button>
    );
  },
);

type AccordionContentProps = ComponentPropsWithoutRef<"div">;

const Content = forwardRef<HTMLDivElement, AccordionContentProps>(
  function AccordionContent({ className, children, ...rest }, ref) {
    const item = useAccordionItem("Accordion.Content");
    return (
      <section
        id={item.contentId}
        aria-labelledby={item.triggerId}
        inert={!item.open}
        data-slot="accordion-content"
        data-state={item.open ? "open" : "closed"}
      >
        <div
          ref={ref}
          data-slot="accordion-content-inner"
          className={cn(className)}
          {...rest}
        >
          {children}
        </div>
      </section>
    );
  },
);

interface AccordionIndicatorProps
  extends Omit<ComponentPropsWithoutRef<"span">, "children"> {
  /**
   * Indicator content. Pass a ReactNode for a static icon (typically paired
   * with a `data-[state=open]:…` className for the open transform), or a
   * function `({ open }) => ReactNode` to render different content per state
   * — useful for plus/minus pairs.
   */
  children?: ReactNode | ((state: { open: boolean }) => ReactNode);
}

const Indicator = forwardRef<HTMLSpanElement, AccordionIndicatorProps>(
  function AccordionIndicator({ className, children, ...rest }, ref) {
    const item = useAccordionItem("Accordion.Indicator");
    const resolved =
      typeof children === "function" ? children({ open: item.open }) : children;
    return (
      <span
        ref={ref}
        aria-hidden="true"
        data-slot="accordion-indicator"
        data-state={item.open ? "open" : "closed"}
        className={cn(className)}
        {...rest}
      >
        {resolved}
      </span>
    );
  },
);

type AccordionComposition = {
  /**
   * Root component for the Accordion. Renders a `<ul>` and manages open state
   * for either a single item (`type="single"`) or many (`type="multiple"`).
   *
   * @example
   *
   * ```tsx
   * <Accordion.Root type="single" defaultValue="item-1" collapsible>
   *   <Accordion.Item value="item-1">
   *     <Accordion.Heading>
   *       <Accordion.Trigger>
   *         Title
   *         <Accordion.Indicator>
   *           <ChevronDown />
   *         </Accordion.Indicator>
   *       </Accordion.Trigger>
   *     </Accordion.Heading>
   *     <Accordion.Content>Content</Accordion.Content>
   *   </Accordion.Item>
   * </Accordion.Root>
   * ```
   */
  Root: typeof Root;
  /**
   * Wraps a single accordion entry. Renders a `<li>` and provides item context
   * (open state, ids) to its descendants.
   */
  Item: typeof Item;
  /**
   * Renders the heading wrapping the trigger. Defaults to `<h3>`; pass `level`
   * to choose the appropriate heading level for the surrounding outline.
   */
  Heading: typeof Heading;
  /**
   * The interactive `<button>` that toggles the item. Handles
   * `aria-expanded` / `aria-controls` wiring and Arrow/Home/End keyboard
   * navigation between triggers.
   */
  Trigger: typeof Trigger;
  /**
   * The expandable panel associated with an item. Renders as a `region`
   * labelled by the trigger and is unmounted by default when closed.
   */
  Content: typeof Content;
  /**
   * Decorative indicator (e.g. chevron, plus/minus) rendered inside the
   * trigger. Mirrors `data-state` from the item so it can be animated via
   * CSS — e.g. rotate a chevron with
   * `className="data-[state=open]:-rotate-180"`. For per-state content swaps
   * (plus → minus, custom icons), pass a function as children:
   * `{({ open }) => (open ? <Minus /> : <Plus />)}`. No rotation is applied
   * by default — every visual decision lives with the consumer.
   */
  Indicator: typeof Indicator;
};

export const Accordion: AccordionComposition = {
  Root,
  Item,
  Heading,
  Trigger,
  Content,
  Indicator,
};

export type {
  AccordionContentProps,
  AccordionHeadingProps,
  AccordionIndicatorProps,
  AccordionItemProps,
  AccordionRootProps,
  AccordionTriggerProps,
  AccordionType,
};
