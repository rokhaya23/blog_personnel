import { useState } from "react"
import { useAuth } from "../../context/AuthContext"

function AdminLogin() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { login, logout } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    if (!username.trim() || !password) {
      setError("Veuillez remplir tous les champs")
      return
    }

    setIsLoading(true)
    const result = await login(username.trim(), password)
    setIsLoading(false)

    if (!result.success) {
      setError(result.message)
      return
    }

    if (!result.user?.is_admin) {
      await logout()
      setError("Ce compte n'a pas les droits administrateur")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 w-full max-w-md shadow-2xl border border-white/20">
        <div className="text-center mb-8">
          <span className="text-4xl mb-4 block">📊</span>
          <h1
            className="text-3xl font-black bg-gradient-to-r from-blue-400 via-blue-300 to-blue-600 bg-clip-text text-transparent mb-2"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Daily Post
          </h1>
          <p className="text-blue-200/70 text-sm">Panel de monitoring</p>
        </div>

        {error && (
          <div className="bg-blue-500/15 border border-blue-400 text-blue-100 px-4 py-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-blue-200 text-sm mb-2">
              Nom d'utilisateur admin
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
            className="w-full py-3 bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded-lg transition duration-200 shadow-lg disabled:opacity-50"
          >
            {isLoading ? "Connexion en cours..." : "Acceder au monitoring"}
          </button>
        </form>

        <p className="text-blue-200/60 text-xs text-center mt-6">
          Acces reserve aux administrateurs de Daily Post
        </p>
      </div>
    </div>
  )
}

export default AdminLogin
