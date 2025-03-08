import React, { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState("light");
  
  const toggleTheme = () => setTheme(theme === "light" ? "dark" : "light");
  
  // Apply theme to document body whenever theme changes
  useEffect(() => {
    // Remove previous theme class
    document.body.classList.remove("light-theme", "dark-theme");
    // Add current theme class
    document.body.classList.add(`${theme}-theme`);
    
    // Additionally, set data-theme attribute that can be used for CSS variables
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
