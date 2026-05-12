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

/**
 * Subscribes to embla events and returns whether the given snap index is the
 * selected one. The component only re-renders on the two transitions
 * (becoming active / becoming inactive), not on every slide change.
 */
function useIsSelectedSnap(index: number | undefined): boolean {
  const { emblaApi } = useCarousel();
  const [selected, setSelected] = useState(() => index === 0);
  useEffect(() => {
    if (!emblaApi || index === undefined) return;
    const update = () => setSelected(emblaApi.selectedScrollSnap() === index);
    update();
    emblaApi.on("select", update);
    emblaApi.on("reInit", update);
    return () => {
      emblaApi.off("select", update);
      emblaApi.off("reInit", update);
    };
  }, [emblaApi, index]);
  return selected;
}

/**
 * Subscribes to embla events for `canScrollPrev`/`canScrollNext`. Components
 * only re-render when the flag actually flips (typically only at the edges).
 */
function useCanScroll(direction: "prev" | "next"): boolean {
  const { emblaApi } = useCarousel();
  const [can, setCan] = useState(false);
  useEffect(() => {
    if (!emblaApi) return;
    const read =
      direction === "prev"
        ? () => emblaApi.canScrollPrev()
        : () => emblaApi.canScrollNext();
    const update = () => setCan(read());
    update();
    emblaApi.on("select", update);
    emblaApi.on("reInit", update);
    return () => {
      emblaApi.off("select", update);
      emblaApi.off("reInit", update);
    };
  }, [emblaApi, direction]);
  return can;
}

/**
 * Subscribes to embla `reInit` for the scroll snap list (the only event that
 * can change snap count/positions).
 */
function useScrollSnaps(): number[] {
  const { emblaApi } = useCarousel();
  const [snaps, setSnaps] = useState<number[]>([]);
  useEffect(() => {
    if (!emblaApi) return;
    const update = () => setSnaps(emblaApi.scrollSnapList());
    update();
    emblaApi.on("reInit", update);
    return () => {
      emblaApi.off("reInit", update);
    };
  }, [emblaApi]);
  return snaps;
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

    const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
    const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
    const scrollTo = useCallback(
      (index: number) => emblaApi?.scrollTo(index),
      [emblaApi],
    );

    useEffect(() => {
      if (!emblaApi) return;
      if (autoplay === false) return;
      emblaApi.plugins().autoplay?.play();
    }, [emblaApi, autoplay]);

    useEffect(() => {
      onApiChange?.(emblaApi);
    }, [emblaApi, onApiChange]);

    const contextValue = useMemo<CarouselContextValue>(
      () => ({ emblaRef, emblaApi, scrollPrev, scrollNext, scrollTo }),
      [emblaRef, emblaApi, scrollPrev, scrollNext, scrollTo],
    );

    return (
      <CarouselContext.Provider value={contextValue}>
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
    const isActive = useIsSelectedSnap(index);
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
  const { scrollPrev } = useCarousel();
  const canScrollPrev = useCanScroll("prev");
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
    const { scrollNext } = useCarousel();
    const canScrollNext = useCanScroll("next");
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
    const scrollSnaps = useScrollSnaps();
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
  const { scrollTo } = useCarousel();
  const selected = useIsSelectedSnap(index);
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
