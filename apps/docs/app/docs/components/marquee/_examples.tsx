"use client";

import { Marquee } from "@made-together/ui/marquee";

const words = [
  "Motion",
  "Layout",
  "Tokens",
  "A11y",
  "Composition",
  "Tailwind",
  "React",
];

const logos = ["Acme", "Globex", "Initech", "Umbrella", "Soylent", "Hooli"];

export function BasicMarqueeExample() {
  return (
    <Marquee.Root className="w-full rounded-xl border border-border bg-card [--gap:2rem] [--duration:35s]">
      {words.map((word) => (
        <Marquee.Item key={word}>
          <span className="inline-flex items-center rounded-full border border-border bg-background px-4 py-2 text-sm font-medium text-foreground shadow-sm">
            {word}
          </span>
        </Marquee.Item>
      ))}
    </Marquee.Root>
  );
}

export function ReverseMarqueeExample() {
  return (
    <Marquee.Root
      reverse
      className="w-full rounded-xl bg-foreground text-background [--gap:1.25rem] [--duration:18s]"
    >
      {words.map((word) => (
        <Marquee.Item key={word}>
          <span className="inline-flex items-center rounded-lg bg-white/10 px-3 py-1.5 text-sm font-medium ring-1 ring-white/20">
            {word}
          </span>
        </Marquee.Item>
      ))}
    </Marquee.Root>
  );
}

export function PauseOnHoverMarqueeExample() {
  return (
    <Marquee.Root
      pauseOnHover
      className="w-full cursor-default rounded-xl border border-dashed border-border bg-card [--gap:2rem] [--duration:28s]"
    >
      {logos.map((logo) => (
        <Marquee.Item key={logo}>
          <span className="text-base font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            {logo}
          </span>
        </Marquee.Item>
      ))}
    </Marquee.Root>
  );
}

export function VerticalMarqueeExample() {
  return (
    <div className="flex w-full max-w-md flex-row items-stretch gap-6 rounded-xl border border-border bg-card p-4">
      <p className="w-32 shrink-0 self-center text-sm leading-relaxed text-muted-foreground">
        Side column stays still while the ticker runs beside it.
      </p>
      <Marquee.Root
        vertical
        repeat={3}
        className="h-52 min-w-0 flex-1 [--gap:0.75rem] [--duration:22s]"
      >
        {words.map((word) => (
          <Marquee.Item key={word}>
            <span className="block bg-background px-3 py-2 text-center text-sm font-medium text-foreground">
              {word}
            </span>
          </Marquee.Item>
        ))}
      </Marquee.Root>
    </div>
  );
}

export function FastMarqueeExample() {
  return (
    <Marquee.Root className="w-full rounded-xl bg-card [--gap:1rem] [--duration:6s]">
      {words.map((word) => (
        <Marquee.Item key={word}>
          <span className="inline-flex items-center rounded-md bg-foreground/5 px-3 py-1.5 text-sm font-medium text-foreground">
            {word}
          </span>
        </Marquee.Item>
      ))}
    </Marquee.Root>
  );
}

export function LogoCloudMarqueeExample() {
  return (
    <Marquee.Root
      pauseOnHover
      className="w-full rounded-xl bg-card [--gap:3rem] [--duration:30s]"
    >
      {logos.map((logo) => (
        <Marquee.Item key={logo}>
          <span className="text-xl font-bold tracking-tight text-muted-foreground transition-colors hover:text-foreground">
            {logo}
          </span>
        </Marquee.Item>
      ))}
    </Marquee.Root>
  );
}
