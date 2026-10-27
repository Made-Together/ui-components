#!/usr/bin/env node
// Builds the Pagefind search index from Next's prerendered HTML.
// `pagefind --site .next/server/app` only works without a build adapter: when
// one is set (Vercel sets NEXT_ADAPTER_PATH), Next writes prerendered pages to
// `.next/server/route-cache/APP_PAGE/<hash>/$/<route>.html` instead. Map both
// layouts back to `<route>.html` so search URLs stay the same.
import { readdirSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as pagefind from "pagefind";

const appRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const serverDir = join(appRoot, ".next/server");
const outputPath = join(appRoot, "public/_pagefind");
const routePath = /^(?:app|route-cache\/APP_PAGE\/[^/]+\/\$)\/(.+\.html)$/;

const pages = readdirSync(serverDir, { recursive: true })
  .map((file) => ({
    file,
    route: file.replaceAll("\\", "/").match(routePath)?.[1],
  }))
  .filter((page) => page.route)
  // Sorted so the index is deterministic regardless of directory layout.
  .sort((a, b) => a.route.localeCompare(b.route));

if (pages.length === 0) {
  throw new Error(`No prerendered HTML found in ${serverDir}`);
}

const { index } = await pagefind.createIndex();
for (const { file, route } of pages) {
  const content = await readFile(join(serverDir, file), "utf8");
  const { errors } = await index.addHTMLFile({ sourcePath: route, content });
  if (errors.length) throw new Error(errors.join("\n"));
}

const { errors } = await index.writeFiles({ outputPath });
if (errors.length) throw new Error(errors.join("\n"));
await pagefind.close();

console.log(`Pagefind: indexed ${pages.length} pages into public/_pagefind`);
