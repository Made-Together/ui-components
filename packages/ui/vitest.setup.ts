import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

if (typeof window !== "undefined" && !window.matchMedia) {
  window.matchMedia = (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  });
}

class MockObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
  takeRecords = vi.fn(() => []);
  root = null;
  rootMargin = "";
  thresholds = [];
}

if (typeof window !== "undefined") {
  // biome-ignore lint/suspicious/noExplicitAny: jsdom polyfill
  window.IntersectionObserver ??= MockObserver as any;
  // biome-ignore lint/suspicious/noExplicitAny: jsdom polyfill
  window.ResizeObserver ??= MockObserver as any;
}

afterEach(() => {
  cleanup();
});
