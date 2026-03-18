// ============================================================
// ThemeContext.jsx
// GESTION DU THÈME (DARK / LIGHT MODE)
//
// Permet de basculer entre le mode sombre et le mode clair.
// Le choix est sauvegardé dans localStorage pour persister
// entre les sessions.
//
// Utilisation dans n'importe quel composant :
//   const { theme, toggleTheme } = useTheme()
// ============================================================

import { createContext, useContext, useState } from "react"

const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
  // Lire le thème sauvegardé dans localStorage
  // Si rien n'est sauvegardé, on utilise "dark" par défaut
  const [theme, setTheme] = useState(
    localStorage.getItem("daily_post_theme") || "dark"
  )

  // Basculer entre dark et light
  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark"
    setTheme(newTheme)
    localStorage.setItem("daily_post_theme", newTheme)
  }

  // Vérifier si on est en mode sombre
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