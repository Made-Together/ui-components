# @togetheragency/ui

A headless React component library focused on motion, composition, and accessibility. Components are unstyled by default, override-friendly via `className`, and built to drop into any Tailwind v4 project.

## Install

```sh
npm install @togetheragency/ui
```

Peer dependencies: `react`, `react-dom`, `motion` (^12), `tailwindcss` (^4).

## Usage

```tsx
import { Marquee } from "@togetheragency/ui/marquee";

export default function Page() {
  return (
    <Marquee>
      <span>Ship it.</span>
    </Marquee>
  );
}
```

Each component is importable from its own subpath (`@togetheragency/ui/<component>`) for tree-shaking.

## Documentation

Full component reference, examples, and guides: [ui.bytogether.agency/docs/getting-started](https://ui.bytogether.agency/docs/getting-started).

## License

Licensed under the [MIT license](https://github.com/Made-Together/ui-components/blob/main/LICENSE.md).
