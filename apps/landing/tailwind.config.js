import sharedConfig from "@taxyciti/ui/tailwind.config";

/** @type {import('tailwindcss').Config} */
const config = {
	presets: [sharedConfig],
	content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}", "../../packages/ui/src/**/*.{js,ts,jsx,tsx,mdx}"],
	theme: {
		extend: {
			colors: {
				brand: {
					yellow: "#FFD700",
					black: "#1A1A1A",
				},
			},
			animation: {
				blob: "blob 7s infinite",
			},
			keyframes: {
				blob: {
					"0%": {
						transform: "translate(0px, 0px) scale(1)",
					},
					"33%": {
						transform: "translate(30px, -50px) scale(1.1)",
					},
					"66%": {
						transform: "translate(-20px, 20px) scale(0.9)",
					},
					"100%": {
						transform: "translate(0px, 0px) scale(1)",
					},
				},
			},
		},
	},
};

export default config;
