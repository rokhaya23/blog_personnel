// ============================================================
// AdminPage.jsx
// CONTENEUR ADMIN — Gère le login admin séparé
//
// Si l'admin n'est pas authentifié → affiche AdminLogin
// Si l'admin est authentifié → affiche AdminMonitoring
//
// L'authentification admin est stockée dans sessionStorage
// (disparaît quand on ferme le navigateur).
// C'est COMPLÈTEMENT séparé de l'auth utilisateur.
// ============================================================

import { useState } from "react"
import AdminLogin from "./AdminLogin"
import AdminMonitoring from "./AdminMonitoring"

function AdminPage() {
  // Vérifier si l'admin est déjà connecté (sessionStorage persiste pendant la session)
  const [isAuthenticated, setIsAuthenticated] = useState(
    sessionStorage.getItem("admin_authenticated") === "true"
  )

  if (!isAuthenticated) {
    return <AdminLogin onLogin={() => setIsAuthenticated(true)} />
  }

  return <AdminMonitoring />
}

export default AdminPage