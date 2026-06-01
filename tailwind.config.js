/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // TTS Swap 设计系统
        bg: {
          DEFAULT: '#131922', // 页面背景 / 输入框背景
          soft: '#0e131b',
        },
        panel: {
          DEFAULT: '#1d2633', // 卡片 / 面板
          light: '#242f3f',
          line: '#343d4f',    // 卡片边框
        },
        gold: {
          DEFAULT: '#ffb751', // 主强调色（暖金）
          soft: '#f7ca76',    // tab 选中 / 次强调
          deep: '#e09c34',
        },
        muted: '#aab4c0',      // 次要文字（比 #ccc 略柔，暗底更耐看）
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      backgroundImage: {
        'btn-gold': 'linear-gradient(180deg, #ffcc00 0%, #ffcc66 100%)',
        'gold-line': 'linear-gradient(90deg, #ffb751, #f7ca76)',
      },
      boxShadow: {
        'gold': '0 8px 24px rgba(255, 183, 81, 0.18)',
        'panel': '0 12px 40px rgba(0, 0, 0, 0.45)',
        'glow': '0 0 0 1px rgba(255,183,81,0.25), 0 8px 30px rgba(255,183,81,0.15)',
      },
      borderRadius: {
        'panel': '28px',
        'card': '18px',
      },
      animation: {
        'pulse-gold': 'pulse-gold 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        'pulse-gold': {
          '0%, 100%': { opacity: 1, boxShadow: '0 0 0 0 rgba(255, 183, 81, 0.35)' },
          '50%': { opacity: .9, boxShadow: '0 0 0 8px rgba(255, 183, 81, 0)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
}
