import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#7f3d8b',
        secondary: '#b6e41f',
        recovery: '#b6e41f',
        cream: '#f5e6d3',
        'brand-green': '#b6e41f',
        'brand-purple': '#7f3d8b',
      },
    },
  },
  plugins: [],
}
export default config
