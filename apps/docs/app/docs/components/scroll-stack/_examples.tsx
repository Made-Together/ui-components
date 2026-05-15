"use client";

import { ScrollStack } from "@repo/ui/scroll-stack";

const cards = [
  {
    eyebrow: "01",
    title: "Composition first",
    body: "ScrollStack ships three primitives — Root, Viewport, Item — and stays out of the way otherwise. Style the cards however you like.",
    tone: "bg-foreground text-background",
  },
  {
    eyebrow: "02",
    title: "Scroll-driven scale",
    body: "Each card pins with position: sticky inside a shared parent, then scales down via a motion useScroll value as later cards stack on top.",
    tone: "bg-secondary text-foreground",
  },
  {
    eyebrow: "03",
    title: "Smoothed by a spring",
    body: "Raw scroll progress is fed through useSpring so the scrub feels physical rather than 1:1 with the scroll wheel. Tune or disable it per-Root.",
    tone: "bg-card text-foreground ring-1 ring-border",
  },
  {
    eyebrow: "04",
    title: "Respects motion preferences",
    body: "useReducedMotion short-circuits the scale to 1 so users with reduced-motion preferences see a calm, non-animated stack.",
    tone: "bg-foreground/90 text-background",
  },
];

interface CardProps {
  eyebrow: string;
  title: string;
  body: string;
  tone: string;
}

function Card({ eyebrow, title, body, tone }: CardProps) {
  return (
    <div
      className={`flex h-56 flex-col justify-between rounded-2xl p-6 shadow-lg shadow-foreground/5 ${tone}`}
    >
      <span className="font-mono text-[11px] uppercase tracking-[0.18em] opacity-70">
        {eyebrow}
      </span>
      <div className="flex flex-col gap-2">
        <h3 className="text-lg font-semibold leading-tight">{title}</h3>
        <p className="text-sm leading-relaxed opacity-80">{body}</p>
      </div>
    </div>
  );
}

export function BasicScrollStackExample() {
  return (
    <ScrollStack.Root
      useViewportScroll
      topOffset={16}
      stackGap={12}
      scaleStep={0.04}
      itemDistance={120}
      className="w-full max-w-md"
    >
      <ScrollStack.Viewport className="h-80 rounded-2xl border border-border bg-background p-4 pb-48">
        {cards.map((card) => (
          <ScrollStack.Item key={card.eyebrow}>
            <Card {...card} />
          </ScrollStack.Item>
        ))}
      </ScrollStack.Viewport>
    </ScrollStack.Root>
  );
}

export function TightScrollStackExample() {
  return (
    <ScrollStack.Root
      useViewportScroll
      topOffset={8}
      stackGap={4}
      scaleStep={0.02}
      itemDistance={80}
      className="w-full max-w-md"
    >
      <ScrollStack.Viewport className="h-80 rounded-2xl border border-border bg-background p-4">
        {cards.map((card) => (
          <ScrollStack.Item key={card.eyebrow}>
            <Card {...card} />
          </ScrollStack.Item>
        ))}
      </ScrollStack.Viewport>
    </ScrollStack.Root>
  );
}

export function SteppedScrollStackExample() {
  return (
    <ScrollStack.Root
      useViewportScroll
      topOffset={24}
      stackGap={24}
      scaleStep={0.08}
      itemDistance={180}
      className="w-full max-w-md"
    >
      <ScrollStack.Viewport className="h-80 rounded-2xl border border-border bg-background p-4">
        {cards.map((card) => (
          <ScrollStack.Item key={card.eyebrow}>
            <Card {...card} />
          </ScrollStack.Item>
        ))}
      </ScrollStack.Viewport>
    </ScrollStack.Root>
  );
}

export function SnappyScrollStackExample() {
  return (
    <ScrollStack.Root
      useViewportScroll
      topOffset={16}
      stackGap={12}
      scaleStep={0.04}
      itemDistance={120}
      spring={{ stiffness: 500, damping: 50, mass: 0.4 }}
      className="w-full max-w-md"
    >
      <ScrollStack.Viewport className="h-80 rounded-2xl border border-border bg-background p-4">
        {cards.map((card) => (
          <ScrollStack.Item key={card.eyebrow}>
            <Card {...card} />
          </ScrollStack.Item>
        ))}
      </ScrollStack.Viewport>
    </ScrollStack.Root>
  );
}

export function RawScrollStackExample() {
  return (
    <ScrollStack.Root
      useViewportScroll
      topOffset={16}
      stackGap={12}
      scaleStep={0.04}
      itemDistance={120}
      spring={false}
      className="w-full max-w-md"
    >
      <ScrollStack.Viewport className="h-80 rounded-2xl border border-border bg-background p-4">
        {cards.map((card) => (
          <ScrollStack.Item key={card.eyebrow}>
            <Card {...card} />
          </ScrollStack.Item>
        ))}
      </ScrollStack.Viewport>
    </ScrollStack.Root>
  );
}
