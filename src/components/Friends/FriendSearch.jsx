import { useState } from "react"
import { useFriends } from "../../context/FriendContext"

function FriendSearch() {
  const [query,     setQuery]     = useState("") // ce que l'user tape
  const [resultats, setResultats] = useState([]) // users trouvés
  const [loading,   setLoading]   = useState(false)
  const [message,   setMessage]   = useState("") // retour après envoi demande

  // On récupère les fonctions du contexte
  const { rechercherUsers, envoyerDemande } = useFriends()

  const rechercher = async () => {
    if (query.trim().length < 2) return
    setLoading(true)
    const users = await rechercherUsers(query)
    setResultats(users)
    setLoading(false)
  }

  const handleEnvoyer = async (userId) => {
    const result = await envoyerDemande(userId)
    if (result.success) {
      setMessage("Demande envoyée !")
      // Retirer l'user des résultats pour éviter de renvoyer
      setResultats(prev => prev.filter(u => u._id !== userId))
    } else {
      setMessage(result.message)
    }
    // Effacer le message après 3 secondes
    setTimeout(() => setMessage(""), 3000)
  }

  return (
    <div className="flex flex-col gap-2 w-full">

      {/* Barre de recherche */}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Rechercher un ami par username..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === "Enter" && rechercher()}
          className="flex-1 max-w-sm px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-purple-400 transition text-sm"
        />
        <button
          onClick={rechercher}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg transition"
        >
          {loading ? "..." : "Rechercher"}
        </button>
      </div>

      {/* Message de retour (succès ou erreur) */}
      {message && (
        <p className="text-sm text-purple-300">{message}</p>
      )}

      {/* Résultats de recherche */}
      {resultats.length > 0 && (
        <div className="absolute top-16 left-64 bg-slate-800 border border-white/10 rounded-xl p-2 min-w-72 z-10 flex flex-col gap-2">
          {resultats.map(user => (
            <div
              key={user._id}
              className="flex justify-between items-center px-3 py-2 rounded-lg bg-white/5"
            >
              <div>
                <div className="text-sm font-medium text-white">
                  {user.full_name}
                </div>
                <div className="text-xs text-purple-300/60">
                  @{user.username}
                </div>
              </div>
              <button
                onClick={() => handleEnvoyer(user._id)}
                className="text-xs px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition"
              >
                Ajouter
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default FriendSearch