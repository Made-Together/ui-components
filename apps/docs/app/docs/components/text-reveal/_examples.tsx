"use client";

import { TextReveal } from "@togetheragency/ui/text-reveal";
import { useTransform } from "motion/react";
import { useId, useState } from "react";

const LOREM =
  "Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.";

const PREVIEW_CLASS =
  "flex w-full max-h-[528px] flex-col items-center justify-center gap-8 px-6 py-12";
const TEXT_CLASS =
  "max-w-3xl text-balance text-center text-2xl font-medium leading-snug text-foreground sm:text-3xl md:text-4xl";

interface ProgressSliderProps {
  value: number;
  onChange: (next: number) => void;
  label?: string;
}

function ProgressSlider({
  value,
  onChange,
  label = "Progress",
}: ProgressSliderProps) {
  const id = useId();
  return (
    <div className="flex w-full max-w-md flex-col gap-2">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <label htmlFor={id} className="font-medium">
          {label}
        </label>
        <span className="font-mono tabular-nums">{value}%</span>
      </div>
      <input
        id={id}
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-secondary accent-foreground"
      />
    </div>
  );
}

export function InteractiveTextRevealExample() {
  const [progress, setProgress] = useState(40);
  return (
    <div className={PREVIEW_CLASS}>
      <TextReveal.Root progress={progress}>
        <TextReveal.Text className={TEXT_CLASS}>{LOREM}</TextReveal.Text>
      </TextReveal.Root>
      <ProgressSlider value={progress} onChange={setProgress} />
    </div>
  );
}

export function CustomTransformTextRevealExample() {
  const [progress, setProgress] = useState(60);
  return (
    <div className={PREVIEW_CLASS}>
      <TextReveal.Root progress={progress}>
        <TextReveal.Text
          className={TEXT_CLASS}
          transform={(p) => ({
            // biome-ignore lint/correctness/useHookAtTopLevel: invoked inside TextReveal.Word's render
            opacity: useTransform(p, [0, 0.5], [0, 1]),
            // biome-ignore lint/correctness/useHookAtTopLevel: invoked inside TextReveal.Word's render
            y: useTransform(p, [0, 1], [24, 0]),
            // biome-ignore lint/correctness/useHookAtTopLevel: invoked inside TextReveal.Word's render
            filter: useTransform(p, [0, 1], ["blur(10px)", "blur(0px)"]),
          })}
        >
          {LOREM}
        </TextReveal.Text>
      </TextReveal.Root>
      <ProgressSlider value={progress} onChange={setProgress} />
    </div>
  );
}

export function ColorTransformTextRevealExample() {
  const [progress, setProgress] = useState(50);
  return (
    <div className={PREVIEW_CLASS}>
      <TextReveal.Root progress={progress}>
        <TextReveal.Text
          className={TEXT_CLASS}
          transform={(p) => ({
            // biome-ignore lint/correctness/useHookAtTopLevel: invoked inside TextReveal.Word's render
            color: useTransform(
              p,
              [0, 1],
              ["rgb(156 163 175 / 0.35)", "rgb(23 23 23)"],
            ),
          })}
        >
          {LOREM}
        </TextReveal.Text>
      </TextReveal.Root>
      <ProgressSlider value={progress} onChange={setProgress} />
    </div>
  );
}

export function ComposedWordTextRevealExample() {
  const words = ["Lorem", "ipsum", "dolor", "sit", "amet."];
  return (
    <div className={PREVIEW_CLASS}>
      <TextReveal.Root progress={65}>
        <p className="flex max-w-3xl flex-wrap justify-center gap-x-3 gap-y-2 text-balance text-center text-2xl font-medium leading-snug text-foreground sm:text-3xl md:text-4xl">
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
      </TextReveal.Root>
    </div>
  );
}

export function ScrollTextRevealExample() {
  return (
    <div className={PREVIEW_CLASS}>
      <TextReveal.Root>
        <TextReveal.Text className={TEXT_CLASS}>This is a text</TextReveal.Text>
      </TextReveal.Root>
    </div>
  );
}

export function ScrollMarginTextRevealExample() {
  return (
    <div className={PREVIEW_CLASS}>
      <TextReveal.Root startMargin="35vh" endMargin="35vh">
        <TextReveal.Text className={TEXT_CLASS}>{LOREM}</TextReveal.Text>
      </TextReveal.Root>
    </div>
  );
}
