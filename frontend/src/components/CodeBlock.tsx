import { useState } from "react"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { nightOwl } from "react-syntax-highlighter/dist/esm/styles/prism"

// load languages explicitly (Prism requires this)
import "react-syntax-highlighter/dist/esm/languages/prism/python"
import "react-syntax-highlighter/dist/esm/languages/prism/javascript"
import "react-syntax-highlighter/dist/esm/languages/prism/typescript"
import "react-syntax-highlighter/dist/esm/languages/prism/bash"
import "react-syntax-highlighter/dist/esm/languages/prism/json"

interface CodeBlockProps {
  inline?: boolean
  className?: string
  children?: React.ReactNode
}

export default function CodeBlock({
  inline = false,
  className = "",
  children,
  ...props
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false)

  const match = /language-(\S+)/.exec(className)
  const lang = match ? match[1] : undefined

  const code = typeof children === "string"
    ? children.replace(/\n$/, "")
    : String(children)

  const handleCopy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 1000)
  }

  // inline code
  if (inline) {
    return (
      <code className="px-1 py-0.5 bg-black/40 rounded text-[0.85em]">
        {children}
      </code>
    )
  }

  // block code
  return (
    <div className="relative group">
      <button
        onClick={handleCopy}
        className="
          absolute top-2 right-2 text-xs px-2 py-1 rounded
          bg-black/40 hover:bg-black/60 border border-white/10
          opacity-0 group-hover:opacity-100 transition
        "
      >
        {copied ? "copied" : "copy"}
      </button>

      <SyntaxHighlighter
        style={nightOwl}
        language={lang}
        PreTag="div"
        customStyle={{
          margin: 0,
          padding: "14px",
          borderRadius: "10px",
          background: "rgba(0,0,0,0.35)",
          fontSize: "0.85rem",
        }}
        {...props}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  )
}