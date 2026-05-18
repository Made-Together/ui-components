"use client";

import { useReducedMotion } from "motion/react";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import {
  createContext,
  forwardRef,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { cn } from "../../lib/utils.js";

interface TypeAheadContextValue {
  typingSpeed: number;
  deletionSpeed: number;
  pauseDuration: number;
  startDelay: number;
  showCursor: boolean;
  cursorCharacter: string;
  loop: boolean;
}

const DEFAULTS: TypeAheadContextValue = {
  typingSpeed: 24,
  deletionSpeed: 36,
  pauseDuration: 1500,
  startDelay: 0,
  showCursor: true,
  cursorCharacter: "|",
  loop: true,
};

const TypeAheadContext = createContext<TypeAheadContextValue>(DEFAULTS);

interface TypeAheadRootProps extends ComponentPropsWithoutRef<"span"> {
  /**
   * Default typing speed in characters per second for descendant
   * `<TypeAhead.Animated>` parts. Individual parts may override.
   * @default 24
   */
  typingSpeed?: number;
  /**
   * Default deletion speed in characters per second.
   * @default 36
   */
  deletionSpeed?: number;
  /**
   * Default pause (ms) between finishing a string and starting to delete it.
   * @default 1500
   */
  pauseDuration?: number;
  /**
   * Default delay (ms) before any animation begins. Applied per part.
   * @default 0
   */
  startDelay?: number;
  /**
   * Whether animated parts render a blinking caret by default.
   * @default true
   */
  showCursor?: boolean;
  /**
   * Character used for the blinking caret.
   * @default "|"
   */
  cursorCharacter?: string;
  /**
   * Whether animated parts cycle their strings indefinitely by default.
   * @default true
   */
  loop?: boolean;
}

const Root = forwardRef<HTMLSpanElement, TypeAheadRootProps>(
  function TypeAheadRoot(
    {
      typingSpeed,
      deletionSpeed,
      pauseDuration,
      startDelay,
      showCursor,
      cursorCharacter,
      loop,
      className,
      children,
      ...rest
    },
    ref,
  ) {
    const ctx = useMemo<TypeAheadContextValue>(
      () => ({
        typingSpeed: typingSpeed ?? DEFAULTS.typingSpeed,
        deletionSpeed: deletionSpeed ?? DEFAULTS.deletionSpeed,
        pauseDuration: pauseDuration ?? DEFAULTS.pauseDuration,
        startDelay: startDelay ?? DEFAULTS.startDelay,
        showCursor: showCursor ?? DEFAULTS.showCursor,
        cursorCharacter: cursorCharacter ?? DEFAULTS.cursorCharacter,
        loop: loop ?? DEFAULTS.loop,
      }),
      [
        typingSpeed,
        deletionSpeed,
        pauseDuration,
        startDelay,
        showCursor,
        cursorCharacter,
        loop,
      ],
    );

    return (
      <TypeAheadContext.Provider value={ctx}>
        <style>{TYPE_AHEAD_BEHAVIORAL_CSS}</style>
        <span
          ref={ref}
          data-slot="type-ahead-root"
          className={cn(className)}
          {...rest}
        >
          {children}
        </span>
      </TypeAheadContext.Provider>
    );
  },
);

const TYPE_AHEAD_BEHAVIORAL_CSS = `
[data-slot="type-ahead-root"],
[data-slot="type-ahead-static"],
[data-slot="type-ahead-animated"] {
  display: inline;
  white-space: pre-wrap;
}
[data-slot="type-ahead-cursor"] {
  display: inline-block;
  animation: type-ahead-blink 1s steps(2, start) infinite;
}
@keyframes type-ahead-blink {
  to { visibility: hidden; }
}
@media (prefers-reduced-motion: reduce) {
  [data-slot="type-ahead-cursor"] {
    animation: none;
  }
}
`;

type TypeAheadStaticProps = ComponentPropsWithoutRef<"span">;

const Static = forwardRef<HTMLSpanElement, TypeAheadStaticProps>(
  function TypeAheadStatic({ className, children, ...rest }, ref) {
    return (
      <span
        ref={ref}
        data-slot="type-ahead-static"
        className={cn(className)}
        {...rest}
      >
        {children}
      </span>
    );
  },
);

interface TypeAheadAnimatedProps
  extends Omit<ComponentPropsWithoutRef<"span">, "children"> {
  /**
   * String, or list of strings to cycle through. When an array is provided
   * each entry is typed, paused, deleted, then the next entry is typed.
   */
  texts: string | string[];
  /**
   * Characters per second while typing. Overrides the value from
   * `<TypeAhead.Root>`.
   */
  typingSpeed?: number;
  /**
   * Characters per second while deleting. Overrides the value from
   * `<TypeAhead.Root>`.
   */
  deletionSpeed?: number;
  /**
   * Milliseconds to wait after a string is fully typed before deletion
   * begins. Only meaningful when there is more than one string or when
   * `loop` is `true`.
   */
  pauseDuration?: number;
  /**
   * Milliseconds to wait before the very first character is typed.
   */
  startDelay?: number;
  /**
   * Whether to render a blinking caret while the animation runs.
   */
  showCursor?: boolean;
  /**
   * Character used for the blinking caret when `showCursor` is `true`.
   */
  cursorCharacter?: string;
  /**
   * Whether to keep cycling once the last string is reached. When `false`
   * the animation halts on the final string and the caret stops blinking.
   * Defaults to `true` when `texts` is an array, `false` for a single
   * string (unless a value is provided).
   */
  loop?: boolean;
  /**
   * Render-prop for fully custom output. Receives the currently displayed
   * substring plus the current phase. Children passed via this prop bypass
   * the default cursor rendering — opt into a custom layout entirely.
   */
  render?: (state: {
    text: string;
    fullText: string;
    index: number;
    phase: TypeAheadPhase;
    done: boolean;
  }) => ReactNode;
  /**
   * Fired whenever a string is fully typed.
   */
  onType?: (text: string, index: number) => void;
  /**
   * Fired whenever a string is fully deleted, just before the next one
   * starts typing.
   */
  onDelete?: (text: string, index: number) => void;
  /**
   * Fired when the animation reaches its terminal state. Only invoked when
   * `loop` resolves to `false`.
   */
  onComplete?: () => void;
}

type TypeAheadPhase = "idle" | "typing" | "pausing" | "deleting" | "done";

const Animated = forwardRef<HTMLSpanElement, TypeAheadAnimatedProps>(
  function TypeAheadAnimated(props, ref) {
    const {
      texts,
      typingSpeed: typingSpeedProp,
      deletionSpeed: deletionSpeedProp,
      pauseDuration: pauseDurationProp,
      startDelay: startDelayProp,
      showCursor: showCursorProp,
      cursorCharacter: cursorCharacterProp,
      loop: loopProp,
      render,
      onType,
      onDelete,
      onComplete,
      className,
      ...rest
    } = props;

    const root = useContext(TypeAheadContext);
    const reducedMotion = useReducedMotion();

    const list = useMemo(
      () =>
        (Array.isArray(texts) ? texts : [texts]).filter((t) => t.length > 0),
      [texts],
    );

    const typingSpeed = typingSpeedProp ?? root.typingSpeed;
    const deletionSpeed = deletionSpeedProp ?? root.deletionSpeed;
    const pauseDuration = pauseDurationProp ?? root.pauseDuration;
    const startDelay = startDelayProp ?? root.startDelay;
    const showCursor = showCursorProp ?? root.showCursor;
    const cursorCharacter = cursorCharacterProp ?? root.cursorCharacter;
    const loop = loopProp ?? (list.length > 1 ? root.loop : false);

    const [index, setIndex] = useState(0);
    const [text, setText] = useState("");
    const [phase, setPhase] = useState<TypeAheadPhase>("idle");

    const callbacksRef = useRef({ onType, onDelete, onComplete });
    useEffect(() => {
      callbacksRef.current = { onType, onDelete, onComplete };
    }, [onType, onDelete, onComplete]);

    const fullText = list[index] ?? "";

    useEffect(() => {
      if (list.length === 0) return;
      if (reducedMotion) {
        setIndex(list.length - 1);
        setText(list[list.length - 1] ?? "");
        setPhase("done");
        callbacksRef.current.onComplete?.();
        return;
      }

      const current = list[index] ?? "";

      if (phase === "done") return;

      if (phase === "idle") {
        const t = window.setTimeout(() => setPhase("typing"), startDelay);
        return () => clearTimeout(t);
      }

      if (phase === "typing") {
        if (text === current) {
          callbacksRef.current.onType?.(current, index);
          if (list.length === 1 && !loop) {
            setPhase("done");
            callbacksRef.current.onComplete?.();
            return;
          }
          const t = window.setTimeout(() => setPhase("pausing"), 0);
          return () => clearTimeout(t);
        }
        const t = window.setTimeout(
          () => setText(current.slice(0, text.length + 1)),
          1000 / typingSpeed,
        );
        return () => clearTimeout(t);
      }

      if (phase === "pausing") {
        const t = window.setTimeout(() => setPhase("deleting"), pauseDuration);
        return () => clearTimeout(t);
      }

      if (phase === "deleting") {
        if (text === "") {
          callbacksRef.current.onDelete?.(current, index);
          const nextIndex = index + 1;
          if (nextIndex >= list.length) {
            if (!loop) {
              setPhase("done");
              callbacksRef.current.onComplete?.();
              return;
            }
            setIndex(0);
          } else {
            setIndex(nextIndex);
          }
          setPhase("typing");
          return;
        }
        const t = window.setTimeout(
          () => setText(text.slice(0, -1)),
          1000 / deletionSpeed,
        );
        return () => clearTimeout(t);
      }
    }, [
      phase,
      text,
      index,
      list,
      loop,
      typingSpeed,
      deletionSpeed,
      pauseDuration,
      startDelay,
      reducedMotion,
    ]);

    const done = phase === "done";

    if (render) {
      return (
        <span
          ref={ref}
          data-slot="type-ahead-animated"
          data-phase={phase}
          className={cn(className)}
          {...rest}
        >
          {render({ text, fullText, index, phase, done })}
        </span>
      );
    }

    const showCaret = showCursor && !(done && !loop);

    return (
      <span
        ref={ref}
        data-slot="type-ahead-animated"
        data-phase={phase}
        className={cn(className)}
        {...rest}
      >
        <span data-slot="type-ahead-animated-text">{text}</span>
        {showCaret ? (
          <span aria-hidden="true" data-slot="type-ahead-cursor">
            {cursorCharacter}
          </span>
        ) : null}
      </span>
    );
  },
);

type TypeAheadComposition = {
  /**
   * Root component. Renders a `<span>` (safe to nest inside a `<p>`) and
   * provides default animation settings to descendant `<TypeAhead.Animated>`
   * parts via context.
   *
   * @example
   *
   * ```tsx
   * <p>
   *   <TypeAhead.Root typingSpeed={28}>
   *     <TypeAhead.Static>I love </TypeAhead.Static>
   *     <TypeAhead.Animated texts={["React", "Vue", "Svelte"]} />
   *     <TypeAhead.Static> for building UIs.</TypeAhead.Static>
   *   </TypeAhead.Root>
   * </p>
   * ```
   */
  Root: typeof Root;
  /**
   * Inert text that does not animate. Use to interleave plain copy with
   * animated segments while keeping everything inside a single `<p>`.
   */
  Static: typeof Static;
  /**
   * Animated text that types itself character-by-character. Accepts a
   * single string or an array; arrays cycle by typing, pausing, deleting,
   * then advancing to the next entry. All speed and cursor controls can be
   * overridden per-instance.
   */
  Animated: typeof Animated;
};

export const TypeAhead: TypeAheadComposition = {
  Root,
  Static,
  Animated,
};

export type {
  TypeAheadAnimatedProps,
  TypeAheadPhase,
  TypeAheadRootProps,
  TypeAheadStaticProps,
};
