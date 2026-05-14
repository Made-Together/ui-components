import { useMDXComponents as getThemeComponents } from "nextra-theme-docs";
import type {
  ComponentPropsWithoutRef,
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

const tableComponents = {
  table: Table,
  thead: Thead,
  tbody: Tbody,
  tr: Tr,
  th: Th,
  td: Td,
};

export function useMDXComponents(
  components: Record<string, React.ComponentType<unknown>>,
) {
  return {
    ...themeComponents,
    ...tableComponents,
    ...components,
  };
}
