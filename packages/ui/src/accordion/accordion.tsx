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
  useId,
  useMemo,
  useRef,
  useState,
} from "react";

import { cn } from "../../lib/utils.js";

type AccordionType = "single" | "multiple";

type SingleValue = string | null;
type MultipleValue = string[];

interface AccordionContextValue {
  type: AccordionType;
  value: MultipleValue;
  collapsible: boolean;
  disabled: boolean;
  toggle: (itemValue: string) => void;
  isOpen: (itemValue: string) => boolean;
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

    const normalize = useCallback(
      (raw: SingleValue | MultipleValue | undefined): MultipleValue => {
        if (raw === undefined || raw === null) return [];
        return Array.isArray(raw) ? raw : [raw];
      },
      [],
    );

    const [internalValue, setInternalValue] = useState<MultipleValue>(() =>
      normalize(defaultValue),
    );

    const value = isControlled ? normalize(controlledValue) : internalValue;

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

    const commit = useCallback(
      (next: MultipleValue) => {
        if (!isControlled) setInternalValue(next);
        if (isMultiple) {
          (onValueChange as ((v: MultipleValue) => void) | undefined)?.(next);
        } else {
          (onValueChange as ((v: SingleValue) => void) | undefined)?.(
            next[0] ?? null,
          );
        }
      },
      [isControlled, isMultiple, onValueChange],
    );

    const toggle = useCallback(
      (itemValue: string) => {
        const isOpen = value.includes(itemValue);
        if (isMultiple) {
          commit(
            isOpen
              ? value.filter((v) => v !== itemValue)
              : [...value, itemValue],
          );
          return;
        }
        if (isOpen) {
          if (collapsible) commit([]);
          return;
        }
        commit([itemValue]);
      },
      [collapsible, commit, isMultiple, value],
    );

    const isOpen = useCallback(
      (itemValue: string) => value.includes(itemValue),
      [value],
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
        value,
        collapsible,
        disabled,
        toggle,
        isOpen,
        registerTrigger,
        focusTrigger,
      }),
      [
        type,
        value,
        collapsible,
        disabled,
        toggle,
        isOpen,
        registerTrigger,
        focusTrigger,
      ],
    );

    return (
      <AccordionContext.Provider value={ctx}>
        <ul
          ref={ref}
          data-slot="accordion-root"
          data-orientation="vertical"
          className={cn("list-none", className)}
          {...rest}
        >
          {children}
        </ul>
      </AccordionContext.Provider>
    );
  },
);

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
    const open = root.isOpen(value);
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
          className={cn("list-none", className)}
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
        className={cn("m-0", className)}
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
        className={className}
        {...rest}
      >
        {children}
      </button>
    );
  },
);

interface AccordionContentProps extends ComponentPropsWithoutRef<"section"> {
  /**
   * Keeps the content mounted in the DOM when collapsed. The element is still
   * hidden from assistive tech and not focusable, but rendered for animations
   * or to preserve state.
   * @default false
   */
  forceMount?: boolean;
}

const Content = forwardRef<HTMLDivElement, AccordionContentProps>(
  function AccordionContent(
    { forceMount = false, className, children, ...rest },
    ref,
  ) {
    const item = useAccordionItem("Accordion.Content");
    if (!(item.open || forceMount)) return null;
    return (
      <div
        ref={ref}
        id={item.contentId}
        hidden={!item.open}
        data-slot="accordion-content"
        data-state={item.open ? "open" : "closed"}
        className={className}
        {...rest}
      >
        {children}
      </div>
    );
  },
);

interface AccordionIndicatorProps extends ComponentPropsWithoutRef<"span"> {
  children?: ReactNode;
}

const Indicator = forwardRef<HTMLSpanElement, AccordionIndicatorProps>(
  function AccordionIndicator({ className, children, ...rest }, ref) {
    const item = useAccordionItem("Accordion.Indicator");
    return (
      <span
        ref={ref}
        aria-hidden="true"
        data-slot="accordion-indicator"
        data-state={item.open ? "open" : "closed"}
        className={cn("inline-flex shrink-0", className)}
        {...rest}
      >
        {children}
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
   * Decorative indicator (e.g. chevron) rendered inside the trigger. Mirrors
   * `data-state` from the item so it can be animated via CSS.
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
