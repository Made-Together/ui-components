import { render, screen } from "@testing-library/react";
import type { ComponentProps } from "react";
import { describe, expect, it, vi } from "vitest";
import {
  Carousel,
  type CarouselApi,
  type CarouselPlugins,
} from "./carousel.js";

function silenceConsoleError() {
  return vi.spyOn(console, "error").mockImplementation(() => {});
}

function FullCarousel({
  count = 3,
  ...rootProps
}: ComponentProps<typeof Carousel.Root> & { count?: number }) {
  return (
    <Carousel.Root autoplay={false} {...rootProps}>
      <Carousel.Viewport>
        <Carousel.Container>
          {Array.from({ length: count }).map((_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: stable test fixture
            <Carousel.Slide key={i} index={i}>
              Slide {i + 1}
            </Carousel.Slide>
          ))}
        </Carousel.Container>
      </Carousel.Viewport>
      <Carousel.Previous>Prev</Carousel.Previous>
      <Carousel.Next>Next</Carousel.Next>
      <Carousel.Navigation />
    </Carousel.Root>
  );
}

function makeMockAutoplay() {
  const play = vi.fn();
  const stop = vi.fn();
  const reset = vi.fn();
  const isPlaying = vi.fn(() => false);
  const plugin = {
    name: "autoplay",
    options: {},
    init: vi.fn(),
    destroy: vi.fn(),
    play,
    stop,
    reset,
    isPlaying,
  };
  return { plugin, play, stop, reset };
}

describe("Carousel — context / composition integrity", () => {
  it("renders Carousel.Root without a Viewport without crashing", () => {
    expect(() =>
      render(
        <Carousel.Root autoplay={false} data-testid="root">
          <span>no viewport</span>
        </Carousel.Root>,
      ),
    ).not.toThrow();
    expect(screen.getByTestId("root")).toBeInTheDocument();
  });

  it("fails predictably when Viewport is rendered without a Container", () => {
    const spy = silenceConsoleError();
    expect(() =>
      render(
        <Carousel.Root autoplay={false}>
          <Carousel.Viewport data-testid="vp">empty</Carousel.Viewport>
        </Carousel.Root>,
      ),
    ).toThrow(TypeError);
    spy.mockRestore();
  });

  it("renders an empty Container and disables both navigation buttons", () => {
    render(
      <Carousel.Root autoplay={false}>
        <Carousel.Viewport>
          <Carousel.Container data-testid="container" />
        </Carousel.Viewport>
        <Carousel.Previous>Prev</Carousel.Previous>
        <Carousel.Next>Next</Carousel.Next>
      </Carousel.Root>,
    );
    expect(screen.getByTestId("container")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /previous slide/i }),
    ).toBeDisabled();
    expect(screen.getByRole("button", { name: /next slide/i })).toBeDisabled();
  });

  it("keeps each carousel instance's API isolated when multiple are mounted", () => {
    const onApiA = vi.fn();
    const onApiB = vi.fn();
    render(
      <>
        <FullCarousel count={2} onApiChange={onApiA} data-testid="a" />
        <FullCarousel count={2} onApiChange={onApiB} data-testid="b" />
      </>,
    );
    const apiA = onApiA.mock.calls.at(-1)?.[0] as CarouselApi | undefined;
    const apiB = onApiB.mock.calls.at(-1)?.[0] as CarouselApi | undefined;
    expect(apiA).toBeTruthy();
    expect(apiB).toBeTruthy();
    expect(apiA).not.toBe(apiB);
    expect(screen.getByTestId("a")).not.toBe(screen.getByTestId("b"));
  });

  it("nested carousels resolve consumers to the nearest provider", () => {
    const outerApi = vi.fn();
    const innerApi = vi.fn();
    render(
      <Carousel.Root
        autoplay={false}
        onApiChange={outerApi}
        data-testid="outer"
      >
        <Carousel.Viewport>
          <Carousel.Container>
            <Carousel.Slide index={0}>
              <Carousel.Root
                autoplay={false}
                onApiChange={innerApi}
                data-testid="inner"
              >
                <Carousel.Viewport>
                  <Carousel.Container>
                    <Carousel.Slide index={0}>inner</Carousel.Slide>
                  </Carousel.Container>
                </Carousel.Viewport>
              </Carousel.Root>
            </Carousel.Slide>
          </Carousel.Container>
        </Carousel.Viewport>
      </Carousel.Root>,
    );
    const outer = outerApi.mock.calls.at(-1)?.[0];
    const inner = innerApi.mock.calls.at(-1)?.[0];
    expect(outer).toBeTruthy();
    expect(inner).toBeTruthy();
    expect(outer).not.toBe(inner);
  });
});

describe("Carousel — initialization & lifecycle", () => {
  it("renders Previous/Next safely on initial mount and leaves them disabled with no slides", () => {
    expect(() =>
      render(
        <Carousel.Root autoplay={false}>
          <Carousel.Previous>Prev</Carousel.Previous>
          <Carousel.Next>Next</Carousel.Next>
        </Carousel.Root>,
      ),
    ).not.toThrow();
    expect(
      screen.getByRole("button", { name: /previous slide/i }),
    ).toBeDisabled();
    expect(screen.getByRole("button", { name: /next slide/i })).toBeDisabled();
  });

  it("calls onApiChange with the resolved Embla API exposing scroll methods", () => {
    const onApiChange = vi.fn();
    render(<FullCarousel onApiChange={onApiChange} />);
    expect(onApiChange).toHaveBeenCalled();
    const api = onApiChange.mock.calls.at(-1)?.[0] as CarouselApi | undefined;
    expect(api).toBeTruthy();
    expect(typeof api?.scrollNext).toBe("function");
    expect(typeof api?.scrollPrev).toBe("function");
    expect(typeof api?.scrollTo).toBe("function");
  });

  it("passes the latest API to onApiChange when options change (reinit)", () => {
    const onApiChange = vi.fn();
    const { rerender } = render(
      <FullCarousel onApiChange={onApiChange} options={{ loop: false }} />,
    );
    const initialApi = onApiChange.mock.calls.at(-1)?.[0];
    rerender(
      <FullCarousel onApiChange={onApiChange} options={{ loop: true }} />,
    );
    const latestApi = onApiChange.mock.calls.at(-1)?.[0];
    expect(latestApi).toBeTruthy();
    expect((latestApi as CarouselApi)?.internalEngine()?.options.loop).toBe(
      true,
    );
    expect(latestApi).toBe(initialApi);
  });

  it("removes Embla event listeners on unmount", () => {
    const onApiChange = vi.fn();
    const { unmount } = render(<FullCarousel onApiChange={onApiChange} />);
    const api = onApiChange.mock.calls.at(-1)?.[0] as CarouselApi | undefined;
    expect(api).toBeTruthy();
    if (!api) return;
    const offSpy = vi.spyOn(api, "off");
    unmount();
    expect(offSpy).toHaveBeenCalledWith("select", expect.any(Function));
    expect(offSpy).toHaveBeenCalledWith("reInit", expect.any(Function));
  });

  it("re-renders without throwing when options change", () => {
    const { rerender } = render(
      <FullCarousel options={{ loop: false, align: "start" }} />,
    );
    expect(() =>
      rerender(<FullCarousel options={{ loop: true, align: "center" }} />),
    ).not.toThrow();
  });

  it("re-renders with changed plugins without duplicating them by name", () => {
    const a = makeMockAutoplay();
    const b = makeMockAutoplay();
    const onApiChange = vi.fn();
    const { rerender } = render(
      <FullCarousel
        autoplay={false}
        plugins={[a.plugin] as unknown as CarouselPlugins}
        onApiChange={onApiChange}
      />,
    );
    rerender(
      <FullCarousel
        autoplay={false}
        plugins={[b.plugin] as unknown as CarouselPlugins}
        onApiChange={onApiChange}
      />,
    );
    const api = onApiChange.mock.calls.at(-1)?.[0] as CarouselApi | undefined;
    const pluginMap = api?.plugins() ?? {};
    const namedAutoplays = Object.keys(pluginMap).filter(
      (k) => k === "autoplay",
    );
    expect(namedAutoplays).toHaveLength(1);
  });

  it("switching autoplay from true to false stops triggering autoplay.play()", () => {
    const { plugin, play } = makeMockAutoplay();
    const plugins = [plugin] as unknown as CarouselPlugins;
    const { rerender } = render(
      <FullCarousel autoplay={true} plugins={plugins} />,
    );
    expect(play).toHaveBeenCalled();
    const callsAfterTrue = play.mock.calls.length;
    rerender(<FullCarousel autoplay={false} plugins={plugins} />);
    expect(play.mock.calls.length).toBe(callsAfterTrue);
  });

  it("switching autoplay from false to true triggers autoplay.play()", () => {
    const { plugin, play } = makeMockAutoplay();
    const plugins = [plugin] as unknown as CarouselPlugins;
    const { rerender } = render(
      <FullCarousel autoplay={false} plugins={plugins} />,
    );
    const before = play.mock.calls.length;
    rerender(<FullCarousel autoplay={true} plugins={plugins} />);
    expect(play.mock.calls.length).toBeGreaterThan(before);
  });
});
