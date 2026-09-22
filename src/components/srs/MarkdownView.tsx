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

export function MarkdownView({ markdown }: { markdown: string }) {
  return <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>{markdown}</ReactMarkdown>;
}
