import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 w-full max-w-md shadow-2xl border border-white/20">
        <h1 className="text-3xl font-bold text-white text-center mb-2">
          Mon Blog
        </h1>
        <p className="text-purple-200 text-center mb-8">
          Créez votre compte pour commencer
        </p>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-purple-200 text-sm mb-2">
              Nom complet
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-purple-400 transition"
              placeholder="Lyliane Damado"
            />
          </div>

          <div className="mb-4">
            <label className="block text-purple-200 text-sm mb-2">
              Nom d'utilisateur
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-purple-400 transition"
              placeholder="lyliane_d"
            />
          </div>

          <div className="mb-4">
            <label className="block text-purple-200 text-sm mb-2">
              Mot de passe
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-purple-400 transition"
              placeholder="Minimum 6 caracteres"
            />
          </div>

          <div className="mb-6">
            <label className="block text-purple-200 text-sm mb-2">
              Confirmer le mot de passe
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-purple-400 transition"
              placeholder="Retapez votre mot de passe"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg transition duration-200 shadow-[0_14px_30px_rgba(15,23,42,0.26)] hover:shadow-[0_16px_34px_rgba(15,23,42,0.30)] disabled:opacity-50"
          >
            {isLoading ? "Inscription en cours..." : "S'inscrire"}
          </button>
        </form>

        <p className="text-purple-200 text-center mt-6">
          Déja un compte ?{" "}
          <Link to="/login" className="text-purple-400 hover:text-purple-300 underline">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Register
