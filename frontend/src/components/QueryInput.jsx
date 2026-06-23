import { useRef } from 'react'

export default function QueryInput({ onSubmit, disabled, mock, onMockChange, collection, onCollectionChange }) {
  const textareaRef = useRef(null)

  const submit = (e) => {
    e.preventDefault()
    const q = textareaRef.current?.value?.trim()
    if (!q || disabled) return
    onSubmit(q)
  }

  const handleKeyDown = (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') submit(e)
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-3">
      <textarea
        ref={textareaRef}
        rows={4}
        disabled={disabled}
        onKeyDown={handleKeyDown}
        placeholder="How does the Calculator track history?"
        className="w-full bg-panel border border-border rounded-lg px-3 py-2.5 text-sm text-text placeholder-faint font-mono resize-none focus:outline-none focus:border-accent/60 focus:ring-1 focus:ring-accent/20 transition-colors disabled:opacity-50"
      />

      <button
        type="submit"
        disabled={disabled}
        className="w-full bg-accent hover:bg-accent-dim text-bg font-semibold text-sm py-2.5 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {disabled ? 'Thinking…' : 'Ask →'}
      </button>

      <div className="flex flex-col gap-2 pt-0.5">
        <label className="flex items-center gap-2 text-xs text-muted cursor-pointer select-none">
          <input
            type="checkbox"
            checked={mock}
            onChange={e => onMockChange(e.target.checked)}
            className="accent-accent w-3.5 h-3.5"
          />
          Mock mode (no API key)
        </label>

        <label className="flex items-center gap-2 text-xs text-muted">
          Collection
          <input
            type="text"
            value={collection}
            onChange={e => onCollectionChange(e.target.value)}
            className="flex-1 bg-panel border border-border rounded px-2 py-0.5 text-xs font-mono text-text focus:outline-none focus:border-accent/60 transition-colors"
          />
        </label>
      </div>
    </form>
  )
}
