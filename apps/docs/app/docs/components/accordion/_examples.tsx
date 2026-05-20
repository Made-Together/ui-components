"use client";

import { Accordion } from "@made-together/ui/accordion";
import { useState } from "react";

const faqItems = [
  {
    value: "headless",
    title: "Is the accordion headless?",
    content:
      "Yes. The component ships with semantic markup (ul > li > h3 > button) and ARIA wiring only — visual styling, spacing and transitions are all up to the consumer via className and data-state.",
  },
  {
    value: "a11y",
    title: "What about keyboard support?",
    content:
      "Triggers expose aria-expanded and aria-controls, and the panel is a region labelled by its trigger. Use ArrowDown / ArrowUp to move between triggers, Home jumps to the first, End to the last.",
  },
  {
    value: "controlled",
    title: "Can I control the open state?",
    content:
      "Yes — pass value + onValueChange for controlled usage, or defaultValue to leave the component in charge. Both single (string) and multiple (string[]) modes are supported.",
  },
  {
    value: "animation",
    title: "How do I animate the panel?",
    content:
      'Every part exposes data-state="open" | "closed" so you can drive CSS transitions or motion variants. The default Accordion.Content already animates open/close via grid-template-rows.',
  },
];

function ChevronDown({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <title>Chevron down</title>
      <path d="m5 7.5 5 5 5-5" />
    </svg>
  );
}

export function BasicAccordionExample() {
  return (
    <Accordion.Root
      type="single"
      defaultValue="headless"
      className="w-full max-w-xl divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card"
    >
      {faqItems.map((item) => (
        <Accordion.Item key={item.value} value={item.value}>
          <Accordion.Heading>
            <Accordion.Trigger className="group flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-medium text-foreground hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
              {item.title}
              <Accordion.Indicator className="text-muted-foreground">
                <ChevronDown className="size-4" />
              </Accordion.Indicator>
            </Accordion.Trigger>
          </Accordion.Heading>
          <Accordion.Content className="px-5 text-sm leading-relaxed text-muted-foreground">
            {item.content}
          </Accordion.Content>
        </Accordion.Item>
      ))}
    </Accordion.Root>
  );
}

export function MultipleAccordionExample() {
  return (
    <Accordion.Root
      type="multiple"
      defaultValue={["a11y", "animation"]}
      className="flex w-full max-w-xl flex-col gap-2"
    >
      {faqItems.map((item) => (
        <Accordion.Item
          key={item.value}
          value={item.value}
          className="overflow-hidden rounded-xl bg-card text-foreground ring-1 ring-border data-[state=open]:ring-foreground/20"
        >
          <Accordion.Heading>
            <Accordion.Trigger className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left text-sm font-medium hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              {item.title}
              <Accordion.Indicator className="">
                <ChevronDown className="size-3.5" />
              </Accordion.Indicator>
            </Accordion.Trigger>
          </Accordion.Heading>
          <Accordion.Content className="border-t border-border px-4 text-sm leading-relaxed text-muted-foreground">
            {item.content}
          </Accordion.Content>
        </Accordion.Item>
      ))}
    </Accordion.Root>
  );
}

export function ControlledAccordionExample() {
  const [value, setValue] = useState<string | null>("headless");
  return (
    <div className="flex w-full max-w-xl flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="text-muted-foreground">Open:</span>
        {faqItems.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() =>
              setValue((cur) => (cur === item.value ? null : item.value))
            }
            data-active={value === item.value || undefined}
            className="rounded-full border border-border px-3 py-1 font-medium text-muted-foreground transition hover:text-foreground data-[active]:border-foreground data-[active]:bg-foreground data-[active]:text-background"
          >
            {item.value}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setValue(null)}
          className="rounded-full px-3 py-1 font-medium text-muted-foreground hover:text-foreground"
        >
          Close all
        </button>
      </div>
      <Accordion.Root
        type="single"
        value={value}
        onValueChange={setValue}
        className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card"
      >
        {faqItems.map((item) => (
          <Accordion.Item key={item.value} value={item.value}>
            <Accordion.Heading>
              <Accordion.Trigger className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-medium text-foreground hover:bg-secondary">
                {item.title}
                <Accordion.Indicator className="text-muted-foreground">
                  <ChevronDown className="size-4" />
                </Accordion.Indicator>
              </Accordion.Trigger>
            </Accordion.Heading>
            <Accordion.Content className="px-5 text-sm leading-relaxed text-muted-foreground">
              {item.content}
            </Accordion.Content>
          </Accordion.Item>
        ))}
      </Accordion.Root>
    </div>
  );
}

export function DisabledAccordionExample() {
  return (
    <Accordion.Root
      type="single"
      defaultValue="headless"
      className="w-full max-w-xl divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card"
    >
      {faqItems.map((item, i) => (
        <Accordion.Item
          key={item.value}
          value={item.value}
          disabled={i === 1}
          className="data-[disabled]:opacity-50"
        >
          <Accordion.Heading>
            <Accordion.Trigger className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-medium text-foreground hover:bg-secondary disabled:cursor-not-allowed disabled:hover:bg-transparent">
              {item.title}
              {i === 1 ? (
                <span className="rounded-full bg-foreground/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                  Disabled
                </span>
              ) : (
                <Accordion.Indicator className="text-muted-foreground">
                  <ChevronDown className="size-4" />
                </Accordion.Indicator>
              )}
            </Accordion.Trigger>
          </Accordion.Heading>
          <Accordion.Content className="px-5 text-sm leading-relaxed text-muted-foreground">
            {item.content}
          </Accordion.Content>
        </Accordion.Item>
      ))}
    </Accordion.Root>
  );
}

export function NonCollapsibleAccordionExample() {
  return (
    <Accordion.Root
      type="single"
      defaultValue="headless"
      collapsible={false}
      className="w-full max-w-xl divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card"
    >
      {faqItems.map((item) => (
        <Accordion.Item key={item.value} value={item.value}>
          <Accordion.Heading>
            <Accordion.Trigger className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-medium text-foreground hover:bg-secondary">
              {item.title}
              <Accordion.Indicator className="text-muted-foreground">
                <ChevronDown className="size-4" />
              </Accordion.Indicator>
            </Accordion.Trigger>
          </Accordion.Heading>
          <Accordion.Content className="px-5 text-sm leading-relaxed text-muted-foreground">
            {item.content}
          </Accordion.Content>
        </Accordion.Item>
      ))}
    </Accordion.Root>
  );
}
