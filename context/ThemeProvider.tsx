import React from "react";
import { useTheme } from "@heroui/use-theme";

interface ThemeProviderProps {
	children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
	const { theme, setTheme } = useTheme();

	// Apply theme class to html element
	React.useEffect(() => {
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

export const useThemeContext = () => React.useContext(ThemeContext);
