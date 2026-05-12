"use client";

import { Carousel } from "@repo/ui/carousel";

const slides = [
  { title: "Aurora", hue: "from-indigo-500 to-fuchsia-500" },
  { title: "Tidepool", hue: "from-cyan-500 to-teal-500" },
  { title: "Ember", hue: "from-amber-500 to-rose-500" },
  { title: "Moss", hue: "from-emerald-500 to-lime-500" },
  { title: "Dusk", hue: "from-slate-700 to-slate-900" },
];

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-16 px-6 py-16">
      <header className="flex flex-col gap-2">
        <span className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-500">
          @repo/ui
        </span>
        <h1 className="text-3xl font-semibold tracking-tight">
          Carousel playground
        </h1>
        <p className="text-sm text-neutral-500">
          Headless composite primitives wrapping embla-carousel. Styling is
          applied here via Tailwind — the library ships none.
        </p>
      </header>

      <BasicCarousel />
      <LoopingCarousel />
      <MultiSlideCarousel />
    </main>
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

function Indicator() {
  return (
    <span className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-400">
      Drag · swipe · click
    </span>
  );
}
