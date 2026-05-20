"use client";

import { Ticker } from "@made-together/ui/ticker";
import { useState } from "react";

function ArrowRight({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <title>Arrow right</title>
      <path d="M4 10h12m0 0-5-5m5 5-5 5" />
    </svg>
  );
}

export function BasicTickerExample() {
  return (
    <div className="flex w-full max-w-md items-center gap-3 rounded-lg bg-foreground px-3 py-2.5 text-background">
      <span className="shrink-0 rounded border border-background/30 px-2.5 py-1 text-sm font-medium">
        News
      </span>
      <Ticker.Root
        className="flex-1"
        startDelay={2000}
        endDelay={2000}
        scrollSpeed={40}
      >
        <Ticker.Content>
          Health Closes Pre-Seed Funding to Automate Healthcare Compliance and
          Risk Management
        </Ticker.Content>
      </Ticker.Root>
      <ArrowRight className="size-5 shrink-0 opacity-60" />
    </div>
  );
}

export function ShortTextTickerExample() {
  return (
    <div className="w-full max-w-md rounded-lg border border-border bg-card p-4">
      <Ticker.Root className="text-foreground">
        <Ticker.Content>Short text that fits</Ticker.Content>
      </Ticker.Root>
    </div>
  );
}

export function FixedWidthTickerExample() {
  return (
    <div className="w-full max-w-md rounded-lg border border-border bg-card p-4">
      <Ticker.Root
        containerWidth={200}
        className="rounded bg-secondary px-2 py-1 text-foreground"
        startDelay={1500}
        scrollSpeed={30}
      >
        <Ticker.Content>
          This is a much longer text that will definitely overflow the 200px
          container
        </Ticker.Content>
      </Ticker.Root>
    </div>
  );
}

export function SpeedsTickerExample() {
  return (
    <div className="flex w-full max-w-md flex-col gap-2">
      <div className="rounded-lg border border-border bg-card p-3">
        <p className="mb-1 text-xs text-muted-foreground">Slow (25px/s)</p>
        <Ticker.Root
          className="text-foreground"
          scrollSpeed={25}
          startDelay={1000}
        >
          <Ticker.Content>
            A slow scrolling text that takes its time to reveal all the content
            gradually
          </Ticker.Content>
        </Ticker.Root>
      </div>
      <div className="rounded-lg border border-border bg-card p-3">
        <p className="mb-1 text-xs text-muted-foreground">Medium (50px/s)</p>
        <Ticker.Root
          className="text-foreground"
          scrollSpeed={50}
          startDelay={1000}
        >
          <Ticker.Content>
            A medium speed scrolling text that moves at a comfortable pace for
            reading
          </Ticker.Content>
        </Ticker.Root>
      </div>
      <div className="rounded-lg border border-border bg-card p-3">
        <p className="mb-1 text-xs text-muted-foreground">Fast (100px/s)</p>
        <Ticker.Root
          className="text-foreground"
          scrollSpeed={100}
          startDelay={1000}
        >
          <Ticker.Content>
            A fast scrolling text that quickly reveals the content - good for
            shorter delays
          </Ticker.Content>
        </Ticker.Root>
      </div>
    </div>
  );
}

export function FadesTickerExample() {
  return (
    <div className="flex w-full max-w-md flex-col gap-2">
      <div className="rounded-lg border border-border bg-card p-3">
        <p className="mb-1 text-xs text-muted-foreground">Narrow fade (12px)</p>
        <Ticker.Root
          className="text-foreground"
          fadeWidth={12}
          startDelay={1500}
        >
          <Ticker.Content>
            This text has a narrow fade mask on the edges creating a subtle
            transition effect
          </Ticker.Content>
        </Ticker.Root>
      </div>
      <div className="rounded-lg border border-border bg-card p-3">
        <p className="mb-1 text-xs text-muted-foreground">Wide fade (48px)</p>
        <Ticker.Root
          className="text-foreground"
          fadeWidth={48}
          startDelay={1500}
        >
          <Ticker.Content>
            This text has a wide fade mask on the edges creating a more
            dramatic gradient effect
          </Ticker.Content>
        </Ticker.Root>
      </div>
    </div>
  );
}

export function DynamicTickerExample() {
  const [text, setText] = useState(
    "This text can be changed dynamically to test re-renders and animation reset!",
  );
  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      <div className="rounded-lg border border-border bg-card p-4">
        <Ticker.Root className="text-foreground" startDelay={1500}>
          <Ticker.Content>{text}</Ticker.Content>
        </Ticker.Root>
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() =>
            setText(
              "This text can be changed dynamically to test re-renders and animation reset!",
            )
          }
          className="rounded-md bg-foreground px-3 py-1.5 text-sm text-background transition hover:opacity-80"
        >
          Original
        </button>
        <button
          type="button"
          onClick={() => setText("Short text")}
          className="rounded-md bg-secondary px-3 py-1.5 text-sm text-foreground transition hover:opacity-80"
        >
          Short
        </button>
        <button
          type="button"
          onClick={() =>
            setText(
              "Here is an even longer piece of text that will definitely require scrolling to read all the way through because it contains so much important information!",
            )
          }
          className="rounded-md bg-secondary px-3 py-1.5 text-sm text-foreground transition hover:opacity-80"
        >
          Very long
        </button>
      </div>
    </div>
  );
}

export function PlayerRowTickerExample() {
  return (
    <div className="flex w-full max-w-md items-center gap-4 rounded-xl bg-emerald-900 p-4">
      <div className="size-14 shrink-0 rounded-md bg-emerald-700" />
      <div className="min-w-0 flex-1 space-y-1">
        <Ticker.Root
          className="font-medium text-white"
          startDelay={3000}
          endDelay={2000}
          scrollSpeed={35}
        >
          <Ticker.Content>
            Bohemian Rhapsody - 2011 Remaster (Super Deluxe Edition)
          </Ticker.Content>
        </Ticker.Root>
        <Ticker.Root
          className="text-sm text-emerald-200"
          startDelay={3500}
          scrollSpeed={30}
        >
          <Ticker.Content>
            Queen • A Night at the Opera (Deluxe Remastered Version)
          </Ticker.Content>
        </Ticker.Root>
      </div>
    </div>
  );
}

export function NotificationTickerExample() {
  return (
    <div className="flex w-full max-w-md items-center gap-3 rounded-lg bg-blue-600 px-4 py-3">
      <span className="relative flex size-2 shrink-0">
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-white opacity-75" />
        <span className="relative inline-flex size-2 rounded-full bg-white" />
      </span>
      <Ticker.Root
        className="flex-1 font-medium text-white"
        startDelay={2500}
        scrollSpeed={45}
      >
        <Ticker.Content>
          System update available: Version 2.4.1 includes performance
          improvements and bug fixes. Click here to learn more.
        </Ticker.Content>
      </Ticker.Root>
    </div>
  );
}
