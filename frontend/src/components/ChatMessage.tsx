import type { Message } from '../types/Message'

interface ChatMessageProps {
  message: Message
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user'

  return (
    <div
      className={`w-full flex ${
        isUser ? 'justify-end' : 'justify-start'
      } mb-3`}
    >
      <div
        className={`
          px-4 py-2 rounded-xl text-sm whitespace-pre-wrap wrap-break-word
          max-w-[90%] sm:max-w-[75%] backdrop-blur-sm
          shadow-[0_4px_14px_rgba(0,0,0,0.3)]
          ${
            isUser
              ? 'bg-blue-600 text-white rounded-br-md'
              : 'bg-white/5 text-gray-200 border border-white/10 rounded-bl-md'
          }
        `}
      >
        {message.content}
      </div>
    </div>
  )
}
