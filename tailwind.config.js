/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{vue,js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                primary: "#0070F3", // Deep Blue
                "primary-hover": "#005bb5", // Darker Blue
                accent: "#00F781", // Electric Green
                "accent-dark": "#00c466", // Darker Electric Green
                "secondary-bg": "#f9fafb",
                "dark-bg": "#0D1117", // Deeper dark background
                "dark-card": "#161B22", // Dark card/surface background
                "dark-text": "#e5e7eb",
                "dark-border": "#30363D", // Darker border
                "background-light": "#ffffff",
                "background-dark": "#0D1117", // Main dark background
            },
            fontFamily: {
                display: ["Noto Sans SC", "sans-serif"],
                sans: ["Noto Sans SC", "sans-serif"],
            },
            borderRadius: {
                DEFAULT: "0.5rem",
                lg: "0.75rem",
            },
        },
    },
    plugins: [
        require('@tailwindcss/typography'),
        require('@tailwindcss/forms'),
    ],
}
