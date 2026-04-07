/** @type {import('tailwindcss').Config} */
module.exports = {
	presets: [require("nativewind/preset")],
	content: ["./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
	theme: {
		extend: {
			colors: {
				brand: {
					DEFAULT: "#FACC15",
					foreground: "#09090B",
				},
			},
		},
	},
	plugins: [],
};
