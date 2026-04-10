"use client"

import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

export function MarkdownContent({ content }: { content: string }) {
  // Strip leading H1 (it's already rendered as the page title)
  const body = content.replace(/^#\s+[^\n]+\n?/, "").trimStart()

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: ({ children }) => (
          <h2 className="text-3xl font-bold font-playfair text-[#212121] mt-10 mb-4 pb-2 border-b border-[#DEE2E6]">{children}</h2>
        ),
        h2: ({ children }) => (
          <h2 className="text-2xl font-bold font-playfair text-[#212121] mt-8 mb-3 pb-2 border-b border-[#DEE2E6]">{children}</h2>
        ),
        h3: ({ children }) => (
          <h3 className="text-xl font-semibold font-playfair text-[#212121] mt-6 mb-2">{children}</h3>
        ),
        h4: ({ children }) => (
          <h4 className="text-lg font-semibold text-[#212121] mt-4 mb-2">{children}</h4>
        ),
        p: ({ children }) => (
          <p className="text-[#333] leading-[1.8] mb-4 text-base">{children}</p>
        ),
        strong: ({ children }) => (
          <strong className="font-semibold text-[#1a1a1a]">{children}</strong>
        ),
        em: ({ children }) => (
          <em className="italic text-[#444]">{children}</em>
        ),
        ul: ({ children }) => (
          <ul className="list-disc list-inside space-y-1.5 mb-4 text-[#333] pl-2">{children}</ul>
        ),
        ol: ({ children }) => (
          <ol className="list-decimal list-inside space-y-1.5 mb-4 text-[#333] pl-2">{children}</ol>
        ),
        li: ({ children }) => (
          <li className="leading-relaxed">{children}</li>
        ),
        blockquote: ({ children }) => (
          <blockquote className="border-l-4 border-[#2E7D32] pl-4 py-1 my-4 bg-[#f0faf0] rounded-r-xl text-[#555] italic">{children}</blockquote>
        ),
        a: ({ href, children }) => (
          <a href={href} className="text-[#2E7D32] underline underline-offset-2 hover:text-[#1a9020] transition-colors" target="_blank" rel="noopener noreferrer">{children}</a>
        ),
        code: ({ children, className }) => {
          const isBlock = className?.includes("language-")
          return isBlock ? (
            <code className="block bg-[#F8F9FA] border border-[#DEE2E6] rounded-xl p-4 text-sm font-mono text-[#2E7D32] overflow-x-auto my-4">{children}</code>
          ) : (
            <code className="bg-[#F8F9FA] text-[#2E7D32] px-1.5 py-0.5 rounded text-sm font-mono">{children}</code>
          )
        },
        table: ({ children }) => (
          <div className="overflow-x-auto my-6 rounded-xl border border-[#DEE2E6]">
            <table className="w-full text-sm text-left">{children}</table>
          </div>
        ),
        thead: ({ children }) => (
          <thead className="bg-[#F8F9FA] border-b border-[#DEE2E6]">{children}</thead>
        ),
        tbody: ({ children }) => (
          <tbody className="divide-y divide-[#DEE2E6]">{children}</tbody>
        ),
        tr: ({ children }) => (
          <tr className="hover:bg-[#fafafa] transition-colors">{children}</tr>
        ),
        th: ({ children }) => (
          <th className="px-4 py-3 font-semibold text-[#1d1d1f]">{children}</th>
        ),
        td: ({ children }) => (
          <td className="px-4 py-3 text-[#444]">{children}</td>
        ),
        hr: () => (
          <hr className="my-8 border-[#DEE2E6]" />
        ),
      }}
    >
      {body}
    </ReactMarkdown>
  )
}
