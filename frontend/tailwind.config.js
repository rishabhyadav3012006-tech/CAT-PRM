/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Specified Soft Pastel Palette
        pastel: {
          lavender: '#E9E3FF',
          mint: '#DDF5E9',
          babyBlue: '#DFEEFF',
          peach: '#FFE9DC',
          cream: '#FFF9ED',
          pink: '#FCE4ED',
        },
        // Specified Primary Purple with tints
        purple: {
          50: '#F7F5FD',
          100: '#EFEBFB',
          200: '#DDD5F7',
          300: '#C2B5F0',
          400: '#9E8EE4',
          500: '#7969B5', // Primary Purple
          600: '#6755A4',
          700: '#554391',
          800: '#45347B',
          900: '#382967',
        },
        primary: {
          purple: '#7969B5',
          dark: '#554391',
          light: '#9E8EE4',
          soft: '#E9E3FF',
        },
        // Specified Main Text (#34354A) and hierarchical tints
        ink: {
          main: '#34354A',
          secondary: '#575973',
          muted: '#7A7D9D',
          light: '#A4A7C5',
          border: '#E5E4F2',
        },
        // Semantic pastel accents
        accent: {
          mintDark: '#2B8756',
          mintSoft: '#DDF5E9',
          blueDark: '#2B6EB5',
          blueSoft: '#DFEEFF',
          peachDark: '#B85820',
          peachSoft: '#FFE9DC',
          pinkDark: '#B53364',
          pinkSoft: '#FCE4ED',
          lavenderDark: '#5E4FA2',
          lavenderSoft: '#E9E3FF',
          creamDark: '#997321',
          creamSoft: '#FFF9ED',
        }
      },
      fontFamily: {
        heading: ['Nunito', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        title: ['Poppins', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glass-sm': '0 4px 20px 0 rgba(121, 105, 181, 0.05)',
        'glass': '0 8px 32px 0 rgba(121, 105, 181, 0.08)',
        'glass-hover': '0 12px 40px 0 rgba(121, 105, 181, 0.14)',
        'glass-lg': '0 16px 48px 0 rgba(121, 105, 181, 0.12)',
        'glow-purple': '0 6px 24px -2px rgba(121, 105, 181, 0.35)',
        'glow-pink': '0 6px 24px -2px rgba(252, 228, 237, 0.6)',
        'glow-mint': '0 6px 24px -2px rgba(221, 245, 233, 0.6)',
      },
      borderRadius: {
        '2xl': '1.25rem',
        '3xl': '1.75rem',
        '4xl': '2.25rem',
      },
      backdropBlur: {
        'xs': '2px',
        'glass': '14px',
      }
    },
  },
  plugins: [],
}
