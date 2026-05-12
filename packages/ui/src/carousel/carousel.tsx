"use client";

import useEmblaCarousel, {
  type UseEmblaCarouselType,
} from "embla-carousel-react";
import {
  type ComponentPropsWithoutRef,
  type MouseEvent,
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

type EmblaRef = UseEmblaCarouselType[0];
type EmblaApi = UseEmblaCarouselType[1];
type EmblaOptions = Parameters<typeof useEmblaCarousel>[0];
type EmblaPlugins = Parameters<typeof useEmblaCarousel>[1];

interface CarouselContextValue {
  emblaRef: EmblaRef;
  emblaApi: EmblaApi;
  selectedIndex: number;
  canScrollPrev: boolean;
  canScrollNext: boolean;
  scrollPrev: () => void;
  scrollNext: () => void;
  scrollTo: (index: number) => void;
}

const CarouselContext = createContext<CarouselContextValue | null>(null);

function useCarousel() {
  const ctx = useContext(CarouselContext);
  if (!ctx) {
    throw new Error(
      "Carousel sub-components must be rendered inside <Carousel.Root>.",
    );
  }
  return ctx;
}

interface CarouselRootProps extends ComponentPropsWithoutRef<"div"> {
  options?: EmblaOptions;
  plugins?: EmblaPlugins;
  onApiChange?: (api: EmblaApi) => void;
}

const Root = forwardRef<HTMLDivElement, CarouselRootProps>(
  function CarouselRoot(
    { options, plugins, onApiChange, children, ...rest },
    ref,
  ) {
    const [emblaRef, emblaApi] = useEmblaCarousel(options, plugins);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [canScrollPrev, setCanScrollPrev] = useState(false);
    const [canScrollNext, setCanScrollNext] = useState(false);

    const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
    const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
    const scrollTo = useCallback(
      (index: number) => emblaApi?.scrollTo(index),
      [emblaApi],
    );

    useEffect(() => {
      if (!emblaApi) return;
      const sync = () => {
        setSelectedIndex(emblaApi.selectedScrollSnap());
        setCanScrollPrev(emblaApi.canScrollPrev());
        setCanScrollNext(emblaApi.canScrollNext());
      };
      sync();
      emblaApi.on("select", sync);
      emblaApi.on("reInit", sync);
      return () => {
        emblaApi.off("select", sync);
        emblaApi.off("reInit", sync);
      };
    }, [emblaApi]);

    useEffect(() => {
      onApiChange?.(emblaApi);
    }, [emblaApi, onApiChange]);

    return (
      <CarouselContext.Provider
        value={{
          emblaRef,
          emblaApi,
          selectedIndex,
          canScrollPrev,
          canScrollNext,
          scrollPrev,
          scrollNext,
          scrollTo,
        }}
      >
        <div
          ref={ref}
          data-slot="carousel-root"
          aria-roledescription="carousel"
          {...rest}
        >
          {children}
        </div>
      </CarouselContext.Provider>
    );
  },
);

const Viewport = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<"div">>(
  function CarouselViewport({ children, ...rest }, ref) {
    const { emblaRef } = useCarousel();
    return (
      <div
        ref={(node) => {
          emblaRef(node);
          if (typeof ref === "function") ref(node);
          else if (ref) ref.current = node;
        }}
        data-slot="carousel-viewport"
        {...rest}
      >
        {children}
      </div>
    );
  },
);

const Container = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<"div">>(
  function CarouselContainer(props, ref) {
    return <div ref={ref} data-slot="carousel-container" {...props} />;
  },
);

interface CarouselSlideProps extends ComponentPropsWithoutRef<"div"> {
  index?: number;
}

const Slide = forwardRef<HTMLDivElement, CarouselSlideProps>(
  function CarouselSlide({ index, ...rest }, ref) {
    const { selectedIndex } = useCarousel();
    const isActive = index !== undefined && index === selectedIndex;
    return (
      <div
        ref={ref}
        role="group"
        aria-roledescription="slide"
        data-slot="carousel-slide"
        data-state={isActive ? "active" : "inactive"}
        {...rest}
      />
    );
  },
);

const Previous = forwardRef<
  HTMLButtonElement,
  ComponentPropsWithoutRef<"button">
>(function CarouselPrevious({ onClick, disabled, type, ...rest }, ref) {
  const { scrollPrev, canScrollPrev } = useCarousel();
  return (
    <button
      ref={ref}
      type={type ?? "button"}
      data-slot="carousel-previous"
      data-disabled={!canScrollPrev}
      aria-label="Previous slide"
      disabled={disabled ?? !canScrollPrev}
      onClick={(event: MouseEvent<HTMLButtonElement>) => {
        onClick?.(event);
        if (!event.defaultPrevented) scrollPrev();
      }}
      {...rest}
    />
  );
});

const Next = forwardRef<HTMLButtonElement, ComponentPropsWithoutRef<"button">>(
  function CarouselNext({ onClick, disabled, type, ...rest }, ref) {
    const { scrollNext, canScrollNext } = useCarousel();
    return (
      <button
        ref={ref}
        type={type ?? "button"}
        data-slot="carousel-next"
        data-disabled={!canScrollNext}
        aria-label="Next slide"
        disabled={disabled ?? !canScrollNext}
        onClick={(event: MouseEvent<HTMLButtonElement>) => {
          onClick?.(event);
          if (!event.defaultPrevented) scrollNext();
        }}
        {...rest}
      />
    );
  },
);

export const Carousel = {
  Root,
  Viewport,
  Container,
  Slide,
  Previous,
  Next,
};

export { useCarousel };
export type {
  CarouselRootProps,
  CarouselSlideProps,
  EmblaApi as CarouselApi,
  EmblaOptions as CarouselOptions,
  EmblaPlugins as CarouselPlugins,
};
