// src/components/ChatMessage.tsx
import { useRef, useEffect, useState } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeRaw from "rehype-raw"
import rehypeSanitize from "rehype-sanitize"
import type { Message } from "@/types/Message"
import CodeBlock from "./CodeBlock"
import TechnicalDetails from "./TechnicalDetails"

export default function ChatMessage({ message }: { message: Message }) {
  const isUser = message.role === "user"
  const ref = useRef<HTMLDivElement>(null)
  const [radius, setRadius] = useState("9999px")

  useEffect(() => {
    if (!ref.current) return
    const h = ref.current.offsetHeight
    const r = h > 50 ? "0.75rem" : "9999px"

    if (isUser) {
      setRadius(h > 50 ? `${r} ${r} 0.25rem ${r}` : `${r} ${r} ${r} ${r}`)
    } else {
      setRadius(h > 50 ? `${r} 0.25rem ${r} ${r}` : `${r} ${r} ${r} ${r}`)
    }
  }, [message.content])

  return (
    <div className={`w-full flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className="max-w-[80%] bg-[#0f1113]" ref={ref}>
        
        {/* MESSAGE BUBBLE */}
        <div
          style={{ borderRadius: radius }}
          className={`
            px-4 py-2 w-full
            ${isUser
              ? "bg-blue-600 text-white"
              : "bg-white/5 text-gray-200 border border-white/10"}
          `}
        >
          {/* MAIN TEXT */}
          <div
            className="
              markdown-body
              whitespace-pre-line
              text-[0.95rem]
              leading-[1.35rem]
              [&_ul]:list-disc [&_ol]:list-decimal
              [&_ul]:ml-5 [&_ol]:ml-5
              [&_li]:my-1
              [&_li_p]:my-0
            "
          >
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw, rehypeSanitize]}
              components={{
                code(props) {
                  return <CodeBlock {...props} />
                },
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>

          {/* TECHNICAL DETAILS */}
          {!isUser && (message.tuning || message.metrics) && (
            <div className="mt-3">
              <TechnicalDetails
                tuning={message.tuning}
                metrics={message.metrics}
              />
            </div>
          )}
        </div>

      </div>
    </div>
  )
}