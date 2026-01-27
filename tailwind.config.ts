import type { Config } from "tailwindcss";

export default {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                // Brand colors
                brand: {
                    50: '#EEF2FF',
                    100: '#E0E7FF',
                    200: '#C7D2FE',
                    300: '#A5B4FC',
                    400: '#818CF8',
                    500: '#6366F1',
                    600: '#2D4DE0',
                    700: '#243FBE',
                    800: '#1E3A8A',
                    900: '#1E3A6A',
                },
                // Dark theme colors
                dark: {
                    bg: '#0B1220',
                    surface: '#111B2E',
                    card: '#151F32',
                    border: 'rgba(255, 255, 255, 0.10)',
                },
                // Text colors
                text: {
                    primary: '#EAF0FF',
                    secondary: '#A9B4D0',
                    muted: '#6B7A99',
                },
                // Status colors
                status: {
                    green: '#22C55E',
                    yellow: '#F59E0B',
                    red: '#EF4444',
                },
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
            fontSize: {
                'display': ['3.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
                'h1': ['2.5rem', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
                'h2': ['1.875rem', { lineHeight: '1.25' }],
                'h3': ['1.25rem', { lineHeight: '1.4' }],
            },
            boxShadow: {
                'glow': '0 0 40px rgba(45, 77, 224, 0.15)',
                'card': '0 4px 24px rgba(0, 0, 0, 0.25)',
                'card-hover': '0 8px 40px rgba(0, 0, 0, 0.35)',
                'button': '0 4px 14px rgba(45, 77, 224, 0.35)',
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
                'hero-gradient': 'linear-gradient(135deg, rgba(45, 77, 224, 0.15) 0%, transparent 50%)',
            },
            animation: {
                'fade-in': 'fadeIn 0.5s ease-out',
                'slide-up': 'slideUp 0.5s ease-out',
                'slide-down': 'slideDown 0.3s ease-out',
                'scale-in': 'scaleIn 0.2s ease-out',
                'pulse-soft': 'pulseSoft 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'shimmer': 'shimmer 2s linear infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { opacity: '0', transform: 'translateY(20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                slideDown: {
                    '0%': { opacity: '0', transform: 'translateY(-10px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                scaleIn: {
                    '0%': { opacity: '0', transform: 'scale(0.95)' },
                    '100%': { opacity: '1', transform: 'scale(1)' },
                },
                pulseSoft: {
                    '0%, 100%': { opacity: '1' },
                    '50%': { opacity: '0.8' },
                },
                shimmer: {
                    '0%': { backgroundPosition: '-200% 0' },
                    '100%': { backgroundPosition: '200% 0' },
                },
            },
            backdropBlur: {
                xs: '2px',
            },
        },
    },
    plugins: [],
} satisfies Config;
