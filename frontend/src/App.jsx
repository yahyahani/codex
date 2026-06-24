import { useState, useEffect, useCallback } from 'react'
import Logo          from './components/Logo.jsx'
import ThemeToggle   from './components/ThemeToggle.jsx'
import QueryInput    from './components/QueryInput.jsx'
import QueryHistory  from './components/QueryHistory.jsx'
import AnswerPanel   from './components/AnswerPanel.jsx'
import SourceCard    from './components/SourceCard.jsx'

export default function App() {
  const [theme,           setTheme]           = useState('dark')
  const [history,         setHistory]         = useState([])
  const [status,          setStatus]          = useState('idle')
  const [streamingAnswer, setStreamingAnswer] = useState('')
  const [sources,         setSources]         = useState([])
  const [error,           setError]           = useState(null)
  const [question,        setQuestion]        = useState('')
  const [mock,            setMock]            = useState(false)
  const [collection,      setCollection]      = useState('codebase')

  // keep html .dark class in sync with theme state
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  const toggleTheme = useCallback(() => setTheme(t => t === 'dark' ? 'light' : 'dark'), [])

  const handleSubmit = async (q) => {
    setStatus('loading')
    setStreamingAnswer('')
    setSources([])
    setError(null)
    setQuestion(q)

    try {
      const resp = await fetch('/ask/stream', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ question: q, collection, mock }),
      })
      if (!resp.ok) throw new Error(`${resp.status} ${resp.statusText}`)
      setStatus('streaming')

      const reader  = resp.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      let fullAnswer   = ''
      let finalSources = []

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop()

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const payload = line.slice(6).trim()
          if (payload === '[DONE]') continue
          let event
          try { event = JSON.parse(payload) } catch { continue }
          if (event.type === 'text') {
            fullAnswer += event.content
            setStreamingAnswer(fullAnswer)
          } else if (event.type === 'sources') {
            finalSources = event.content
            setSources(event.content)
          }
        }
      }

      setHistory(h => [...h, { question: q, answer: fullAnswer, sources: finalSources }])
      setStatus('idle')
    } catch (err) {
      setError(
        err.message.toLowerCase().includes('fetch')
          ? 'Cannot reach the backend — is the server running on port 8000?'
          : err.message
      )
      setStatus('error')
    }
  }

  const loadFromHistory = (entry) => {
    setQuestion(entry.question)
    setStreamingAnswer(entry.answer)
    setSources(entry.sources)
    setStatus('idle')
    setError(null)
  }

  const busy   = status === 'loading' || status === 'streaming'
  const isEmpty = !question && status === 'idle'

  // Radial gradient overlay — electric blue at very low opacity
  const gradientStyle = {
    background: `radial-gradient(circle at 0% 0%, rgba(0,102,255,${theme === 'dark' ? '0.04' : '0.03'}) 0%, transparent 60%)`,
  }

  return (
    <div className="flex h-screen overflow-hidden bg-codex-l-bg dark:bg-codex-bg text-codex-l-text dark:text-codex-text font-sans transition-colors duration-200">

      {/* Background gradient overlay */}
      <div className="pointer-events-none fixed inset-0 z-0" style={gradientStyle} />

      {/* ── Sidebar ── */}
      <aside className="relative z-10 w-80 shrink-0 border-r border-codex-l-border dark:border-codex-border flex flex-col bg-codex-l-panel dark:bg-codex-panel transition-colors duration-200">
        {/* Logo + name */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-codex-l-border dark:border-codex-border">
          <Logo size={28} />
          <div>
            <span className="font-semibold text-sm tracking-tight text-codex-l-text dark:text-codex-text">
              Codex
            </span>
            <p className="text-xs text-codex-l-muted dark:text-codex-muted leading-none mt-0.5">
              Codebase Q&amp;A
            </p>
          </div>
        </div>

        {/* Input + history */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-5">
          <QueryInput
            onSubmit={handleSubmit}
            disabled={busy}
            mock={mock}
            onMockChange={setMock}
            collection={collection}
            onCollectionChange={setCollection}
          />
          <div className="border-t border-codex-l-border dark:border-codex-border pt-4">
            <QueryHistory history={history} onSelect={loadFromHistory} />
          </div>
        </div>
      </aside>

      {/* ── Main panel ── */}
      <main className="relative z-10 flex-1 flex flex-col overflow-hidden">
        {/* Top bar with current question + theme toggle */}
        <header className="flex items-center justify-between px-8 py-3 border-b border-codex-l-border dark:border-codex-border bg-codex-l-panel/80 dark:bg-codex-panel/80 backdrop-blur-sm transition-colors duration-200">
          <span className="text-xs text-codex-l-muted dark:text-codex-muted truncate max-w-lg font-mono">
            {question || 'No question yet'}
          </span>
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
        </header>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-8 flex flex-col gap-6">

          {isEmpty ? (
            /* Empty state */
            <div className="flex-1 flex flex-col items-center justify-center gap-5 py-24 select-none">
              <Logo size={64} className="opacity-[0.12]" />
              <p className="text-sm text-codex-l-hint dark:text-codex-hint font-mono">
                Ask a question about your codebase
              </p>
            </div>
          ) : (
            <>
              {mock && (
                <div className="inline-flex items-center gap-2 text-xs font-mono text-codex-accent border border-codex-accent/30 bg-codex-accent/5 rounded px-3 py-1.5 w-fit">
                  <span className="w-1.5 h-1.5 rounded-full bg-codex-accent animate-pulse" />
                  Demo mode — no API key required
                </div>
              )}

              <AnswerPanel
                answer={streamingAnswer}
                status={status}
                error={error}
              />

              {sources.length > 0 && (
                <section>
                  <h3 className="text-xs font-semibold text-codex-l-hint dark:text-codex-hint tracking-widest uppercase mb-4">
                    Evidence — {sources.length} source{sources.length !== 1 ? 's' : ''}
                  </h3>
                  <div className={sources.length > 2 ? 'grid grid-cols-2 gap-4' : 'flex flex-col gap-4'}>
                    {sources.map((src, i) => (
                      <SourceCard key={`${src.file}-${src.start_line}-${i}`} source={src} index={i} />
                    ))}
                  </div>
                </section>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  )
}
