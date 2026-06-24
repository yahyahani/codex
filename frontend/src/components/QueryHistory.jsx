export default function QueryHistory({ history, onSelect }) {
  if (history.length === 0) {
    return (
      <p className="text-xs text-codex-l-hint dark:text-codex-hint leading-relaxed">
        No history yet — ask a question to get started.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-1">
      <p className="text-xs font-semibold text-codex-l-hint dark:text-codex-hint tracking-widest uppercase mb-2">
        History
      </p>
      {[...history].reverse().map((entry, i) => (
        <button
          key={i}
          onClick={() => onSelect(entry)}
          title={entry.question}
          className="text-left text-xs text-codex-l-muted dark:text-codex-muted hover:text-codex-l-text dark:hover:text-codex-text truncate py-1.5 px-2 rounded hover:bg-codex-l-bg dark:hover:bg-codex-bg transition-colors duration-200"
        >
          {entry.question}
        </button>
      ))}
    </div>
  )
}
