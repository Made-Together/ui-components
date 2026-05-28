"use client";

import { Accordion } from "@togetheragency/ui/accordion";
import { Carousel } from "@togetheragency/ui/carousel";
import { Marquee } from "@togetheragency/ui/marquee";
import { Swappable } from "@togetheragency/ui/swappable";
import { Tabs } from "@togetheragency/ui/tabs";
import { Ticker } from "@togetheragency/ui/ticker";
import { useState } from "react";

const slides = [
  { title: "Aurora", hue: "from-indigo-500 to-fuchsia-500" },
  { title: "Tidepool", hue: "from-cyan-500 to-teal-500" },
  { title: "Ember", hue: "from-amber-500 to-rose-500" },
  { title: "Moss", hue: "from-emerald-500 to-lime-500" },
  { title: "Dusk", hue: "from-slate-700 to-slate-900" },
];

const marqueeWords = [
  "Motion",
  "Layout",
  "Tokens",
  "A11y",
  "Composition",
  "Tailwind",
  "React",
];

const faqItems = [
  {
    value: "headless",
    title: "Is the accordion headless?",
    content:
      "Yes. The component ships with semantic markup (ul > li > h3 > button) and ARIA wiring only — visual styling, spacing and transitions are all up to the consumer via className and data-state.",
  },
  {
    value: "a11y",
    title: "What about keyboard support?",
    content:
      "Triggers expose aria-expanded and aria-controls, and the panel is a region labelled by its trigger. Use ArrowDown / ArrowUp to move between triggers, Home jumps to the first, End to the last.",
  },
  {
    value: "controlled",
    title: "Can I control the open state?",
    content:
      "Yes — pass value + onValueChange for controlled usage, or defaultValue to leave the component in charge. Both single (string) and multiple (string[]) modes are supported.",
  },
  {
    value: "animation",
    title: "How do I animate the panel?",
    content:
      'Every part exposes data-state="open"|"closed" so you can drive CSS transitions or motion variants. Pass forceMount on Accordion.Content to keep panels in the DOM while collapsed.',
  },
];

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-16 px-6 py-16 my-20 pb-20">
      <header className="flex flex-col gap-2">
        <span className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-500">
          @togetheragency/ui
        </span>
        <h1 className="text-3xl font-semibold tracking-tight">
          Component playground
        </h1>
        <p className="text-sm text-neutral-500">
          Headless primitives with composition APIs. Carousel uses
          embla-carousel; Marquee ships scoped animation CSS from{" "}
          <code className="rounded bg-neutral-100 px-1 py-0.5 text-xs">
            Marquee.Root
          </code>
          . All visuals below are Tailwind in this app only.
        </p>
      </header>

      <BasicCarousel />
      <LoopingCarousel />
      <MultiSlideCarousel />

      <div aria-hidden="true" className="h-px w-full bg-neutral-200" />

      <header className="flex flex-col gap-2">
        <span className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-500">
          Marquee
        </span>
        <h2 className="text-2xl font-semibold tracking-tight">
          Infinite scroll strips
        </h2>
        <p className="text-sm text-neutral-500">
          Use{" "}
          <code className="rounded bg-neutral-100 px-1 py-0.5 text-xs">
            Marquee.Item
          </code>{" "}
          for each cell;{" "}
          <code className="rounded bg-neutral-100 px-1 py-0.5 text-xs">
            Marquee.Root
          </code>{" "}
          repeats tracks for a seamless loop.
        </p>
      </header>

      <MarqueeBasic />
      <MarqueeReverse />
      <MarqueePauseOnHover />
      <MarqueeVertical />

      <div aria-hidden="true" className="h-px w-full bg-neutral-200" />

      <header className="flex flex-col gap-2">
        <span className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-500">
          Accordion
        </span>
        <h2 className="text-2xl font-semibold tracking-tight">
          Disclosure primitives
        </h2>
        <p className="text-sm text-neutral-500">
          Composition API with{" "}
          <code className="rounded bg-neutral-100 px-1 py-0.5 text-xs">
            Accordion.Root
          </code>{" "}
          (a <code>ul</code>) and items as <code>li</code>s. Triggers are real
          buttons, panels are <code>section</code>s wired with{" "}
          <code>aria-controls</code>.
        </p>
      </header>

      <AccordionSingle />
      <AccordionMultiple />

      <div aria-hidden="true" className="h-px w-full bg-neutral-200" />

      <header className="flex flex-col gap-2">
        <span className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-500">
          Tabs
        </span>
        <h2 className="text-2xl font-semibold tracking-tight">
          Sectioned navigation
        </h2>
        <p className="text-sm text-neutral-500">
          <code className="rounded bg-neutral-100 px-1 py-0.5 text-xs">
            Tabs.Indicator
          </code>{" "}
          slides between triggers via motion&apos;s shared{" "}
          <code className="rounded bg-neutral-100 px-1 py-0.5 text-xs">
            layoutId
          </code>
          . Arrow keys move between tabs (orientation-aware), Home/End jump to
          the ends.
        </p>
      </header>

      <TabsSegmented />
      <TabsVertical />

      <div aria-hidden="true" className="h-px w-full bg-neutral-200" />

      <header className="flex flex-col gap-2">
        <span className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-500">
          Ticker
        </span>
        <h2 className="text-2xl font-semibold tracking-tight">
          Overflow-aware text scroller
        </h2>
        <p className="text-sm text-neutral-500">
          Spotify-style ticker that only scrolls when text overflows its
          container. Composition API:{" "}
          <code className="rounded bg-neutral-100 px-1 py-0.5 text-xs">
            Ticker.Root
          </code>{" "}
          measures and animates,{" "}
          <code className="rounded bg-neutral-100 px-1 py-0.5 text-xs">
            Ticker.Content
          </code>{" "}
          renders the text.
        </p>
      </header>

      <TickerNews />
      <TickerShortText />
      <TickerFixedWidth />
      <TickerSpotify />
      <TickerSpeeds />
      <TickerFades />
      <TickerDynamic />
      <TickerNotification />

      <div aria-hidden="true" className="h-px w-full bg-neutral-200" />

      <header className="flex flex-col gap-2">
        <span className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-500">
          Swappable
        </span>
        <h2 className="text-2xl font-semibold tracking-tight">
          Rotating logo wall
        </h2>
        <p className="text-sm text-neutral-500">
          Renders an{" "}
          <code className="rounded bg-neutral-100 px-1 py-0.5 text-xs">
            M × N
          </code>{" "}
          grid and swaps random cells on random intervals when the source array
          has more items than visible cells. Composition:{" "}
          <code className="rounded bg-neutral-100 px-1 py-0.5 text-xs">
            Swappable.Root
          </code>{" "}
          owns state,{" "}
          <code className="rounded bg-neutral-100 px-1 py-0.5 text-xs">
            Swappable.Grid
          </code>{" "}
          renders the cells,{" "}
          <code className="rounded bg-neutral-100 px-1 py-0.5 text-xs">
            Swappable.Item
          </code>{" "}
          animates each swap via motion.
        </p>
      </header>

      <SwappableLogoWall />
      <SwappableLogoGrid />
      <SwappableLogoFast />
    </main>
  );
}

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

function TickerNews() {
  return (
    <section className="flex flex-col gap-4">
      <Heading
        eyebrow="Ticker 01"
        title="News ticker"
        description="Inline label, scrolling headline, trailing icon. Only the headline runs when it overflows."
      />
      <div className="flex items-center gap-3 rounded-lg bg-stone-800 p-3">
        <span className="shrink-0 rounded border border-stone-400 px-2.5 py-1 text-sm font-medium text-stone-200">
          News
        </span>
        <Ticker.Root
          className="flex-1 text-stone-200"
          startDelay={2000}
          endDelay={2000}
          scrollSpeed={40}
        >
          <Ticker.Content>
            Health Closes Pre-Seed Funding to Automate Healthcare Compliance and
            Risk Management
          </Ticker.Content>
        </Ticker.Root>
        <ArrowRight className="size-5 shrink-0 text-stone-400" />
      </div>
    </section>
  );
}

function TickerShortText() {
  return (
    <section className="flex flex-col gap-4">
      <Heading
        eyebrow="Ticker 02"
        title="Short text (no scrolling)"
        description="When text fits inside the container, the component stays static and no mask is applied."
      />
      <div className="rounded-lg border border-neutral-200 bg-white p-4">
        <Ticker.Root className="text-neutral-900">
          <Ticker.Content>Short text that fits</Ticker.Content>
        </Ticker.Root>
      </div>
    </section>
  );
}

function TickerFixedWidth() {
  return (
    <section className="flex flex-col gap-4">
      <Heading
        eyebrow="Ticker 03"
        title="Fixed width (200px)"
        description="containerWidth pins the track to an exact pixel width regardless of parent layout."
      />
      <div className="rounded-lg border border-neutral-200 bg-white p-4">
        <Ticker.Root
          containerWidth={200}
          className="rounded bg-neutral-100 px-2 py-1 text-neutral-900"
          startDelay={1500}
          scrollSpeed={30}
        >
          <Ticker.Content>
            This is a much longer text that will definitely overflow the 200px
            container
          </Ticker.Content>
        </Ticker.Root>
      </div>
    </section>
  );
}

function TickerSpotify() {
  return (
    <section className="flex flex-col gap-4">
      <Heading
        eyebrow="Ticker 04"
        title="Player row"
        description="Two stacked scrollers with independent delays — title runs first, artist follows."
      />
      <div className="flex items-center gap-4 rounded-xl bg-emerald-900 p-4">
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
    </section>
  );
}

function TickerSpeeds() {
  return (
    <section className="flex flex-col gap-4">
      <Heading
        eyebrow="Ticker 05"
        title="Different scroll speeds"
        description="scrollSpeed is in pixels per second — same text, three tempos."
      />
      <div className="flex flex-col gap-3">
        <div className="rounded-lg border border-neutral-200 bg-white p-3">
          <p className="mb-1 text-xs text-neutral-500">Slow (25px/s)</p>
          <Ticker.Root
            className="text-neutral-900"
            scrollSpeed={25}
            startDelay={1000}
          >
            <Ticker.Content>
              A slow scrolling text that takes its time to reveal all the
              content gradually
            </Ticker.Content>
          </Ticker.Root>
        </div>
        <div className="rounded-lg border border-neutral-200 bg-white p-3">
          <p className="mb-1 text-xs text-neutral-500">Medium (50px/s)</p>
          <Ticker.Root
            className="text-neutral-900"
            scrollSpeed={50}
            startDelay={1000}
          >
            <Ticker.Content>
              A medium speed scrolling text that moves at a comfortable pace for
              reading
            </Ticker.Content>
          </Ticker.Root>
        </div>
        <div className="rounded-lg border border-neutral-200 bg-white p-3">
          <p className="mb-1 text-xs text-neutral-500">Fast (100px/s)</p>
          <Ticker.Root
            className="text-neutral-900"
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
    </section>
  );
}

function TickerFades() {
  return (
    <section className="flex flex-col gap-4">
      <Heading
        eyebrow="Ticker 06"
        title="Custom fade widths"
        description="fadeWidth controls the gradient mask on each edge — subtle vs. dramatic."
      />
      <div className="flex flex-col gap-3">
        <div className="rounded-lg border border-neutral-200 bg-white p-3">
          <p className="mb-1 text-xs text-neutral-500">Narrow fade (12px)</p>
          <Ticker.Root
            className="text-neutral-900"
            fadeWidth={12}
            startDelay={1500}
          >
            <Ticker.Content>
              This text has a narrow fade mask on the edges creating a subtle
              transition effect
            </Ticker.Content>
          </Ticker.Root>
        </div>
        <div className="rounded-lg border border-neutral-200 bg-white p-3">
          <p className="mb-1 text-xs text-neutral-500">Wide fade (48px)</p>
          <Ticker.Root
            className="text-neutral-900"
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
    </section>
  );
}

function TickerDynamic() {
  const [dynamicText, setDynamicText] = useState(
    "This text can be changed dynamically to test re-renders and animation reset!",
  );
  return (
    <section className="flex flex-col gap-4">
      <Heading
        eyebrow="Ticker 07"
        title="Dynamic text updates"
        description="Animation cleanly resets when content changes — the component re-measures and decides whether to scroll."
      />
      <div className="flex flex-col gap-3">
        <div className="rounded-lg border border-neutral-200 bg-white p-4">
          <Ticker.Root className="text-neutral-900" startDelay={1500}>
            <Ticker.Content>{dynamicText}</Ticker.Content>
          </Ticker.Root>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() =>
              setDynamicText(
                "This text can be changed dynamically to test re-renders and animation reset!",
              )
            }
            className="rounded-md bg-neutral-900 px-3 py-1.5 text-sm text-white transition-colors hover:bg-neutral-700"
          >
            Original text
          </button>
          <button
            type="button"
            onClick={() => setDynamicText("Short text")}
            className="rounded-md bg-neutral-200 px-3 py-1.5 text-sm text-neutral-900 transition-colors hover:bg-neutral-300"
          >
            Short text
          </button>
          <button
            type="button"
            onClick={() =>
              setDynamicText(
                "Here is an even longer piece of text that will definitely require scrolling to read all the way through because it contains so much important information!",
              )
            }
            className="rounded-md bg-neutral-200 px-3 py-1.5 text-sm text-neutral-900 transition-colors hover:bg-neutral-300"
          >
            Very long text
          </button>
        </div>
      </div>
    </section>
  );
}

function TickerNotification() {
  return (
    <section className="flex flex-col gap-4">
      <Heading
        eyebrow="Ticker 08"
        title="Notification banner"
        description="Pulsing status dot + scrolling message. Mask hides clipping at both edges."
      />
      <div className="flex items-center gap-3 rounded-lg bg-blue-600 px-4 py-3">
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
    </section>
  );
}

function BasicCarousel() {
  return (
    <section className="flex flex-col gap-4">
      <Heading
        eyebrow="Example 01"
        title="Basic"
        description="One slide visible at a time. Prev/Next auto-disable at the edges."
      />

      <Carousel.Root className="relative" options={{ align: "start" }}>
        <Carousel.Viewport className="overflow-hidden rounded-2xl">
          <Carousel.Container className="flex">
            {slides.map((slide, i) => (
              <Carousel.Slide
                key={slide.title}
                index={i}
                className="min-w-0 flex-[0_0_100%] pr-3 last:pr-0"
              >
                <SlideCard {...slide} index={i} />
              </Carousel.Slide>
            ))}
          </Carousel.Container>
        </Carousel.Viewport>

        <div className="mt-4 flex items-center justify-between">
          <Carousel.Navigation
            aria-label="Featured slides"
            className="flex items-center gap-2"
          >
            {slides.map((slide, i) => (
              <Carousel.NavigationItem
                key={slide.title}
                index={i}
                className="block h-2 w-2 rounded-full bg-neutral-300 transition-[width,background-color] duration-300 data-[state=active]:w-5 data-[state=active]:bg-neutral-900"
              />
            ))}
          </Carousel.Navigation>
          <div className="flex gap-2">
            <Carousel.Previous className="rounded-full border border-neutral-300 px-4 py-2 text-sm font-medium transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-40">
              Prev
            </Carousel.Previous>
            <Carousel.Next className="rounded-full border border-neutral-300 px-4 py-2 text-sm font-medium transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-40">
              Next
            </Carousel.Next>
          </div>
        </div>
      </Carousel.Root>
    </section>
  );
}

function LoopingCarousel() {
  return (
    <section className="flex flex-col gap-4">
      <Heading
        eyebrow="Example 02"
        title="Looping"
        description="loop: true wraps both directions; nav buttons never disable."
      />

      <Carousel.Root options={{ loop: true, align: "center" }}>
        <Carousel.Viewport className="overflow-hidden rounded-2xl">
          <Carousel.Container className="flex">
            {slides.map((slide, i) => (
              <Carousel.Slide
                key={slide.title}
                index={i}
                className="group min-w-0 flex-[0_0_70%] pr-3"
              >
                <div className="transition-[transform,opacity] duration-500 group-data-[state=inactive]:scale-95 group-data-[state=inactive]:opacity-50">
                  <SlideCard {...slide} index={i} />
                </div>
              </Carousel.Slide>
            ))}
          </Carousel.Container>
        </Carousel.Viewport>

        <div className="mt-4 flex flex-col items-center gap-4">
          <Carousel.Navigation
            aria-label="Looping showcase"
            className="flex items-center gap-2"
          >
            {slides.map((slide, i) => (
              <Carousel.NavigationItem
                key={slide.title}
                index={i}
                aria-label={`Go to ${slide.title}`}
                className="grid size-8 place-items-center rounded-full border border-neutral-300 text-xs font-medium text-neutral-500 transition hover:border-neutral-500 hover:text-neutral-900 data-[state=active]:border-neutral-900 data-[state=active]:bg-neutral-900 data-[state=active]:text-white"
              >
                {i + 1}
              </Carousel.NavigationItem>
            ))}
          </Carousel.Navigation>
          <div className="flex gap-2">
            <Carousel.Previous className="grid size-10 place-items-center rounded-full bg-neutral-900 text-white transition hover:bg-neutral-700">
              ←
            </Carousel.Previous>
            <Carousel.Next className="grid size-10 place-items-center rounded-full bg-neutral-900 text-white transition hover:bg-neutral-700">
              →
            </Carousel.Next>
          </div>
        </div>
      </Carousel.Root>
    </section>
  );
}

function MultiSlideCarousel() {
  return (
    <section className="flex flex-col gap-4">
      <Heading
        eyebrow="Example 03"
        title="Multi-slide"
        description="Three slides per view, dragFree scrolling, custom slide widths via Tailwind."
      />

      <Carousel.Root options={{ dragFree: true, align: "start" }}>
        <Carousel.Viewport className="overflow-hidden">
          <Carousel.Container className="flex">
            {[...slides, ...slides].map((slide, i) => (
              <Carousel.Slide
                // biome-ignore lint/suspicious/noArrayIndexKey: stable test fixture
                key={`${slide.title}-${i}`}
                index={i}
                className="min-w-0 flex-[0_0_33.333%] pr-3"
              >
                <SlideCard {...slide} index={i} compact />
              </Carousel.Slide>
            ))}
          </Carousel.Container>
        </Carousel.Viewport>
      </Carousel.Root>
    </section>
  );
}

function SlideCard({
  title,
  hue,
  index,
  compact,
}: {
  title: string;
  hue: string;
  index: number;
  compact?: boolean;
}) {
  return (
    <div
      className={`relative flex w-full flex-col justify-between overflow-hidden rounded-2xl bg-linear-to-br ${hue} p-6 text-white shadow-lg ${
        compact ? "aspect-square" : "aspect-video"
      }`}
    >
      <span className="text-xs font-medium uppercase tracking-[0.2em] opacity-80">
        Slide {String(index + 1).padStart(2, "0")}
      </span>
      <h3 className="text-2xl font-semibold tracking-tight">{title}</h3>
    </div>
  );
}

function Heading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-400">
        {eyebrow}
      </span>
      <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      <p className="text-sm text-neutral-500">{description}</p>
    </div>
  );
}

function MarqueeBasic() {
  return (
    <section className="flex flex-col gap-4">
      <Heading
        eyebrow="Marquee 01"
        title="Horizontal"
        description="Default direction and speed. Gap and duration are CSS variables on the root."
      />
      <Marquee.Root className="rounded-xl border border-neutral-200 bg-neutral-50 [--gap:2rem] [--duration:35s]">
        {marqueeWords.map((word) => (
          <Marquee.Item key={word}>
            <span className="inline-flex items-center rounded-full border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-800 shadow-sm">
              {word}
            </span>
          </Marquee.Item>
        ))}
      </Marquee.Root>
    </section>
  );
}

function MarqueeReverse() {
  return (
    <section className="flex flex-col gap-4">
      <Heading
        eyebrow="Marquee 02"
        title="Reverse + faster"
        description="reverse flips animation-direction; shorter --duration reads as a busier strip."
      />
      <Marquee.Root
        reverse
        className="rounded-xl border border-neutral-900 bg-neutral-950 [--gap:1.25rem] [--duration:5s]"
      >
        {marqueeWords.map((word) => (
          <Marquee.Item key={word}>
            <span className="inline-flex items-center rounded-lg bg-white/10 px-3 py-1.5 text-sm font-medium text-white ring-1 ring-white/20">
              {word}
            </span>
          </Marquee.Item>
        ))}
      </Marquee.Root>
    </section>
  );
}

function MarqueePauseOnHover() {
  return (
    <section className="flex flex-col gap-4">
      <Heading
        eyebrow="Marquee 03"
        title="Pause on hover"
        description="Hover the strip to freeze motion — useful when items are links or copy-heavy."
      />
      <Marquee.Root
        pauseOnHover
        className="cursor-default rounded-xl border border-dashed border-neutral-300 bg-white [--gap:1.75rem] [--duration:28s]"
      >
        {marqueeWords.map((word) => (
          <Marquee.Item key={word}>
            <span className="text-sm font-medium tracking-wide text-neutral-600 uppercase">
              {word}
            </span>
            <span aria-hidden="true" className="text-neutral-300">
              {" "}
              ·{" "}
            </span>
          </Marquee.Item>
        ))}
      </Marquee.Root>
    </section>
  );
}

function MarqueeVertical() {
  return (
    <section className="flex flex-col gap-4">
      <Heading
        eyebrow="Marquee 04"
        title="Vertical"
        description="vertical stacks tracks in a column; give the root a fixed height so overflow clips cleanly."
      />
      <div className="flex max-w-md flex-row gap-6 rounded-xl border border-neutral-200 bg-neutral-50 p-4">
        <p className="w-32 shrink-0 text-sm leading-relaxed text-neutral-600">
          Side column stays still while the ticker runs beside it.
        </p>
        <Marquee.Root
          vertical
          className="h-52 min-w-0 flex-1 [--gap:0.75rem] [--duration:22s]"
          repeat={3}
        >
          {marqueeWords.map((word) => (
            <Marquee.Item key={word}>
              <span className="block rounded-md bg-white px-3 py-2 text-center text-sm font-medium text-neutral-800 shadow-sm ring-1 ring-neutral-200/80">
                {word}
              </span>
            </Marquee.Item>
          ))}
        </Marquee.Root>
      </div>
    </section>
  );
}

function ChevronDown({ className }: { className?: string }) {
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
      <title>Chevron down</title>
      <path d="m5 7.5 5 5 5-5" />
    </svg>
  );
}

function AccordionSingle() {
  return (
    <section className="flex flex-col gap-4">
      <Heading
        eyebrow="Accordion 01"
        title="Single, collapsible"
        description="Only one panel open at a time; click the open item again to collapse it."
      />
      <Accordion.Root
        type="single"
        defaultValue="headless"
        className="divide-y divide-neutral-200 overflow-hidden rounded-2xl border border-neutral-200 bg-white"
      >
        {faqItems.map((item) => (
          <Accordion.Item key={item.value} value={item.value}>
            <Accordion.Heading>
              <Accordion.Trigger className="group flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-medium text-neutral-900 transition hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2">
                {item.title}
                <Accordion.Indicator className="text-neutral-500 transition-transform duration-300 data-[state=open]:rotate-180">
                  <ChevronDown className="size-4" />
                </Accordion.Indicator>
              </Accordion.Trigger>
            </Accordion.Heading>
            <Accordion.Content className="px-5 pb-4 text-sm leading-relaxed text-neutral-600">
              {item.content}
            </Accordion.Content>
          </Accordion.Item>
        ))}
      </Accordion.Root>
    </section>
  );
}

function AccordionMultiple() {
  return (
    <section className="flex flex-col gap-4">
      <Heading
        eyebrow="Accordion 02"
        title="Multiple"
        description="Many panels can stay open. Triggers are full buttons with arrow-key navigation."
      />
      <Accordion.Root
        type="multiple"
        defaultValue={["a11y", "animation"]}
        className="flex flex-col gap-2"
      >
        {faqItems.map((item) => (
          <Accordion.Item
            key={item.value}
            value={item.value}
            className="overflow-hidden rounded-xl bg-neutral-950 text-neutral-100 ring-1 ring-white/10 data-[state=open]:ring-white/20"
          >
            <Accordion.Heading>
              <Accordion.Trigger className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left text-sm font-medium transition hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
                {item.title}
                <Accordion.Indicator className="grid size-6 place-items-center rounded-full bg-white/10 transition-transform duration-300 data-[state=open]:rotate-180">
                  <ChevronDown className="size-3.5" />
                </Accordion.Indicator>
              </Accordion.Trigger>
            </Accordion.Heading>
            <Accordion.Content className="border-t border-white/10 px-4 py-3 text-sm leading-relaxed text-neutral-300">
              {item.content}
            </Accordion.Content>
          </Accordion.Item>
        ))}
      </Accordion.Root>
    </section>
  );
}

const settingsTabs = [
  {
    id: "account",
    label: "Account",
    title: "Account Settings",
    body: "Manage your account information and preferences.",
  },
  {
    id: "security",
    label: "Security",
    title: "Security Settings",
    body: "Configure two-factor authentication and password settings.",
  },
  {
    id: "notifications",
    label: "Notifications",
    title: "Notification Preferences",
    body: "Choose how and when you want to receive notifications.",
  },
  {
    id: "billing",
    label: "Billing",
    title: "Billing Information",
    body: "View and manage your subscription and payment methods.",
  },
];

function TabsSegmented() {
  return (
    <section className="flex flex-col gap-4">
      <Heading
        eyebrow="Tabs 01"
        title="Segmented"
        description="Pill-style indicator slides between triggers; separators fade out on the active tab."
      />
      <Tabs.Root defaultValue="account" className="w-full max-w-xl">
        <Tabs.Container>
          <Tabs.List
            aria-label="Settings sections"
            className="rounded-full bg-neutral-100 p-1"
          >
            {settingsTabs.map((tab) => (
              <Tabs.Trigger key={tab.id} id={tab.id} className="flex-1">
                <Tabs.Separator />
                {tab.label}
                <Tabs.Indicator className="rounded-full bg-white shadow-sm ring-1 ring-black/5" />
              </Tabs.Trigger>
            ))}
          </Tabs.List>
        </Tabs.Container>
        {settingsTabs.map((tab) => (
          <Tabs.Content key={tab.id} id={tab.id} className="px-1 py-4">
            <h3 className="mb-1 font-semibold text-neutral-900">{tab.title}</h3>
            <p className="text-sm text-neutral-500">{tab.body}</p>
          </Tabs.Content>
        ))}
      </Tabs.Root>
    </section>
  );
}

function TabsVertical() {
  return (
    <section className="flex flex-col gap-4">
      <Heading
        eyebrow="Tabs 02"
        title="Vertical"
        description="Arrow Up/Down navigate when the list is vertical; the indicator animates between rows."
      />
      <Tabs.Root
        orientation="vertical"
        defaultValue="account"
        className="w-full max-w-lg rounded-2xl border border-neutral-200 bg-white p-2"
      >
        <Tabs.Container>
          <Tabs.List
            aria-label="Vertical tabs"
            className="w-44 gap-1 rounded-xl bg-neutral-50 p-1"
          >
            {settingsTabs.map((tab) => (
              <Tabs.Trigger
                key={tab.id}
                id={tab.id}
                className="h-9 w-full justify-start px-3"
              >
                {tab.label}
                <Tabs.Indicator className="rounded-lg bg-white shadow-sm ring-1 ring-black/5" />
              </Tabs.Trigger>
            ))}
          </Tabs.List>
        </Tabs.Container>
        {settingsTabs.map((tab) => (
          <Tabs.Content key={tab.id} id={tab.id} className="flex-1 px-4 py-2">
            <h3 className="mb-1 font-semibold text-neutral-900">{tab.title}</h3>
            <p className="text-sm text-neutral-500">{tab.body}</p>
          </Tabs.Content>
        ))}
      </Tabs.Root>
    </section>
  );
}

type Logo = {
  name: string;
  fill: string;
  draw: (id: string) => React.ReactNode;
};

const logos: Logo[] = [
  {
    name: "Orbit",
    fill: "#6366F1",
    draw: (id) => <circle cx="32" cy="32" r="18" fill={`url(#${id})`} />,
  },
  {
    name: "Slate",
    fill: "#0EA5E9",
    draw: (id) => (
      <rect x="14" y="14" width="36" height="36" rx="8" fill={`url(#${id})`} />
    ),
  },
  {
    name: "Prism",
    fill: "#F59E0B",
    draw: (id) => <polygon points="32,12 54,50 10,50" fill={`url(#${id})`} />,
  },
  {
    name: "Hex",
    fill: "#10B981",
    draw: (id) => (
      <polygon
        points="32,10 52,22 52,42 32,54 12,42 12,22"
        fill={`url(#${id})`}
      />
    ),
  },
  {
    name: "Nova",
    fill: "#EF4444",
    draw: (id) => (
      <polygon
        points="32,8 38,26 56,26 41,38 47,56 32,45 17,56 23,38 8,26 26,26"
        fill={`url(#${id})`}
      />
    ),
  },
  {
    name: "Plus",
    fill: "#8B5CF6",
    draw: (id) => (
      <path d="M26 10h12v16h16v12H38v16H26V38H10V26h16z" fill={`url(#${id})`} />
    ),
  },
  {
    name: "Kite",
    fill: "#EC4899",
    draw: (id) => (
      <polygon points="32,8 56,32 32,56 8,32" fill={`url(#${id})`} />
    ),
  },
  {
    name: "Halo",
    fill: "#14B8A6",
    draw: (id) => (
      <>
        <circle cx="32" cy="32" r="20" fill={`url(#${id})`} />
        <circle cx="32" cy="32" r="10" fill="white" />
      </>
    ),
  },
  {
    name: "Wave",
    fill: "#F97316",
    draw: (id) => (
      <path
        d="M10 40c8-20 16-20 22-12s14 8 22-12v32H10z"
        fill={`url(#${id})`}
      />
    ),
  },
  {
    name: "Chevron",
    fill: "#22C55E",
    draw: (id) => (
      <path d="M16 14h12l20 18-20 18H16l20-18z" fill={`url(#${id})`} />
    ),
  },
];

function LogoMark({ logo }: { logo: Logo }) {
  const gradId = `swappable-grad-${logo.name.toLowerCase()}`;
  return (
    <div className="flex h-full w-full items-center justify-center gap-3 rounded-xl border border-neutral-200 bg-white px-5 py-4">
      <svg viewBox="0 0 64 64" className="size-10 shrink-0" aria-hidden="true">
        <title>{logo.name}</title>
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={logo.fill} stopOpacity="0.95" />
            <stop offset="100%" stopColor={logo.fill} stopOpacity="0.7" />
          </linearGradient>
        </defs>
        {logo.draw(gradId)}
      </svg>
      <span className="text-sm font-semibold tracking-tight text-neutral-800">
        {logo.name}
      </span>
    </div>
  );
}

function SwappableLogoWall() {
  return (
    <section className="flex flex-col gap-4">
      <Heading
        eyebrow="Swappable 01"
        title="Single row, responsive cols"
        description="One row, more columns as the viewport grows. Defaults: 2s–5s interval, scale + fade transition."
      />
      <Swappable.Root
        items={logos}
        rows={1}
        cols={{ base: 2, sm: 3, md: 4, lg: 5 }}
        className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4"
      >
        <Swappable.Grid<Logo> className="gap-3">
          {(logo) => (
            <Swappable.Item>
              <LogoMark logo={logo} />
            </Swappable.Item>
          )}
        </Swappable.Grid>
      </Swappable.Root>
    </section>
  );
}

function SwappableLogoGrid() {
  return (
    <section className="flex flex-col gap-4">
      <Heading
        eyebrow="Swappable 02"
        title="Two-row grid, pause on hover"
        description="2 × 4 visible at md+; rotation pauses while the grid is hovered or focused."
      />
      <Swappable.Root
        items={logos}
        rows={2}
        cols={{ base: 2, sm: 3, md: 4 }}
        rotationInterval={{ min: 1500, max: 3500 }}
        pauseOnHover
        className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4"
      >
        <Swappable.Grid<Logo> className="gap-3">
          {(logo) => (
            <Swappable.Item>
              <LogoMark logo={logo} />
            </Swappable.Item>
          )}
        </Swappable.Grid>
      </Swappable.Root>
    </section>
  );
}

function SwappableLogoFast() {
  return (
    <section className="flex flex-col gap-4">
      <Heading
        eyebrow="Swappable 03"
        title="Custom transition"
        description="Faster cadence with a custom blur + slide-up motion variant overriding the default."
      />
      <Swappable.Root
        items={logos}
        rows={1}
        cols={{ base: 2, sm: 4, lg: 6 }}
        rotationInterval={{ min: 700, max: 1600 }}
        initial={{ opacity: 0, y: 16, filter: "blur(6px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        exit={{ opacity: 0, y: -16, filter: "blur(6px)" }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4"
      >
        <Swappable.Grid<Logo> className="gap-3">
          {(logo) => (
            <Swappable.Item>
              <LogoMark logo={logo} />
            </Swappable.Item>
          )}
        </Swappable.Grid>
      </Swappable.Root>
    </section>
  );
}
