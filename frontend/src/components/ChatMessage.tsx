import { useRef, useEffect, useState } from 'react'
import type { Message } from '../types/Message'

interface ChatMessageProps {
  message: Message
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user'
  const messageRef = useRef<HTMLDivElement>(null)
  const [borderRadius, setBorderRadius] = useState('9999px%')

  useEffect(() => {
    if (messageRef.current) {
      const height = messageRef.current.offsetHeight
      const r = height > 50 ? '0.75rem' : '9999px'
      if (isUser) {
        if (height > 50) setBorderRadius(`${r} ${r} 0.25rem ${r}`)
        else setBorderRadius(`${r} ${r} ${r} ${r}`)
      } else {
        if (height > 50) setBorderRadius(`${r} ${r} ${r} 0.25rem`)
        else setBorderRadius(`${r} ${r} ${r} ${r}`)
      }
    }
  }, [message.content, isUser])

  return (
    <div className={`w-full flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}>
      <div
        ref={messageRef}
        style={{ borderRadius }}
        className={`
          px-4 py-2 text-sm whitespace-pre-wrap
          max-w-[90%] sm:max-w-[75%] backdrop-blur-sm
          shadow-[0_4px_14px_rgba(0,0,0,0.3)]
          ${isUser
            ? 'bg-blue-600 text-white' 
            : 'bg-white/5 text-gray-200 border border-white/10'}
        `}
      >
        {message.content}
      </div>
    </div>
  )
}
