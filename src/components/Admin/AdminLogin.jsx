// ============================================================
// AdminLogin.jsx
// PAGE DE CONNEXION ADMIN — Séparée du login utilisateur
//
// Accessible via /admin/monitoring
// L'admin entre un code secret pour accéder au monitoring.
// Ce n'est PAS un compte utilisateur normal.
// ============================================================

import { useState } from "react"
import { useNavigate } from "react-router-dom"

// Code secret admin — en production ce serait dans une variable d'environnement
const ADMIN_CODE = "dailypost2026"

function AdminLogin({ onLogin }) {
  const [code, setCode] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = (e) => {
    e.preventDefault()
    setError("")

    if (code === ADMIN_CODE) {
      // Stocker dans sessionStorage (disparaît quand on ferme le navigateur)
      sessionStorage.setItem("admin_authenticated", "true")
      onLogin()
    } else {
      setError("Code d'acces incorrect")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 w-full max-w-md shadow-2xl border border-white/20">
        <div className="text-center mb-8">
          <span className="text-4xl mb-4 block">📊</span>
          <h1
            className="text-3xl font-black bg-gradient-to-r from-purple-400 via-violet-300 to-purple-500 bg-clip-text text-transparent mb-2"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Daily Post
          </h1>
          <p className="text-purple-300/60 text-sm">Panel de monitoring</p>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-purple-200 text-sm mb-2">
              Code d'acces administrateur
            </label>
            <input
              type="password"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-purple-400 transition"
              placeholder="Entrez le code secret"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition duration-200 shadow-lg"
          >
            Acceder au monitoring
          </button>
        </form>

        <p className="text-purple-300/40 text-xs text-center mt-6">
          Acces reserve aux administrateurs de Daily Post
        </p>
      </div>
    </div>
  )
}

export default AdminLogin