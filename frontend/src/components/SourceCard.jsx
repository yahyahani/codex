export default function SourceCard({ source, index }) {
  const { file, start_line, end_line, code } = source

  // strip /repo/ prefix so paths look clean
  const cleanPath = (file || '').replace(/^\/?repo\//, '')
  const parts     = cleanPath.split('/')
  const filename  = parts.pop()
  const dir       = parts.join('/')

  const lines = (code || '').split('\n')

  return (
    <div
      className="bg-surface border border-border rounded-xl overflow-hidden"
      style={{ animation: `fadeSlideIn 0.3s ease ${index * 0.07}s both` }}
    >
      {/* Card header */}
      <div className="flex items-center justify-between gap-4 px-4 py-2.5 border-b border-border bg-panel">
        <div className="flex items-center gap-1 font-mono text-xs min-w-0">
          {dir && <span className="text-faint truncate">{dir}/</span>}
          <span className="text-text font-medium shrink-0">{filename}</span>
        </div>
        <span className="shrink-0 font-mono text-xs text-accent bg-accent/10 border border-accent/20 rounded px-2 py-0.5 whitespace-nowrap">
          :{start_line}–{end_line}
        </span>
      </div>

      {/* Code with line numbers */}
      {code && (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-xs font-mono leading-6">
            <tbody>
              {lines.map((line, i) => (
                <tr key={i} className="hover:bg-panel/50 transition-colors">
                  <td className="select-none text-right pr-4 pl-4 text-faint w-12 shrink-0 border-r border-border bg-code/40">
                    {(start_line ?? 1) + i}
                  </td>
                  <td className="pl-4 pr-4 text-text/90 whitespace-pre">
                    {line || ' '}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
