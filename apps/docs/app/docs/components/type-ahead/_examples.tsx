"use client";

import { TypeAhead } from "@togetheragency/ui/type-ahead";
import { useState } from "react";

export function BasicTypeAheadExample() {
  return (
    <p className="text-2xl font-medium text-foreground">
      <TypeAhead.Root>
        <TypeAhead.Static>I love building </TypeAhead.Static>
        <TypeAhead.Animated
          texts={["React apps", "design systems", "tiny components"]}
          className="text-foreground"
        />
      </TypeAhead.Root>
    </p>
  );
}

export function SingleStringTypeAheadExample() {
  return (
    <p className="text-2xl font-medium text-foreground">
      <TypeAhead.Root>
        <TypeAhead.Animated
          texts="Headless. Accessible. Tiny."
          loop={false}
          typingSpeed={28}
        />
      </TypeAhead.Root>
    </p>
  );
}

export function SpeedControlsTypeAheadExample() {
  return (
    <div className="flex w-full max-w-xl flex-col gap-3 text-lg text-foreground">
      <p>
        <span className="text-muted-foreground">Fast: </span>
        <TypeAhead.Root typingSpeed={48} deletionSpeed={64} pauseDuration={800}>
          <TypeAhead.Animated texts={["snappy", "rapid", "instant"]} />
        </TypeAhead.Root>
      </p>
      <p>
        <span className="text-muted-foreground">Slow: </span>
        <TypeAhead.Root typingSpeed={8} deletionSpeed={12} pauseDuration={2000}>
          <TypeAhead.Animated texts={["deliberate", "patient", "measured"]} />
        </TypeAhead.Root>
      </p>
    </div>
  );
}

export function CustomCursorTypeAheadExample() {
  return (
    <div className="flex w-full max-w-xl flex-col gap-3 text-2xl font-medium text-foreground">
      <p>
        <TypeAhead.Root cursorCharacter="▌">
          <TypeAhead.Static>{"> "}</TypeAhead.Static>
          <TypeAhead.Animated texts={["whoami", "ls -la", "exit"]} />
        </TypeAhead.Root>
      </p>
      <p>
        <TypeAhead.Root cursorCharacter="_">
          <TypeAhead.Static>SYSTEM://</TypeAhead.Static>
          <TypeAhead.Animated texts={["ONLINE", "READY", "AWAITING INPUT"]} />
        </TypeAhead.Root>
      </p>
      <p>
        <TypeAhead.Root showCursor={false}>
          <TypeAhead.Static>No cursor — </TypeAhead.Static>
          <TypeAhead.Animated texts={["quiet typing", "no blink", "minimal"]} />
        </TypeAhead.Root>
      </p>
    </div>
  );
}

export function ControlledTypeAheadExample() {
  const [history, setHistory] = useState<string[]>([]);
  return (
    <div className="flex w-full max-w-xl flex-col gap-4">
      <p className="text-2xl font-medium text-foreground">
        <TypeAhead.Root>
          <TypeAhead.Static>Currently showing: </TypeAhead.Static>
          <TypeAhead.Animated
            texts={["alpha", "bravo", "charlie", "delta"]}
            onType={(text) => setHistory((cur) => [text, ...cur].slice(0, 4))}
          />
        </TypeAhead.Root>
      </p>
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="text-muted-foreground">Recently typed:</span>
        {history.length === 0 ? (
          <span className="text-muted-foreground">…</span>
        ) : (
          history.map((entry, index) => (
            <span
              // biome-ignore lint/suspicious/noArrayIndexKey: we want to use the index as a key
              key={`${entry}-${index}`}
              className="rounded-full border border-border bg-card px-3 py-1 font-mono text-foreground"
            >
              {entry}
            </span>
          ))
        )}
      </div>
    </div>
  );
}

export function RenderPropTypeAheadExample() {
  return (
    <p className="text-2xl font-medium text-foreground">
      <TypeAhead.Root>
        <TypeAhead.Static>Mood: </TypeAhead.Static>
        <TypeAhead.Animated
          texts={["focused", "playful", "shipping"]}
          render={({ text, phase }) => (
            <span
              data-phase={phase}
              className="rounded-md bg-foreground/10 px-2 py-0.5 font-mono text-foreground data-[phase=deleting]:text-muted-foreground"
            >
              {text}
              <span
                aria-hidden="true"
                className="ml-0.5 inline-block animate-pulse"
              >
                ▌
              </span>
            </span>
          )}
        />
      </TypeAhead.Root>
    </p>
  );
}
