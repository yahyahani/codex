export default function AnswerPanel({ question, answer, status, error }) {
  const isLoading   = status === 'loading'
  const isStreaming = status === 'streaming'
  const isEmpty     = !question && status === 'idle'

  if (isEmpty) {
    return (
      <div className="flex items-center justify-center h-48 text-faint text-sm font-mono select-none">
        ← ask a question to begin
      </div>
    )
  }

  return (
    <section className="flex flex-col gap-4">
      {question && (
        <h2 className="text-base font-semibold text-text leading-snug">
          {question}
        </h2>
      )}

      <div className="bg-surface border border-border rounded-xl p-6 min-h-[100px]">
        {isLoading && (
          <div className="flex items-center gap-3 text-muted text-sm font-mono">
            <span className="flex gap-1 items-center">
              {[0, 1, 2].map(i => (
                <span
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-accent"
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
          <pre
            className="text-sm text-text font-mono whitespace-pre-wrap leading-relaxed"
            style={isStreaming ? { '--tw-content': '"▋"' } : {}}
          >
            {answer}
            {isStreaming && (
              <span className="text-accent animate-pulse ml-px">▋</span>
            )}
          </pre>
        )}
      </div>
    </section>
  )
}
