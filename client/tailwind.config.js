/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          bg: '#F3F6FC',        // soft light backdrop
          bgAlt: '#EAF0FB',     // secondary light backdrop tint
          card: '#FFFFFF',      // clean white surface
          border: '#E2E8F5',    // hairline border on light surfaces
          ink: '#0F172A',       // primary heading/body ink
          muted: '#5B6478',     // secondary/muted text
          accent: '#4338CA',    // confident indigo (primary brand)
          accent2: '#0EA5E9',   // sky blue (secondary accent)
          mint: '#10B981',      // emerald "compiled/success" accent
          live: '#E11D48',      // rose - live/urgent
          ended: '#D97706',     // amber - ended/warning
          dark: '#0B1220',      // deep navy for terminal-style contrast panels
          darkCard: '#111A2E',  // terminal card surface
        }
      },
      fontFamily: {
        display: ['Space Grotesk', 'sans-serif'],
        mono: ['JetBrains Mono', 'Share Tech Mono', 'monospace'],
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
