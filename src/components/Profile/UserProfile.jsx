import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useFriends } from "../../context/FriendContext"
import api from "../../services/api"

function UserProfile() {
  const { userId }  = useParams()
  const navigate    = useNavigate()
  const { amis, demandes, envoyerDemande, bloquerUser } = useFriends()

  const [user,           setUser]           = useState(null)
  const [articles,       setArticles]       = useState([])
  const [friends,        setFriends]        = useState([])
  const [loading,        setLoading]        = useState(true)
  const [message,        setMessage]        = useState("")
  const [activeTab,      setActiveTab]      = useState("articles")
  const [demandeEnvoyee, setDemandeEnvoyee] = useState(false) // ← nouveau

  // ════════════════════════════════
  // CALCULER LE STATUT DE RELATION
  // ════════════════════════════════
  const statutRelation = () => {
    if (amis.find(a => a._id === userId))           return "ami"
    if (demandes.find(d => d.sender_id === userId)) return "demande_recue"
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
    } else {
      setMessage(result.message)
    }
  }

  // ════════════════════════════════
  // BLOQUER UN UTILISATEUR
  // ════════════════════════════════
  const handleBloquer = async () => {
    if (!confirm("Bloquer cet utilisateur ?")) return
    const result = await bloquerUser(userId)
    if (result.success) navigate("/dashboard")
    else setMessage(result.message)
  }

  if (loading) return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <p className="text-purple-200 text-lg">Chargement...</p>
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
    <div className="min-h-screen bg-slate-900">

      {/* ── BARRE DU HAUT ── */}
      <div className="bg-white/5 border-b border-white/10 px-6 py-4 flex items-center gap-4">
        <button
          onClick={() => navigate("/dashboard")}
          className="text-purple-300 hover:text-white transition text-sm flex items-center gap-2"
        >
          ← Retour
        </button>
        <span className="text-white font-medium">{user?.full_name}</span>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">

        {/* ════════════════════════════════
            CARTE PROFIL PRINCIPALE
        ════════════════════════════════ */}
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden mb-6">

          {/* Bannière */}
          <div className="h-32 bg-gradient-to-r from-purple-900 via-purple-800 to-slate-800" />

          {/* Avatar + infos + boutons */}
          <div className="px-6 pb-6">
            <div className="flex items-end justify-between -mt-10 mb-4">

              {/* Avatar grand format */}
              <div className="w-20 h-20 rounded-full bg-purple-600 border-4 border-slate-900 flex items-center justify-center text-2xl font-bold text-white flex-shrink-0">
                {initiales}
              </div>

              {/* ════════════════════════════════
                  BOUTONS SELON LE STATUT
              ════════════════════════════════ */}
              <div className="flex items-center gap-2 mt-12">

                {/* Déjà ami */}
                {statut === "ami" && (
                  <>
                    <span className="flex items-center gap-1 px-4 py-2 bg-green-500/20 text-green-400 rounded-lg text-sm">
                      ✓ Ami
                    </span>
                    <button
                      onClick={handleBloquer}
                      className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm transition"
                    >
                      Bloquer
                    </button>
                  </>
                )}

                {/* Demande reçue de cet utilisateur */}
                {statut === "demande_recue" && (
                  <span className="px-4 py-2 bg-purple-500/20 text-purple-300 rounded-lg text-sm">
                    Demande reçue — va dans "Demandes" pour répondre
                  </span>
                )}

                {/* Aucune relation */}
                {statut === "aucun" && (
                  <>
                    {demandeEnvoyee ? (
                      // ── Après envoi ── bouton désactivé avec confirmation visuelle
                      <span className="flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-400 rounded-lg text-sm">
                        ✓ Demande envoyée
                      </span>
                    ) : (
                      // ── Avant envoi ── bouton normal
                      <button
                        onClick={handleAjouter}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm transition font-medium"
                      >
                        + Ajouter en ami
                      </button>
                    )}
                    <button
                      onClick={handleBloquer}
                      className="px-4 py-2 bg-white/10 hover:bg-white/20 text-purple-200 rounded-lg text-sm transition"
                    >
                      Bloquer
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Nom + username + statut en ligne */}
            <div>
              <h1 className="text-2xl font-bold text-white">{user?.full_name}</h1>
              <div className="text-purple-300/60 text-sm mb-2">@{user?.username}</div>
              <div className="flex items-center gap-1 text-sm">
                {user?.is_online ? (
                  <span className="flex items-center gap-1 text-green-400">
                    <span className="w-2 h-2 rounded-full bg-green-400 inline-block"></span>
                    En ligne
                  </span>
                ) : (
                  <span className="text-purple-300/40">Hors ligne</span>
                )}
              </div>
              {/* Message d'erreur si envoi échoue */}
              {message && (
                <p className="text-red-400 text-sm mt-2">{message}</p>
              )}
            </div>

            {/* Stats rapides */}
            <div className="flex gap-6 mt-4 pt-4 border-t border-white/10">
              <div className="text-center">
                <div className="text-xl font-bold text-white">{articles.length}</div>
                <div className="text-xs text-purple-300/60">Articles</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-white">{friends.length}</div>
                <div className="text-xs text-purple-300/60">Amis</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-white">
                  {user?.created_at
                    ? new Date(user.created_at).toLocaleDateString("fr-FR", { month: "short", year: "numeric" })
                    : "-"}
                </div>
                <div className="text-xs text-purple-300/60">Membre depuis</div>
              </div>
            </div>
          </div>
        </div>

        {/* ════════════════════════════════
            ONGLETS Articles / Amis
        ════════════════════════════════ */}
        <div className="flex gap-2 mb-6 border-b border-white/10">
          {[
            { id: "articles", label: `Articles (${articles.length})` },
            { id: "amis",     label: `Amis (${friends.length})` },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-3 text-sm font-medium transition border-b-2 -mb-px ${
                activeTab === tab.id
                  ? "border-purple-500 text-white"
                  : "border-transparent text-purple-300/60 hover:text-purple-200"
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
                <p className="text-purple-200/60">Aucun article public pour l'instant</p>
              </div>
            ) : (
              articles.map(article => (
                <div
                  key={article.id || article._id}
                  className="bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/10 transition"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-white text-base">{article.title}</h3>
                    <span className="text-xs text-purple-300/40 flex-shrink-0 ml-4">
                      {new Date(article.created_at).toLocaleDateString("fr-FR", {
                        day: "numeric", month: "short", year: "numeric"
                      })}
                    </span>
                  </div>
                  {/* Aperçu du contenu — limité à 3 lignes */}
                  <p className="text-sm text-purple-300/70 line-clamp-3">{article.content}</p>
                </div>
              ))
            )}
          </div>
        )}

        {/* ── Onglet Amis ── */}
        {activeTab === "amis" && (
          <div>
            {friends.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-purple-200/60">Aucun ami pour l'instant</p>
              </div>
            ) : (
              // Grille 2 colonnes comme Facebook
              <div className="grid grid-cols-2 gap-3">
                {friends.map(ami => (
                  <button
                    key={ami._id}
                    onClick={() => navigate(`/profile/${ami._id}`)}
                    className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition text-left"
                  >
                    <div className="w-12 h-12 rounded-full bg-purple-600/50 flex items-center justify-center text-sm font-medium text-purple-200 flex-shrink-0">
                      {ami.full_name?.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white">{ami.full_name}</div>
                      <div className="text-xs text-purple-300/60 flex items-center gap-1">
                        @{ami.username}
                        {ami.is_online && (
                          <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block ml-1"></span>
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