/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg:           '#0A0B0D',
        surface:      '#13151A',
        panel:        '#1C1F26',
        border:       '#252830',
        accent:       '#F07A1A',
        'accent-dim': '#C45F0D',
        text:         '#E8EAED',
        muted:        '#9CA3AF',
        faint:        '#4B5563',
        code:         '#0F1117',
      },
      fontFamily: {
        sans: ['Space Grotesk', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
    },
  },
  plugins: [],
}
