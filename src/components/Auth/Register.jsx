import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"

// Palette alignée sur la landing
const c = {
  blue: "#1d4ed8",
  blueDark: "#0b1d3a",
  blueSoft: "#e8f0ff",
  gray: "#f1f4f9",
  graySoft: "#eef2f6",
  text: "#0b1220",
  muted: "#4b5563",
  border: "#d7deea",
  shadow: "0 12px 28px rgba(11,29,58,0.12)",
  heroGradient: "linear-gradient(145deg, #f8fbff 0%, #dfe9ff 55%, #1d4ed8 100%)",
}

function Register() {
  const [fullName, setFullName] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const { register } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    if (!fullName || !username || !password || !confirmPassword) {
      setError("Veuillez remplir tous les champs")
      return
    }

    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caracteres")
      return
    }

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas")
      return
    }

    if (username.includes(" ")) {
      setError("Le nom d'utilisateur ne doit pas contenir d'espaces")
      return
    }

    setIsLoading(true)

    const result = await register(fullName, username, password)

    setIsLoading(false)

    if (result.success) {
      navigate("/dashboard")
    } else {
      setError(result.message)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-5 py-10"
      style={{ background: c.heroGradient }}
    >
      <div className="page-shell w-full max-w-5xl grid items-center gap-10 md:grid-cols-[1.05fr_1fr]">

        {/* Colonne texte */}
        <div className="space-y-4 text-center md:text-left">
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold"
            style={{ background: c.blueSoft, color: c.blueDark, border: `1px solid ${c.border}` }}
          >
            🌊 Palette landing
          </div>
          <h1
            className="text-3xl md:text-4xl font-extrabold leading-tight"
            style={{ color: c.blueDark, fontFamily: "'Playfair Display', serif" }}
          >
            Rejoignez DailyBlog
          </h1>
          <p
            className="text-sm md:text-base leading-relaxed max-w-lg mx-auto md:mx-0"
            style={{ color: c.muted }}
          >
            Même bleu profond, mêmes gris doux que sur la landing : l’expérience reste cohérente de l’inscription jusqu’au tableau de bord.
          </p>
          <div className="flex gap-3 justify-center md:justify-start">
            <button
              onClick={() => navigate("/login")}
              className="px-6 py-3 text-sm font-bold rounded-lg text-white"
              style={{ background: c.blue, boxShadow: c.shadow }}
            >
              J'ai déjà un compte
            </button>
          </div>
        </div>

        {/* Formulaire */}
        <div
          className="rounded-2xl p-8 md:p-9"
          style={{ background: "white", border: `1px solid ${c.border}`, boxShadow: c.shadow }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] font-semibold" style={{ color: c.muted }}>
                Inscription
              </p>
              <h2 className="text-2xl font-bold" style={{ color: c.blueDark }}>DailyBlog</h2>
            </div>
            <span className="px-3 py-1 text-xs rounded-full font-semibold"
              style={{ background: c.blueSoft, color: c.blueDark, border: `1px solid ${c.border}` }}>
              Palette landing
            </span>
          </div>

          {error && (
            <div
              className="px-4 py-3 rounded-xl text-sm mb-4"
              style={{ background: "#fee2e2", color: "#b91c1c", border: "1px solid #fecaca" }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium" style={{ color: c.text }}>Nom complet</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-3 rounded-lg text-sm focus:outline-none"
                style={{ background: c.gray, border: `1px solid ${c.border}`, color: c.text }}
                placeholder="Lyliane Damado"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium" style={{ color: c.text }}>Nom d'utilisateur</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 rounded-lg text-sm focus:outline-none"
                style={{ background: c.gray, border: `1px solid ${c.border}`, color: c.text }}
                placeholder="lyliane_d"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium" style={{ color: c.text }}>Mot de passe</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg text-sm focus:outline-none"
                style={{ background: c.gray, border: `1px solid ${c.border}`, color: c.text }}
                placeholder="Minimum 6 caracteres"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium" style={{ color: c.text }}>Confirmer le mot de passe</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg text-sm focus:outline-none"
                style={{ background: c.gray, border: `1px solid ${c.border}`, color: c.text }}
                placeholder="Retapez votre mot de passe"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 text-sm font-semibold rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: c.blue, color: "white", boxShadow: c.shadow }}
            >
              {isLoading ? "Inscription en cours..." : "S'inscrire"}
            </button>
          </form>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px" style={{ background: c.border }} />
            <span className="text-xs" style={{ color: c.muted }}>ou</span>
            <div className="flex-1 h-px" style={{ background: c.border }} />
          </div>

          <p className="text-sm text-center" style={{ color: c.muted }}>
            Déjà un compte ?{" "}
            <Link to="/login" className="font-semibold" style={{ color: c.blue }}>
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Register
