import { useState, useRef, useEffect } from "react"
import ChatMessage from "@/components/ChatMessage"
import ChatInputBox from "@/components/ChatInputBox"
import InferenceCurveContainer from "@/components/InferenceCurveContainer"
import DebugPanel from "@/components/DebugPanel"

import useAnimatedCurve from "@/hooks/useAnimatedCurve"
import usePrediction from "@/hooks/useInferencePredictionReal"
import { useInferenceDepth } from "@/hooks/useInferenceDepth"
import { useDepthAutoFollow } from "@/hooks/useDepthAutoFollow"
import { useChatMessages } from "@/hooks/useChatMessages"

import { calculateTuningParameters } from "@/inferenceTuning"

import { useDebugClass } from "@/utils/debugStyles"

export default function ChatPage() {
  const bottomRef = useRef<HTMLDivElement | null>(null)
  const chatInputRef = useRef<HTMLTextAreaElement>(null)

  // debug boundaries
  const pageDebug = useDebugClass("border-red-500")
  const headerDebug = useDebugClass("border-yellow-500")
  const mainDebug = useDebugClass("border-blue-500")
  const innerMainDebug = useDebugClass("border-green-500")
  const footerDebug = useDebugClass("border-purple-500")
  const formDebug = useDebugClass("border-yellow-500")

  // prediction + tuning + input state
  const {
    prediction,
    updatePredictionFromInput,
    resetPrediction,
    debugInfo,
    isDefault,
    markJustSent
  } = usePrediction()

  const { mean, sigma } = useAnimatedCurve(prediction)

  const {
    depth,
    setDepth,
    setDepthRaw,
    locked,
    setLocked,
    unlock,
    userIsControlling,
    beginControl,
    endControl,
  } = useInferenceDepth()

  useDepthAutoFollow(mean, locked, userIsControlling, setDepthRaw)

  const { messages, sendMessage } = useChatMessages()

  const [input, setInput] = useState("")
  const [showCurve, setShowCurve] = useState(false)

  // auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSend = async () => {
    const trimmed = input.trim()
    if (!trimmed) return

    const text = trimmed
    setInput("")
    markJustSent()
    resetPrediction()

    if (chatInputRef.current) {
      chatInputRef.current.style.height = "auto"
      chatInputRef.current.style.borderRadius = "9999px"
    }

    setShowCurve(false)
    unlock()

    const tuning = calculateTuningParameters(depth)
    await sendMessage(text, tuning)
  }

  // auto-focus control
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return

      const active = document.activeElement

      if (e.key === "Enter" && !e.shiftKey) {
        if (input.trim().length > 0) {
          e.preventDefault()
          handleSend()
          return
        }
      }

      if (active !== chatInputRef.current) {
        chatInputRef.current?.focus()
      }
    }

    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [input])

  return (
    <div
      className={`
        w-full min-h-screen bg-[#0f1113] text-gray-200
        flex flex-col relative
        ${pageDebug}
      `}
    >
      {/* DEBUG PANEL */}
      <DebugPanel
        debug={debugInfo}
        inferenceDepth={depth}
        prediction={prediction}
        isDefault={isDefault}
      />

      {/* HEADER */}
      <header
        className={`
          sticky top-0 z-50 h-14 px-6 flex items-center bg-[#0f1113]
          after:absolute after:left-0 after:right-0 after:-bottom-2 after:h-2
          after:bg-linear-to-b after:from-[#0f1113] after:to-transparent after:pointer-events-none
          ${headerDebug}
        `}
      >
        <img src="/logo.svg" alt="Logo" className="w-7 h-6 mr-3" draggable="false"/>
        <h1 className="text-lg font-medium">Aurelient</h1>
      </header>

      {/* MAIN CONTENT */}
      <main
        className={`
          flex-1 overflow-y-auto px-4 sm:px-6
          pt-20 pb-[260px] scrollbar-hide
          ${mainDebug}
        `}
      >
        <div
          className={`
            w-full max-w-3xl mx-auto space-y-4
            ${innerMainDebug}
          `}
        >
          {messages.map(m => (
            <ChatMessage key={m.id} message={m} />
          ))}
          <div ref={bottomRef} />
        </div>
      </main>

      {/* INFERENCE CURVE OVERLAY */}
      <InferenceCurveContainer
        visible={showCurve}
        mean={mean}
        sigma={sigma}
        inferenceDepth={depth}
        setInferenceDepth={setDepth}
        onControlStart={beginControl}
        onControlEnd={endControl}
      />

      {/* FOOTER */}
      <footer
        className={`
          fixed bottom-0 w-full px-4 sm:px-6 pb-5 z-50
          ${footerDebug}
        `}
      >
        <div className="absolute inset-x-0 bottom-0 h-[calc(50%+10px)] bg-[#0f1113] pointer-events-none" />

        <div className={`w-full max-w-3xl mx-auto relative z-50`}>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSend()
            }}
            className={`flex gap-3 ${formDebug}`}
          >
            <ChatInputBox
              ref={chatInputRef}
              input={input}
              setInput={setInput}
              sendMessage={handleSend}
              updatePredictionFromInput={updatePredictionFromInput}
              setDepthLocked={setLocked}
              setShowCurve={setShowCurve}
            />
          </form>
        </div>
      </footer>
    </div>
  )
}