"use client";

import { Swappable } from "@repo/ui/swappable";
import { Logos } from "./_logos";

type Logo = (typeof Logos)[number];

function LogoCell({ Logo }: { Logo: Logo }) {
  return (
    <div className="flex h-24 w-full items-center justify-center rounded-xl border border-border bg-card p-4">
      <div className="flex h-full w-full items-center justify-center [&_img]:max-h-full [&_img]:max-w-full [&_img]:object-contain">
        <Logo />
      </div>
    </div>
  );
}

export function BasicSwappableExample() {
  return (
    <Swappable.Root
      items={Logos}
      rows={1}
      cols={{ base: 2, sm: 3, md: 4, lg: 4 }}
      className="w-full max-w-3xl rounded-2xl border border-border bg-background p-3"
    >
      <Swappable.Grid<Logo> className="gap-3">
        {(Logo) => (
          <Swappable.Item>
            <LogoCell Logo={Logo} />
          </Swappable.Item>
        )}
      </Swappable.Grid>
    </Swappable.Root>
  );
}

export function MultiRowSwappableExample() {
  return (
    <Swappable.Root
      items={Logos}
      rows={2}
      cols={{ base: 2, sm: 3, md: 4 }}
      rotationInterval={{ min: 1500, max: 3500 }}
      pauseOnHover
      className="w-full max-w-3xl rounded-2xl border border-border bg-background p-3"
    >
      <Swappable.Grid<Logo> className="gap-3">
        {(Logo) => (
          <Swappable.Item>
            <LogoCell Logo={Logo} />
          </Swappable.Item>
        )}
      </Swappable.Grid>
    </Swappable.Root>
  );
}

export function FastRotationSwappableExample() {
  return (
    <Swappable.Root
      items={Logos}
      rows={1}
      cols={{ base: 3, sm: 4, lg: 4 }}
      rotationInterval={{ min: 600, max: 1400 }}
      className="w-full max-w-3xl rounded-2xl border border-border bg-background p-3"
    >
      <Swappable.Grid<Logo> className="gap-3">
        {(Logo) => (
          <Swappable.Item>
            <LogoCell Logo={Logo} />
          </Swappable.Item>
        )}
      </Swappable.Grid>
    </Swappable.Root>
  );
}

export function CustomTransitionSwappableExample() {
  return (
    <Swappable.Root
      items={Logos}
      rows={1}
      cols={{ base: 2, sm: 4, lg: 5 }}
      rotationInterval={{ min: 1200, max: 2800 }}
      initial={{ opacity: 0, y: 14, filter: "blur(6px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      exit={{ opacity: 0, y: -14, filter: "blur(6px)" }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="w-full max-w-3xl rounded-2xl border border-border bg-background p-3"
    >
      <Swappable.Grid<Logo> className="gap-3">
        {(Logo) => (
          <Swappable.Item>
            <LogoCell Logo={Logo} />
          </Swappable.Item>
        )}
      </Swappable.Grid>
    </Swappable.Root>
  );
}

export function StaticGridSwappableExample() {
  const fewLogos = Logos.slice(0, 4);
  return (
    <Swappable.Root
      items={fewLogos}
      rows={1}
      cols={{ base: 2, sm: 4 }}
      className="w-full max-w-3xl rounded-2xl border border-border bg-background p-3"
    >
      <Swappable.Grid<Logo> className="gap-3">
        {(Logo) => (
          <Swappable.Item>
            <LogoCell Logo={Logo} />
          </Swappable.Item>
        )}
      </Swappable.Grid>
    </Swappable.Root>
  );
}
