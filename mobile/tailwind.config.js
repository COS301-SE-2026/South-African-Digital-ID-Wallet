/**@type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        'primary-green': '#007a4d',
        'deep-green': '#053B2C',
        'accent-gold': '#FFB81C',
        'national-red': '#DE3831',
        'national-blue': '#002395',
        'clean-white': '#FFFFFF',
        'cream-background': '#F7F4EA',
        'text-primary': '#111827',
        'muted-text': '#6B7280',
        'secure-night': '#031F18',
        'border-grey': '#E5E7EB',
        'neutral-mid-grey': '#9CA3AF',
        'success-green': '#16A34A',
        'warning-amber': '#D97706',
        'danger-red': '#DC2626',
      },
    },
  },
  plugins: [],
}
