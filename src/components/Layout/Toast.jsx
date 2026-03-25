// ============================================================
// Toast.jsx
// NOTIFICATIONS VISUELLES (TOAST)
//
// Un "toast" est un petit message qui apparaît en haut de l'écran
// pendant quelques secondes puis disparaît automatiquement.
// Exemples : "Article créé avec succès ✅" ou "Erreur ❌"
//
// Ce composant fournit :
// 1. ToastProvider : enveloppe l'app (comme AuthProvider)
// 2. useToast() : hook pour afficher un toast depuis n'importe où
// 3. ToastContainer : affiche les toasts à l'écran
//
// Utilisation dans un composant :
//   const { showToast } = useToast()
//   showToast("Article créé !", "success")
//   showToast("Erreur de connexion", "error")
// ============================================================

import { createContext, useContext, useState } from "react"

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  // Liste des toasts actuellement affichés.
  // Chaque toast est un objet { id, message, type }
  const [toasts, setToasts] = useState([])

  // ========================
  // AFFICHER UN TOAST
  // ========================
  // message : le texte à afficher
  // type : "success" (vert), "error" (rouge), "info" (bleu)
  // duration : durée en millisecondes avant disparition (défaut 3 secondes)
  const showToast = (message, type = "success", duration = 3000) => {
    const id = Date.now() // Identifiant unique

    // Ajouter le toast à la liste
    setToasts((prev) => [...prev, { id, message, type }])

    // Programmer sa suppression après "duration" millisecondes
    // setTimeout exécute une fonction après un délai
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, duration)
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Le container est rendu ICI pour être toujours visible */}
      <ToastContainer toasts={toasts} />
    </ToastContext.Provider>
  )
}

// ========================
// HOOK POUR UTILISER LES TOASTS
// ========================
export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error("useToast doit etre utilise dans un ToastProvider")
  }
  return context
}

// ========================
// CONTAINER QUI AFFICHE LES TOASTS
// ========================
// Position fixe en haut à droite de l'écran.
// "fixed" signifie que le container reste en place même si on scrolle.
// "z-50" le met au-dessus de tout le reste de la page.
function ToastContainer({ toasts }) {
  if (toasts.length === 0) return null

  // Couleurs selon le type de toast
  const getStyle = (type) => {
    switch (type) {
      case "success":
        return "bg-green-500/90 border-green-400"
      case "error":
        return "bg-red-500/90 border-red-400"
      case "info":
        return "bg-blue-500/90 border-blue-400"
      default:
        return "bg-blue-500/90 border-blue-400"
    }
  }

  // Icône selon le type
  const getIcon = (type) => {
    switch (type) {
      case "success":
        return "✅"
      case "error":
        return "❌"
      case "info":
        return "ℹ️"
      default:
        return "ℹ️"
    }
  }

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          // L'animation : le toast glisse depuis la droite
          // animate-slide-in est défini plus bas via le style
          className={`flex items-center gap-2 px-4 py-3 rounded-lg border text-white shadow-lg backdrop-blur-lg ${getStyle(toast.type)}`}
          style={{
            animation: "slideIn 0.3s ease-out",
          }}
        >
          <span>{getIcon(toast.type)}</span>
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      ))}

      {/* Animation CSS intégrée */}
      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(100px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  )
}
