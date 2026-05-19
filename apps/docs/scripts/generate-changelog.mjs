#!/usr/bin/env node
import { existsSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(here, "..", "..", "..");
const sourceChangelog = join(repoRoot, "packages/ui/CHANGELOG.md");
const outFile = join(here, "..", "app/docs/changelog/page.mdx");

const FRONTMATTER = `---
description:
  Latest updates and changes.
---

# Changelog
`;

const PLACEHOLDER_BODY = `
No releases yet.
`;

function stripLeadingH1(md) {
  return md.replace(/^#\s+.*\n+/, "");
}

function escapeJsxLikeAngleBrackets(md) {
  const lines = md.split("\n");
  let inFence = false;
  return lines
    .map((line) => {
      if (/^\s*```/.test(line)) {
        inFence = !inFence;
        return line;
      }
      if (inFence) return line;
      return line.replace(
        /<(\/?[A-Za-z][^>`]*?)>/g,
        (_match, inner) => `\`<${inner}>\``,
      );
    })
    .join("\n");
}

async function buildBody() {
  if (!existsSync(sourceChangelog)) {
    return PLACEHOLDER_BODY;
  }
  const raw = await readFile(sourceChangelog, "utf8");
  const stripped = stripLeadingH1(raw).trimStart();
  const safe = escapeJsxLikeAngleBrackets(stripped);
  return `\n${safe.trimEnd()}\n`;
}

async function main() {
  const body = await buildBody();
  const next = `${FRONTMATTER}${body}`;

  let current = "";
  try {
    current = await readFile(outFile, "utf8");
  } catch {}

  if (current === next) {
    return;
  }

  await writeFile(outFile, next, "utf8");
  console.log(`Updated ${relative(repoRoot, outFile)}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
