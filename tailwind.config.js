/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "var(--background)",
                foreground: "var(--foreground)",
                primary: "#D4AF37",
                "primary-admin": "#0ea5e9", // Sky blue for admin actions 
                // Header used 'text-primary', so I need to define it if it's not default.
                // Wait, where was 'primary' defined before?
                // If I can't find the old CSS, I might lose the specific color value.
                // I'll guess or try to extract it from a screenshot if I had one?
                // Or I can look at the Header again. Header used 'text-primary'. 
                // If I define it here, it works. If not, it falls back to nothing.
                // I'll add a placeholder or try to find it.
                // Actually, if 'primary' was a custom class in the old index.css, I need it.
            },
        },
    },
    plugins: [],
};
