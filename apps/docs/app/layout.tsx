import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Head } from "nextra/components";
import { getPageMap } from "nextra/page-map";
import { Layout, Navbar } from "nextra-theme-docs";
import { Logo } from "./components/logo";

import "nextra-theme-docs/style.css";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });
const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "Together UI",
  description: "A collection of components for your Next.js application.",
};

// const banner = <Banner storageKey="some-key">Nextra 4.0 is released 🎉</Banner>;
const navbar = (
  <Navbar
    logo={
      <div className="flex items-center gap-1.5">
        <Logo style={{ width: "72px" }} />
        <span className="text-[11px] font-mono font-semibold leading-none inline-block bg-foreground rounded px-1 py-0.5 text-background -mt-0.5">
          /ui
        </span>
      </div>
    }
    // ... Your additional navbar options
  />
);

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <body
        className={`${geist.variable} ${geistMono.variable} font-sans antialiased`}
      >
        <Layout
          // banner={banner}
          navbar={navbar}
          pageMap={await getPageMap()}
          sidebar={{ autoCollapse: true }}
          // docsRepositoryBase="https://github.com/shuding/nextra/tree/main/docs"
          // ... Your additional layout options
        >
          {children}
        </Layout>
      </body>
    </html>
  );
}
