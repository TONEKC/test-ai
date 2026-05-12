import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/app/**/*.{js,ts,tsx,mdx}',
    './src/components/**/*.{js,ts,tsx,mdx}',
    './src/features/**/*.{js,ts,tsx,mdx}',
    './src/lib/**/*.{js,ts,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'sans-serif',
        ],
      },
      colors: {
        surface: {
          DEFAULT: '#f8fafc',
          muted: '#eef2f7',
        },
        ink: {
          DEFAULT: '#101828',
          muted: '#475467',
        },
      },
    },
  },
  plugins: [],
}
export default config
