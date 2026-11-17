"use client";

import { Check, Copy } from "lucide-react";
import { type ComponentProps, useRef, useState } from "react";

/** A highlighted code block with its language and a copy button. */
export function CodeBlock({ children, className, ...props }: ComponentProps<"pre"> & { "data-language"?: string }) {
  const pre = useRef<HTMLPreElement>(null);
  const [copied, setCopied] = useState(false);
  const language = props["data-language"];

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(pre.current?.innerText ?? "");
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <figure className="note-code">
      <figcaption>
        <span className="type-label text-muted-foreground">{language && language !== "text" ? language : "code"}</span>
        <button type="button" onClick={copy} className="note-copy" aria-live="polite">
          {copied ? <Check aria-hidden="true" className="size-3.5" /> : <Copy aria-hidden="true" className="size-3.5" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </figcaption>
      {/* Focusable so keyboard users can scroll long lines. */}
      <pre ref={pre} className={className} tabIndex={0}>
        {children}
      </pre>
    </figure>
  );
}
