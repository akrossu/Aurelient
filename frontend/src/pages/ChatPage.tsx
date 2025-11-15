import { useState, useRef, useEffect } from 'react'
import ChatMessage from '../components/ChatMessage'
import InferenceCurveContainer from '../components/InferenceCurveContainer'
import useAnimatedCurve from '../hooks/useAnimatedCurve'
import { fakeLLMReply } from '../services/fakeLLMReply'
import type { Message } from '../types/Message'

import { Send } from "@/components/icons/Send";

// fake
// import useInferencePrediction from '../hooks/useInferencePrediction'

// real
import useInferencePrediction from '../hooks/useInferencePredictionReal'


const uuid = () => crypto.randomUUID()

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [inferenceDepth, setInferenceDepth] = useState(0.5)
  const [showCurve, setShowCurve] = useState(true)

  const [depthLocked, setDepthLocked] = useState(false)

  const bottomRef = useRef<HTMLDivElement | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const {
    prediction,
    updatePredictionFromInput,
    resetPrediction
  } = useInferencePrediction()

  // lowkey might never use resetCurve again lol
  const { mean, sigma, resetCurve } = useAnimatedCurve(prediction)

  const [userIsControlling, setUserIsControlling] = useState(false)
  const lastUserControlTime = useRef(Date.now())

  const meanRef = useRef(mean)
  useEffect(() => { meanRef.current = mean }, [mean])

  const beginControl = () => {
    setUserIsControlling(true)
    setDepthLocked(true)
    lastUserControlTime.current = Date.now()
  }

  const endControl = () => {
    setUserIsControlling(false)
    lastUserControlTime.current = Date.now()
  }

  useEffect(() => {
    let frame: number

    const loop = () => {
      const elapsed = Date.now() - lastUserControlTime.current
      const allowFollow = !depthLocked && !userIsControlling && elapsed > 800

      if (allowFollow) {
        setInferenceDepth(prev => {
          const target = meanRef.current
          const alpha = 0.05
          const next = prev + (target - prev) * alpha
          if (Math.abs(next - target) < 0.0004) return target
          return next
        })
      }

      frame = requestAnimationFrame(loop)
    }

    frame = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(frame)
  }, [depthLocked, userIsControlling])

  const sendMessage = async () => {
    if (!input.trim()) return
  
    const userMsg: Message = {
      id: uuid(),
      role: 'user',
      content: input.trim(),
    }
  
    setMessages(prev => [...prev, userMsg])
  
    const reply = await fakeLLMReply(input, inferenceDepth, prediction)
  
    setMessages(prev => [
      ...prev,
      { id: uuid(), role: 'assistant', content: reply },
    ])
  
    setInput('')

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.borderRadius = "9999px"
    }

    resetPrediction()
    setDepthLocked(false)
  }

  useEffect(() => { 
    if (textareaRef.current) { 
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
      textareaRef.current.style.overflowY = 'hidden'
    } 
  }, [])
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' })}, [messages])

  return (
    <div className="w-full h-screen bg-[#0f1113] text-gray-200 flex flex-col relative">

      <header className="h-14 px-6 flex items-center bg-none">
        <h1 className="text-lg font-medium">Aurelient</h1>
      </header>

      <main className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 pb-[260px] scrollbar-hide">
        <div className="w-full max-w-3xl mx-auto space-y-4">
          {messages.map(m => <ChatMessage key={m.id} message={m} />)}
          <div ref={bottomRef} />
        </div>
      </main>

      <InferenceCurveContainer
        visible={showCurve}
        mean={mean}
        sigma={sigma}
        inferenceDepth={inferenceDepth}
        setInferenceDepth={(v) => {
          setDepthLocked(true)
          setInferenceDepth(v)
        }}
        toggle={() => setShowCurve(v => !v)}
        onControlStart={beginControl}
        onControlEnd={endControl}
      />

      {/* <footer className="px-4 sm:px-6 py-5 backdrop-blur-xl"> */}
      <footer className='fixed bottom-0 w-full px-4 sm:px-6 pb-5 z-50'>
      <div
      className="absolute inset-x-0 bottom-0 h-[calc((50%)+10px)] bg-[#0f1113] pointer-events-none"
      style={{ zIndex: 0 }}/>
        <div className="w-full max-w-3xl mx-auto">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              sendMessage()
            }}
            className="flex gap-3"
          >
            <div className="relative flex-1">
              <textarea
                rows={1}
                ref={textareaRef}
                className="
                  w-full max-h-32 rounded-full bg-[#1a1c1f] border border-white/10
                  px-5 pr-12 py-3 text-sm placeholder-gray-500
                  focus:outline-none focus:ring-2 focus:ring-blue-500/40
                  shadow-inner transition-[height] duration-120 ease-in-out
                  resize-none whitespace-pre-wrap
                  overflow-y-auto box-border
                "
                placeholder="Start by asking a question..."
                value={input}
                onChange={(e) => {
                  const v = e.target.value;
                  setInput(v)
                  setDepthLocked(false)
                  updatePredictionFromInput(v)

                  e.target.style.height = 'auto'
                  const maxHeight = 128 // h-32
                  e.target.style.height = `${Math.min(e.target.scrollHeight, maxHeight)}px`
                  e.target.style.overflowY = e.target.scrollHeight > maxHeight ? "auto" : "hidden"
                  e.target.style.borderRadius = e.target.scrollHeight > 50 ? "0.75rem" : "9999px" // v kewl
                }}
              />

              <button
                type="submit"
                disabled={!input}
                aria-label="Send message"
                className={`
                  absolute right-3 top-1/2 -translate-y-1/2 p-1
                  transition-opacity duration-300
                  focus:outline-none focus:ring-2 focus:ring-blue-500/40
                  ${input.trim() ? "opacity-100 cursor-pointer" : "opacity-0 cursor-not-allowed"}
                `}
              >
                <Send className="w-5 h-5 text-gray-400 hover:text-white transition" />
              </button>
            </div>
          </form>

        </div>
      </footer>
    </div>
  )
}
