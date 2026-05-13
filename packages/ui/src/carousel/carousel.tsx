"use client";

import Autoplay, { type AutoplayOptionsType } from "embla-carousel-autoplay";
import useEmblaCarousel, {
  type UseEmblaCarouselType,
} from "embla-carousel-react";
import react from "react";

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

const CarouselContext = react.createContext<CarouselContextValue | null>(null);

/**
 * Returns Embla handles and scroll helpers from the nearest `Carousel.Root`.
 * Must be used from a descendant of `Carousel.Root`.
 */
function useCarousel() {
  const ctx = react.useContext(CarouselContext);
  if (!ctx) {
    throw new Error(
      "Carousel sub-components must be rendered inside <Carousel.Root>.",
    );
  }
  return ctx;
}

function useIsSelectedSnap(index: number | undefined): boolean {
  const { emblaApi } = useCarousel();
  const [selected, setSelected] = react.useState(() => index === 0);
  react.useEffect(() => {
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

function useCanScroll(direction: "prev" | "next"): boolean {
  const { emblaApi } = useCarousel();
  const [can, setCan] = react.useState(false);
  react.useEffect(() => {
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

function useScrollSnaps(): number[] {
  const { emblaApi } = useCarousel();
  const [snaps, setSnaps] = react.useState<number[]>([]);
  react.useEffect(() => {
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

interface CarouselRootProps extends react.ComponentPropsWithoutRef<"div"> {
  /**
   * Optional Embla carousel options.
   *
   * @see https://www.embla-carousel.com/docs/api/options
   */
  options?: EmblaOptions;
  /**
   * Optional Embla carousel plugins.
   *
   * @see https://www.embla-carousel.com/docs/plugins
   */
  plugins?: EmblaPlugins;
  /**
   * Autoplay configuration. Defaults to `true` (autoplay enabled with the
   * plugin's defaults). Pass `false` to disable, or an options object to
   * override individual settings. If you supply your own `Autoplay()` instance
   * via the `plugins` prop, it takes precedence and this prop is ignored.
   *
   * @default true
   */
  autoplay?: CarouselAutoplay;
  /**
   * Callback function that is called when the Embla API changes.
   *
   * @param api - The new Embla API.
   */
  onApiChange?: (api: EmblaApi) => void;
}

const Root = react.forwardRef<HTMLDivElement, CarouselRootProps>(
  function CarouselRoot(
    { options, plugins, autoplay = true, onApiChange, children, ...rest },
    ref,
  ) {
    const resolvedPlugins = react.useMemo(() => {
      const list = plugins ? [...plugins] : [];
      const userHasAutoplay = list.some((p) => p?.name === "autoplay");
      if (autoplay !== false && !userHasAutoplay) {
        list.push(Autoplay(typeof autoplay === "object" ? autoplay : {}));
      }
      return list;
    }, [plugins, autoplay]);

    const [emblaRef, emblaApi] = useEmblaCarousel(options, resolvedPlugins);

    const scrollPrev = react.useCallback(
      () => emblaApi?.scrollPrev(),
      [emblaApi],
    );
    const scrollNext = react.useCallback(
      () => emblaApi?.scrollNext(),
      [emblaApi],
    );
    const scrollTo = react.useCallback(
      (index: number) => emblaApi?.scrollTo(index),
      [emblaApi],
    );

    react.useEffect(() => {
      if (!emblaApi) return;
      if (autoplay === false) return;
      emblaApi.plugins().autoplay?.play();
    }, [emblaApi, autoplay]);

    react.useEffect(() => {
      onApiChange?.(emblaApi);
    }, [emblaApi, onApiChange]);

    const contextValue = react.useMemo<CarouselContextValue>(
      () => ({ emblaRef, emblaApi, scrollPrev, scrollNext, scrollTo }),
      [emblaRef, emblaApi, scrollPrev, scrollNext, scrollTo],
    );

    return (
      <CarouselContext.Provider value={contextValue}>
        <div ref={ref} data-slot="carousel-root" {...rest}>
          {children}
        </div>
      </CarouselContext.Provider>
    );
  },
);

const Viewport = react.forwardRef<
  HTMLDivElement,
  react.ComponentPropsWithoutRef<"div">
>(function CarouselViewport({ children, ...rest }, ref) {
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
});

const Container = react.forwardRef<
  HTMLDivElement,
  react.ComponentPropsWithoutRef<"div">
>(function CarouselContainer(props, ref) {
  return <div ref={ref} data-slot="carousel-container" {...props} />;
});

interface CarouselSlideProps extends react.ComponentPropsWithoutRef<"div"> {
  index?: number;
}

const Slide = react.forwardRef<HTMLDivElement, CarouselSlideProps>(
  function CarouselSlide({ index, ...rest }, ref) {
    const isActive = useIsSelectedSnap(index);
    return (
      // biome-ignore lint/a11y/useSemanticElements: we need to use a div to be able to use the data-state attribute
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

const Previous = react.forwardRef<
  HTMLButtonElement,
  react.ComponentPropsWithoutRef<"button">
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
      onClick={(event: react.MouseEvent<HTMLButtonElement>) => {
        onClick?.(event);
        if (!event.defaultPrevented) scrollPrev();
      }}
      {...rest}
    />
  );
});

const Next = react.forwardRef<
  HTMLButtonElement,
  react.ComponentPropsWithoutRef<"button">
>(function CarouselNext({ onClick, disabled, type, ...rest }, ref) {
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
      onClick={(event: react.MouseEvent<HTMLButtonElement>) => {
        onClick?.(event);
        if (!event.defaultPrevented) scrollNext();
      }}
      {...rest}
    />
  );
});

interface CarouselNavigationProps
  extends Omit<react.ComponentPropsWithoutRef<"nav">, "children"> {
  /**
   * Custom children for full control over item rendering. When provided, the
   * default per-snap `NavigationItem` list is replaced. When omitted, one
   * `NavigationItem` is rendered per scroll snap.
   */
  children?: react.ReactNode;
}

const Navigation = react.forwardRef<HTMLElement, CarouselNavigationProps>(
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
  extends react.ComponentPropsWithoutRef<"button"> {
  index: number;
}

const NavigationItem = react.forwardRef<
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
      onClick={(event: react.MouseEvent<HTMLButtonElement>) => {
        onClick?.(event);
        if (!event.defaultPrevented) scrollTo(index);
      }}
      {...rest}
    >
      {children}
    </button>
  );
});

type CarouselComposition = {
  /**
   * Root component for the Carousel.
   *
   * @example
   *
   * ```tsx
   * <Carousel.Root>
   *   <Carousel.Viewport>
   *     <Carousel.Container>
   *       <Carousel.Slide>
   *         <div>Slide 1</div>
   *         <div>Slide 2</div>
   *         <div>Slide 3</div>
   *         { ... }
   *       </Carousel.Slide>
   *     </Carousel.Container>
   *   </Carousel.Viewport>
   * </Carousel.Root>
   * ```
   */
  Root: typeof Root;
  /**
   * Viewport component for the Carousel.
   */
  Viewport: typeof Viewport;
  /**
   * Container component for the Carousel.
   */
  Container: typeof Container;
  /**
   * Slide component for the Carousel.
   *
   * Use for the individual slides of the Carousel.
   */
  Slide: typeof Slide;
  /**
   * Previous button for navigating to the previous slide.
   */
  Previous: typeof Previous;
  /**
   * Next button for navigating to the next slide.
   */
  Next: typeof Next;
  /**
   * Navigation wrapper for custom or default per-snap items.
   *
   * @example
   *
   * ```tsx
   * <Carousel.Navigation>
   *   <Carousel.NavigationItem index={0} />
   *   <Carousel.NavigationItem index={1} />
   *   <Carousel.NavigationItem index={2} />
   * </Carousel.Navigation>
   * ```
   */
  Navigation: typeof Navigation;
  /**
   * Button that jumps to a specific slide index.
   */
  NavigationItem: typeof NavigationItem;
};

export const Carousel: CarouselComposition = {
  Root,
  Viewport,
  Container,
  Slide,
  Previous,
  Next,
  Navigation,
  NavigationItem,
};

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
export { useCarousel };
