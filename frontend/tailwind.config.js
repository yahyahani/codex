/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        codex: {
          // dark mode
          bg:         '#0A0E14',
          panel:      '#111620',
          border:     '#1C2330',
          accent:     '#0066FF',
          'accent-h': '#1A75FF',
          text:       '#E8EBF0',
          muted:      '#8B96A3',
          hint:       '#5A6472',
          // light mode
          'l-bg':       '#F5F7FA',
          'l-panel':    '#FFFFFF',
          'l-border':   '#E2E6EC',
          'l-accent-h': '#0052CC',
          'l-text':     '#1A1F29',
          'l-muted':    '#5C6675',
          'l-hint':     '#8A92A0',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
    },
  },
  plugins: [],
}
