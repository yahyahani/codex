import { useRef } from 'react'

export default function QueryInput({ onSubmit, disabled, mock, onMockChange, collection, onCollectionChange }) {
  const textareaRef = useRef(null)

  const submit = (e) => {
    e.preventDefault()
    const q = textareaRef.current?.value?.trim()
    if (!q || disabled) return
    onSubmit(q)
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-3">
      <textarea
        ref={textareaRef}
        rows={4}
        disabled={disabled}
        onKeyDown={e => { if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') submit(e) }}
        placeholder="How does the Calculator track history?"
        className="w-full bg-codex-l-bg dark:bg-codex-bg border border-codex-l-border dark:border-codex-border rounded-lg px-3 py-2.5 text-sm text-codex-l-text dark:text-codex-text placeholder-codex-l-hint dark:placeholder-codex-hint font-mono resize-none focus:outline-none focus:border-codex-accent focus:ring-1 focus:ring-codex-accent/20 transition-colors duration-200 disabled:opacity-50"
      />

      <button
        type="submit"
        disabled={disabled}
        className="w-full bg-codex-accent hover:bg-codex-accent-h text-white font-semibold text-sm py-2.5 rounded-lg transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {disabled ? 'Thinking…' : 'Ask'}
      </button>

      <div className="flex flex-col gap-2 pt-0.5">
        <label className="flex items-center gap-2 text-xs text-codex-l-muted dark:text-codex-muted cursor-pointer select-none">
          <input
            type="checkbox"
            checked={mock}
            onChange={e => onMockChange(e.target.checked)}
            className="accent-codex-accent w-3.5 h-3.5 rounded"
          />
          Mock mode (no API key)
        </label>

        <label className="flex items-center gap-2 text-xs text-codex-l-muted dark:text-codex-muted">
          Collection
          <input
            type="text"
            value={collection}
            onChange={e => onCollectionChange(e.target.value)}
            className="flex-1 bg-codex-l-bg dark:bg-codex-bg border border-codex-l-border dark:border-codex-border rounded px-2 py-0.5 text-xs font-mono text-codex-l-text dark:text-codex-text focus:outline-none focus:border-codex-accent transition-colors duration-200"
          />
        </label>
      </div>
    </form>
  )
}
