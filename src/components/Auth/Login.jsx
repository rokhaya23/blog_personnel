import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"

function Login() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError]       = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { login }  = useAuth()
  const navigate   = useNavigate()

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
    <>
      {/* CHANGEMENT 1 : justify-center ajouté pour centrer verticalement */}
      <div className="min-h-screen bg-gradient-to-br from-slate-800 via-blue-600 to-slate-900 px-6 py-10 flex flex-col items-center justify-center">

      {/* CHANGEMENT 2 : logo recentré, icône ajoutée, tagline ajoutée */}
      <div className="flex flex-col items-center gap-2 mb-8">
        <div className="flex items-center gap-3">
          <h1
            className="text-3xl font-black text-white tracking-wide"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Daily Blog
          </h1>
        </div>
        <p className="text-white/50 text-sm tracking-wide">
          Partagez vos idées avec le monde
        </p>
      </div>

      {/* Carte — inchangée sauf légère amélioration des bordures */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 w-full max-w-md shadow-2xl border border-white/20">

        <p className="text-sm text-blue-100/80 text-center mb-6 uppercase tracking-[0.15em]">
          Connexion
        </p>

        {error && (
          <div className="bg-red-500/15 border border-red-400/40 text-red-200 px-4 py-3 rounded-xl mb-4 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-blue-200 text-sm font-medium mb-2">
              Nom d'utilisateur
            </label>
            {/* CHANGEMENT 3 : icône dans l'input */}
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 opacity-40 text-sm pointer-events-none">👤</span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-blue-400 transition"
                placeholder="Entrez votre username"
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-blue-200 text-sm font-medium mb-2">
              Mot de passe
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 opacity-40 text-sm pointer-events-none">🔒</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-blue-400 transition"
                placeholder="Entrez votre mot de passe"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded-xl transition duration-200 shadow-[0_12px_26px_rgba(37,99,235,0.35)] hover:shadow-[0_14px_30px_rgba(37,99,235,0.45)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Connexion en cours..." : "Se connecter"}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-white/15" />
          <span className="text-white/35 text-xs">ou</span>
          <div className="flex-1 h-px bg-white/15" />
        </div>

        <p className="text-blue-200/70 text-center text-sm">
          Pas encore de compte ?{" "}
          <Link to="/register" className="text-blue-300 hover:text-white underline transition">
            S'inscrire
          </Link>
        </p>
      </div>
    </div>
    </>
  )}

export default Login