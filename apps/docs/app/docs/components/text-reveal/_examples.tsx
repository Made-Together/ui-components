"use client";

import { TextReveal } from "@repo/ui/text-reveal";
import { useTransform } from "motion/react";
import { useShowcaseScrollContainer } from "../../../components/component-showcase";

// Total scroll track inside the showcase's 600px preview viewport. Three
// times the viewport gives a comfortable reveal distance without forcing the
// reader through a huge scrub.
const TRACK_CLASS = "relative h-[1800px]";
// Fills the preview viewport so the text locks centered while scrolling.
const STICKY_CLASS =
  "sticky top-0 flex h-[600px] items-center justify-center px-6";

export function BasicTextRevealExample() {
  const container = useShowcaseScrollContainer();
  return (
    <TextReveal.Root
      container={container ?? undefined}
      offset={["start start", "end end"]}
      className={TRACK_CLASS}
    >
      <div className={STICKY_CLASS}>
        <TextReveal.Text className="max-w-3xl text-balance text-center text-3xl font-medium leading-snug text-foreground sm:text-4xl md:text-5xl">
          Headless components, beautiful animations, and zero opinions on how
          your product should look.
        </TextReveal.Text>
      </div>
    </TextReveal.Root>
  );
}

export function OnceTextRevealExample() {
  const container = useShowcaseScrollContainer();
  return (
    <TextReveal.Root
      once
      container={container ?? undefined}
      offset={["start start", "end end"]}
      className={TRACK_CLASS}
    >
      <div className={STICKY_CLASS}>
        <TextReveal.Text className="max-w-3xl text-balance text-center text-3xl font-medium leading-snug text-foreground sm:text-4xl md:text-5xl">
          This reveal runs exactly once. Scroll back up and the words stay put
          — perfect for hero sections that should never re-animate.
        </TextReveal.Text>
      </div>
    </TextReveal.Root>
  );
}

export function CustomTransformTextRevealExample() {
  const container = useShowcaseScrollContainer();
  return (
    <TextReveal.Root
      container={container ?? undefined}
      offset={["start start", "end end"]}
      className={TRACK_CLASS}
    >
      <div className={STICKY_CLASS}>
        <TextReveal.Text
          className="max-w-3xl text-balance text-center text-3xl font-medium leading-snug text-foreground sm:text-4xl md:text-5xl"
          transform={(p) => ({
            // biome-ignore lint/correctness/useHookAtTopLevel: invoked inside TextReveal.Word's render
            opacity: useTransform(p, [0, 0.5], [0, 1]),
            // biome-ignore lint/correctness/useHookAtTopLevel: invoked inside TextReveal.Word's render
            y: useTransform(p, [0, 1], [24, 0]),
            // biome-ignore lint/correctness/useHookAtTopLevel: invoked inside TextReveal.Word's render
            filter: useTransform(p, [0, 1], ["blur(10px)", "blur(0px)"]),
          })}
        >
          Translate, blur, fade — the transform prop is just a function of the
          per-word scroll progress.
        </TextReveal.Text>
      </div>
    </TextReveal.Root>
  );
}

export function ColorTransformTextRevealExample() {
  const container = useShowcaseScrollContainer();
  return (
    <TextReveal.Root
      container={container ?? undefined}
      offset={["start start", "end end"]}
      className={TRACK_CLASS}
    >
      <div className={STICKY_CLASS}>
        <TextReveal.Text
          className="max-w-3xl text-balance text-center text-3xl font-medium leading-snug sm:text-4xl md:text-5xl"
          transform={(p) => ({
            // biome-ignore lint/correctness/useHookAtTopLevel: invoked inside TextReveal.Word's render
            color: useTransform(
              p,
              [0, 1],
              ["rgb(156 163 175 / 0.35)", "rgb(23 23 23)"],
            ),
          })}
          wordClassName="dark:[--reveal-end:theme(colors.neutral.50)]"
        >
          Drive color, not opacity. Each word smoothly inks in as it crosses
          its slice of the page scroll.
        </TextReveal.Text>
      </div>
    </TextReveal.Root>
  );
}

export function ComposedWordTextRevealExample() {
  const container = useShowcaseScrollContainer();
  const words = ["Composition", "over", "configuration", "—", "always."];
  return (
    <TextReveal.Root
      container={container ?? undefined}
      offset={["start start", "end end"]}
      className={TRACK_CLASS}
    >
      <div className={STICKY_CLASS}>
        <p className="flex max-w-3xl flex-wrap justify-center gap-x-3 gap-y-2 text-balance text-center text-3xl font-medium leading-snug text-foreground sm:text-4xl md:text-5xl">
          {words.map((word, i) => (
            <TextReveal.Word
              key={word}
              index={i}
              total={words.length}
              transform={(p) => ({
                // biome-ignore lint/correctness/useHookAtTopLevel: invoked inside TextReveal.Word's render
                opacity: useTransform(p, [0, 0.6], [0.1, 1]),
                // biome-ignore lint/correctness/useHookAtTopLevel: invoked inside TextReveal.Word's render
                y: useTransform(p, [0, 1], [16, 0]),
              })}
              className="data-[state=revealed]:text-foreground"
            >
              {i === words.length - 1 ? (
                <span className="rounded-md bg-foreground/10 px-2 py-0.5 font-mono">
                  {word}
                </span>
              ) : (
                word
              )}
            </TextReveal.Word>
          ))}
        </p>
      </div>
    </TextReveal.Root>
  );
}
