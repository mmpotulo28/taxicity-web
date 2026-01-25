"use client";
import React from "react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export const ThemeSwitch = () => {
 const [mounted, setMounted] = useState(false);
 const { theme, setTheme } = useTheme();

 useEffect(() => {
  setMounted(true);
 }, []);

 if (!mounted) {
  return (
   <div className="w-9 h-9" /> // Placeholder to avoid layout shift
  );
 }

 const toggleTheme = () => {
  setTheme(theme === "light" ? "dark" : "light");
 };

 return (
  <button
   onClick={toggleTheme}
   className="p-2 rounded-full hover:bg-default-100 dark:hover:bg-default-800 transition-colors"
   aria-label="Toggle theme"
  >
   {theme === "light" ? (
    <Moon className="w-5 h-5 text-default-700" />
   ) : (
    <Sun className="w-5 h-5 text-primary-400" />
   )}
  </button>
 );
};
