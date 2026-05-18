"use client";

import { useCallback, useEffect, useState } from "react";

interface CopyInstallCommandProps {
  command: string;
  prefix?: string;
  className?: string;
}

export function CopyInstallCommand({
  command,
  prefix = "$",
  className,
}: CopyInstallCommandProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const t = window.setTimeout(() => setCopied(false), 1800);
    return () => window.clearTimeout(t);
  }, [copied]);

  const onCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
    } catch {
      // Clipboard blocked — leave state untouched.
    }
  }, [command]);

  return (
    <button
      type="button"
      onClick={onCopy}
      data-state={copied ? "copied" : "idle"}
      aria-label={copied ? "Copied to clipboard" : `Copy: ${command}`}
      className={[
        "group/copy relative inline-flex w-full items-center gap-3 overflow-hidden",
        "rounded-md border border-border bg-card/60 backdrop-blur-sm",
        "px-4 py-3 text-left font-mono text-[13px] leading-none",
        "transition-[border-color,background-color,box-shadow] duration-300",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "sm:max-w-md",
        className ?? "",
      ].join(" ")}
    >
      <span
        aria-hidden="true"
        className="select-none text-muted-foreground transition-colors group-hover/copy:text-foreground"
      >
        {prefix}
      </span>
      <span className="flex-1 truncate text-foreground">{command}</span>

      <span
        aria-hidden="true"
        className="relative ml-2 inline-flex size-5 shrink-0 items-center justify-center"
      >
        <span
          className="absolute inset-0 inline-flex items-center justify-center transition-all duration-300"
          style={{
            opacity: copied ? 0 : 1,
            transform: copied ? "scale(0.6) rotate(-12deg)" : "none",
          }}
        >
          <CopyGlyph />
        </span>
        <span
          className="absolute inset-0 inline-flex items-center justify-center transition-all duration-300"
          style={{
            opacity: copied ? 1 : 0,
            transform: copied ? "none" : "scale(0.6) rotate(12deg)",
          }}
        >
          <CheckGlyph />
        </span>
      </span>
    </button>
  );
}

function CopyGlyph() {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-4 text-muted-foreground group-hover/copy:text-foreground"
      aria-hidden="true"
    >
      <rect x="5" y="5" width="8" height="8" rx="1.25" />
      <path d="M11 5V3.75C11 3.06 10.44 2.5 9.75 2.5H3.75C3.06 2.5 2.5 3.06 2.5 3.75v6c0 .69.56 1.25 1.25 1.25H5" />
    </svg>
  );
}

function CheckGlyph() {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-4 text-foreground"
      aria-hidden="true"
    >
      <path d="m3.5 8.5 2.75 2.75L12.5 5" />
    </svg>
  );
}
