// ============================================================
// AuthContext.jsx — VERSION CONNECTÉE AU BACKEND FLASK
// Plus de données mockées ! Tout passe par l'API.
// ============================================================

import { createContext, useContext, useState, useEffect } from "react"
import { authAPI } from "../services/api"

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)
  // loading = true pendant qu'on vérifie si l'utilisateur est déjà connecté
  // Ça évite un flash de la page login avant la redirection vers le dashboard

  // ========================
  // EFFET : VÉRIFIER SI L'UTILISATEUR EST DÉJÀ CONNECTÉ
  // ========================
  // Au chargement de l'app, on vérifie s'il y a un token dans le localStorage.
  // Si oui, on appelle /api/auth/me pour récupérer les infos de l'utilisateur.
  // Si le token est expiré ou invalide, on le supprime.
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token")

      if (token) {
        try {
          const response = await authAPI.getMe()
          setCurrentUser(response.data)
        } catch (error) {
          // Token invalide ou expiré → on le supprime
          console.error("Token invalide:", error)
          localStorage.removeItem("token")
          setCurrentUser(null)
        }
      }

      setLoading(false)
    }

    checkAuth()
  }, [])

  const refreshCurrentUser = async () => {
    const token = localStorage.getItem("token")
    if (!token) {
      setCurrentUser(null)
      return null
    }

    try {
      const response = await authAPI.getMe()
      setCurrentUser(response.data)
      return response.data
    } catch {
      localStorage.removeItem("token")
      setCurrentUser(null)
      return null
    }
  }

  // ========================
  // CONNEXION
  // ========================
  const login = async (username, password) => {
    try {
      const response = await authAPI.login(username, password)

      // Stocker le token dans le localStorage
      // Le localStorage persiste même si on ferme le navigateur
      localStorage.setItem("token", response.data.token)

      // Mettre à jour l'utilisateur connecté
      setCurrentUser(response.data.user)

      return { success: true, user: response.data.user }
    } catch (error) {
      // error.response.data contient le message d'erreur de Flask
      const message =
        error.response?.data?.message || "Erreur de connexion"
      return { success: false, message }
    }
  }

  // ========================
  // INSCRIPTION
  // ========================
  const register = async (fullName, username, password) => {
    try {
      const response = await authAPI.register(fullName, username, password)

      localStorage.setItem("token", response.data.token)
      setCurrentUser(response.data.user)

      return { success: true, user: response.data.user }
    } catch (error) {
      const message =
        error.response?.data?.message || "Erreur d'inscription"
      return { success: false, message }
    }
  }

  // ========================
  // DÉCONNEXION
  // ========================
  const logout = async () => {
    try {
      await authAPI.logout()
    } catch (error) {
      // Même si l'appel échoue, on déconnecte quand même côté frontend
      console.error("Erreur lors de la déconnexion:", error)
    }

    localStorage.removeItem("token")
    setCurrentUser(null)
  }

  const value = {
    currentUser,
    loading,
    login,
    register,
    logout,
    refreshCurrentUser,
  }

  // Tant que loading est true, on affiche un écran de chargement
  // Ça empêche le ProtectedRoute de rediriger vers /login
  // avant qu'on ait vérifié le token
  if (loading) {
    return (
      <AuthContext.Provider value={value}>
        <div className="min-h-screen flex items-center justify-center bg-slate-900">
          <p className="text-blue-200 text-lg">Chargement...</p>
        </div>
      </AuthContext.Provider>
    )
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth doit etre utilise dans un AuthProvider")
  }
  return context
}
