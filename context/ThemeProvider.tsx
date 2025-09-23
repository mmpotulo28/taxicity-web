import React, { useContext, useEffect } from "react";
import { useTheme } from "@heroui/use-theme";

interface ThemeProviderProps {
	children: React.ReactNode;
}

export const CustomThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
	const { theme, setTheme } = useTheme();

	// Apply theme class to html element
	useEffect(() => {
		document.documentElement.classList.remove("light", "dark");
		document.documentElement.classList.add(theme || "light");
	}, [theme]);

	return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
};

interface ThemeContextType {
	theme: string;
	setTheme: (theme: string) => void;
}

export const ThemeContext = React.createContext<ThemeContextType>({
	theme: "light",
	setTheme: () => {},
});

export const useThemeContext = () => useContext(ThemeContext);
