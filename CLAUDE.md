# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository

Turborepo monorepo (pnpm workspaces, Node >= 20, see `.nvmrc`: 20.19.5). The `@made-together/ui` package is the actual deliverable — a headless React component library. The `apps/playground` (port 3000) and `apps/docs` (port 3001) Next.js 16 apps exist to develop and showcase those components.

Component scope is tracked in `ROADMAP.md` (Carousel, Marquee, Accordion, Tabs, Ticker, StackedContent, Swappable, TextReveal, TextSplit, NumberFlow, FixedScrollableArea). New components go in `packages/ui/src/<component>/` as a folder containing `<component>.tsx`, `index.ts`, `<component>.test.tsx`, and `README.md` (see the `carousel/` scaffold).

## Commands

Run from the repo root unless noted. Turbo handles task graph + caching.

- `pnpm dev` — run all apps (playground + docs).
- `pnpm build` — build all packages/apps.
- `pnpm lint` — Biome check via turbo (per-package).
- `pnpm check` — Biome check at the root (whole repo).
- `pnpm format` — Biome format-write at the root.
- `pnpm check-types` — `tsc --noEmit` across packages; apps run `next typegen` first.
- Filter to one workspace: `pnpm exec turbo dev --filter=playground` (or `docs`, `@made-together/ui`).
- New UI component scaffold: `pnpm --filter @made-together/ui generate:component`.

There is no test runner wired up yet — `*.test.tsx` files exist but no `test` script is defined.

## Architecture notes

- **`@made-together/ui` exports raw source**: `"exports": { "./*": ["./src/*/index.ts", "./src/*.tsx"] }`. No build step — consumers (Next.js apps) transpile the source directly. Import as `@made-together/ui/<name>`: folder-based components resolve to `./src/<name>/index.ts` first, falling back to single-file `./src/<name>.tsx`. Folder layout (preferred for new components) needs an `index.ts` re-export.
- **Peer deps** declare `react ^17 || ^18 || ^19` and `motion ^12`. Animation work should use `motion` (Framer Motion successor), not add new animation deps.
- **Tailwind v4** is a peer dependency of `@made-together/ui` (`tailwindcss ^4.0.0`), used by `apps/playground` and `apps/docs` (via `@tailwindcss/postcss`). Components remain headless by default; when styling is needed inside `@made-together/ui`, use Tailwind utility classes, and always keep them overridable via `className` (merged last) so consumers can replace any default.
- **Client components**: source files use `"use client"` at the top (see `button.tsx`); keep that on any component using hooks, refs, or browser APIs so Next.js App Router consumers work.
- **TypeScript configs** live in `packages/typescript-config` (`base.json`, `nextjs.json`, `react-library.json`) and are referenced via `@made-together/typescript-config` workspace dep.
- **Biome 2.4** is the single linter+formatter (replaced ESLint/Prettier per recent commit). Settings: 2-space indent, double quotes, semicolons always, organize-imports on. The root `pnpm lint` runs per-package `biome check .`; `pnpm check` runs Biome across everything including the root.

## Component guidelines
- Components should be headless whenever possible.
- Do not hardcode styling systems into component internals.
- If a component needs styling, use Tailwind classes; never reach for another styling system. Defaults should be minimal and always overridable — consumer `className` must be able to replace or extend any class applied internally (merge with `cn`/`twMerge`, don't hardcode in a way that wins over user overrides).
- All styling should be override-friendly via className, style, slots, or render props.
- Prefer semantic HTML and accessibility-first behavior.
- Components must support both controlled and uncontrolled usage patterns where applicable.
- Components should expose internal state through data attributes whenever useful (data-state, data-open, etc).
- Avoid deeply nested internal abstractions unless they significantly improve DX or accessibility.
- Favor small reusable primitives over giant all-in-one components.

## Animation philosophy

Animations are a first-class feature of the library and should use motion exclusively.

Animation implementations should:

- Feel smooth and modern by default.
- Remain interruptible and composable.
- Respect reduced-motion preferences.
- Avoid layout thrashing and unnecessary re-renders.
- Expose hooks for customization instead of locking users into fixed transitions.

Animations should enhance usability and spatial understanding — not become visual noise.

## Implementation guidance

When generating new components or modifying existing ones:

- Preserve composition-first APIs.
- Avoid introducing styling opinions into @made-together/ui.
- Prefer extensibility over convenience shortcuts.
- Maintain accessibility semantics and keyboard interactions.
- All composites should be react forwardRef's and their props should extend the parent element's props.
- Keep component internals understandable and debuggable.
- Avoid premature abstraction.
- Prefer explicit exports and predictable file structures.
- Maintain consistency with existing component folder organization.
- Reuse shared utilities/hooks before introducing new helpers.
- Do not add new runtime dependencies without strong justification.
- Use motion for animation work instead of introducing alternative animation libraries.
- Keep APIs React-idiomatic and tree-shakeable.
- Favor slot-based composition patterns over large prop surfaces.
- Ensure components work correctly in Next.js App Router environments.
- Prioritize DX, readability, accessibility standards and long-term maintainability over clever implementations.