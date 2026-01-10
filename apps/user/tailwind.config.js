import { heroui } from "@heroui/theme";
import sharedConfig from "@taxicity/ui/tailwind.config";

/** @type {import('tailwindcss').Config} */
const config = {
	presets: [sharedConfig],
	content: [
		"./app/**/*.{js,ts,jsx,tsx,mdx}",
		// Include the UI package components
		"../../packages/ui/src/**/*.{js,ts,jsx,tsx,mdx}",
		"./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
	],
	plugins: [heroui()],
};

export default config;
