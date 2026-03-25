import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"

function Login() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const { login } = useAuth()
  const navigate = useNavigate()

  // handleSubmit est maintenant async car login() fait un appel API
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    if (!username || !password) {
      setError("Veuillez remplir tous les champs")
      return
    }

    setIsLoading(true)

    const result = await login(username, password)

    setIsLoading(false)

    if (result.success) {
      navigate("/dashboard")
    } else {
      setError(result.message)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 w-full max-w-md shadow-2xl border border-white/20">
        <h1 className="text-3xl font-bold text-white text-center mb-2">
          Mon Blog
        </h1>
        <p className="text-blue-200 text-center mb-8">
          Connectez-vous pour acceder a votre espace
        </p>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-blue-200 text-sm mb-2">
              Nom d'utilisateur
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-blue-400 transition"
              placeholder="Entrez votre username"
            />
          </div>

          <div className="mb-6">
            <label className="block text-blue-200 text-sm mb-2">
              Mot de passe
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-blue-400 transition"
              placeholder="Entrez votre mot de passe"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded-lg transition duration-200 shadow-[0_14px_30px_rgba(37,99,235,0.28)] hover:shadow-[0_16px_34px_rgba(37,99,235,0.32)] disabled:opacity-50"
          >
            {isLoading ? "Connexion en cours..." : "Se connecter"}
          </button>
        </form>

        <p className="text-blue-200 text-center mt-6">
          Pas encore de compte ?{" "}
          <Link to="/register" className="text-blue-300 hover:text-blue-200 underline">
            S'inscrire
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Login
