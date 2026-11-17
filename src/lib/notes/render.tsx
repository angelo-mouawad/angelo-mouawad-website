import rehypeShiki from "@shikijs/rehype";
import type { Element, ElementContent, Root } from "hast";
import { toJsxRuntime } from "hast-util-to-jsx-runtime";
import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
import { CodeBlock } from "@/components/world/notes/CodeBlock";
import { ASSET_BASE, type NoteMeta, resolveAsset, resolveNoteLink } from "./source";

export interface Heading {
  id: string;
  text: string;
  depth: 2 | 3;
}

const CALLOUTS: Record<string, string> = { note: "Note", tip: "Tip", important: "Important", warning: "Warning", caution: "Caution" };

const isElement = (node: unknown): node is Element => !!node && (node as Element).type === "element";

function textOf(node: ElementContent | Root): string {
  if (node.type === "text") return node.value;
  if ("children" in node) return (node.children as ElementContent[]).map(textOf).join("");
  return "";
}

function walk(node: Root | Element, visit: (element: Element, parent: Root | Element) => void) {
  for (const child of node.children) {
    if (!isElement(child)) continue;
    visit(child, node);
    walk(child, visit);
  }
}

/** Turns GitHub style alerts (a quote starting with [!NOTE] and so on) into callout boxes. */
function callouts() {
  return (tree: Root) =>
    walk(tree, (element) => {
      if (element.tagName !== "blockquote") return;
      const first = element.children.find(isElement);
      const lead = first?.children[0];
      if (!first || first.tagName !== "p" || lead?.type !== "text") return;
      const match = lead.value.match(/^\[!(\w+)\]\s*/);
      const kind = match?.[1].toLowerCase();
      if (!match || !kind || !CALLOUTS[kind]) return;
      lead.value = lead.value.slice(match[0].length);
      element.tagName = "div";
      element.properties = { className: ["callout"], "data-callout": kind, role: "note" };
      element.children.unshift({ type: "element", tagName: "p", properties: { className: ["callout-title"] }, children: [{ type: "text", value: CALLOUTS[kind] }] });
    });
}

/** Points relative images at the copied assets, and relative .md links at the matching note pages. */
function localPaths(note: NoteMeta) {
  const relative = (value: unknown): value is string => typeof value === "string" && !/^([a-z]+:|\/|#)/i.test(value);
  return (tree: Root) =>
    walk(tree, (element) => {
      if (element.tagName === "img" && relative(element.properties.src)) {
        const src = element.properties.src;
        // Folder names can contain spaces ("2 Python"), so every segment is URL encoded.
        element.properties.src = resolveAsset(note, src) ?? [ASSET_BASE, ...note.folders, src.replace(/^\.\//, "")].map(encodeURI).join("/");
      }
      if (element.tagName === "a" && relative(element.properties.href) && /\.mdx?(#|$)/.test(element.properties.href)) {
        element.properties.href = resolveNoteLink(note, element.properties.href) ?? element.properties.href;
      }
    });
}

function NoteLink({ href = "", children, ...props }: ComponentProps<"a">) {
  if (href.startsWith("/")) return <Link href={href}>{children}</Link>;
  const external = /^https?:/.test(href);
  return (
    <a href={href} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})} {...props}>
      {children}
    </a>
  );
}

const components = {
  a: NoteLink,
  pre: CodeBlock,
  table: (props: ComponentProps<"table">) => (
    <div className="note-table">
      <table {...props} />
    </div>
  ),
  // Notes are trusted local files and their images have no known size, so plain img is the right tool here.
  // eslint-disable-next-line @next/next/no-img-element
  img: ({ alt = "", ...props }: ComponentProps<"img">) => <img alt={alt} loading="lazy" decoding="async" {...props} />,
};

/** Converts a note's markdown to React at build time, and lists its headings for the table of contents. */
export async function renderNote(markdown: string, note: NoteMeta): Promise<{ content: ReactNode; headings: Heading[] }> {
  const processor = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkMath)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(callouts)
    .use(rehypeKatex)
    .use(rehypeSlug)
    .use(rehypeShiki, {
      theme: "github-light",
      defaultLanguage: "text",
      transformers: [
        {
          pre(node) {
            node.properties["data-language"] = this.options.lang;
          },
        },
      ],
    })
    .use(localPaths, note);

  const tree = (await processor.run(processor.parse(markdown))) as Root;

  // The page header already shows the title, so a leading heading that repeats it is dropped.
  const firstIndex = tree.children.findIndex(isElement);
  const first = tree.children[firstIndex];
  if (isElement(first) && first.tagName === "h1") tree.children.splice(firstIndex, 1);

  const headings: Heading[] = [];
  walk(tree, (element) => {
    if ((element.tagName === "h2" || element.tagName === "h3") && typeof element.properties.id === "string") {
      headings.push({ id: element.properties.id, text: textOf(element), depth: element.tagName === "h2" ? 2 : 3 });
    }
  });

  const content = toJsxRuntime(tree, { Fragment, jsx, jsxs, components, passKeys: true });
  return { content, headings };
}
