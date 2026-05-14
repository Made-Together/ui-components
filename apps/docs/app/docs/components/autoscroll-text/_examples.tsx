"use client";

import { AutoScrollText } from "@repo/ui/autoscroll-text";
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

export function BasicAutoScrollTextExample() {
  return (
    <div className="flex w-full max-w-md items-center gap-3 rounded-lg bg-foreground px-3 py-2.5 text-background">
      <span className="shrink-0 rounded border border-background/30 px-2.5 py-1 text-sm font-medium">
        News
      </span>
      <AutoScrollText.Root
        className="flex-1"
        startDelay={2000}
        endDelay={2000}
        scrollSpeed={40}
      >
        <AutoScrollText.Content>
          Health Closes Pre-Seed Funding to Automate Healthcare Compliance and
          Risk Management
        </AutoScrollText.Content>
      </AutoScrollText.Root>
      <ArrowRight className="size-5 shrink-0 opacity-60" />
    </div>
  );
}

export function ShortTextAutoScrollTextExample() {
  return (
    <div className="w-full max-w-md rounded-lg border border-border bg-card p-4">
      <AutoScrollText.Root className="text-foreground">
        <AutoScrollText.Content>Short text that fits</AutoScrollText.Content>
      </AutoScrollText.Root>
    </div>
  );
}

export function FixedWidthAutoScrollTextExample() {
  return (
    <div className="w-full max-w-md rounded-lg border border-border bg-card p-4">
      <AutoScrollText.Root
        containerWidth={200}
        className="rounded bg-secondary px-2 py-1 text-foreground"
        startDelay={1500}
        scrollSpeed={30}
      >
        <AutoScrollText.Content>
          This is a much longer text that will definitely overflow the 200px
          container
        </AutoScrollText.Content>
      </AutoScrollText.Root>
    </div>
  );
}

export function SpeedsAutoScrollTextExample() {
  return (
    <div className="flex w-full max-w-md flex-col gap-2">
      <div className="rounded-lg border border-border bg-card p-3">
        <p className="mb-1 text-xs text-muted-foreground">Slow (25px/s)</p>
        <AutoScrollText.Root
          className="text-foreground"
          scrollSpeed={25}
          startDelay={1000}
        >
          <AutoScrollText.Content>
            A slow scrolling text that takes its time to reveal all the content
            gradually
          </AutoScrollText.Content>
        </AutoScrollText.Root>
      </div>
      <div className="rounded-lg border border-border bg-card p-3">
        <p className="mb-1 text-xs text-muted-foreground">Medium (50px/s)</p>
        <AutoScrollText.Root
          className="text-foreground"
          scrollSpeed={50}
          startDelay={1000}
        >
          <AutoScrollText.Content>
            A medium speed scrolling text that moves at a comfortable pace for
            reading
          </AutoScrollText.Content>
        </AutoScrollText.Root>
      </div>
      <div className="rounded-lg border border-border bg-card p-3">
        <p className="mb-1 text-xs text-muted-foreground">Fast (100px/s)</p>
        <AutoScrollText.Root
          className="text-foreground"
          scrollSpeed={100}
          startDelay={1000}
        >
          <AutoScrollText.Content>
            A fast scrolling text that quickly reveals the content - good for
            shorter delays
          </AutoScrollText.Content>
        </AutoScrollText.Root>
      </div>
    </div>
  );
}

export function FadesAutoScrollTextExample() {
  return (
    <div className="flex w-full max-w-md flex-col gap-2">
      <div className="rounded-lg border border-border bg-card p-3">
        <p className="mb-1 text-xs text-muted-foreground">Narrow fade (12px)</p>
        <AutoScrollText.Root
          className="text-foreground"
          fadeWidth={12}
          startDelay={1500}
        >
          <AutoScrollText.Content>
            This text has a narrow fade mask on the edges creating a subtle
            transition effect
          </AutoScrollText.Content>
        </AutoScrollText.Root>
      </div>
      <div className="rounded-lg border border-border bg-card p-3">
        <p className="mb-1 text-xs text-muted-foreground">Wide fade (48px)</p>
        <AutoScrollText.Root
          className="text-foreground"
          fadeWidth={48}
          startDelay={1500}
        >
          <AutoScrollText.Content>
            This text has a wide fade mask on the edges creating a more
            dramatic gradient effect
          </AutoScrollText.Content>
        </AutoScrollText.Root>
      </div>
    </div>
  );
}

export function DynamicAutoScrollTextExample() {
  const [text, setText] = useState(
    "This text can be changed dynamically to test re-renders and animation reset!",
  );
  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      <div className="rounded-lg border border-border bg-card p-4">
        <AutoScrollText.Root className="text-foreground" startDelay={1500}>
          <AutoScrollText.Content>{text}</AutoScrollText.Content>
        </AutoScrollText.Root>
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

export function PlayerRowAutoScrollTextExample() {
  return (
    <div className="flex w-full max-w-md items-center gap-4 rounded-xl bg-emerald-900 p-4">
      <div className="size-14 shrink-0 rounded-md bg-emerald-700" />
      <div className="min-w-0 flex-1 space-y-1">
        <AutoScrollText.Root
          className="font-medium text-white"
          startDelay={3000}
          endDelay={2000}
          scrollSpeed={35}
        >
          <AutoScrollText.Content>
            Bohemian Rhapsody - 2011 Remaster (Super Deluxe Edition)
          </AutoScrollText.Content>
        </AutoScrollText.Root>
        <AutoScrollText.Root
          className="text-sm text-emerald-200"
          startDelay={3500}
          scrollSpeed={30}
        >
          <AutoScrollText.Content>
            Queen • A Night at the Opera (Deluxe Remastered Version)
          </AutoScrollText.Content>
        </AutoScrollText.Root>
      </div>
    </div>
  );
}

export function NotificationAutoScrollTextExample() {
  return (
    <div className="flex w-full max-w-md items-center gap-3 rounded-lg bg-blue-600 px-4 py-3">
      <span className="relative flex size-2 shrink-0">
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-white opacity-75" />
        <span className="relative inline-flex size-2 rounded-full bg-white" />
      </span>
      <AutoScrollText.Root
        className="flex-1 font-medium text-white"
        startDelay={2500}
        scrollSpeed={45}
      >
        <AutoScrollText.Content>
          System update available: Version 2.4.1 includes performance
          improvements and bug fixes. Click here to learn more.
        </AutoScrollText.Content>
      </AutoScrollText.Root>
    </div>
  );
}
