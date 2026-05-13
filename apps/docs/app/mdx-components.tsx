import { useMDXComponents as getThemeComponents } from "nextra-theme-docs";

// Get the default MDX components
const themeComponents = getThemeComponents();

// Merge components
export function useMDXComponents(
  components: Record<string, React.ComponentType<unknown>>,
) {
  return {
    ...themeComponents,
    ...components,
  };
}
