export default function QueryHistory({ history, onSelect }) {
  if (history.length === 0) {
    return (
      <p className="text-xs text-faint leading-relaxed mt-1">
        No history yet — ask a question to get started.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-1">
      <p className="text-xs font-semibold text-faint tracking-widest uppercase mb-1">
        History
      </p>
      {[...history].reverse().map((entry, i) => (
        <button
          key={i}
          onClick={() => onSelect(entry)}
          title={entry.question}
          className="text-left text-xs text-muted hover:text-text truncate py-1.5 px-2 rounded hover:bg-panel transition-colors"
        >
          {entry.question}
        </button>
      ))}
    </div>
  )
}
