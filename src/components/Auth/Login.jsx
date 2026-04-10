import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"

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
  softShadow: "0 8px 18px rgba(11,29,58,0.08)",
  heroGradient: "linear-gradient(145deg, #f8fbff 0%, #dfe9ff 55%, #1d4ed8 100%)",
}

function Login() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    if (!username || !password) { setError("Veuillez remplir tous les champs"); return }
    setIsLoading(true)
    const result = await login(username, password)
    setIsLoading(false)
    if (result.success) navigate("/dashboard")
    else setError(result.message)
  }

  return (
    <div
      className="min-h-screen px-5 py-10 flex items-center justify-center"
      style={{ background: c.heroGradient }}
    >
      <div className="w-full max-w-5xl grid items-center gap-10 md:grid-cols-[1.1fr_1fr]">

        <div className="space-y-4 text-center md:text-left">

          <h1
            className="text-3xl md:text-4xl font-extrabold leading-tight"
            style={{ color: c.blueDark, fontFamily: "'Playfair Display', serif" }}
          >
            Bienvenue sur DailyBlog
          </h1>
          <p
            className="text-sm md:text-base leading-relaxed max-w-lg mx-auto md:mx-0"
            style={{ color: c.muted }}
          >
            Votre plateform de blogging moderne et intuitive. 
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">

          </div>
        </div>

        {/* Carte de connexion */}
        <div
          className="rounded-2xl p-8 md:p-9"
          style={{
            background: "white",
            border: `1px solid ${c.border}`,
            boxShadow: c.shadow,
          }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
         
              <h2 className="text-2xl font-bold" style={{ color: c.blueDark }}>Connexion</h2>
            </div>

          </div>

          {error && (
            <div
              className="px-4 py-3 rounded-xl text-sm mb-4"
              style={{ background: "#fee2e2", color: "#b91c1c", border: "1px solid #fecaca" }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium" style={{ color: c.text }}>Nom d'utilisateur</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg" style={{ color: c.muted }}>👤</span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-9 pr-4 py-3 rounded-lg focus:outline-none text-sm"
                  style={{
                    background: c.gray,
                    border: `1px solid ${c.border}`,
                    color: c.text,
                  }}
                  placeholder="Entrez votre username"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium" style={{ color: c.text }}>Mot de passe</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg" style={{ color: c.muted }}>🔒</span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-4 py-3 rounded-lg focus:outline-none text-sm"
                  style={{
                    background: c.gray,
                    border: `1px solid ${c.border}`,
                    color: c.text,
                  }}
                  placeholder="Entrez votre mot de passe"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 text-sm font-semibold rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: c.blue, color: "white", boxShadow: c.shadow }}
            >
              {isLoading ? "Connexion en cours..." : "Se connecter"}
            </button>
          </form>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px" style={{ background: c.border }} />
            <span className="text-xs" style={{ color: c.muted }}>ou</span>
            <div className="flex-1 h-px" style={{ background: c.border }} />
          </div>

          <p className="text-sm text-center" style={{ color: c.muted }}>
            Pas encore de compte ?{" "}
            <Link to="/register" className="font-semibold" style={{ color: c.blue }}>
              S'inscrire
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
