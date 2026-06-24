import hljs from 'highlight.js/lib/core'
import python     from 'highlight.js/lib/languages/python'
import javascript from 'highlight.js/lib/languages/javascript'
import typescript from 'highlight.js/lib/languages/typescript'
import json       from 'highlight.js/lib/languages/json'
import yaml       from 'highlight.js/lib/languages/yaml'
import bash       from 'highlight.js/lib/languages/bash'
import 'highlight.js/styles/atom-one-dark.css'

hljs.registerLanguage('python',     python)
hljs.registerLanguage('javascript', javascript)
hljs.registerLanguage('typescript', typescript)
hljs.registerLanguage('json',       json)
hljs.registerLanguage('yaml',       yaml)
hljs.registerLanguage('bash',       bash)

const EXT_MAP = {
  py: 'python', js: 'javascript', jsx: 'javascript',
  ts: 'typescript', tsx: 'typescript', json: 'json',
  yml: 'yaml', yaml: 'yaml', sh: 'bash', bash: 'bash',
}

function detectLang(filename) {
  const ext = (filename || '').split('.').pop()?.toLowerCase()
  return EXT_MAP[ext] ?? null
}

function highlight(code, lang) {
  if (!code) return ''
  try {
    const validLang = lang && hljs.getLanguage(lang) ? lang : null
    const result = validLang
      ? hljs.highlight(code, { language: validLang })
      : hljs.highlightAuto(code)
    return result.value
  } catch {
    return code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  }
}

export default function SourceCard({ source, index }) {
  const { file, start_line, end_line, code } = source

  const cleanPath = (file || '').replace(/^\/?repo\//, '')
  const parts     = cleanPath.split('/')
  const filename  = parts.pop()
  const dir       = parts.join('/')
  const lang      = detectLang(filename)

  // Highlight the full block then split — preserves multi-line tokens
  const hlLines   = highlight(code || '', lang).split('\n')
  const rawLines  = (code || '').split('\n')

  return (
    <div
      className="bg-codex-l-panel dark:bg-codex-panel border border-codex-l-border dark:border-codex-border rounded-xl overflow-hidden shadow-sm dark:shadow-none transition-colors duration-200"
      style={{
        borderLeft: '2px solid #0066FF',
        animation: `fadeSlideIn 0.2s ease ${index * 0.07}s both`,
      }}
    >
      {/* Card header */}
      <div className="flex items-center justify-between gap-4 px-4 py-3 border-b border-codex-l-border dark:border-codex-border">
        <div className="flex items-center gap-1 font-mono text-xs min-w-0">
          {dir && <span className="text-codex-l-hint dark:text-codex-hint truncate">{dir}/</span>}
          <span className="text-codex-accent font-medium shrink-0">{filename}</span>
        </div>
        <span className="shrink-0 font-mono text-xs text-codex-l-muted dark:text-codex-muted bg-codex-l-border dark:bg-codex-border rounded px-2 py-0.5 whitespace-nowrap">
          {start_line}–{end_line}
        </span>
      </div>

      {/* Code with line numbers */}
      {code && (
        <div className="overflow-x-auto" style={{ backgroundColor: '#282c34' }}>
          <table className="w-full border-collapse text-xs font-mono leading-6">
            <tbody>
              {rawLines.map((_, i) => (
                <tr key={i} className="hover:bg-white/5 transition-colors">
                  <td
                    className="select-none text-right pr-4 pl-4 w-12 shrink-0 border-r border-white/10"
                    style={{ color: '#5A6472' }}
                  >
                    {(start_line ?? 1) + i}
                  </td>
                  <td
                    className="pl-4 pr-4 whitespace-pre"
                    dangerouslySetInnerHTML={{ __html: hlLines[i] ?? '' }}
                  />
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
