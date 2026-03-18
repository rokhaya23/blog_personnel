import { useState, useEffect, useRef } from "react"
import { useFriends } from "../../context/FriendContext"
import { useNavigate } from "react-router-dom"
import { useTheme } from "../../context/ThemeContext"

function FriendSearch() {
  const [query,     setQuery]     = useState("")
  const [resultats, setResultats] = useState([])
  const [loading,   setLoading]   = useState(false)
  const [message,   setMessage]   = useState("")
  const [showDrop,  setShowDrop]  = useState(false)

  const { rechercherUsers, envoyerDemande, amis } = useFriends()
  const { isDark } = useTheme()
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

  const inputClass = isDark
    ? "bg-white/10 border-white/20 text-white placeholder-white/40"
    : "bg-white border-violet-200 text-slate-800 placeholder:text-violet-500/50 shadow-sm"
  const iconClass = isDark ? "text-purple-300/50" : "text-violet-800/45"
  const feedbackClass = isDark ? "text-purple-300" : "text-violet-900"
  const dropdownClass = isDark
    ? "bg-slate-800 border border-white/10 shadow-xl"
    : "bg-white/95 border border-violet-200 shadow-[0_18px_40px_rgba(76,29,149,0.12)] backdrop-blur-xl"
  const rowClass = isDark
    ? "bg-white/5 hover:bg-white/10"
    : "bg-violet-50/40 hover:bg-violet-100/70"
  const avatarClass = isDark
    ? "bg-purple-600/40 text-purple-200"
    : "bg-violet-100 text-violet-800"
  const nameClass = isDark ? "text-white" : "text-slate-800"
  const usernameClass = isDark ? "text-purple-300/60" : "text-violet-900/55"
  const secondaryButton = isDark
    ? "bg-white/10 hover:bg-white/20 text-purple-200"
    : "bg-white hover:bg-violet-50 text-violet-900 border border-violet-200"
  const primaryButton = isDark
    ? "bg-violet-600 hover:bg-violet-500 text-white"
    : "bg-violet-700 hover:bg-violet-800 text-white"
  const emptyClass = isDark ? "text-purple-300/60" : "text-violet-900/60"

  return (
    // ref sur le conteneur pour détecter les clics dehors
    <div className="flex flex-col gap-2 w-full" ref={containerRef}>

      {/* Barre de recherche — plus de bouton, recherche automatique */}
      <div className="relative flex gap-2">
        <div className="relative flex-1 max-w-sm">
          <span className={`absolute left-3 top-1/2 -translate-y-1/2 text-sm ${iconClass}`}>
            🔍
          </span>
          <input
            type="text"
            placeholder="Rechercher un ami..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            onFocus={() => resultats.length > 0 && setShowDrop(true)}
            className={`w-full pl-9 pr-4 py-2 rounded-lg border focus:outline-none focus:border-violet-400 transition text-sm ${inputClass}`}
          />
          {/* Spinner de chargement */}
          {loading && (
            <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs ${iconClass}`}>
              ...
            </span>
          )}
          {/* Bouton effacer */}
          {query && !loading && (
            <button
              onClick={() => { setQuery(""); setResultats([]); setShowDrop(false) }}
              className={`absolute right-3 top-1/2 -translate-y-1/2 transition ${iconClass} ${isDark ? "hover:text-white" : "hover:text-violet-900"}`}
            >✕</button>
          )}
        </div>

        {/* Message retour */}
        {message && (
          <span className={`text-sm self-center ${feedbackClass}`}>{message}</span>
        )}
      </div>

      {/* Dropdown des résultats */}
      {showDrop && resultats.length > 0 && (
        <div className={`absolute top-14 left-4 rounded-xl p-2 min-w-80 z-50 flex flex-col gap-1 ${dropdownClass}`}>

          <div className={`text-xs px-2 py-1 ${isDark ? "text-purple-300/40" : "text-violet-900/45"}`}>
            {resultats.length} résultat{resultats.length > 1 ? "s" : ""}
          </div>

          {resultats.map(user => (
            <div
              key={user._id}
              className={`flex justify-between items-center px-3 py-2 rounded-lg transition ${rowClass}`}
            >
              {/* Partie gauche — cliquable pour voir le profil */}
              <button
                onClick={() => voirProfil(user._id)}
                className="flex items-center gap-3 text-left flex-1"
              >
                {/* Avatar avec initiales */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 ${avatarClass}`}>
                  {user.full_name?.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className={`text-sm font-medium ${nameClass}`}>
                    {user.full_name}
                  </div>
                  <div className={`text-xs flex items-center gap-1 ${usernameClass}`}>
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
                    className={`text-xs px-2 py-1.5 rounded-lg transition ${secondaryButton}`}
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
                    className={`text-xs px-2 py-1.5 rounded-lg transition ${primaryButton}`}
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
        <div className={`absolute top-14 left-4 rounded-xl p-4 min-w-80 z-50 ${dropdownClass}`}>
          <p className={`text-sm text-center ${emptyClass}`}>
            Aucun utilisateur trouvé pour "{query}"
          </p>
        </div>
      )}
    </div>
  )
}

export default FriendSearch
