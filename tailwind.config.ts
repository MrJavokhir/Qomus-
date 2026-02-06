import type { Config } from "tailwindcss";

export default {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    darkMode: 'class',
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
                    600: '#4F46E5',
                    700: '#4338CA',
                    800: '#3730A3',
                    900: '#312E81',
                },
                // Themeable colors
                bg: 'var(--bg)',
                surface: 'var(--surface)',
                card: 'var(--card)',
                border: 'var(--border)',

                // Dark theme specific (legacy support if needed, or mapped to vars)
                dark: {
                    bg: '#030712',
                    surface: '#111827',
                    card: '#1F2937',
                    border: 'rgba(255, 255, 255, 0.08)',
                },

                // Text colors
                text: {
                    primary: 'var(--text-primary)',
                    secondary: 'var(--text-secondary)',
                    muted: 'var(--text-muted)',
                },
                // Status colors
                status: {
                    green: '#10B981',
                    yellow: '#F59E0B',
                    red: '#EF4444',
                },
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
            fontSize: {
                'display': ['4.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
                'h1': ['3rem', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
                'h2': ['2.25rem', { lineHeight: '1.25', letterSpacing: '-0.01em' }],
                'h3': ['1.5rem', { lineHeight: '1.4' }],
            },
            boxShadow: {
                'glow': '0 0 40px rgba(79, 70, 229, 0.2)',
                'card': 'var(--shadow-card)',
                'card-hover': 'var(--shadow-card-hover)',
                'button': '0 4px 14px 0 rgba(79, 70, 229, 0.4)',
                'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.1)',
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
                'hero-gradient': 'linear-gradient(135deg, rgba(79, 70, 229, 0.1) 0%, transparent 50%)',
                'grid-pattern': "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h40v40H0V0zm1 1h38v38H1V1z' fill='%236366F1' fill-opacity='0.05' fill-rule='evenodd'/%3E%3C/svg%3E\")",
            },
            animation: {
                'fade-in': 'fadeIn 0.5s ease-out',
                'slide-up': 'slideUp 0.5s ease-out',
                'slide-down': 'slideDown 0.3s ease-out',
                'scale-in': 'scaleIn 0.2s ease-out',
                'pulse-soft': 'pulseSoft 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'shimmer': 'shimmer 2s linear infinite',
                'float': 'float 6s ease-in-out infinite',
                'blob': 'blob 7s infinite',
                'spin-slow': 'spin 12s linear infinite',
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
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-20px)' },
                },
                blob: {
                    '0%': { transform: 'translate(0px, 0px) scale(1)' },
                    '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
                    '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
                    '100%': { transform: 'translate(0px, 0px) scale(1)' },
                },
            },
            backdropBlur: {
                xs: '2px',
                '3xl': '64px',
            },
        },
    },
    plugins: [],
} satisfies Config;
