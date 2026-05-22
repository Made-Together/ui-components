"use client";

import { Carousel } from "@togetheragency/ui/carousel";

const slides = Array.from({ length: 5 }, (_, i) => i + 1);

function SimpleSlide({ index }: { index: number }) {
  return (
    <div
      data-slot="card"
      className="flex flex-col gap-4 overflow-hidden rounded-md bg-foreground/10 text-card-foreground"
    >
      <div
        data-slot="card-content"
        className="flex aspect-video items-center justify-center p-6"
      >
        <span className="text-3xl font-semibold">{index + 1}</span>
      </div>
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
      <Carousel.Viewport className="overflow-hidden rounded-md">
        <Carousel.Container className="flex">
          {slides.map((slide, i) => (
            <Carousel.Slide
              key={slide.toString()}
              index={i}
              className="min-w-0 flex-[0_0_100%] pr-3 last:pr-0"
            >
              <SimpleSlide index={i} />
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
              key={slide.toString()}
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
      autoplay={{ delay: 2500 }}
    >
      <Carousel.Viewport className="overflow-hidden rounded-md">
        <Carousel.Container className="flex gap-4">
          {slides.map((slide, i) => (
            <Carousel.Slide
              key={slide.toString()}
              index={i}
              className="min-w-0 flex-[0_0_100%]"
            >
              <SimpleSlide index={i} />
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
            key={slide.toString()}
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
      <Carousel.Viewport className="overflow-hidden rounded-md">
        <Carousel.Container className="flex">
          {slides.map((slide, i) => (
            <Carousel.Slide
              key={slide.toString()}
              index={i}
              className="group min-w-0 flex-[0_0_70%] pr-3"
            >
              <div className="transition-all duration-500 group-data-[state=inactive]:scale-95 group-data-[state=inactive]:opacity-50">
                <SimpleSlide index={i} />
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
  const items = [...slides, ...slides];
  return (
    <Carousel.Root
      autoplay={false}
      className="w-full max-w-2xl"
      options={{ dragFree: true, align: "start" }}
    >
      <Carousel.Viewport className="overflow-hidden">
        <Carousel.Container className="flex">
          {items.map((slide, i) => (
            <Carousel.Slide
              // biome-ignore lint/suspicious/noArrayIndexKey: stable demo fixture
              key={`${slide.toString()}-${i}`}
              index={i}
              className="min-w-0 flex-[0_0_33.333%] pr-3"
            >
              <SimpleSlide index={i} />
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
      <Carousel.Viewport className="overflow-hidden rounded-md">
        <Carousel.Container className="flex">
          {slides.map((slide, i) => (
            <Carousel.Slide
              key={slide.toString()}
              index={i}
              className="min-w-0 flex-[0_0_100%] pr-3"
            >
              <SimpleSlide index={i} />
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
            key={slide.toString()}
            index={i}
            aria-label={`Go to ${slide.toString()}`}
            className="grid size-8 place-items-center rounded-full border border-border text-xs font-medium text-muted-foreground transition hover:border-foreground hover:text-foreground data-[state=active]:border-foreground data-[state=active]:bg-foreground data-[state=active]:text-background"
          >
            {i + 1}
          </Carousel.NavigationItem>
        ))}
      </Carousel.Navigation>
    </Carousel.Root>
  );
}

export function VerticalCarouselExample() {
  return (
    <Carousel.Root
      autoplay={false}
      className="relative w-full max-w-sm"
      options={{ axis: "y", align: "start" }}
    >
      <Carousel.Viewport className="h-72 overflow-hidden rounded-md">
        <Carousel.Container className="flex h-full flex-col">
          {slides.map((slide, i) => (
            <Carousel.Slide
              key={slide.toString()}
              index={i}
              className="min-h-0 flex-[0_0_100%] pb-4 last:pb-0"
            >
              <div
                data-slot="card"
                className="flex h-full items-center justify-center rounded-md text-card-foreground bg-foreground/10"
              >
                <span className="text-3xl font-semibold">{i + 1}</span>
              </div>
            </Carousel.Slide>
          ))}
        </Carousel.Container>
      </Carousel.Viewport>
      <div className="mt-4 flex items-center justify-center gap-2">
        <Carousel.Previous
          aria-label="Previous slide"
          className="grid size-9 place-items-center rounded-full border border-border transition hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-40"
        >
          ↑
        </Carousel.Previous>
        <Carousel.Next
          aria-label="Next slide"
          className="grid size-9 place-items-center rounded-full border border-border transition hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-40"
        >
          ↓
        </Carousel.Next>
      </div>
    </Carousel.Root>
  );
}

export function ResponsiveCarouselExample() {
  const items = [...slides, ...slides];
  return (
    <Carousel.Root
      autoplay={false}
      className="w-full max-w-2xl"
      options={{ align: "start" }}
    >
      <Carousel.Viewport className="overflow-hidden">
        <Carousel.Container className="flex">
          {items.map((slide, i) => (
            <Carousel.Slide
              // biome-ignore lint/suspicious/noArrayIndexKey: stable demo fixture
              key={`${slide.toString()}-${i}`}
              index={i}
              className="min-w-0 shrink-0 grow-0 basis-full pr-3 md:basis-1/2 lg:basis-1/3"
            >
              <SimpleSlide index={i} />
            </Carousel.Slide>
          ))}
        </Carousel.Container>
      </Carousel.Viewport>
    </Carousel.Root>
  );
}
