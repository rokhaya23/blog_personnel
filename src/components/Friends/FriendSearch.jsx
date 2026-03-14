import { useState, useEffect, useRef } from "react"
import { useFriends } from "../../context/FriendContext"
import { useNavigate } from "react-router-dom"

function FriendSearch() {
  const [query,     setQuery]     = useState("")
  const [resultats, setResultats] = useState([])
  const [loading,   setLoading]   = useState(false)
  const [message,   setMessage]   = useState("")
  const [showDrop,  setShowDrop]  = useState(false)

  const { rechercherUsers, envoyerDemande, amis } = useFriends()
  const navigate = useNavigate()

  // useRef pour détecter le clic en dehors du dropdown
  const containerRef = useRef(null)

  // ════════════════════════════════
  // RECHERCHE EN TEMPS RÉEL
  // useEffect se déclenche à chaque fois que query change
  // On attend 400ms après la dernière frappe avant de chercher
  // C'est ce qu'on appelle le "debounce" — évite d'appeler
  // l'API à chaque lettre tapée
  // ════════════════════════════════
  // APRÈS — on déplace les setState dans des fonctions async
    useEffect(() => {
    if (query.trim().length < 2) {
        const vider = () => {
        setResultats([])
        setShowDrop(false)
        }
        vider()
        return
    }

    const timer = setTimeout(async () => {
        setLoading(true)
        const users = await rechercherUsers(query)
        setResultats(users)
        setShowDrop(true)
        setLoading(false)
    }, 400)

    return () => clearTimeout(timer)

    }, [query, rechercherUsers]) // ← ajouter rechercherUsers // ← se relance à chaque changement de query

  // ════════════════════════════════
  // FERMER LE DROPDOWN SI CLIC EN DEHORS
  // ════════════════════════════════
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowDrop(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleEnvoyer = async (userId) => {
    const result = await envoyerDemande(userId)
    if (result.success) {
      setMessage("Demande envoyée !")
      setResultats(prev => prev.filter(u => u._id !== userId))
    } else {
      setMessage(result.message)
    }
    setTimeout(() => setMessage(""), 3000)
  }

  // ════════════════════════════════
  // VISITER LE PROFIL
  // ════════════════════════════════
  const voirProfil = (userId) => {
    setShowDrop(false)
    setQuery("")
    navigate(`/profile/${userId}`)
  }

  return (
    // ref sur le conteneur pour détecter les clics dehors
    <div className="flex flex-col gap-2 w-full" ref={containerRef}>

      {/* Barre de recherche — plus de bouton, recherche automatique */}
      <div className="relative flex gap-2">
        <div className="relative flex-1 max-w-sm">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-300/50 text-sm">
            🔍
          </span>
          <input
            type="text"
            placeholder="Rechercher un ami..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            onFocus={() => resultats.length > 0 && setShowDrop(true)}
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-purple-400 transition text-sm"
          />
          {/* Spinner de chargement */}
          {loading && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-300/50 text-xs">
              ...
            </span>
          )}
          {/* Bouton effacer */}
          {query && !loading && (
            <button
              onClick={() => { setQuery(""); setResultats([]); setShowDrop(false) }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-300/50 hover:text-white transition"
            >✕</button>
          )}
        </div>

        {/* Message retour */}
        {message && (
          <span className="text-sm text-purple-300 self-center">{message}</span>
        )}
      </div>

      {/* Dropdown des résultats */}
      {showDrop && resultats.length > 0 && (
        <div className="absolute top-14 left-4 bg-slate-800 border border-white/10 rounded-xl p-2 min-w-80 z-50 flex flex-col gap-1 shadow-xl">

          <div className="text-xs text-purple-300/40 px-2 py-1">
            {resultats.length} résultat{resultats.length > 1 ? "s" : ""}
          </div>

          {resultats.map(user => (
            <div
              key={user._id}
              className="flex justify-between items-center px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition"
            >
              {/* Partie gauche — cliquable pour voir le profil */}
              <button
                onClick={() => voirProfil(user._id)}
                className="flex items-center gap-3 text-left flex-1"
              >
                {/* Avatar avec initiales */}
                <div className="w-8 h-8 rounded-full bg-purple-600/40 flex items-center justify-center text-xs font-medium text-purple-200 flex-shrink-0">
                  {user.full_name?.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="text-sm font-medium text-white">
                    {user.full_name}
                  </div>
                  <div className="text-xs text-purple-300/60 flex items-center gap-1">
                    @{user.username}
                    {user.is_online && (
                      <span className="flex items-center gap-1 text-green-400 ml-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block"></span>
                        en ligne
                      </span>
                    )}
                  </div>
                </div>
              </button>

              {/* Boutons actions */}
              <div className="flex gap-2 ml-2">
                <button
                    onClick={() => voirProfil(user._id)}
                    className="text-xs px-2 py-1.5 bg-white/10 hover:bg-white/20 text-purple-200 rounded-lg transition"
                >
                    Voir profil
                </button>

                {/* Vérifier si déjà ami avant d'afficher le bouton */}
                {amis.find(a => a._id === user._id) ? (
                    <span className="text-xs px-2 py-1.5 bg-green-500/20 text-green-400 rounded-lg">
                    ✓ Ami
                    </span>
                ) : (
                    <button
                    onClick={() => handleEnvoyer(user._id)}
                    className="text-xs px-2 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition"
                    >
                    + Ajouter
                    </button>
                )}
                </div>
            </div>
          ))}
        </div>
      )}

      {/* Aucun résultat */}
      {showDrop && query.length >= 2 && resultats.length === 0 && !loading && (
        <div className="absolute top-14 left-4 bg-slate-800 border border-white/10 rounded-xl p-4 min-w-80 z-50">
          <p className="text-purple-300/60 text-sm text-center">
            Aucun utilisateur trouvé pour "{query}"
          </p>
        </div>
      )}
    </div>
  )
}

export default FriendSearch