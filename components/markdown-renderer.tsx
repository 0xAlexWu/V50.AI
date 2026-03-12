import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownRendererProps {
  markdown: string;
}

export function MarkdownRenderer({ markdown }: MarkdownRendererProps) {
  return (
    <article className="prose-v50 rounded-[1.3rem] border border-border bg-card p-6 text-slate-700 shadow-soft md:p-8">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href, children }) => (
            <a className="text-accent underline underline-offset-4" target="_blank" rel="noreferrer" href={href}>
              {children}
            </a>
          ),
          code: ({ className, children }) => {
            if (!className) {
              return <code className="rounded border border-border/80 bg-transparent px-1.5 py-0.5 text-sm">{children}</code>;
            }

            return <code className={className}>{children}</code>;
          },
          table: ({ children }) => (
            <div className="my-5 overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">{children}</table>
            </div>
          ),
          th: ({ children }) => (
            <th className="border border-border bg-transparent px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-700">
              {children}
            </th>
          ),
          td: ({ children }) => <td className="border border-border px-3 py-2 align-top">{children}</td>,
          hr: () => <hr className="my-6 border-0 border-t border-border" />,
          blockquote: ({ children }) => (
            <blockquote className="my-5 border-l-2 border-border px-4 py-2 italic text-slate-700">
              {children}
            </blockquote>
          )
        }}
      >
        {markdown}
      </ReactMarkdown>
    </article>
  );
}
