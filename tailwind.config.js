
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        background:      '#FAF7F2',
        cream:           '#F5F0EB',
        parchment:       '#EDE8E0',
        terracotta:      '#A0522D',
        terracottaLight: '#C4784F',
        terracottaDark:  '#7A3E20',
        charcoal:        '#2D2A26',
        charcoalLight:   '#4A4640',
        ink:             '#1A1815',
        muted:           '#9E9890',
        mutedLight:      '#BAB5AC',
        sage:            '#7C8B6F',
        sageDark:        '#5C6852',
        gold:            '#B8A088',
        goldLight:       '#D4C4AE',
        clay:            '#C4956A',
        clayLight:       '#DDB898',
        stone:           '#D4CBC1',
        warmWhite:       '#FAF7F2',
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans:  ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'display-2xl': ['clamp(4rem,9vw,9rem)',    { lineHeight: '0.92', letterSpacing: '-0.025em' }],
        'display-xl':  ['clamp(3rem,7vw,7rem)',     { lineHeight: '0.95', letterSpacing: '-0.02em'  }],
        'display-lg':  ['clamp(2.25rem,5vw,4.5rem)',{ lineHeight: '1.0',  letterSpacing: '-0.015em' }],
        'display-md':  ['clamp(1.75rem,3.5vw,3rem)',{ lineHeight: '1.05', letterSpacing: '-0.01em'  }],
        'display-sm':  ['clamp(1.25rem,2.5vw,2rem)',{ lineHeight: '1.1',  letterSpacing: '-0.005em' }],
        'body-lg':     ['1.125rem', { lineHeight: '1.7',  letterSpacing: '0.005em' }],
        'caption':     ['0.8125rem',{ lineHeight: '1.5',  letterSpacing: '0.1em'   }],
        'label':       ['0.6875rem',{ lineHeight: '1.4',  letterSpacing: '0.2em'   }],
      },
      spacing: {
        'section': 'clamp(6rem,12vw,12rem)',
        'block':   'clamp(3rem,6vw,6rem)',
        '18': '4.5rem', '22': '5.5rem', '26': '6.5rem', '30': '7.5rem',
        '34': '8.5rem', '38': '9.5rem', '42': '10.5rem','46': '11.5rem',
        '52': '13rem',  '56': '14rem',  '60': '15rem',  '72': '18rem',
        '80': '20rem',  '96': '24rem',  '104':'26rem',  '112':'28rem',
      },
      maxWidth: {
        'reading': '65ch',
        'prose':   '72ch',
        'wide':    '90rem',
      },
      transitionTimingFunction: {
        'luxury':        'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'dramatic':      'cubic-bezier(0.77, 0, 0.175, 1)',
        'spring':        'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'ease-out-expo': 'cubic-bezier(0.19, 1, 0.22, 1)',
      },
      transitionDuration: {
        '400': '400ms', '600': '600ms', '700': '700ms',
        '800': '800ms', '900': '900ms', '1200':'1200ms',
      },
      animation: {
        'marquee':      'marquee 30s linear infinite',
        'marquee-slow': 'marquee 50s linear infinite',
        'fade-in-up':   'fadeInUp 0.8s cubic-bezier(0.25,0.46,0.45,0.94) forwards',
        'fade-in':      'fadeIn 0.6s cubic-bezier(0.25,0.46,0.45,0.94) forwards',
        'slide-up':     'slideUp 0.7s cubic-bezier(0.25,0.46,0.45,0.94) forwards',
        'shimmer':      'shimmer 2s ease-in-out infinite',
        'pulse-soft':   'pulseSoft 3s ease-in-out infinite',
        'toast-in':     'toastIn 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards',
        'toast-out':    'toastOut 0.3s cubic-bezier(0.25,0.46,0.45,0.94) forwards',
      },
      keyframes: {
        marquee: {
          '0%':   { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        fadeInUp: {
          '0%':   { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%,100%': { opacity: '0.4' },
          '50%':     { opacity: '0.8' },
        },
        pulseSoft: {
          '0%,100%': { opacity: '1' },
          '50%':     { opacity: '0.6' },
        },
        toastIn: {
          '0%':   { opacity: '0', transform: 'translateX(100%) scale(0.9)' },
          '100%': { opacity: '1', transform: 'translateX(0) scale(1)' },
        },
        toastOut: {
          '0%':   { opacity: '1', transform: 'translateX(0) scale(1)' },
          '100%': { opacity: '0', transform: 'translateX(100%) scale(0.95)' },
        },
      },
      boxShadow: {
        'artwork':       '0 4px 24px rgba(45,42,38,0.08), 0 1px 4px rgba(45,42,38,0.04)',
        'artwork-hover': '0 16px 48px rgba(45,42,38,0.14), 0 4px 12px rgba(45,42,38,0.08)',
        'card':          '0 2px 12px rgba(45,42,38,0.06)',
        'card-hover':    '0 8px 32px rgba(45,42,38,0.12)',
        'modal':         '0 32px 80px rgba(45,42,38,0.22)',
        'nav':           '0 1px 0 rgba(45,42,38,0.06)',
        'toast':         '0 8px 32px rgba(45,42,38,0.18)',
        'button':        '0 2px 8px rgba(160,82,45,0.25)',
        'button-hover':  '0 4px 16px rgba(160,82,45,0.35)',
      },
      borderWidth: {
        '0.5': '0.5px',
      },
      zIndex: {
        '60': '60', '70': '70', '80': '80', '90': '90', '100': '100',
      },
    },
  },
  plugins: [],
}
