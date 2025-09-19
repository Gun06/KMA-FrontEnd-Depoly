/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.stories.@(js|jsx|ts|tsx|mdx)',
    './.storybook/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        giants: ['Giants-Bold', 'sans-serif'],
        pretendard: ['Pretendard-Medium', 'sans-serif'],
        'pretendard-extrabold': ['Pretendard-ExtraBold', 'sans-serif'],
      },
      colors: {
        kma: {
          blue:  '#1976D2',
          green: '#2E7D32',
          red:   '#D32F2F',
          black: '#111111',
        },
      },
      screens: {
        xs: '475px',
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        custom: '1300px',
        '2xl': '1536px',
      },
    },
  },
  plugins: [
    function({ addUtilities }) {
      const newUtilities = {
        '.scrollbar-hide': {
          /* for Firefox */
          'scrollbar-width': 'none',
          /* for IE, Edge */
          '-ms-overflow-style': 'none',
        },
        '.scrollbar-hide::-webkit-scrollbar': {
          display: 'none',
        },
      };
      addUtilities(newUtilities);
    }
  ],
}