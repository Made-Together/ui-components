# Swappable

A headless rotating grid. Hand it an array of items and a grid shape (`rows` ×
`cols`); it renders the first `rows × cols` items, then, while
`items.length > gridSize`, periodically swaps a random visible cell with a
random off-screen item. Uniqueness is preserved: the same item is never
visible twice.

## Import

```tsx
import { Swappable } from "@togetheragency/ui/swappable";
```

The component is exported as a compound object; every sub-component is a
property of `Swappable`:

```tsx
Swappable.Root;
Swappable.Grid;
Swappable.Item;
```

## Composition

Swappable is three parts that work together; `Root` owns state and the
rotation timer, `Grid` renders the visible cells via a render prop, and `Item`
is the animated cell wrapper:

```tsx
<Swappable.Root items={items} rows={1} cols={{ base: 2, md: 4 }}>
  <Swappable.Grid<Item>>
    {(item) => (
      <Swappable.Item>
        <Card data={item} />
      </Swappable.Item>
    )}
  </Swappable.Grid>
</Swappable.Root>
```

- **`Swappable.Root`** holds the `items` array, the grid shape, the rotation
  timer, and the default motion variants. It deduplicates `items` on entry and
  assigns each one a stable internal id (via a `Map<T, string>` keyed by
  reference for objects, by value for primitives), so consumers never have to
  thread an `id` field through their data.
- **`Swappable.Grid`** renders the responsive CSS grid and calls its render
  prop once per visible cell. It injects the internal id as `key` on the
  rendered element, which is what lets `AnimatePresence` orchestrate the
  enter/exit animation when an item swaps in or out. It is generic over the
  item type — `<Swappable.Grid<MyItem>>` so the render-prop argument is
  typed.
- **`Swappable.Item`** is a `motion.div` that inherits Root's default
  `initial` / `animate` / `exit` / `transition`. Per-instance props win over
  the defaults.

## Documentation

Find the detailed [documentation with examples here](https://ui.bytogether.agency/docs/components/swappable).