/** @type {import('next').NextConfig} */

import nextra from "nextra";

const withNextra = nextra({
  // Nextra-specific options
});

const nextConfig = {};

export default withNextra({
  ...nextConfig,
  turbopack: {
    resolveAlias: {
      "next-mdx-import-source-file": "./app/mdx-components.tsx",
    },
  },
});

