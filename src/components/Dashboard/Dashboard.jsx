import { useState, useEffect } from "react"
import { useAuth }             from "../../context/AuthContext"
import { useNavigate }         from "react-router-dom"
import { articlesAPI }         from "../../services/api"
import { useToast }            from "../Layout/Toast"
import ArticleCard             from "../Articles/ArticleCard"
import ArticleForm             from "../Articles/ArticleForm"
import FriendSearch            from "../Friends/FriendSearch"
import FriendsList             from "../Friends/FriendsList"
import FriendRequests          from "../Friends/FriendRequests"

function Dashboard() {
  const { currentUser, logout } = useAuth()
  const navigate                = useNavigate()
  const { showToast }           = useToast()

  // ── Pages et onglets ──
  const [activePage, setActivePage] = useState("dashboard")
  const [activeTab,  setActiveTab]  = useState("mine")

  // ── Articles ──
  const [myArticles,   setMyArticles]   = useState([])
  const [feedArticles, setFeedArticles] = useState([])
  const [showForm,     setShowForm]     = useState(false)
  const [articleToEdit,setArticleToEdit]= useState(null)
  const [loading,      setLoading]      = useState(true)

  // ── Recherche et pagination ──
  const [searchQuery,  setSearchQuery]  = useState("")
  const [currentPage,  setCurrentPage]  = useState(1)
  const ARTICLES_PER_PAGE = 10

  // Initiales pour l'avatar (ex: "Rokhaya Diallo" → "RD")
  const initiales = currentUser?.full_name
    ?.split(" ")
    .map(n => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "?"

  const navItems = [
    { id: "dashboard", label: "Tableau de bord", icon: "🏠" },
    { id: "amis",      label: "Mes amis",        icon: "👥" },
    { id: "articles",  label: "Mes articles",    icon: "✍️" },
    { id: "demandes",  label: "Demandes",        icon: "🔔" },
  ]

  // ════════════════════════════════
  // CHARGER LES ARTICLES
  // ════════════════════════════════
  const loadArticles = async () => {
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
  }

  useEffect(() => {
    const fetchArticles = async () => { await loadArticles() }
    fetchArticles()
  }, [])

  // ════════════════════════════════
  // DÉCONNEXION
  // ════════════════════════════════
  const handleLogout = async () => {
    await logout()
    navigate("/login")
  }

  // ════════════════════════════════
  // CRUD ARTICLES
  // ════════════════════════════════
  const handleCreateArticle = async (data) => {
    try {
      await articlesAPI.create(data)
      await loadArticles()
      setShowForm(false)
      showToast("Article publié avec succès !", "success")
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
      showToast("Article modifié avec succès !", "success")
    } catch (err) {
      return { success: false, message: err.response?.data?.message || "Erreur" }
    }
    return { success: true }
  }

  const handleDeleteArticle = async (articleId) => {
    try {
      await articlesAPI.delete(articleId)
      await loadArticles()
      showToast("Article supprimé", "info")
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

  // ════════════════════════════════
  // RECHERCHE + PAGINATION
  // ════════════════════════════════
  const filterArticles = (articles) => {
    if (!searchQuery.trim()) return articles
    const query = searchQuery.toLowerCase()
    return articles.filter(
      a => a.title.toLowerCase().includes(query) ||
           a.content.toLowerCase().includes(query)
    )
  }

  const paginateArticles = (articles) => {
    const start = (currentPage - 1) * ARTICLES_PER_PAGE
    return articles.slice(start, start + ARTICLES_PER_PAGE)
  }

  const currentArticles  = activeTab === "mine" ? myArticles : feedArticles
  const filteredArticles = filterArticles(currentArticles)
  const totalPages       = Math.ceil(filteredArticles.length / ARTICLES_PER_PAGE)
  const displayedArticles= paginateArticles(filteredArticles)

  const handleTabChange = (tab) => {
    setActiveTab(tab)
    setCurrentPage(1)
    setSearchQuery("")
  }

  // ════════════════════════════════
  // RENDU
  // ════════════════════════════════
  return (
    <div className="min-h-screen flex bg-slate-900">

      {/* ── SIDEBAR ── */}
      <aside className="w-60 flex-shrink-0 bg-white/5 border-r border-white/10 flex flex-col p-3 gap-1">

        {/* Avatar + nom */}
        <div className="flex items-center gap-3 px-2 py-3 mb-2 border-b border-white/10">
          <div className="w-9 h-9 rounded-full bg-purple-600 flex items-center justify-center text-sm font-medium text-white flex-shrink-0">
            {initiales}
          </div>
          <div>
            <div className="text-sm font-medium text-white">
              {currentUser?.full_name}
            </div>
            <div className="flex items-center gap-1 text-xs text-purple-300/60">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block"></span>
              En ligne
            </div>
          </div>
        </div>

        <div className="text-xs text-purple-300/40 px-2 py-1 mt-1">NAVIGATION</div>

        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => setActivePage(item.id)}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition w-full text-left
              ${activePage === item.id
                ? "bg-purple-600 text-white"
                : "text-purple-200 hover:bg-white/10"
              }`}
          >
            <span>{item.icon}</span>
            {item.label}
          </button>
        ))}

        <div className="mt-auto border-t border-white/10 pt-3">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition w-full"
          >
            <span>🚪</span>
            Déconnexion
          </button>
        </div>
      </aside>

      {/* ── CONTENU PRINCIPAL ── */}
      <main className="flex-1 flex flex-col overflow-hidden">

        {/* Barre du haut avec recherche amis */}
        <div className="bg-white/5 border-b border-white/10 px-6 py-3 flex items-center gap-3">
          <FriendSearch />
        </div>

        <div className="flex-1 overflow-auto p-6">

          {/* ── Page : Tableau de bord ── */}
          {activePage === "dashboard" && (
            <div>
              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                {[
                  { label: "Mes articles",    valeur: myArticles.length    },
                  { label: "Fil d'actualité", valeur: feedArticles.length  },
                  { label: "Demandes reçues", valeur: 0, violet: true      },
                ].map(stat => (
                  <div key={stat.label} className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <div className="text-xs text-purple-300/60 mb-2">{stat.label}</div>
                    <div className={`text-3xl font-bold ${stat.violet ? "text-purple-400" : "text-white"}`}>
                      {stat.valeur}
                    </div>
                  </div>
                ))}
              </div>

              {/* Onglets */}
              <div className="flex gap-2 mb-6">
                {[
                  { id: "mine", label: "Mes articles" },
                  { id: "feed", label: `Fil d'actualité (${feedArticles.length})` },
                ].map(tab => (
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

              {/* Barre de recherche */}
              {currentArticles.length > 0 && (
                <div className="mb-6">
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-300/50">🔍</span>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1) }}
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
                      {filteredArticles.length} résultat{filteredArticles.length !== 1 ? "s" : ""} pour "{searchQuery}"
                    </p>
                  )}
                </div>
              )}

              {/* En-tête + bouton nouvel article */}
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">
                  {activeTab === "mine" ? "Mes articles" : "Fil d'actualité"}
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
                      ? "Aucun article ne correspond à votre recherche"
                      : activeTab === "mine"
                      ? "Vous n'avez pas encore d'articles"
                      : "Aucun article dans votre fil"}
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {displayedArticles.map(article => (
                    <ArticleCard
                      key={article._id || article.id}
                      article={article}
                      isOwner={activeTab === "mine"}
                      onEdit={handleEdit}
                      onDelete={handleDeleteArticle}
                    />
                  ))}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-3 mt-8">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 rounded-lg bg-white/10 text-purple-200 hover:bg-white/20 transition disabled:opacity-30"
                  >← Précédent</button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
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
                    onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 rounded-lg bg-white/10 text-purple-200 hover:bg-white/20 transition disabled:opacity-30"
                  >Suivant →</button>
                </div>
              )}
            </div>
          )}

          {/* ── Page : Mes amis ── */}
          {activePage === "amis"     && <FriendsList />}

          {/* ── Page : Mes articles ── */}
          {activePage === "articles" && (
            <div className="flex flex-col gap-4">
              {myArticles.map(article => (
                <ArticleCard
                  key={article._id || article.id}
                  article={article}
                  isOwner={true}
                  onEdit={handleEdit}
                  onDelete={handleDeleteArticle}
                />
              ))}
            </div>
          )}

          {/* ── Page : Demandes reçues ── */}
          {activePage === "demandes" && <FriendRequests />}

        </div>
      </main>
    </div>
  )
}

export default Dashboard