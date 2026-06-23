import { useState } from 'react'
import QueryInput   from './components/QueryInput.jsx'
import QueryHistory from './components/QueryHistory.jsx'
import AnswerPanel  from './components/AnswerPanel.jsx'
import SourceCard   from './components/SourceCard.jsx'

export default function App() {
  const [history,         setHistory]         = useState([])
  const [status,          setStatus]          = useState('idle') // idle | loading | streaming | error
  const [streamingAnswer, setStreamingAnswer] = useState('')
  const [sources,         setSources]         = useState([])
  const [error,           setError]           = useState(null)
  const [question,        setQuestion]        = useState('')
  const [mock,            setMock]            = useState(false)
  const [collection,      setCollection]      = useState('codebase')

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
      let fullAnswer  = ''
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
      const msg = err.message.toLowerCase().includes('fetch')
        ? 'Cannot reach the backend — is the server running on port 8000?'
        : err.message
      setError(msg)
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

  return (
    <div className="flex h-screen bg-bg text-text font-sans overflow-hidden">

      {/* ── Sidebar ── */}
      <aside className="w-72 shrink-0 border-r border-border flex flex-col bg-surface">
        <div className="px-5 py-4 border-b border-border">
          <span className="text-xs font-semibold text-faint tracking-widest uppercase">
            Codebase Q&amp;A
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-5">
          <QueryInput
            onSubmit={handleSubmit}
            disabled={status === 'loading' || status === 'streaming'}
            mock={mock}
            onMockChange={setMock}
            collection={collection}
            onCollectionChange={setCollection}
          />
          <div className="border-t border-border pt-4">
            <QueryHistory history={history} onSelect={loadFromHistory} />
          </div>
        </div>
      </aside>

      {/* ── Main panel ── */}
      <main className="flex-1 overflow-y-auto p-8 flex flex-col gap-6">
        {mock && (
          <div className="inline-flex items-center gap-2 text-xs font-mono text-accent border border-accent/30 bg-accent/5 rounded px-3 py-1.5 w-fit">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            Demo mode — no API key required
          </div>
        )}

        <AnswerPanel
          question={question}
          answer={streamingAnswer}
          status={status}
          error={error}
        />

        {sources.length > 0 && (
          <section>
            <h3 className="text-xs font-semibold text-faint tracking-widest uppercase mb-4">
              Evidence — {sources.length} source{sources.length !== 1 ? 's' : ''}
            </h3>
            <div className="flex flex-col gap-4">
              {sources.map((src, i) => (
                <SourceCard key={`${src.file}-${src.start_line}-${i}`} source={src} index={i} />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  )
}
