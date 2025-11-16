import { useState, useRef, useEffect } from 'react'
import ChatMessage from '../components/ChatMessage'
import InferenceCurveContainer from '../components/InferenceCurveContainer'
import useAnimatedCurve from '../hooks/useAnimatedCurve'
import type { Message } from '../types/Message'
import { streamChat } from "@/services/streamChat"

import ChatInputBox from '@/components/ChatInputBox'
import DebugPanel from '@/components/DebugPanel'
import useInferencePrediction from '../hooks/useInferencePredictionReal'
import { calculateTuningParameters } from '@/inferenceTuning'

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [inferenceDepth, setInferenceDepth] = useState(0.5)
  const [showCurve, setShowCurve] = useState(false)
  const [depthLocked, setDepthLocked] = useState(false)

  const bottomRef = useRef<HTMLDivElement | null>(null)
  const chatInputRef = useRef<HTMLTextAreaElement>(null)

  const {
    prediction,
    updatePredictionFromInput,
    resetPrediction,
    debugInfo,
  } = useInferencePrediction()

  const { mean, sigma } = useAnimatedCurve(prediction)

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
      id: crypto.randomUUID(),
      role: "user",
      content: input.trim(),
    }
    setMessages(prev => [...prev, userMsg])
  
    const assistantId = crypto.randomUUID()
  
    setMessages(prev => [
      ...prev,
        {
          id: assistantId,
          role: "assistant",
          content: "",
          tuning
        }
    ])
  
    const text = input
    const tuning = calculateTuningParameters(inferenceDepth)
  
    setInput("")
    if (chatInputRef.current) {
      chatInputRef.current.style.height = 'auto'
    }
    setShowCurve(false)
    resetPrediction()
    setDepthLocked(false)
  
    // STREAMING WITH TUNING
    await streamChat(text, tuning, (token) => {
      setMessages(prev =>
        prev.map(m =>
          m.id === assistantId
            ? { ...m, content: m.content + token }
            : m
        )
      )
    })
  }


  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className="w-full min-h-screen bg-[#0f1113] text-gray-200 flex flex-col relative">

      {/* Floating Debug Panel */}
      <DebugPanel
        debug={debugInfo}
        inferenceDepth={inferenceDepth}
        prediction={prediction}
      />

      {/* HEADER */}
      <header className="h-14 px-6 flex items-center bg-none">
        <h1 className="text-lg font-medium">Aurelient</h1>
      </header>

      {/* SHIFT WRAPPER */}
      <div
        className={`
          flex-1 flex flex-col transition-all duration-300
          ${debugInfo ? "pl-40" : "pl-0"}
        `}
      >
        {/* MESSAGES */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 pb-40 scrollbar-hide">
          <div className="w-full max-w-3xl mx-auto space-y-4">
            {messages.map(m => (
              <ChatMessage key={m.id} message={m} />
            ))}
            <div ref={bottomRef} />
          </div>
        </main>

        {/* CURVE (shifts with messages) */}
        <InferenceCurveContainer
          visible={showCurve}
          mean={mean}
          sigma={sigma}
          inferenceDepth={inferenceDepth}
          setInferenceDepth={v => {
            setDepthLocked(true)
            setInferenceDepth(v)
          }}
          toggle={() => setShowCurve(v => !v)}
          onControlStart={beginControl}
          onControlEnd={endControl}
        />
      </div>

      {/* INPUT BAR (NEVER shifts) */}
      <footer className="fixed bottom-0 w-full px-4 sm:px-6 pb-5 z-50">
        {/* fade effect */}
        <div
          className="absolute inset-x-0 bottom-0 h-[calc((50%)+10px)] bg-[#0f1113] pointer-events-none"
          style={{ zIndex: 0 }}
        />
      
        <div className="w-full max-w-3xl mx-auto relative z-50">
          <form
            onSubmit={e => {
              e.preventDefault()
              sendMessage()
            }}
            className="flex gap-3"
          >
            <ChatInputBox
              ref={chatInputRef}
              input={input}
              setInput={setInput}
              sendMessage={sendMessage}
              updatePredictionFromInput={updatePredictionFromInput}
              setDepthLocked={setDepthLocked}
              setShowCurve={setShowCurve}
            />
          </form>
        </div>
      </footer>
    </div>
  )
}