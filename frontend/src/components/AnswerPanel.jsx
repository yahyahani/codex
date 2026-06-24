export default function AnswerPanel({ answer, status, error }) {
  const isLoading   = status === 'loading'
  const isStreaming = status === 'streaming'

  return (
    <section className="bg-codex-l-panel dark:bg-codex-panel border border-codex-l-border dark:border-codex-border rounded-xl p-6 min-h-[120px] shadow-sm dark:shadow-none transition-colors duration-200">
      {isLoading && (
        <div className="flex items-center gap-3 text-codex-l-muted dark:text-codex-muted text-sm font-mono">
          <span className="flex gap-1 items-center">
            {[0, 1, 2].map(i => (
              <span
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-codex-accent"
                style={{ animation: `bounceDot .9s ease-in-out ${i * 0.2}s infinite` }}
              />
            ))}
          </span>
          Retrieving relevant chunks…
        </div>
      )}

      {error && !isLoading && (
        <p className="text-red-400 text-sm font-mono">{error}</p>
      )}

      {(answer || isStreaming) && (
        <pre className="text-sm text-codex-l-text dark:text-codex-text font-mono whitespace-pre-wrap leading-relaxed">
          {answer}
          {isStreaming && <span className="text-codex-accent animate-pulse ml-px">▋</span>}
        </pre>
      )}
    </section>
  )
}
