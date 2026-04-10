import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useFriends } from "../../context/FriendContext"
import api from "../../services/api"
import { useTheme } from "../../context/ThemeContext"

function UserProfile() {
  const { userId }  = useParams()
  const navigate    = useNavigate()
  const { amis, demandes, envoyerDemande, bloquerUser, pendingSent, annulerDemande } = useFriends()
  const { isDark } = useTheme()

  const [user,           setUser]           = useState(null)
  const [articles,       setArticles]       = useState([])
  const [friends,        setFriends]        = useState([])
  const [loading,        setLoading]        = useState(true)
  const [message,        setMessage]        = useState("")
  const [activeTab,      setActiveTab]      = useState("articles")
  const [demandeEnvoyee, setDemandeEnvoyee] = useState(false)
  const [successMsg, setSuccessMsg] = useState("")
  const [expandedId, setExpandedId] = useState(null)

  // ════════════════════════════════
  // CALCULER LE STATUT DE RELATION
  // ════════════════════════════════
  const statutRelation = () => {
    if (amis.find(a => a._id === userId))           return "ami"
    if (demandes.find(d => d.sender_id === userId)) return "demande_reçue"
    if (pendingSent.find(p => p._id === userId))    return "demande_envoyee"
    return "aucun"
  }

  // ════════════════════════════════
  // CHARGER LES DONNÉES DU PROFIL
  // ════════════════════════════════
  useEffect(() => {
    const charger = async () => {
      try {
        // Promise.all = lancer les 3 requêtes en même temps
        // au lieu de les faire l'une après l'autre
        const [resUser, resArticles, resFriends] = await Promise.all([
          api.get(`/users/${userId}`),
          api.get(`/users/${userId}/articles`),
          api.get(`/users/${userId}/friends`),
        ])
        setUser(resUser.data)
        setArticles(resArticles.data.articles || [])
        setFriends(resFriends.data.amis || [])
      } catch {
        navigate("/dashboard")
      } finally {
        setLoading(false)
      }
    }
    charger()
  }, [userId, navigate])

  // ════════════════════════════════
  // ENVOYER UNE DEMANDE D'AMI
  // ════════════════════════════════
  const handleAjouter = async () => {
    const result = await envoyerDemande(userId)
    if (result.success) {
      // Changer l'état du bouton au lieu d'afficher un message temporaire
      setDemandeEnvoyee(true)
      setMessage("")
      setSuccessMsg("Demande envoyée")
    } else {
      setMessage(result.message)
    }
  }

  const handleAnnuler = async () => {
    const result = await annulerDemande(userId)
    if (result.success) {
      setDemandeEnvoyee(false)
      setSuccessMsg("Invitation annulée")
    } else {
      setMessage(result.message)
    }
  }

  // ════════════════════════════════
  // BLOQUER UN UTILISATEUR
  // ════════════════════════════════
  const handleBloquer = async () => {
    const result = await bloquerUser(userId)
    if (result.success) {
      setSuccessMsg("Utilisateur bloqué")
      setTimeout(() => navigate("/dashboard"), 1200)
    } else {
      setMessage(result.message)
    }
  }

  const pageBg = isDark ? "bg-slate-900" : "bg-[#f0f4f8]"
  const topBarBg = isDark
    ? "bg-white/5 border-white/10"
    : "bg-white/90 border-slate-200/80 shadow-[0_12px_28px_rgba(15,23,42,0.06)] backdrop-blur-xl"
  const cardBg = isDark
    ? "bg-white/5 border-white/10"
    : "bg-white/92 border-slate-200/70 shadow-[0_18px_38px_rgba(15,23,42,0.06)]"
  const bannerBg = isDark
    ? "bg-gradient-to-r from-blue-900 via-indigo-700 to-blue-900"
    : "bg-gradient-to-r from-blue-900 via-indigo-700 to-blue-500"
  const primaryText = isDark ? "text-white" : "text-slate-800"
  const secondaryText = isDark ? "text-blue-200/70" : "text-blue-900/65"
  const mutedText = isDark ? "text-blue-200/50" : "text-blue-800/60"
  const primaryButton = isDark
    ? "bg-blue-700 hover:bg-blue-600 text-white shadow-[0_14px_30px_rgba(37,99,235,0.30)]"
    : "bg-blue-700 hover:bg-blue-800 text-white shadow-[0_12px_28px_rgba(37,99,235,0.18)]"
  const neutralButton = isDark
    ? "bg-blue-900/30 hover:bg-blue-800/40 text-white border border-blue-800"
    : "bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200"
  const tabActive = isDark ? "border-blue-500 text-white" : "border-blue-700 text-blue-900"
  const tabInactive = isDark ? "border-transparent text-blue-200/60 hover:text-white" : "border-transparent text-blue-900/60 hover:text-blue-900"

  if (loading) return (
    <div className={`min-h-screen flex items-center justify-center ${pageBg}`}>
      <p className={`text-lg ${isDark ? "text-blue-200" : "text-blue-900/70"}`}>Chargement...</p>
    </div>
  )

  const statut   = statutRelation()
  const initiales = user?.full_name
    ?.split(" ")
    .map(n => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "?"

  return (
    <div className={`min-h-screen ${pageBg}`}>

      {/* ── BARRE DU HAUT ── */}
      <div className={`border-b px-6 py-4 flex items-center gap-4 ${topBarBg}`}>
        <button
          onClick={() => navigate("/dashboard")}
          className={`transition text-sm flex items-center gap-2 ${isDark ? "text-blue-200 hover:text-white" : "text-blue-900/70 hover:text-blue-900"}`}
        >
          ← Retour
        </button>
        <span className={`font-medium ${primaryText}`}>{user?.full_name}</span>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">

        {/* ════════════════════════════════
            CARTE PROFIL PRINCIPALE
        ════════════════════════════════ */}
        <div className={`border rounded-2xl overflow-hidden mb-6 ${cardBg}`}>

          {/* Bannière */}
          <div className={`h-32 ${bannerBg}`} />

          {/* Avatar + infos + boutons */}
          <div className="px-6 pb-6">
            <div className="flex items-end justify-between -mt-10 mb-4">

              {user?.avatar ? (
              <img
                src={`http://localhost:5000/api/auth/avatar/${user.avatar}`}
                alt={user.full_name}
                className={`w-20 h-20 rounded-full object-cover border-4 flex-shrink-0 ${isDark ? "border-slate-900" : "border-white"}`}
              />
            ) : (
              <div className={`w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-blue-800 border-4 flex items-center justify-center text-2xl font-bold text-white flex-shrink-0 ${isDark ? "border-slate-900" : "border-white"}`}>
                {initiales}
              </div>
            )}

              {/* ════════════════════════════════
                  BOUTONS SELON LE STATUT
              ════════════════════════════════ */}
              <div className="flex items-center gap-2 mt-12">

                {/* Déjà ami */}
                {statut === "ami" && (
                  <>
                    <span className="flex items-center gap-1 px-4 py-2 bg-blue-500/15 text-blue-200 rounded-lg text-sm border border-blue-300/40">
                      ✓ Ajouté
                    </span>
                    <button
                      onClick={handleBloquer}
                      className="px-4 py-2 bg-slate-800/60 hover:bg-slate-700 text-white rounded-lg text-sm transition"
                    >
                      Bloquer
                    </button>
                  </>
                )}

                {/* Demande reçue de cet utilisateur */}
                {statut === "demande_recue" && (
                  <span className={`px-4 py-2 rounded-lg text-sm ${isDark ? "bg-blue-600/20 text-blue-200" : "bg-blue-100 text-blue-900"}`}>
                    Demande reçue — allez dans "Demandes" pour répondre
                  </span>
                )}

                {/* Aucune relation */}
                {statut === "demande_envoyee" || demandeEnvoyee ? (
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-2 px-4 py-2 bg-blue-500/15 text-blue-200 rounded-lg text-sm border border-blue-300/40">
                      Demande envoyée
                    </span>
                    <button
                      onClick={handleAnnuler}
                      className={`px-4 py-2 rounded-lg text-sm transition ${neutralButton}`}
                    >
                      Annuler
                    </button>
                  </div>
                ) : statut === "aucun" && (
                  <>
                    <button
                      onClick={handleAjouter}
                      className={`px-4 py-2 rounded-lg text-sm transition font-medium ${primaryButton}`}
                    >
                      + Ajouter en ami
                    </button>
                    <button
                      onClick={handleBloquer}
                      className={`px-4 py-2 rounded-lg text-sm transition ${neutralButton}`}
                    >
                      Bloquer
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Nom + username + statut en ligne */}
            <div>
              <h1 className={`text-2xl font-bold ${primaryText}`}>{user?.full_name}</h1>
              <div className={`text-sm mb-2 ${secondaryText}`}>@{user?.username}</div>
              <div className="flex items-center gap-1 text-sm">
                {user?.is_online ? (
                  <span className="flex items-center gap-1 text-blue-300">
                    <span className="w-2 h-2 rounded-full bg-blue-400 inline-block"></span>
                    En ligne
                  </span>
                ) : (
                  <span className={mutedText}>Hors ligne</span>
                )}
              </div>
              {(message || successMsg) && (
                <p className={`text-sm mt-2 ${successMsg ? "text-green-400" : "text-blue-200"}`}>
                  {message || successMsg}
                </p>
              )}
            </div>

            {/* Stats rapides */}
        <div className={`flex gap-6 mt-4 pt-4 border-t ${isDark ? "border-white/10" : "border-blue-200/70"}`}>
              <div className="text-center">
                <div className={`text-xl font-bold ${primaryText}`}>{articles.length}</div>
                <div className={`text-xs ${secondaryText}`}>Articles</div>
              </div>
              <div className="text-center">
                <div className={`text-xl font-bold ${primaryText}`}>{friends.length}</div>
                <div className={`text-xs ${secondaryText}`}>Amis</div>
              </div>
              <div className="text-center">
                <div className={`text-xl font-bold ${primaryText}`}>
                  {user?.created_at
                    ? new Date(user.created_at).toLocaleDateString("fr-FR", { month: "short", year: "numeric" })
                    : "-"}
                </div>
                <div className={`text-xs ${secondaryText}`}>Membre depuis</div>
              </div>
            </div>
          </div>
        </div>

        {/* ════════════════════════════════
            ONGLETS Articles / Amis
        ════════════════════════════════ */}
        <div className={`flex gap-2 mb-6 border-b ${isDark ? "border-white/10" : "border-blue-200/70"}`}>
          {[
            { id: "articles", label: `Articles (${articles.length})` },
            { id: "amis",     label: `Amis (${friends.length})` },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-3 text-sm font-medium transition border-b-2 -mb-px ${
                activeTab === tab.id
                  ? tabActive
                  : tabInactive
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Onglet Articles ── */}
        {activeTab === "articles" && (
          <div className="flex flex-col gap-3">
            {articles.length === 0 ? (
              <div className="text-center py-16">
                <p className={secondaryText}>Vous n'avez aucun article public pour l'instant</p>
              </div>
            ) : (
              articles.map(article => {
                const key = article.id || article._id
                const isOpen = expandedId === key
                return (
                  <button
                    key={key}
                    onClick={() => setExpandedId(isOpen ? null : key)}
                    className={`border rounded-xl p-5 text-left transition w-full ${isDark ? "bg-white/5 border-white/10 hover:bg-white/10" : "bg-white/92 border-blue-200/70 hover:bg-white shadow-sm"}`}
                  >
                    <div className="flex justify-between items-start mb-2 gap-3">
                      <h3 className={`font-semibold text-base ${primaryText}`}>{article.title}</h3>
                      <span className={`text-xs flex-shrink-0 ${mutedText}`}>
                        {new Date(article.created_at).toLocaleDateString("fr-FR", {
                          day: "numeric", month: "short", year: "numeric"
                        })}
                      </span>
                    </div>
                    <p className={`text-sm ${isDark ? "text-blue-100/80" : "text-slate-600"}`}>
                      {isOpen ? article.content : (article.content || "").slice(0, 160) + (article.content?.length > 160 ? "…" : "")}
                    </p>
                    <div className={`text-xs mt-2 ${mutedText}`}>{isOpen ? "Clique pour refermer" : "Clique pour lire"}</div>
                  </button>
                )
              })
            )}
          </div>
        )}

        {/* ── Onglet Amis ── */}
        {activeTab === "amis" && (
          <div>
            {friends.length === 0 ? (
              <div className="text-center py-16">
                <p className={secondaryText}>Aucun ami pour l'instant</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {friends.map(ami => (
                  <button
                    key={ami._id}
                    onClick={() => navigate(`/profile/${ami._id}`)}
                    className={`flex items-center gap-3 p-3 border rounded-xl transition text-left w-full ${isDark ? "bg-white/5 border-white/10 hover:bg-white/10" : "bg-white/92 border-blue-200/70 hover:bg-white shadow-sm"}`}
                  >
                    {ami.avatar ? (
                    <img
                      src={`http://localhost:5000/api/auth/avatar/${ami.avatar}`}
                      alt={ami.full_name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-blue-500 flex-shrink-0"
                    />
                  ) : (
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 ${isDark ? "bg-blue-600/50 text-blue-100" : "bg-blue-100 text-blue-800"}`}>
                      {ami.full_name?.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                    <div>
                      <div className={`text-sm font-medium ${primaryText}`}>{ami.full_name}</div>
                      <div className={`text-xs flex items-center gap-1 ${secondaryText}`}>
                        @{ami.username}
                        {ami.is_online && (
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 inline-block ml-1"></span>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  )
}

export default UserProfile
