import Image from "next/image";
import Link from "next/link";

import { ArrowRightIcon, GitHubIcon } from "nextra/icons";
import { CopyInstallCommand } from "./components/copy-install-command";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center gap-4 x:max-w-(--nextra-content-width) min-h-[calc(100vh-var(--nextra-navbar-height))] x:pl-[max(env(safe-area-inset-left),1.5rem)] x:pr-[max(env(safe-area-inset-right),1.5rem)] mx-auto">
      <div className="col-span-12 flex flex-col items-center justify-center gap-4 lg:gap-8 -mt-42">
        <div className="w-full aspect-16/6 rounded-xl overflow-hidden relative mask-[linear-gradient(to_top,transparent,black_200%)]">
          <Image
            src="/homepage_intro.avif"
            alt="Homepage hero"
            width={1280}
            height={1000}
            className="w-full h-auto object-cover object-center absolute inset-0"
          />
        </div>

        <h1 className="font-semibold md:text-4xl lg:text-5xl max-w-lg md:max-w-2xl text-center text-3xl tracking-tight text-balance">
          Headless React primitives for modern websites
        </h1>
        <p className="text-base sm:text-lg m-0 max-w-lg text-center font-medium">
          Raw, minimally styled, accessible primitives that you can compose into
          your own design system.
        </p>
        <div className="flex flex-col md:flex-row md:justify-center gap-2">
          <CopyInstallCommand
            command="pnpm add @made-together/ui"
            className="max-[340px]:hidden"
          />
          <Link
            href="/docs/getting-started"
            className="flex items-center justify-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md md:min-w-38 min-w-0 text-base font-medium"
          >
            Get started
            <ArrowRightIcon className="size-3.5 -mr-1" />
          </Link>
        </div>
        <Link
          href="https://github.com/made-together/ui"
          target="_blank"
          className="group flex flex-row items-center gap-1.5"
        >
          <GitHubIcon className="size-3 text-muted-foreground group-hover:text-foreground transition-colors" />
          <p className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
            View on GitHub
          </p>
        </Link>
      </div>
    </main>
  );
}
