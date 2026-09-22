"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";

const components: Components = {
  table: ({ children }) => (
    <div className="markdown-table-scroll" role="region" aria-label="Tabla de requisitos" tabIndex={0}>
      <table>{children}</table>
    </div>
  ),
};

/** `extraComponents` must be a stable reference; a new object per render remounts the document. */
export function MarkdownView({ markdown, extraComponents }: { markdown: string; extraComponents?: Components }) {
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={extraComponents ? { ...components, ...extraComponents } : components}>
      {markdown}
    </ReactMarkdown>
  );
}
