import { useMDXComponents as getThemeComponents } from "nextra-theme-docs";
import type {
  ComponentPropsWithoutRef,
  ComponentType,
  HTMLAttributes,
  TableHTMLAttributes,
  ThHTMLAttributes,
} from "react";

const codeCellClass =
  "[&>code]:relative [&>code]:rounded-md [&>code]:bg-muted [&>code]:px-[0.3rem] [&>code]:py-[0.2rem] [&>code]:font-mono [&>code]:text-[0.8rem] [&>code]:break-words [&>code]:outline-none";

function Table(props: TableHTMLAttributes<HTMLTableElement>) {
  return (
    <div className="my-6 no-scrollbar w-full overflow-y-auto rounded-md border">
      <table
        {...props}
        className="relative w-full overflow-hidden border-none text-[15px] [&_tbody_tr:last-child]:border-b-0"
      />
    </div>
  );
}

function Thead(props: HTMLAttributes<HTMLTableSectionElement>) {
  return <thead {...props} />;
}

function Tbody(props: HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody {...props} />;
}

function Tr(props: HTMLAttributes<HTMLTableRowElement>) {
  return <tr {...props} className="m-0 border-b" />;
}

function Th(props: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      {...props}
      className={`px-4 py-2 text-left font-bold [[align=center]]:text-center [[align=right]]:text-right ${codeCellClass}`}
    />
  );
}

function Td(props: ComponentPropsWithoutRef<"td">) {
  return (
    <td
      {...props}
      className={`px-4 py-2 text-left whitespace-nowrap [[align=center]]:text-center [[align=right]]:text-right ${codeCellClass}`}
    />
  );
}

const themeComponents = getThemeComponents();

// Nextra's `pre` is the full code-block render (outer wrapper, copy button,
// shiki spans). We re-use it so we don't lose those features, and only
// override the visual chrome via `!important` so our classes win against
// Nextra's prefixed `x:` defaults (ring, bg, rounding).
const ThemePre = themeComponents.pre as ComponentType<
  ComponentPropsWithoutRef<"pre">
>;

function Pre({ className, ...props }: ComponentPropsWithoutRef<"pre">) {
  return (
    <ThemePre
      {...props}
      className={`${className ?? ""} rounded-lg bg-foreground/2 dark:bg-foreground/3 ring-0!`.trim()}
    />
  );
}

const tableComponents = {
  table: Table,
  thead: Thead,
  tbody: Tbody,
  tr: Tr,
  th: Th,
  td: Td,
};

const codeComponents = {
  pre: Pre,
};

export function useMDXComponents(
  components: Record<string, React.ComponentType<unknown>>,
) {
  return {
    ...themeComponents,
    ...tableComponents,
    ...codeComponents,
    ...components,
  };
}
