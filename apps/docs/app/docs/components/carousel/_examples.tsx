"use client";

import { Carousel } from "@repo/ui/carousel";

const slides = [
  { title: "Aurora", hue: "from-indigo-500 to-fuchsia-500" },
  { title: "Tidepool", hue: "from-cyan-500 to-teal-500" },
  { title: "Ember", hue: "from-amber-500 to-rose-500" },
  { title: "Moss", hue: "from-emerald-500 to-lime-500" },
  { title: "Dusk", hue: "from-slate-700 to-slate-900" },
];

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

export function BasicCarouselExample() {
  return (
    <Carousel.Root
      autoplay={false}
      className="relative w-full max-w-2xl"
      options={{ align: "start" }}
    >
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

      <div className="mt-4 flex items-center justify-between gap-4">
        <Carousel.Navigation
          aria-label="Featured slides"
          className="flex items-center gap-2"
        >
          {slides.map((slide, i) => (
            <Carousel.NavigationItem
              key={slide.title}
              index={i}
              className="block h-2 w-2 rounded-full bg-neutral-300 transition-[width,background-color] duration-300 data-[state=active]:w-5 data-[state=active]:bg-foreground"
            />
          ))}
        </Carousel.Navigation>
        <div className="flex gap-2">
          <Carousel.Previous className="rounded-full border border-border px-4 py-2 text-sm font-medium transition hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-40">
            Prev
          </Carousel.Previous>
          <Carousel.Next className="rounded-full border border-border px-4 py-2 text-sm font-medium transition hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-40">
            Next
          </Carousel.Next>
        </div>
      </div>
    </Carousel.Root>
  );
}

export function AutoplayCarouselExample() {
  return (
    <Carousel.Root
      className="relative w-full max-w-2xl"
      options={{ loop: true, align: "start" }}
      autoplay={{ delay: 2500, stopOnInteraction: false }}
    >
      <Carousel.Viewport className="overflow-hidden rounded-2xl">
        <Carousel.Container className="flex">
          {slides.map((slide, i) => (
            <Carousel.Slide
              key={slide.title}
              index={i}
              className="min-w-0 flex-[0_0_100%]"
            >
              <SlideCard {...slide} index={i} />
            </Carousel.Slide>
          ))}
        </Carousel.Container>
      </Carousel.Viewport>
      <Carousel.Navigation
        aria-label="Autoplay slides"
        className="mt-4 flex items-center justify-center gap-2"
      >
        {slides.map((slide, i) => (
          <Carousel.NavigationItem
            key={slide.title}
            index={i}
            className="block h-2 w-2 rounded-full bg-neutral-300 transition-[width,background-color] duration-300 data-[state=active]:w-5 data-[state=active]:bg-foreground"
          />
        ))}
      </Carousel.Navigation>
    </Carousel.Root>
  );
}

export function LoopingCarouselExample() {
  return (
    <Carousel.Root
      autoplay={false}
      className="w-full max-w-2xl"
      options={{ loop: true, align: "center" }}
    >
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

      <div className="mt-4 flex items-center justify-center gap-2">
        <Carousel.Previous className="grid size-9 place-items-center rounded-full bg-foreground text-background transition hover:opacity-80">
          ←
        </Carousel.Previous>
        <Carousel.Next className="grid size-9 place-items-center rounded-full bg-foreground text-background transition hover:opacity-80">
          →
        </Carousel.Next>
      </div>
    </Carousel.Root>
  );
}

export function MultiSlideCarouselExample() {
  return (
    <Carousel.Root
      autoplay={false}
      className="w-full max-w-2xl"
      options={{ dragFree: true, align: "start" }}
    >
      <Carousel.Viewport className="overflow-hidden">
        <Carousel.Container className="flex">
          {[...slides, ...slides].map((slide, i) => (
            <Carousel.Slide
              // biome-ignore lint/suspicious/noArrayIndexKey: stable demo fixture
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
  );
}

export function NumberedNavCarouselExample() {
  return (
    <Carousel.Root
      autoplay={false}
      className="w-full max-w-2xl"
      options={{ loop: true }}
    >
      <Carousel.Viewport className="overflow-hidden rounded-2xl">
        <Carousel.Container className="flex">
          {slides.map((slide, i) => (
            <Carousel.Slide
              key={slide.title}
              index={i}
              className="min-w-0 flex-[0_0_100%]"
            >
              <SlideCard {...slide} index={i} />
            </Carousel.Slide>
          ))}
        </Carousel.Container>
      </Carousel.Viewport>
      <Carousel.Navigation
        aria-label="Numbered nav"
        className="mt-4 flex items-center justify-center gap-2"
      >
        {slides.map((slide, i) => (
          <Carousel.NavigationItem
            key={slide.title}
            index={i}
            aria-label={`Go to ${slide.title}`}
            className="grid size-8 place-items-center rounded-full border border-border text-xs font-medium text-muted-foreground transition hover:border-foreground hover:text-foreground data-[state=active]:border-foreground data-[state=active]:bg-foreground data-[state=active]:text-background"
          >
            {i + 1}
          </Carousel.NavigationItem>
        ))}
      </Carousel.Navigation>
    </Carousel.Root>
  );
}
