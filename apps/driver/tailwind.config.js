import { heroui } from "@heroui/theme";
import sharedConfig from "@taxiciti/ui/tailwind.config";

/** @type {import('tailwindcss').Config} */
const config = {
	presets: [sharedConfig],
	content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "../../packages/ui/src/**/*.{js,ts,jsx,tsx,mdx}", "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}"],
};

export default config;
