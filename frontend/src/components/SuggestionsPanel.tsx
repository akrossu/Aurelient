interface Props {
  show: boolean
  suggestions: string[]
}

export default function SuggestionsPanel({ show, suggestions }: Props) {
  if (!show) return null

  return (
    <aside className="fixed right-0 top-14 w-[300px] h-[calc(100%-56px)] bg-black/20 backdrop-blur-md border-l border-white/10 px-4 py-4 overflow-y-auto z-40">
      <h2 className="text-sm mb-3 text-gray-400">suggestions</h2>

      <ul className="space-y-2 text-sm">
        {suggestions.map((s, i) => (
          <li
            key={i}
            className="p-2 rounded bg-white/5 hover:bg-white/10 transition"
          >
            {s}
          </li>
        ))}
      </ul>
    </aside>
  )
}
