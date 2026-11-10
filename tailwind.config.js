/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#090d12',
        surface: {
          DEFAULT: '#111722',
          card: '#161e2e',
          elevated: '#1e293b',
          border: 'rgba(255, 255, 255, 0.08)',
        },
        aqi: {
          good: {
            DEFAULT: '#10b981',
            light: 'rgba(16, 185, 129, 0.15)',
            text: '#34d399',
          },
          satisfactory: {
            DEFAULT: '#84cc16',
            light: 'rgba(132, 204, 22, 0.15)',
            text: '#a3e635',
          },
          moderate: {
            DEFAULT: '#eab308',
            light: 'rgba(234, 179, 8, 0.15)',
            text: '#facc15',
          },
          poor: {
            DEFAULT: '#f97316',
            light: 'rgba(249, 115, 22, 0.15)',
            text: '#fb923c',
          },
          veryPoor: {
            DEFAULT: '#ef4444',
            light: 'rgba(239, 68, 68, 0.15)',
            text: '#f87171',
          },
          severe: {
            DEFAULT: '#991b1b',
            light: 'rgba(153, 27, 27, 0.25)',
            text: '#fca5a5',
          },
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },
    },
  },
  plugins: [],
};
