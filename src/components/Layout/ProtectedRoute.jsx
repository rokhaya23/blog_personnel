// ============================================================
// ProtectedRoute.jsx
// LE GARDIEN DES PAGES PROTÉGÉES
//
// Ce composant agit comme un vigile à l'entrée d'un bâtiment :
// - Si tu as ton badge (tu es connecté) → tu passes
// - Si tu n'as pas de badge (pas connecté) → retour à l'accueil
//
// On l'utilise pour envelopper les pages qui nécessitent
// une connexion (dashboard, articles, amis, etc.)
// ============================================================

import { Navigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"

// "children" représente le contenu de la page protégée.
// Par exemple si on écrit :
//   <ProtectedRoute>
//     <Dashboard />
//   </ProtectedRoute>
// Alors "children" = <Dashboard />
function ProtectedRoute({ children }) {
  // On récupère l'utilisateur connecté depuis le contexte
  const { currentUser } = useAuth()

  // Si personne n'est connecté (currentUser est null)...
  if (!currentUser) {
    // ...on redirige vers la page de connexion.
    // "replace" remplace l'URL dans l'historique du navigateur
    // pour que le bouton "retour" ne ramène pas à la page protégée
    return <Navigate to="/login" replace />
  }

  // Si l'utilisateur est connecté, on affiche la page demandée
  return children
}

export default ProtectedRoute