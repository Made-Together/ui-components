"use client";

import { continuous, NumberFlow } from "@togetheragency/ui/number-flow";
import { useEffect, useState } from "react";

function useTicker(values: readonly number[], intervalMs = 2000) {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % values.length);
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [values.length, intervalMs]);
  return values[index] ?? values[0] ?? 0;
}

const showcaseClassName =
  "flex w-full items-center justify-center rounded-2xl border border-border bg-background p-10 text-5xl font-semibold tabular-nums";

export function BasicNumberFlowExample() {
  const value = useTicker([1234, 42, 987_654, 0, 123]);
  return (
    <div className={showcaseClassName}>
      <NumberFlow.Root value={value} />
    </div>
  );
}

export function CurrencyNumberFlowExample() {
  const value = useTicker([19.99, 49, 124.5, 9.95, 199]);
  return (
    <div className={showcaseClassName}>
      <NumberFlow.Root
        value={value}
        format={{ style: "currency", currency: "USD" }}
        suffix="/mo"
      />
    </div>
  );
}

export function CompactNumberFlowExample() {
  const value = useTicker([1234, 56_789, 1_234_567, 89_000_000]);
  return (
    <div className={showcaseClassName}>
      <NumberFlow.Root value={value} format={{ notation: "compact" }} />
    </div>
  );
}

export function TrendNumberFlowExample() {
  const value = useTicker([20, 35, 17, 88, 4]);
  return (
    <div className={showcaseClassName}>
      <NumberFlow.Root value={value} trend={0} />
    </div>
  );
}

export function ContinuousNumberFlowExample() {
  const value = useTicker([120, 480, 32, 999]);
  return (
    <div className={showcaseClassName}>
      <NumberFlow.Root value={value} plugins={[continuous]} />
    </div>
  );
}

export function GroupNumberFlowExample() {
  const idx = useTicker([0, 1, 2, 3]);
  const prices = [124.23, 218.94, 87.05, 1_204.6] as const;
  const deltas = [0.0564, -0.0218, 0.1342, -0.0091] as const;
  const price = prices[idx] ?? 0;
  const delta = deltas[idx] ?? 0;

  return (
    <div
      className={`${showcaseClassName} flex-col gap-2 text-4xl`}
    >
      <NumberFlow.Group>
        <NumberFlow.Root
          value={price}
          format={{ style: "currency", currency: "USD" }}
        />
        <NumberFlow.Root
          value={delta}
          format={{
            style: "percent",
            maximumFractionDigits: 2,
            signDisplay: "exceptZero",
          }}
          className={`text-2xl ${
            delta >= 0 ? "text-emerald-500" : "text-red-500"
          }`}
        />
      </NumberFlow.Group>
    </div>
  );
}
