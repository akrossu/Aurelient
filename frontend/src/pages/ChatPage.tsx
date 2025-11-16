// src/pages/ChatPage.tsx

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

export default function ChatPage() {
  const bottomRef = useRef<HTMLDivElement | null>(null)

  // prediction model
  const { prediction, updatePredictionFromInput, resetPrediction, debugInfo } =
    usePrediction()

  // animated curve
  const { mean, sigma, resetCurve } = useAnimatedCurve(prediction)

  // inference depth subsystem
  const {
    depth,
    setDepth,
    setDepthRaw,
    locked,
    setLocked,          // <-- add this line
    unlock,
    userIsControlling,
    beginControl,
    endControl,
  } = useInferenceDepth()


  // auto-follow
  useDepthAutoFollow(mean, locked, userIsControlling, setDepthRaw)

  // chat messages
  const { messages, sendMessage } = useChatMessages()

  // UI state
  const [input, setInput] = useState("")
  const [showCurve, setShowCurve] = useState(false)

  // scroll to bottom when messages update
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSend = async () => {
    if (!input.trim()) return
    
    const text = input
    setInput("")
    resetPrediction()
    setShowCurve(false)
    unlock()                    // unlock BEFORE streaming
  
    const tuning = calculateTuningParameters(depth)
    await sendMessage(text, tuning)
  }

  return (
    <div className="w-full min-h-screen bg-[#0f1113] text-gray-200 flex flex-col relative">
      <DebugPanel
        debug={debugInfo}
        inferenceDepth={depth}
        prediction={prediction}
      />

      <header className="h-14 px-6 flex items-center bg-none">
        <h1 className="text-lg font-medium">Aurelient</h1>
      </header>

      <main className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 pb-40 scrollbar-hide">
        <div className="w-full max-w-3xl mx-auto space-y-4">
          {messages.map(m => (
            <ChatMessage key={m.id} message={m} />
          ))}
          <div ref={bottomRef} />
        </div>
      </main>

      <InferenceCurveContainer
        visible={showCurve}
        mean={mean}
        sigma={sigma}
        inferenceDepth={depth}
        setInferenceDepth={setDepth}
        toggle={() => setShowCurve(v => !v)}
        onControlStart={beginControl}
        onControlEnd={endControl}
      />

      <footer className="fixed bottom-0 w-full px-4 sm:px-6 pb-5 z-50">
        <div className="absolute inset-x-0 bottom-0 h-[calc((50%)+10px)] bg-[#0f1113] pointer-events-none" />

        <div className="w-full max-w-3xl mx-auto relative z-50">
          <form
            onSubmit={e => {
              e.preventDefault()
              handleSend()
            }}
            className="flex gap-3"
          >
            <ChatInputBox
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