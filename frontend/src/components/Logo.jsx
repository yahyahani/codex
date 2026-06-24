export default function Logo({ size = 32, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
      aria-label="Codex"
    >
      <rect width="32" height="32" rx="6" fill="#0066FF" />
      <text
        x="16"
        y="21"
        textAnchor="middle"
        fill="white"
        fontFamily="JetBrains Mono, Fira Code, monospace"
        fontWeight="bold"
        fontSize="13"
      >
        {'{}'}
      </text>
    </svg>
  )
}
