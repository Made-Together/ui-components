&nbsp;
<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="./assets/together-ui-light.svg">
    <source media="(prefers-color-scheme: light)" srcset="./assets/together-ui-dark.svg">
    <img alt="@togetheragency/ui" src="./assets/together-ui-light.svg" width="180">
  </picture>
</p>
<h3 align="center">Headless React primitives for modern websites</h3>
<p align="center">
  A collection library of re-usable, minimally styled, headless React components
</p>

<p align="center">
  <a href="https://ui.bytogether.agency/docs/getting-started/">Getting started</a> |
  <a href="https://ui.bytogether.agency/docs/components">Components</a> |
  <a href="https://ui.bytogether.agency/docs/skills">Skills</a> |
  <a href="https://github.com/Made-Together/ui-components/issues/new/choose">Issues</a> |
  <a href="https://ui.bytogether.agency/docs/changelog">Changelog</a>
</p>

<div align="center">

[![NPM Version](https://img.shields.io/npm/v/%40togetheragency%2Fui.svg?style=plastic&color=blue)](https://www.npmjs.com/package/@togetheragency/ui)
[![NPM downloads](https://img.shields.io/npm/dm/%40togetheragency%2Fui.svg?style=plastic&color=222222)](https://www.npmjs.com/package/@togetheragency/ui)
[![CI](https://img.shields.io/github/actions/workflow/status/made-together/ui-components/release.yml?style=plastic&color=eeeeee)](https://github.com/Made-Together/ui-components/actions/workflows/release.yml)

[![React](https://img.shields.io/badge/React-%2320232a.svg?logo=react&logoColor=%2361DAFB&style=plastic)](#)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-%23222222.svg?logo=tailwind-css&logoColor=white&style=plastic)](#)

</div>

<hr/>

## Installation

Install `@togetheragency/ui` with your package manager of choice:

```sh
pnpm add @togetheragency/ui
```

The library declares `react`, `motion`, and `tailwindcss` as peer dependencies. Make sure they're installed in your project:

```sh
pnpm add react react-dom motion tailwindcss
```

Full setup instructions, including Tailwind v4 configuration, are available in the [installation guide](https://ui.bytogether.agency/docs/installation).

## Usage

Components are exported per-name and imported from their subpath. No build step is involved, so your bundler transpiles the source alongside the rest of your app and tree-shaking works as expected.

```tsx
import { Carousel } from "@togetheragency/ui/carousel";
import { Marquee } from "@togetheragency/ui/marquee";
import { Tabs } from "@togetheragency/ui/tabs";
```

Every component is headless by default. It owns behavior, state, and accessibility, and leaves the look and feel up to you. Defaults (when any exist) are minimal and overridable via `className`, `style`, slots, or render props.

For per-component APIs, examples, and recipes, head to the [official documentation](https://ui.bytogether.agency/docs/getting-started).

## Components

The full list of available components, along with live examples and API references, lives at [ui.bytogether.agency/docs/components](https://ui.bytogether.agency/docs/components).

Each component also ships with a focused [skills](https://ui.bytogether.agency/docs/skills) entry that you can feed to Claude Code, Cursor, or any other agentic tool to scaffold and customize components without guessing at the API.

## Contributing

Contributions are welcome! Please open an issue or submit a PR. See the [CONTRIBUTING](CONTRIBUTING.md) file for more details.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.