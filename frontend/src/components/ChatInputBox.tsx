import { useRef, forwardRef, useImperativeHandle } from 'react'
import { SendHorizonal } from 'lucide-react'
import { useDebugClass } from "@/utils/debugStyles"

interface Props {
  input: string
  setInput: (v: string) => void
  sendMessage: () => void
  updatePredictionFromInput: (v: string) => void
  setDepthLocked: (v: boolean) => void
  setShowCurve: (v: boolean) => void
}

const ChatInputBox = forwardRef<HTMLTextAreaElement, Props>(({
  input,
  setInput,
  sendMessage,
  updatePredictionFromInput,
  setDepthLocked,
  setShowCurve,
}, ref) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Expose the textarea ref to parent
  useImperativeHandle(ref, () => textareaRef.current!)

  const wrapDebug = useDebugClass("border-red-500")        // outer wrapper
  const textareaDebug = useDebugClass("border-purple-500") // textarea core
  const buttonDebug = useDebugClass("border-yellow-500")   // send button

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const v = e.target.value

    setInput(v)
    setDepthLocked(false)
    updatePredictionFromInput(v)
    setShowCurve(v.length > 0)

    const el = e.target
    el.style.height = 'auto'
    const maxHeight = 128
    el.style.height = `${Math.min(el.scrollHeight, maxHeight)}px`
    el.style.overflowY = el.scrollHeight > maxHeight ? 'auto' : 'hidden'
    el.style.borderRadius = el.scrollHeight > 50 ? '0.75rem' : '9999px'
  }

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className={`relative flex-1 ${wrapDebug}`}>
      <textarea
        ref={textareaRef}
        rows={1}
        placeholder="Start by asking a question..."
        value={input}
        onChange={handleChange}
        onKeyDown={handleKey}
        className={`
          w-full max-h-32 rounded-full bg-[#1a1c1f] border border-white/10
          px-5 pr-12 py-3 text-sm placeholder-gray-500
          focus:outline-none focus:ring-0 focus:ring-blue-500/40
          shadow-inner transition-[height] duration-120 ease-in-out
          resize-none whitespace-pre-wrap overflow-y-auto box-border
          ${textareaDebug}
        `}
      />

      <button
        type="submit"
        disabled={!input.trim()}
        aria-label="Send message"
        className={`
          absolute right-3 pt-3 p-1
          transition-opacity duration-300
          focus:outline-none focus:ring-2 focus:ring-blue-500/40
          ${input.trim() ? 'opacity-100 cursor-pointer' : 'opacity-0 cursor-not-allowed'}
          ${buttonDebug}
        `}
      >
        <SendHorizonal className='w-5 h-5' />
      </button>
    </div>
  )
})

export default ChatInputBox