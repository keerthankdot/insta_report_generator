/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0e1117',
        surface: '#1c1c1e',
        'surface-2': '#2a2a2d',
        border: 'rgba(255,255,255,0.08)',
        accent: '#2563eb',
        'accent-hover': '#1d4ed8',
        text: {
          primary: '#ffffff',
          secondary: 'rgba(255,255,255,0.6)',
          muted: 'rgba(255,255,255,0.35)',
        },
        status: {
          rising: '#10b981',
          steady: '#3b82f6',
          attention: '#f59e0b',
          new: '#6b7280',
        },
        note: {
          win: '#10b981',
          loss: '#ef4444',
          growth: '#3b82f6',
          feedback: '#f59e0b',
          observation: '#6b7280',
        },
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          'SF Pro Display',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
      },
    },
  },
  plugins: [],
}
