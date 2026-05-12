"use client";

import Autoplay, {
  type AutoplayOptionsType,
} from "embla-carousel-autoplay";
import useEmblaCarousel, {
  type UseEmblaCarouselType,
} from "embla-carousel-react";
import {
  type ComponentPropsWithoutRef,
  type MouseEvent,
  type ReactNode,
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type EmblaRef = UseEmblaCarouselType[0];
type EmblaApi = UseEmblaCarouselType[1];
type EmblaOptions = Parameters<typeof useEmblaCarousel>[0];
type EmblaPlugins = Parameters<typeof useEmblaCarousel>[1];
type CarouselAutoplay = boolean | AutoplayOptionsType;

interface CarouselContextValue {
  emblaRef: EmblaRef;
  emblaApi: EmblaApi;
  selectedIndex: number;
  scrollSnaps: number[];
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
  /**
   * Autoplay configuration. Defaults to `true` (autoplay enabled with the
   * plugin's defaults). Pass `false` to disable, or an options object to
   * override individual settings. If you supply your own `Autoplay()` instance
   * via the `plugins` prop, it takes precedence and this prop is ignored.
   */
  autoplay?: CarouselAutoplay;
  onApiChange?: (api: EmblaApi) => void;
}

const Root = forwardRef<HTMLDivElement, CarouselRootProps>(
  function CarouselRoot(
    {
      options,
      plugins,
      autoplay = true,
      onApiChange,
      children,
      ...rest
    },
    ref,
  ) {
    const resolvedPlugins = useMemo(() => {
      const list = plugins ? [...plugins] : [];
      const userHasAutoplay = list.some((p) => p?.name === "autoplay");
      if (autoplay !== false && !userHasAutoplay) {
        list.push(Autoplay(typeof autoplay === "object" ? autoplay : {}));
      }
      return list;
    }, [plugins, autoplay]);

    const [emblaRef, emblaApi] = useEmblaCarousel(options, resolvedPlugins);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);
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
        setScrollSnaps(emblaApi.scrollSnapList());
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
      if (!emblaApi) return;
      if (autoplay === false) return;
      emblaApi.plugins().autoplay?.play();
    }, [emblaApi, autoplay]);

    useEffect(() => {
      onApiChange?.(emblaApi);
    }, [emblaApi, onApiChange]);

    return (
      <CarouselContext.Provider
        value={{
          emblaRef,
          emblaApi,
          selectedIndex,
          scrollSnaps,
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

interface CarouselNavigationProps
  extends Omit<ComponentPropsWithoutRef<"nav">, "children"> {
  /**
   * Custom children for full control over item rendering. When provided, the
   * default per-snap `NavigationItem` list is replaced. When omitted, one
   * `NavigationItem` is rendered per scroll snap.
   */
  children?: ReactNode;
}

const Navigation = forwardRef<HTMLElement, CarouselNavigationProps>(
  function CarouselNavigation(
    { children, "aria-label": ariaLabel = "Carousel navigation", ...rest },
    ref,
  ) {
    const { scrollSnaps } = useCarousel();
    return (
      <nav
        ref={ref}
        aria-label={ariaLabel}
        data-slot="carousel-navigation"
        {...rest}
      >
        {children ??
          scrollSnaps.map((_, index) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: snap order is stable per embla reInit
            <NavigationItem key={index} index={index} />
          ))}
      </nav>
    );
  },
);

interface CarouselNavigationItemProps
  extends ComponentPropsWithoutRef<"button"> {
  index: number;
}

const NavigationItem = forwardRef<
  HTMLButtonElement,
  CarouselNavigationItemProps
>(function CarouselNavigationItem(
  { index, onClick, children, type, "aria-label": ariaLabel, ...rest },
  ref,
) {
  const { selectedIndex, scrollTo } = useCarousel();
  const selected = index === selectedIndex;
  return (
    <button
      ref={ref}
      type={type ?? "button"}
      aria-current={selected ? "true" : undefined}
      aria-label={ariaLabel ?? `Go to slide ${index + 1}`}
      data-slot="carousel-navigation-item"
      data-state={selected ? "active" : "inactive"}
      onClick={(event: MouseEvent<HTMLButtonElement>) => {
        onClick?.(event);
        if (!event.defaultPrevented) scrollTo(index);
      }}
      {...rest}
    >
      {children}
    </button>
  );
});

export const Carousel = {
  Root,
  Viewport,
  Container,
  Slide,
  Previous,
  Next,
  Navigation,
  NavigationItem,
};

export { useCarousel };
export type {
  CarouselAutoplay,
  CarouselNavigationItemProps,
  CarouselNavigationProps,
  CarouselRootProps,
  CarouselSlideProps,
  EmblaApi as CarouselApi,
  EmblaOptions as CarouselOptions,
  EmblaPlugins as CarouselPlugins,
};
