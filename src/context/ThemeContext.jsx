
import { createContext, useContext, useState } from "react"

const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
  // Mode clair par défaut (au lieu de dark)
  const [theme, setTheme] = useState(
    localStorage.getItem("daily_post_theme") || "light"
  )

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark"
    setTheme(newTheme)
    localStorage.setItem("daily_post_theme", newTheme)
  }

  const isDark = theme === "dark"

  const value = { theme, isDark, toggleTheme }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error("useTheme doit etre utilise dans un ThemeProvider")
  }
  return context
}