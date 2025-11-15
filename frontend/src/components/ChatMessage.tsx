// src/components/ChatMessage.tsx
import { useRef, useEffect, useState } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeRaw from "rehype-raw"
import rehypeSanitize from "rehype-sanitize"
import type { Message } from "../types/Message"

interface ChatMessageProps {
  message: Message
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user"
  const ref = useRef<HTMLDivElement>(null)
  const [radius, setRadius] = useState("9999px")

  useEffect(() => {
    if (ref.current) {
      const h = ref.current.offsetHeight
      const r = h > 50 ? "0.75rem" : "9999px"

      if (isUser) {
        setRadius(h > 50 ? `${r} ${r} 0.25rem ${r}` : `${r} ${r} ${r} ${r}`)
      } else {
        setRadius(h > 50 ? `${r} 0.25rem ${r} ${r}` : `${r} ${r} ${r} ${r}`)
      }
    }
  }, [message.content])

  return (
    <div
      ref={ref}
      className={`
        w-full flex
        ${isUser ? "justify-end" : "justify-start"}
      `}
    >
      <div
        style={{ borderRadius: radius }}
        className={`
          px-4 py-2 max-w-[80%]
          whitespace-pre-line
          ${isUser
            ? "bg-blue-600 text-white"
            : "bg-white/5 text-gray-200 border border-white/10"}
        `}
      >
        {/* markdown wrapper controls spacing */}
        <div className="markdown-body text-[0.95rem] leading-[1.35rem]">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw, rehypeSanitize]}
            components={{
              code(codeProps) {
                const { children, className, ...rest } = codeProps
                const inline = (codeProps as any).inline

                return inline ? (
                  <code
                    className="px-1 py-0.5 bg-black/40 rounded"
                    {...rest}
                  >
                    {children}
                  </code>
                ) : (
                  <pre className="bg-black/40 rounded p-3 overflow-x-auto text-sm">
                    <code className={className} {...rest}>
                      {children}
                    </code>
                  </pre>
                )
              },
            }}
          >
            {message.content}
          </ReactMarkdown>
        </div>

        {!isUser && message.tuning && (
          <details className="mt-2 text-xs opacity-70">
            <summary className="cursor-pointer select-none">
              tuning parameters
            </summary>
            <pre className="mt-1 p-2 bg-black/30 rounded border border-white/10 text-[11px] overflow-x-auto">
{JSON.stringify(message.tuning, null, 2)}
            </pre>
          </details>
        )}
      </div>
    </div>
  )
}