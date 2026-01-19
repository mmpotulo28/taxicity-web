// import { Fira_Code as FontMono, Inter as FontSans } from "next/font/google";

// Replaced with manual CSS loading to fix Docker build issues with Google Fonts
export const fontSans = {
	variable: "font-sans",
	style: { fontFamily: "'Inter', sans-serif" },
};

export const fontMono = {
	variable: "font-mono",
	style: { fontFamily: "'Fira Code', monospace" },
};
