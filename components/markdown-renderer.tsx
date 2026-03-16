import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownRendererProps {
  markdown: string;
}

export function MarkdownRenderer({ markdown }: MarkdownRendererProps) {
  return (
    <article className="surface-card prose-v50 min-w-0 overflow-hidden rounded-[1.7rem] p-4 text-slate-700 sm:p-6 md:p-8">
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
              return <code className="rounded-lg border border-white/62 bg-white/62 px-1.5 py-0.5 text-sm">{children}</code>;
            }

            return <code className={className + " whitespace-pre text-[13px] leading-6"}>{children}</code>;
          },
          table: ({ children }) => (
            <div className="my-5 max-w-full overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">{children}</table>
            </div>
          ),
          th: ({ children }) => (
            <th className="border border-border bg-white/42 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-700">
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
