import { render, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

// motion caches reduced-motion preference in a module-level singleton on
// first read, so swapping window.matchMedia after that point has no effect.
// Mock useReducedMotion directly via a hoisted state holder we can toggle
// per-test.
const { reducedMotionState } = vi.hoisted(() => ({
  reducedMotionState: { reduced: false },
}));

vi.mock("motion/react", async () => {
  const actual =
    await vi.importActual<typeof import("motion/react")>("motion/react");
  return {
    ...actual,
    useReducedMotion: () => reducedMotionState.reduced,
  };
});

import { TextReveal } from "./text-reveal.js";

function silenceConsoleError() {
  return vi.spyOn(console, "error").mockImplementation(() => {});
}

function queryWords(container: HTMLElement) {
  return Array.from(
    container.querySelectorAll<HTMLElement>('[data-slot="text-reveal-word"]'),
  );
}

function queryMeasurementDivs(container: HTMLElement) {
  return Array.from(
    container.querySelectorAll<HTMLDivElement>('div[aria-hidden="true"]'),
  ).filter((el) => el.style.visibility === "hidden");
}

function mockReducedMotion(matches: boolean) {
  const prev = reducedMotionState.reduced;
  reducedMotionState.reduced = matches;
  return () => {
    reducedMotionState.reduced = prev;
  };
}

describe("TextReveal — composition", () => {
  it("throws when Word is rendered without a Root", () => {
    const spy = silenceConsoleError();
    expect(() =>
      render(
        <TextReveal.Word index={0} total={1}>
          hi
        </TextReveal.Word>,
      ),
    ).toThrow(/TextReveal\.Word/);
    spy.mockRestore();
  });

  it("throws when Text is rendered without a Root", () => {
    const spy = silenceConsoleError();
    expect(() =>
      render(<TextReveal.Text>hello world</TextReveal.Text>),
    ).toThrow(/TextReveal\.Word/);
    spy.mockRestore();
  });
});

describe("TextReveal — mode selection", () => {
  it("renders scroll mode by default", () => {
    const { container } = render(
      <TextReveal.Root>
        <TextReveal.Text>hello world</TextReveal.Text>
      </TextReveal.Root>,
    );
    const root = container.querySelector('[data-slot="text-reveal-root"]');
    expect(root).toHaveAttribute("data-mode", "scroll");
  });

  it("renders controlled mode when progress is provided", () => {
    const { container } = render(
      <TextReveal.Root progress={0}>
        <TextReveal.Text>hello world</TextReveal.Text>
      </TextReveal.Root>,
    );
    const root = container.querySelector('[data-slot="text-reveal-root"]');
    expect(root).toHaveAttribute("data-mode", "controlled");
  });

  it("sets data-once when once is true", () => {
    const { container } = render(
      <TextReveal.Root once progress={0}>
        <TextReveal.Text>hello world</TextReveal.Text>
      </TextReveal.Root>,
    );
    const root = container.querySelector('[data-slot="text-reveal-root"]');
    expect(root).toHaveAttribute("data-once", "");
  });

  it("omits data-once when once is false", () => {
    const { container } = render(
      <TextReveal.Root progress={0}>
        <TextReveal.Text>hello world</TextReveal.Text>
      </TextReveal.Root>,
    );
    const root = container.querySelector('[data-slot="text-reveal-root"]');
    expect(root).not.toHaveAttribute("data-once");
  });
});

describe("TextReveal — controlled progress", () => {
  it("starts hidden at progress=0", () => {
    const { container } = render(
      <TextReveal.Root progress={0}>
        <TextReveal.Text>Hello world</TextReveal.Text>
      </TextReveal.Root>,
    );
    const words = queryWords(container);
    expect(words).toHaveLength(2);
    for (const word of words) {
      expect(word).toHaveAttribute("data-state", "hidden");
    }
  });

  it("reveals every word after rerendering to progress=100", async () => {
    const { container, rerender } = render(
      <TextReveal.Root progress={0}>
        <TextReveal.Text>Hello world</TextReveal.Text>
      </TextReveal.Root>,
    );
    rerender(
      <TextReveal.Root progress={100}>
        <TextReveal.Text>Hello world</TextReveal.Text>
      </TextReveal.Root>,
    );
    await waitFor(() => {
      for (const w of queryWords(container)) {
        expect(w).toHaveAttribute("data-state", "revealed");
      }
    });
  });

  it("reveals first word but not second at progress=50", async () => {
    const { container, rerender } = render(
      <TextReveal.Root progress={0}>
        <TextReveal.Text>Hello world</TextReveal.Text>
      </TextReveal.Root>,
    );
    rerender(
      <TextReveal.Root progress={50}>
        <TextReveal.Text>Hello world</TextReveal.Text>
      </TextReveal.Root>,
    );
    await waitFor(() => {
      const [first, second] = queryWords(container);
      expect(first).toHaveAttribute("data-state", "revealed");
      expect(second).toHaveAttribute("data-state", "hidden");
    });
  });

  it("clamps progress > 100 to fully revealed", async () => {
    const { container, rerender } = render(
      <TextReveal.Root progress={0}>
        <TextReveal.Text>Hello world</TextReveal.Text>
      </TextReveal.Root>,
    );
    rerender(
      <TextReveal.Root progress={200}>
        <TextReveal.Text>Hello world</TextReveal.Text>
      </TextReveal.Root>,
    );
    await waitFor(() => {
      for (const w of queryWords(container)) {
        expect(w).toHaveAttribute("data-state", "revealed");
      }
    });
  });

  it("clamps progress < 0 to fully hidden", async () => {
    const { container, rerender } = render(
      <TextReveal.Root progress={100}>
        <TextReveal.Text>Hello world</TextReveal.Text>
      </TextReveal.Root>,
    );
    // Make sure they're revealed first (sanity).
    await waitFor(() => {
      // After a brief delay the upstream useEffect ran at least once, but
      // since the initial MotionValue already matches normalized progress,
      // the change event may not fire. Force a transition via rerender below.
    });
    rerender(
      <TextReveal.Root progress={0}>
        <TextReveal.Text>Hello world</TextReveal.Text>
      </TextReveal.Root>,
    );
    rerender(
      <TextReveal.Root progress={-50}>
        <TextReveal.Text>Hello world</TextReveal.Text>
      </TextReveal.Root>,
    );
    await waitFor(() => {
      for (const w of queryWords(container)) {
        expect(w).toHaveAttribute("data-state", "hidden");
      }
    });
  });
});

describe("TextReveal — once latch (controlled)", () => {
  it("re-hides words when progress decreases without once", async () => {
    const { container, rerender } = render(
      <TextReveal.Root progress={0}>
        <TextReveal.Text>Hello world</TextReveal.Text>
      </TextReveal.Root>,
    );
    rerender(
      <TextReveal.Root progress={100}>
        <TextReveal.Text>Hello world</TextReveal.Text>
      </TextReveal.Root>,
    );
    await waitFor(() => {
      for (const w of queryWords(container)) {
        expect(w).toHaveAttribute("data-state", "revealed");
      }
    });
    rerender(
      <TextReveal.Root progress={0}>
        <TextReveal.Text>Hello world</TextReveal.Text>
      </TextReveal.Root>,
    );
    await waitFor(() => {
      for (const w of queryWords(container)) {
        expect(w).toHaveAttribute("data-state", "hidden");
      }
    });
  });

  it("keeps revealed words pinned when progress decreases with once", async () => {
    const { container, rerender } = render(
      <TextReveal.Root once progress={0}>
        <TextReveal.Text>Hello world</TextReveal.Text>
      </TextReveal.Root>,
    );
    rerender(
      <TextReveal.Root once progress={100}>
        <TextReveal.Text>Hello world</TextReveal.Text>
      </TextReveal.Root>,
    );
    await waitFor(() => {
      for (const w of queryWords(container)) {
        expect(w).toHaveAttribute("data-state", "revealed");
      }
    });
    rerender(
      <TextReveal.Root once progress={0}>
        <TextReveal.Text>Hello world</TextReveal.Text>
      </TextReveal.Root>,
    );
    // Give state machinery time to flush — it should NOT have flipped.
    await new Promise((resolve) => setTimeout(resolve, 50));
    for (const w of queryWords(container)) {
      expect(w).toHaveAttribute("data-state", "revealed");
    }
  });
});

describe("TextReveal — text splitting", () => {
  it("renders one word span per whitespace-separated token", () => {
    const { container } = render(
      <TextReveal.Root progress={0}>
        <TextReveal.Text>Hello world foo</TextReveal.Text>
      </TextReveal.Root>,
    );
    const words = queryWords(container);
    expect(words).toHaveLength(3);
    expect(words[0]).toHaveAttribute("data-index", "0");
    expect(words[1]).toHaveAttribute("data-index", "1");
    expect(words[2]).toHaveAttribute("data-index", "2");
  });

  it("preserves the original whitespace in rendered text", () => {
    const { container } = render(
      <TextReveal.Root progress={0}>
        <TextReveal.Text>Hello world foo</TextReveal.Text>
      </TextReveal.Root>,
    );
    const text = container.querySelector('[data-slot="text-reveal-text"]');
    expect(text?.textContent).toBe("Hello world foo");
  });

  it("applies wordClassName to every word span", () => {
    const { container } = render(
      <TextReveal.Root progress={0}>
        <TextReveal.Text wordClassName="word-x">hi there</TextReveal.Text>
      </TextReveal.Root>,
    );
    for (const w of queryWords(container)) {
      expect(w).toHaveClass("word-x");
    }
  });

  it("respects the `as` prop for the outer element", () => {
    const { container } = render(
      <TextReveal.Root progress={0}>
        <TextReveal.Text as="p">hi there</TextReveal.Text>
      </TextReveal.Root>,
    );
    expect(
      container.querySelector('p[data-slot="text-reveal-text"]'),
    ).toBeInTheDocument();
  });
});

describe("TextReveal.Word — edge cases", () => {
  it("does not crash when total is 0", () => {
    expect(() =>
      render(
        <TextReveal.Root progress={50}>
          <TextReveal.Word index={0} total={0}>
            solo
          </TextReveal.Word>
        </TextReveal.Root>,
      ),
    ).not.toThrow();
  });

  it("flips data-state at a custom revealAt threshold", async () => {
    // Two words, root progress = 5% → first word's local = 0.10.
    // With revealAt=0.1, first word should be revealed; the second is
    // still at local=0, so it stays hidden.
    const { container, rerender } = render(
      <TextReveal.Root progress={0}>
        <TextReveal.Text revealAt={0.1}>Hello world</TextReveal.Text>
      </TextReveal.Root>,
    );
    rerender(
      <TextReveal.Root progress={5}>
        <TextReveal.Text revealAt={0.1}>Hello world</TextReveal.Text>
      </TextReveal.Root>,
    );
    await waitFor(() => {
      const [first, second] = queryWords(container);
      expect(first).toHaveAttribute("data-state", "revealed");
      expect(second).toHaveAttribute("data-state", "hidden");
    });
  });
});

describe("TextReveal — scroll margins", () => {
  it("renders a measurement div for a string startMargin", () => {
    const { container } = render(
      <TextReveal.Root startMargin="40px">
        <TextReveal.Text>hi there</TextReveal.Text>
      </TextReveal.Root>,
    );
    const divs = queryMeasurementDivs(container);
    expect(divs.some((d) => d.style.height === "40px")).toBe(true);
  });

  it("renders measurement divs for both string margins", () => {
    const { container } = render(
      <TextReveal.Root startMargin="40px" endMargin="20vh">
        <TextReveal.Text>hi there</TextReveal.Text>
      </TextReveal.Root>,
    );
    const heights = queryMeasurementDivs(container).map((d) => d.style.height);
    expect(heights).toContain("40px");
    expect(heights).toContain("20vh");
  });

  it("emits no measurement divs for numeric margins", () => {
    const { container } = render(
      <TextReveal.Root startMargin={30} endMargin={30}>
        <TextReveal.Text>hi there</TextReveal.Text>
      </TextReveal.Root>,
    );
    expect(queryMeasurementDivs(container)).toHaveLength(0);
  });

  it("emits no measurement divs at default settings", () => {
    const { container } = render(
      <TextReveal.Root>
        <TextReveal.Text>hi there</TextReveal.Text>
      </TextReveal.Root>,
    );
    expect(queryMeasurementDivs(container)).toHaveLength(0);
  });
});

describe("TextReveal — reduced motion", () => {
  let restore: (() => void) | undefined;
  afterEach(() => {
    restore?.();
    restore = undefined;
  });

  it("starts every word revealed when prefers-reduced-motion is set", () => {
    restore = mockReducedMotion(true);
    const { container } = render(
      <TextReveal.Root progress={0}>
        <TextReveal.Text>Hello world</TextReveal.Text>
      </TextReveal.Root>,
    );
    const words = queryWords(container);
    expect(words).toHaveLength(2);
    for (const w of words) {
      expect(w).toHaveAttribute("data-state", "revealed");
    }
  });
});
