#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(here, "..", "..", "..");
const sourceChangelog = join(repoRoot, "packages/ui/CHANGELOG.md");
const sourceChangelogRel = relative(repoRoot, sourceChangelog);
const outFile = join(here, "..", "app/docs/changelog/page.mdx");

function git(args) {
  try {
    return execFileSync("git", args, {
      cwd: repoRoot,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return "";
  }
}

function getRepoUrl() {
  const raw = git(["config", "--get", "remote.origin.url"]);
  if (!raw) return null;
  // git@github.com:owner/repo(.git) → https://github.com/owner/repo
  const ssh = raw.match(/^git@([^:]+):(.+?)(?:\.git)?$/);
  if (ssh) return `https://${ssh[1]}/${ssh[2]}`;
  return raw.replace(/\.git$/, "");
}

function getVersionDate(version) {
  // Find the oldest commit that introduced this `## <version>` heading
  // in the source CHANGELOG.md. `%cs` is the committer date as YYYY-MM-DD.
  const out = git([
    "log",
    "--reverse",
    "--format=%cs",
    `-S## ${version}`,
    "--",
    sourceChangelogRel,
  ]);
  if (!out) return null;
  return out.split("\n")[0].trim() || null;
}

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

function normalizeComponentTags(md) {
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
        /(`{1,2})?<(\/?)([A-Za-z][A-Za-z0-9]*(?:\s*\.\s*[A-Za-z][A-Za-z0-9]*)*)([^>`]*)>(`{1,2})?/g,
        (match, lead, slash, name, rest, trail) => {
          if (!lead && !trail) return match;
          if (rest.includes("://")) return match;
          const cap = name
            .split(".")
            .map((part) => {
              const p = part.trim();
              return p ? p[0].toUpperCase() + p.slice(1) : p;
            })
            .join(".");
          if (slash === "/") return `</${cap}>`;
          const trimmed = rest.trim();
          const isSelfClose = trimmed.endsWith("/");
          const body = isSelfClose ? trimmed.slice(0, -1).trim() : trimmed;
          const attrs = body ? ` ${body}` : "";
          return isSelfClose ? `<${cap}${attrs} />` : `<${cap}${attrs}>`;
        },
      );
    })
    .join("\n");
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

const DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
  month: "long",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

function formatDate(iso) {
  // iso is YYYY-MM-DD from `git log --format=%cs`
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  return DATE_FORMATTER.format(new Date(Date.UTC(y, m - 1, d)));
}

function annotateVersionHeadings(md) {
  return md.replace(/^##\s+(\S+)[ \t]*$/gm, (line, version) => {
    const date = getVersionDate(version);
    if (!date) return line;
    return `## ${version}\n\n<span className="text-base text-muted-foreground -mb-3">\n  Released: ${formatDate(date)}\n</span>`;
  });
}

function linkifyCommitPrefixes(md, repoUrl) {
  if (!repoUrl) {
    // No remote configured — just drop the noisy hash prefix.
    return md.replace(/^(\s*[-*])\s+([0-9a-f]{7,40}):\s+/gm, "$1 ");
  }
  return md.replace(
    /^(\s*[-*])\s+([0-9a-f]{7,40}):\s+/gm,
    (_m, bullet, sha) => `${bullet} [\`${sha}\`](${repoUrl}/commit/${sha}) — `,
  );
}

async function buildBody() {
  if (!existsSync(sourceChangelog)) {
    return PLACEHOLDER_BODY;
  }
  const raw = await readFile(sourceChangelog, "utf8");
  const stripped = stripLeadingH1(raw).trimStart();
  const linked = linkifyCommitPrefixes(stripped, getRepoUrl());
  const normalized = normalizeComponentTags(linked);
  const safe = escapeJsxLikeAngleBrackets(normalized);
  const dated = annotateVersionHeadings(safe);
  return `\n${dated.trimEnd()}\n`;
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
