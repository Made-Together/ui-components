# Contributing

Thanks for your interest in contributing to `@togetheragency/ui`. This guide walks through the workflow we use for everything from small fixes to new components.

If anything in here is unclear or out of date, open an issue or PR and we'll get it sorted.

## Prerequisites

Before you start, make sure you have the following installed:

- **Node.js** `>= 20` (we pin to the version in [`.nvmrc`](.nvmrc))
- **pnpm** `>= 9` (this repo is a pnpm workspaces monorepo using [turborepo](https://turborepo.dev/))
- **git**

If you use [`nvm`](https://github.com/nvm-sh/nvm) or [`fnm`](https://github.com/Schniz/fnm), running `nvm use` (or `fnm use`) in the repo root picks up the right Node version automatically.

## 1. Fork and clone the repo

Fork the repository on GitHub, then clone your fork locally:

```sh
git clone https://github.com/<your-username>/ui-components.git
cd ui-components
```

Add the upstream remote so you can keep your fork in sync:

```sh
git remote add upstream https://github.com/Made-Together/ui-components.git
```

## 2. Install dependencies

We use [pnpm](https://pnpm.io/) for dependency management. From the repo root:

```sh
pnpm install
```

This installs dependencies for every workspace (the `@togetheragency/ui` package, the playground app, the docs app, and shared configs).

## 3. Create a branch

Branch off `main` with a descriptive name. We don't enforce a strict convention, but a `type/short-description` shape keeps things readable:

```sh
git checkout -b feat/accordion-component
git checkout -b fix/carousel-keyboard-nav
git checkout -b docs/improve-marquee-readme
```

## 4. Run the dev environment

The repo ships with two Next.js apps you can use to develop against:

- **`apps/playground`** (port 3000) for scratch-pad development of new components.
- **`apps/docs`** (port 3001) for the documentation site.

Run everything together with:

```sh
pnpm dev
```

Or scope to a single workspace:

```sh
pnpm exec turbo dev --filter=playground
pnpm exec turbo dev --filter=docs
```

New components live in `packages/ui/src/<component>/`. To scaffold a new component folder with the standard structure (`<component>.tsx`, `index.ts`, `<component>.test.tsx`, `README.md`), run:

```sh
pnpm --filter @togetheragency/ui generate:component
```

Take a look at [`CLAUDE.md`](CLAUDE.md) and [`AGENTS.md`](AGENTS.md) for the architectural guidelines and component conventions we follow (headless first, composition over configuration, motion for animation, Tailwind for any default styling, override-friendly APIs).

## 5. Add tests

Component changes should come with tests when possible. Each component lives next to a `<component>.test.tsx` file. Add new tests, or update existing ones, to cover the behavior you're adding or fixing.

Run the test suite from the repo root:

```sh
pnpm test
```

Aim for tests that cover the public API and accessibility behavior rather than internal implementation details.

## 6. Update the documentation

Documentation lives in two places, both of which should stay in sync with your change:

- **Component `README.md`** inside `packages/ui/src/<component>/README.md` for the component-level reference.
- **Docs site** under `apps/docs/app/docs/components/<component>/` for the public-facing documentation at [ui.bytogether.agency](https://ui.bytogether.agency).

If you're adding a new component, add an entry to both locations and link it from the relevant index pages.

## 7. Lint, format, and type-check

Before pushing, run the standard checks. CI will run these as well, so it's faster to catch issues locally:

```sh
pnpm check        # Biome lint + format check
pnpm format       # auto-fix formatting, via Biome
pnpm check-types  # tsc --noEmit across all workspaces
```

## 8. Add a changeset

We use [Changesets](https://github.com/changesets/changesets) to manage versioning and the changelog. Any change that ships in `@togetheragency/ui` needs a changeset.

From the repo root, run:

```sh
pnpm changeset
```

Pick the package(s) affected, the bump type (`patch`, `minor`, or `major`), and write a short, user-facing summary of the change. This produces a markdown file under `.changeset/` that you should commit alongside your code changes.

If your PR is documentation-only or touches non-published workspaces (the playground, internal configs), you can skip the changeset.

## 9. Commit and push

Commit your work with clear, descriptive messages. Push the branch to your fork:

```sh
git push -u origin <your-branch>
```

## 10. Open a pull request

Open a PR against `main` on [made-together/ui-components](https://github.com/Made-Together/ui-components). In the PR description, include:

- A short summary of what changed and why.
- Links to any related issues.
- Screenshots or screen recordings for visual/UI changes.
- Notes on anything reviewers should pay extra attention to.

A maintainer will review, leave feedback, and merge once everything is in good shape. After your PR lands, the changeset you added will be picked up by the next release and published to npm.

## Reporting bugs and proposing features

If you're not ready to send a PR but spotted something, [open an issue](https://github.com/Made-Together/ui-components/issues/new/choose). For bugs, a minimal reproduction goes a long way. For features, a short description of the use case helps us scope the API.

Thanks again for contributing.
