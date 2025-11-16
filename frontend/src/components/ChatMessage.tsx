import { useRef, useEffect, useState } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeRaw from "rehype-raw"
import rehypeSanitize from "rehype-sanitize"
import type { Message } from "../types/Message"
import CodeBlock from "./CodeBlock"
import TechnicalDetails from "./TechnicalDetails"
import { useDebugClass } from "@/utils/debugStyles"

interface ChatMessageProps {
  message: Message
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user"
  const bubbleRef = useRef<HTMLDivElement>(null)
  const [borderRadius, setBorderRadius] = useState("9999px")

  const bubbleDebug = useDebugClass("border-green-500")    // bubble
  const markdownDebug = useDebugClass("border-yellow-500") // markdown wrapper
  const techDebug = useDebugClass("border-blue-500")       // technical details wrapper

  useEffect(() => {
    if (!bubbleRef.current) return

    const h = bubbleRef.current.offsetHeight
    const base = h > 50 ? "0.75rem" : "9999px"

    if (isUser) {
      setBorderRadius(
        h > 50 ? `${base} ${base} 0.25rem ${base}` : `${base} ${base} ${base} ${base}`
      )
    } else {
      setBorderRadius(
        h > 50 ? `${base} 0.25rem ${base} ${base}` : `${base} ${base} ${base} ${base}`
      )
    }
  }, [message.content])

  return (
    <div
      className={`w-full flex ${isUser ? "justify-end" : "justify-start"} mb-3`}
    >
      <div
        ref={bubbleRef}
        style={{ borderRadius }}
        className={`
          max-w-[75%] md:max-w-[70%]
          ${isUser ? "px-4 py-2.5" : "px-3 py-2"}
          text-[0.95rem] leading-[1.35rem]

          ${isUser
            ? "bg-blue-600 text-white"
            : "bg-white/5 text-gray-200 border border-white/10"}
          
          ${bubbleDebug}
        `}
      >
        <div
          className={`
            markdown-body whitespace-pre-line
            [&_ul]:list-disc [&_ol]:list-decimal
            [&_ul]:ml-5 [&_ol]:ml-5
            [&_li]:my-1
            ${markdownDebug}
          `}
        >
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw, rehypeSanitize]}
            components={{
              code: (props) => <CodeBlock {...props} />,
            }}
          >
            {message.content}
          </ReactMarkdown>
        </div>

        {!isUser && (message.tuning || message.metrics) && (
          <div className={`mt-2 ${techDebug}`}>
            <TechnicalDetails
              tuning={message.tuning}
              metrics={message.metrics}
            />
          </div>
        )}
      </div>
    </div>
  )
}