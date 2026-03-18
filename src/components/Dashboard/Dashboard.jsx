// ============================================================
// Dashboard.jsx — VERSION DAILY POST
// ============================================================

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "../../context/AuthContext"
import { useNavigate } from "react-router-dom"
import { articlesAPI, authAPI } from "../../services/api"
import { useToast } from "../Layout/Toast"
import ArticleCard from "../Articles/ArticleCard"
import ArticleForm from "../Articles/ArticleForm"
import FriendSearch from "../Friends/FriendSearch"
import FriendsList from "../Friends/FriendsList"
import FriendRequests from "../Friends/FriendRequests"
import { useFriends } from "../../context/FriendContext"

function Dashboard() {
  const { currentUser, logout, refreshCurrentUser } = useAuth()
  const navigate = useNavigate()
  const { showToast } = useToast()

  const [activePage, setActivePage] = useState("dashboard")
  const [activeTab, setActiveTab] = useState("mine")
  const [myArticles, setMyArticles] = useState([])
  const [feedArticles, setFeedArticles] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [articleToEdit, setArticleToEdit] = useState(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const ARTICLES_PER_PAGE = 10

  const { demandes } = useFriends()

  const initiales = currentUser?.full_name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "?"

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Bonjour"
    if (hour < 18) return "Bon apres-midi"
    return "Bonsoir"
  }

  const prenom = currentUser?.full_name?.split(" ")[0] || "Utilisateur"

  const navItems = [
    { id: "dashboard", label: "Tableau de bord", icon: "🏠" },
    { id: "amis", label: "Mes amis", icon: "👥" },
    { id: "articles", label: "Mes articles", icon: "✍️" },
    { id: "demandes", label: "Demandes", icon: "🔔", badge: demandes.length },
    { id: "profil", label: "Mon profil", icon: "👤" },
    ...(currentUser?.is_admin ? [{ id: "admin", label: "Monitoring", icon: "📊" }] : []),
  ]

  const loadArticles = useCallback(async () => {
    setLoading(true)
    try {
      const [mineRes, feedRes] = await Promise.all([
        articlesAPI.getMyArticles(),
        articlesAPI.getFeed(),
      ])
      setMyArticles(mineRes.data)
      setFeedArticles(feedRes.data)
    } catch (err) {
      console.error("Erreur chargement articles :", err)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    loadArticles()
  }, [loadArticles])

  const handleLogout = async () => {
    await logout()
    navigate("/login")
  }

  const handleCreateArticle = async (data) => {
    try {
      await articlesAPI.create(data)
      await loadArticles()
      setShowForm(false)
      showToast("Article publie avec succes !", "success")
    } catch (err) {
      return { success: false, message: err.response?.data?.message || "Erreur" }
    }
    return { success: true }
  }

  const handleUpdateArticle = async (articleId, data) => {
    try {
      await articlesAPI.update(articleId, data)
      await loadArticles()
      setShowForm(false)
      setArticleToEdit(null)
      showToast("Article modifie avec succes !", "success")
    } catch (err) {
      return { success: false, message: err.response?.data?.message || "Erreur" }
    }
    return { success: true }
  }

  const handleDeleteArticle = async (articleId) => {
    try {
      await articlesAPI.delete(articleId)
      await loadArticles()
      showToast("Article supprime", "info")
    } catch {
      showToast("Erreur lors de la suppression", "error")
    }
  }

  const handleEdit = (article) => {
    setArticleToEdit(article)
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleFormDone = () => {
    setShowForm(false)
    setArticleToEdit(null)
  }

  const filterArticles = (articles) => {
    if (!searchQuery.trim()) return articles
    const query = searchQuery.toLowerCase()
    return articles.filter(
      (a) =>
        a.title.toLowerCase().includes(query) ||
        a.content.toLowerCase().includes(query)
    )
  }

  const paginateArticles = (articles) => {
    const start = (currentPage - 1) * ARTICLES_PER_PAGE
    return articles.slice(start, start + ARTICLES_PER_PAGE)
  }

  const currentArticles = activeTab === "mine" ? myArticles : feedArticles
  const filteredArticles = filterArticles(currentArticles)
  const totalPages = Math.ceil(filteredArticles.length / ARTICLES_PER_PAGE)
  const displayedArticles = paginateArticles(filteredArticles)

  const handleTabChange = (tab) => {
    setActiveTab(tab)
    setCurrentPage(1)
    setSearchQuery("")
  }

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      showToast("La photo ne doit pas depasser 5 Mo", "error")
      return
    }
    const formData = new FormData()
    formData.append("avatar", file)
    try {
      await authAPI.updateProfile(formData)
      await refreshCurrentUser()
      showToast("Photo de profil mise a jour !", "success")
    } catch {
      showToast("Erreur lors du changement de photo", "error")
    }
  }

  // ════════════════════════════════
  // RENDU
  // ════════════════════════════════
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">

      {/* ══════════════════════════════════════════════
          BARRE DU HAUT — DAILY POST (toute la largeur)
      ══════════════════════════════════════════════ */}
      <div className="bg-white/5 border-b border-white/10 px-6 py-4 flex items-center justify-end">
        <h1
          className="text-4xl font-black tracking-tight bg-gradient-to-r from-purple-400 via-violet-300 to-purple-500 bg-clip-text text-transparent"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Daily Post
        </h1>
      </div>

      {/* ══════════════════════════════════════════════
          CONTENU (SIDEBAR + MAIN) en dessous du titre
      ══════════════════════════════════════════════ */}
      <div className="flex flex-1 overflow-hidden">

        {/* ══════════════════════════════════════════════
            SIDEBAR
        ══════════════════════════════════════════════ */}
        <aside className="w-60 flex-shrink-0 bg-white/5 border-r border-white/10 flex flex-col p-3 gap-1">

          {/* Avatar + nom */}
          <div className="flex items-center gap-3 px-2 py-3 mb-2 border-b border-white/10">
            {currentUser.avatar ? (
              <img
                src={`http://localhost:5000/api/auth/avatar/${currentUser.avatar}`}
                alt="Avatar"
                className="w-9 h-9 rounded-full object-cover border-2 border-purple-500 flex-shrink-0"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-purple-600 flex items-center justify-center text-sm font-medium text-white flex-shrink-0">
                {initiales}
              </div>
            )}
            <div>
              <div className="text-sm font-medium text-white">{currentUser?.full_name}</div>
              <div className="flex items-center gap-1 text-xs text-purple-300/60">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block"></span>
                En ligne
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="text-xs text-purple-300/40 px-2 py-1 mt-1">NAVIGATION</div>

          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                if (item.id === "admin") {
                  navigate("/admin")
                  return
                }
                setActivePage(item.id)
              }}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition w-full text-left
                ${activePage === item.id
                  ? "bg-purple-600 text-white"
                  : "text-purple-200 hover:bg-white/10"
                }`}
            >
              <span>{item.icon}</span>
              {item.label}
              {item.badge > 0 && (
                <span className="ml-auto px-2 py-0.5 text-xs bg-red-500 text-white rounded-full">
                  {item.badge}
                </span>
              )}
            </button>
          ))}

          {/* Déconnexion */}
          <div className="mt-auto border-t border-white/10 pt-3">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition w-full"
            >
              <span>🚪</span>
              Deconnexion
            </button>
          </div>
        </aside>

        {/* ══════════════════════════════════════════════
            CONTENU PRINCIPAL
        ══════════════════════════════════════════════ */}
        <main className="flex-1 flex flex-col overflow-hidden">

          {/* Barre de recherche d'amis */}
          <div className="bg-white/5 border-b border-white/10 px-6 py-3">
            <FriendSearch />
          </div>

          {/* Zone scrollable */}
          <div className="flex-1 overflow-auto p-6">

            {/* ═══════════════════════════════════
                PAGE : TABLEAU DE BORD
            ═══════════════════════════════════ */}
            {activePage === "dashboard" && (
              <div>
                {/* Message de bienvenue */}
                <div className="mb-8">
                  <h1 className="text-3xl font-bold text-white mb-2">
                    {getGreeting()}, {prenom} 👋
                  </h1>
                  <p className="text-purple-300/60">
                    Bienvenue sur Daily Post. Découvrez les derniers articles de vos amis ou partagez vos idées.
                  </p>
                </div>

                {/* Stats cliquables */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                  {[
                    { label: "Mes articles", valeur: myArticles.length, page: null, icon: "📝" },
                    { label: "Fil d'actualité", valeur: feedArticles.length, page: null, icon: "📰" },
                    { label: "Demandes reçues", valeur: demandes.length, violet: true, page: "demandes", icon: "🔔" },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      onClick={() => stat.page && setActivePage(stat.page)}
                      className={`bg-white/5 rounded-xl p-5 border border-white/10 ${
                        stat.page ? "cursor-pointer hover:bg-white/10 transition" : ""
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">{stat.icon}</span>
                        <span className="text-xs text-purple-300/60">{stat.label}</span>
                      </div>
                      <div className={`text-3xl font-bold ${stat.violet ? "text-purple-400" : "text-white"}`}>
                        {stat.valeur}
                      </div>
                      {stat.page && stat.valeur > 0 && (
                        <p className="text-xs text-purple-400 mt-2">Cliquer pour voir →</p>
                      )}
                    </div>
                  ))}
                </div>

                {/* Onglets */}
                <div className="flex gap-2 mb-6">
                  {[
                    { id: "mine", label: "Mes articles" },
                    { id: "feed", label: `Fil d'actualite (${feedArticles.length})` },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => handleTabChange(tab.id)}
                      className={`px-5 py-2.5 rounded-lg font-medium transition ${
                        activeTab === tab.id
                          ? "bg-purple-600 text-white"
                          : "bg-white/10 text-purple-200 hover:bg-white/20"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Recherche */}
                {currentArticles.length > 0 && (
                  <div className="mb-6">
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-300/50">🔍</span>
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1) }}
                        className="w-full pl-12 pr-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-purple-400 transition"
                        placeholder="Rechercher par titre ou contenu..."
                      />
                      {searchQuery && (
                        <button
                          onClick={() => { setSearchQuery(""); setCurrentPage(1) }}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-purple-300/50 hover:text-white"
                        >✕</button>
                      )}
                    </div>
                    {searchQuery && (
                      <p className="text-purple-300/50 text-sm mt-2">
                        {filteredArticles.length} resultat{filteredArticles.length !== 1 ? "s" : ""} pour "{searchQuery}"
                      </p>
                    )}
                  </div>
                )}

                {/* En-tête + bouton */}
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-white">
                    {activeTab === "mine" ? "Mes articles" : "Fil d'actualite"}
                    <span className="text-purple-300/50 text-lg ml-2">({filteredArticles.length})</span>
                  </h2>
                  {activeTab === "mine" && !showForm && (
                    <button
                      onClick={() => { setArticleToEdit(null); setShowForm(true) }}
                      className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition"
                    >
                      + Nouvel article
                    </button>
                  )}
                </div>

                {/* Formulaire */}
                {activeTab === "mine" && showForm && (
                  <div className="mb-8">
                    <ArticleForm
                      articleToEdit={articleToEdit}
                      onCreate={handleCreateArticle}
                      onUpdate={handleUpdateArticle}
                      onDone={handleFormDone}
                    />
                  </div>
                )}

                {/* Liste des articles */}
                {loading ? (
                  <p className="text-purple-200 text-center py-16">Chargement...</p>
                ) : displayedArticles.length === 0 ? (
                  <div className="text-center py-16">
                    <p className="text-purple-200/60 text-lg mb-2">
                      {searchQuery
                        ? "Aucun article ne correspond a votre recherche"
                        : activeTab === "mine"
                        ? "Vous n'avez pas encore d'articles"
                        : "Aucun article dans votre fil"}
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    {displayedArticles.map((article) => (
                      <ArticleCard
                        key={article._id || article.id}
                        article={article}
                        isOwner={activeTab === "mine"}
                        onEdit={handleEdit}
                        onDelete={handleDeleteArticle}
                        onReload={loadArticles}
                      />
                    ))}
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-3 mt-8">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 rounded-lg bg-white/10 text-purple-200 hover:bg-white/20 transition disabled:opacity-30"
                    >← Precedent</button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-10 h-10 rounded-lg font-medium transition ${
                          currentPage === page
                            ? "bg-purple-600 text-white"
                            : "bg-white/10 text-purple-200 hover:bg-white/20"
                        }`}
                      >{page}</button>
                    ))}
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 rounded-lg bg-white/10 text-purple-200 hover:bg-white/20 transition disabled:opacity-30"
                    >Suivant →</button>
                  </div>
                )}
              </div>
            )}

            {/* ═══════════════════════════════════
                PAGE : MES AMIS
            ═══════════════════════════════════ */}
            {activePage === "amis" && <FriendsList />}

            {/* ═══════════════════════════════════
                PAGE : MES ARTICLES
            ═══════════════════════════════════ */}
            {activePage === "articles" && (
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold text-white">
                    Mes articles
                    <span className="text-purple-300/50 text-lg ml-2">({myArticles.length})</span>
                  </h2>
                  <button
                    onClick={() => {
                      setArticleToEdit(null)
                      setShowForm(true)
                      setActivePage("dashboard")
                      setActiveTab("mine")
                    }}
                    className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition"
                  >
                    + Nouvel article
                  </button>
                </div>
                {myArticles.length === 0 ? (
                  <div className="text-center py-16">
                    <p className="text-purple-200/60">Vous n'avez pas encore d'articles</p>
                  </div>
                ) : (
                  myArticles.map((article) => (
                    <ArticleCard
                      key={article._id || article.id}
                      article={article}
                      isOwner={true}
                      onEdit={handleEdit}
                      onDelete={handleDeleteArticle}
                      onReload={loadArticles}
                    />
                  ))
                )}
              </div>
            )}

            {/* ═══════════════════════════════════
                PAGE : DEMANDES D'AMIS
            ═══════════════════════════════════ */}
            {activePage === "demandes" && <FriendRequests />}

            {/* ═══════════════════════════════════
                PAGE : MON PROFIL
            ═══════════════════════════════════ */}
            {activePage === "profil" && (
              <div className="max-w-2xl">
                <h2 className="text-2xl font-bold text-white mb-6">Mon profil</h2>

                {/* Photo de profil */}
                <div className="bg-white/5 rounded-xl p-6 border border-white/10 mb-6">
                  <h3 className="text-lg font-medium text-white mb-4">Photo de profil</h3>
                  <div className="flex items-center gap-6">
                    {currentUser.avatar ? (
                      <img
                        src={`http://localhost:5000/api/auth/avatar/${currentUser.avatar}`}
                        alt="Avatar"
                        className="w-20 h-20 rounded-full object-cover border-4 border-purple-500"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-purple-600 flex items-center justify-center text-2xl font-bold text-white">
                        {initiales}
                      </div>
                    )}
                    <div>
                      <label
                        htmlFor="avatar-upload"
                        className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition cursor-pointer inline-block"
                      >
                        Changer la photo
                      </label>
                      <input
                        id="avatar-upload"
                        type="file"
                        accept="image/png,image/jpg,image/jpeg,image/gif,image/webp"
                        className="hidden"
                        onChange={handleAvatarUpload}
                      />
                      <p className="text-purple-300/50 text-xs mt-2">PNG, JPG, GIF — Max 5 Mo</p>
                    </div>
                  </div>
                </div>

                {/* Informations */}
                <div className="bg-white/5 rounded-xl p-6 border border-white/10 mb-6">
                  <h3 className="text-lg font-medium text-white mb-4">Informations</h3>
                  <div className="flex flex-col gap-3">
                    <div>
                      <span className="text-purple-300/60 text-sm">Nom complet</span>
                      <p className="text-white">{currentUser.full_name}</p>
                    </div>
                    <div>
                      <span className="text-purple-300/60 text-sm">Nom d'utilisateur</span>
                      <p className="text-white">@{currentUser.username}</p>
                    </div>
                    <div>
                      <span className="text-purple-300/60 text-sm">Membre depuis</span>
                      <p className="text-white">
                        {currentUser.created_at
                          ? new Date(currentUser.created_at).toLocaleDateString("fr-FR", {
                              day: "numeric", month: "long", year: "numeric",
                            })
                          : "Inconnu"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Statistiques */}
                <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                  <h3 className="text-lg font-medium text-white mb-4">Statistiques</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-white">{myArticles.length}</p>
                      <p className="text-purple-300/60 text-xs">Articles</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-white">{feedArticles.length}</p>
                      <p className="text-purple-300/60 text-xs">Dans le fil</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-white">{demandes.length}</p>
                      <p className="text-purple-300/60 text-xs">Demandes</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

export default Dashboard
