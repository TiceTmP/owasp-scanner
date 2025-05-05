// tailwind.config.js
export default {
    content: [
        "./components/**/*.{js,vue,ts}",
        "./layouts/**/*.vue",
        "./pages/**/*.vue",
        "./plugins/**/*.{js,ts}",
        "./app.vue",
        "./error.vue"
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    50: '#E3F2FD',
                    100: '#BBDEFB',
                    200: '#90CAF9',
                    300: '#64B5F6',
                    400: '#42A5F5',
                    500: '#2196F3',
                    600: '#1E88E5',
                    700: '#1976D2',
                    800: '#1565C0',
                    900: '#0D47A1',
                },
                secondary: {
                    50: '#F3E5F5',
                    100: '#E1BEE7',
                    200: '#CE93D8',
                    300: '#BA68C8',
                    400: '#AB47BC',
                    500: '#9C27B0',
                    600: '#8E24AA',
                    700: '#7B1FA2',
                    800: '#6A1B9A',
                    900: '#4A148C',
                },
                // OWASP risk colors
                risk: {
                    critical: '#9333EA', // purple-600
                    high: '#DC2626',     // red-600
                    medium: '#EA580C',   // orange-600
                    low: '#CA8A04',      // yellow-600
                    info: '#0284C7',     // sky-600
                }
            },
            fontFamily: {
                sans: ['Sarabun', 'sans-serif'],
            },
            boxShadow: {
                card: '0 2px 5px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.07)',
                dropdown: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            },
            animation: {
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            }
        },
    },
    plugins: [
        require('@tailwindcss/forms'),
    ],
}