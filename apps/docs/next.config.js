/** @type {import('next').NextConfig} */

import nextra from "nextra";

const withNextra = nextra({
  // Nextra-specific options
});

const nextConfig = {
  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.brandfetch.io",
      },
    ],
  },
};

export default withNextra({
  ...nextConfig,
  turbopack: {
    resolveAlias: {
      "next-mdx-import-source-file": "./app/mdx-components.tsx",
    },
  },
});
