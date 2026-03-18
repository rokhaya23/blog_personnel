import { useState, useEffect } from "react"
import { useAuth } from "../../context/AuthContext"
import { useTheme } from "../../context/ThemeContext"
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
  const { currentUser, logout } = useAuth()
  const { isDark, toggleTheme } = useTheme()
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

  // Sidebar mobile (ouverte/fermée)
  const [sidebarOpen, setSidebarOpen] = useState(false)

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
  ]

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

  useEffect(() => { loadArticles() }, [])

  const handleLogout = async () => { await logout(); navigate("/login") }

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
    } catch { showToast("Erreur lors de la suppression", "error") }
  }

  const handleEdit = (article) => {
    setArticleToEdit(article)
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleFormDone = () => { setShowForm(false); setArticleToEdit(null) }

  const filterArticles = (articles) => {
    if (!searchQuery.trim()) return articles
    const query = searchQuery.toLowerCase()
    return articles.filter(
      (a) => a.title.toLowerCase().includes(query) || a.content.toLowerCase().includes(query)
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

  const handleTabChange = (tab) => { setActiveTab(tab); setCurrentPage(1); setSearchQuery("") }

  const handleNavClick = (pageId) => {
    setActivePage(pageId)
    setSidebarOpen(false) // Fermer la sidebar mobile après navigation
  }

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { showToast("La photo ne doit pas depasser 5 Mo", "error"); return }
    const formData = new FormData()
    formData.append("avatar", file)
    try {
      await authAPI.updateProfile(formData)
      showToast("Photo de profil mise a jour !", "success")
      window.location.reload()
    } catch { showToast("Erreur lors du changement de photo", "error") }
  }

  // ═══ CLASSES DYNAMIQUES SELON LE THÈME ═══
  const bg = isDark ? "bg-slate-900" : "bg-gray-50"
  const sidebarBg = isDark ? "bg-white/5 border-white/10" : "bg-white border-gray-200"
  const cardBg = isDark ? "bg-white/10 border-white/10" : "bg-white border-gray-200 shadow-sm"
  const textPrimary = isDark ? "text-white" : "text-gray-900"
  const textSecondary = isDark ? "text-purple-300/60" : "text-gray-500"
  const textMuted = isDark ? "text-purple-300/40" : "text-gray-400"
  const inputBg = isDark
    ? "bg-white/10 border-white/20 text-white placeholder-white/40"
    : "bg-gray-100 border-gray-300 text-gray-900 placeholder-gray-400"
  const btnActive = "bg-purple-600 text-white"
  const btnInactive = isDark ? "bg-white/10 text-purple-200 hover:bg-white/20" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
  const hoverCard = isDark ? "hover:bg-white/10" : "hover:bg-gray-50"
  const topBarBg = isDark ? "bg-white/5 border-white/10" : "bg-white border-gray-200"

  return (
    <div className={`min-h-screen ${bg} flex flex-col`}>

      {/* ═══ BARRE DU HAUT — DAILY POST ═══ */}
      <div className={`${topBarBg} border-b px-4 md:px-6 py-3 flex items-center justify-between`}>
        {/* Bouton hamburger (mobile uniquement) */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className={`md:hidden ${textPrimary} text-2xl`}
        >
          {sidebarOpen ? "✕" : "☰"}
        </button>

        {/* Espace vide au centre */}
        <div className="flex-1" />

        {/* Titre + toggle thème */}
        <div className="flex items-center gap-4">
          {/* Toggle dark/light */}
          <button
            onClick={toggleTheme}
            className={`w-10 h-10 rounded-full flex items-center justify-center text-lg transition ${
              isDark ? "bg-white/10 hover:bg-white/20" : "bg-gray-100 hover:bg-gray-200"
            }`}
            title={isDark ? "Mode clair" : "Mode sombre"}
          >
            {isDark ? "☀️" : "🌙"}
          </button>

          <h1
            className="text-3xl md:text-4xl font-black tracking-tight bg-gradient-to-r from-purple-400 via-violet-300 to-purple-500 bg-clip-text text-transparent"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Daily Post
          </h1>
        </div>
      </div>

      {/* ═══ CONTENU (SIDEBAR + MAIN) ═══ */}
      <div className="flex flex-1 overflow-hidden">

        {/* ═══ SIDEBAR ═══ */}
        {/* Sur mobile : position absolue avec overlay */}
        {/* Sur desktop : toujours visible */}
        <aside className={`
          ${sidebarBg} border-r flex flex-col p-3 gap-1
          fixed md:static inset-y-0 left-0 z-40 w-60
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
          mt-[57px] md:mt-0
        `}>

          {/* Avatar + nom */}
          <div className={`flex items-center gap-3 px-2 py-3 mb-2 border-b ${isDark ? "border-white/10" : "border-gray-200"}`}>
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
              <div className={`text-sm font-medium ${textPrimary}`}>{currentUser?.full_name}</div>
              <div className="flex items-center gap-1 text-xs text-green-500">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block"></span>
                En ligne
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className={`text-xs ${textMuted} px-2 py-1 mt-1`}>NAVIGATION</div>

          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition w-full text-left
                ${activePage === item.id ? btnActive : isDark ? "text-purple-200 hover:bg-white/10" : "text-gray-700 hover:bg-gray-100"}`}
            >
              <span>{item.icon}</span>
              {item.label}
              {item.badge > 0 && (
                <span className="ml-auto px-2 py-0.5 text-xs bg-red-500 text-white rounded-full">{item.badge}</span>
              )}
            </button>
          ))}

          <div className={`mt-auto border-t pt-3 ${isDark ? "border-white/10" : "border-gray-200"}`}>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition w-full"
            >
              <span>🚪</span>
              Deconnexion
            </button>
          </div>
        </aside>

        {/* Overlay sombre (mobile — ferme la sidebar quand on clique) */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 md:hidden mt-[57px]"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* ═══ CONTENU PRINCIPAL ═══ */}
        <main className="flex-1 flex flex-col overflow-hidden">

          {/* Recherche d'amis */}
          <div className={`${topBarBg} border-b px-4 md:px-6 py-3`}>
            <FriendSearch />
          </div>

          <div className="flex-1 overflow-auto p-4 md:p-6">

            {/* ═══ PAGE : TABLEAU DE BORD ═══ */}
            {activePage === "dashboard" && (
              <div>
                {/* Bienvenue */}
                <div className="mb-8">
                  <h1 className={`text-2xl md:text-3xl font-bold ${textPrimary} mb-2`}>
                    {getGreeting()}, {prenom} 👋
                  </h1>
                  <p className={textSecondary}>
                    Bienvenue sur Daily Post. Decouvrez les derniers articles de vos amis ou partagez vos idees.
                  </p>
                </div>

                {/* Stats — 1 colonne sur mobile, 3 sur desktop */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                  {[
                    { label: "Mes articles", valeur: myArticles.length, page: null, icon: "📝" },
                    { label: "Fil d'actualite", valeur: feedArticles.length, page: null, icon: "📰" },
                    { label: "Demandes recues", valeur: demandes.length, violet: true, page: "demandes", icon: "🔔" },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      onClick={() => stat.page && handleNavClick(stat.page)}
                      className={`${cardBg} rounded-xl p-5 border ${stat.page ? `cursor-pointer ${hoverCard} transition` : ""}`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">{stat.icon}</span>
                        <span className={`text-xs ${textSecondary}`}>{stat.label}</span>
                      </div>
                      <div className={`text-3xl font-bold ${stat.violet ? "text-purple-400" : textPrimary}`}>
                        {stat.valeur}
                      </div>
                      {stat.page && stat.valeur > 0 && (
                        <p className="text-xs text-purple-400 mt-2">Cliquer pour voir →</p>
                      )}
                    </div>
                  ))}
                </div>

                {/* Onglets */}
                <div className="flex gap-2 mb-6 flex-wrap">
                  {[
                    { id: "mine", label: "Mes articles" },
                    { id: "feed", label: `Fil d'actualite (${feedArticles.length})` },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => handleTabChange(tab.id)}
                      className={`px-5 py-2.5 rounded-lg font-medium transition ${activeTab === tab.id ? btnActive : btnInactive}`}
                    >{tab.label}</button>
                  ))}
                </div>

                {/* Recherche */}
                {currentArticles.length > 0 && (
                  <div className="mb-6">
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg">🔍</span>
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1) }}
                        className={`w-full pl-12 pr-4 py-3 rounded-lg border focus:outline-none focus:border-purple-400 transition ${inputBg}`}
                        placeholder="Rechercher par titre ou contenu..."
                      />
                      {searchQuery && (
                        <button onClick={() => { setSearchQuery(""); setCurrentPage(1) }} className={`absolute right-4 top-1/2 -translate-y-1/2 ${textMuted} hover:${textPrimary}`}>✕</button>
                      )}
                    </div>
                    {searchQuery && (
                      <p className={`${textMuted} text-sm mt-2`}>
                        {filteredArticles.length} resultat{filteredArticles.length !== 1 ? "s" : ""} pour "{searchQuery}"
                      </p>
                    )}
                  </div>
                )}

                {/* En-tête + bouton */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
                  <h2 className={`text-2xl font-bold ${textPrimary}`}>
                    {activeTab === "mine" ? "Mes articles" : "Fil d'actualite"}
                    <span className={`${textMuted} text-lg ml-2`}>({filteredArticles.length})</span>
                  </h2>
                  {activeTab === "mine" && !showForm && (
                    <button
                      onClick={() => { setArticleToEdit(null); setShowForm(true) }}
                      className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition"
                    >+ Nouvel article</button>
                  )}
                </div>

                {/* Formulaire */}
                {activeTab === "mine" && showForm && (
                  <div className="mb-8">
                    <ArticleForm articleToEdit={articleToEdit} onCreate={handleCreateArticle} onUpdate={handleUpdateArticle} onDone={handleFormDone} />
                  </div>
                )}

                {/* Articles */}
                {loading ? (
                  <p className={`${textSecondary} text-center py-16`}>Chargement...</p>
                ) : displayedArticles.length === 0 ? (
                  <div className="text-center py-16">
                    <p className={`${textSecondary} text-lg`}>
                      {searchQuery ? "Aucun article ne correspond" : activeTab === "mine" ? "Vous n'avez pas encore d'articles" : "Aucun article dans votre fil"}
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    {displayedArticles.map((article) => (
                      <ArticleCard key={article._id || article.id} article={article} isOwner={activeTab === "mine"} onEdit={handleEdit} onDelete={handleDeleteArticle} onReload={loadArticles} />
                    ))}
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-8 flex-wrap">
                    <button onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))} disabled={currentPage === 1} className={`px-4 py-2 rounded-lg transition disabled:opacity-30 ${btnInactive}`}>←</button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button key={page} onClick={() => setCurrentPage(page)} className={`w-10 h-10 rounded-lg font-medium transition ${currentPage === page ? btnActive : btnInactive}`}>{page}</button>
                    ))}
                    <button onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} className={`px-4 py-2 rounded-lg transition disabled:opacity-30 ${btnInactive}`}>→</button>
                  </div>
                )}
              </div>
            )}

            {/* ═══ AUTRES PAGES ═══ */}
            {activePage === "amis" && <FriendsList />}

            {activePage === "articles" && (
              <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
                  <h2 className={`text-2xl font-bold ${textPrimary}`}>
                    Mes articles <span className={`${textMuted} text-lg ml-2`}>({myArticles.length})</span>
                  </h2>
                  <button onClick={() => { setArticleToEdit(null); setShowForm(true); setActivePage("dashboard"); setActiveTab("mine") }}
                    className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition">+ Nouvel article</button>
                </div>
                {myArticles.length === 0 ? (
                  <div className="text-center py-16"><p className={textSecondary}>Vous n'avez pas encore d'articles</p></div>
                ) : (
                  myArticles.map((article) => (
                    <ArticleCard key={article._id || article.id} article={article} isOwner={true} onEdit={handleEdit} onDelete={handleDeleteArticle} onReload={loadArticles} />
                  ))
                )}
              </div>
            )}

            {activePage === "demandes" && <FriendRequests />}

            {/* ═══ PAGE PROFIL ═══ */}
            {activePage === "profil" && (
              <div className="max-w-2xl">
                <h2 className={`text-2xl font-bold ${textPrimary} mb-6`}>Mon profil</h2>

                <div className={`${cardBg} rounded-xl p-6 border mb-6`}>
                  <h3 className={`text-lg font-medium ${textPrimary} mb-4`}>Photo de profil</h3>
                  <div className="flex items-center gap-6">
                    {currentUser.avatar ? (
                      <img src={`http://localhost:5000/api/auth/avatar/${currentUser.avatar}`} alt="Avatar" className="w-20 h-20 rounded-full object-cover border-4 border-purple-500" />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-purple-600 flex items-center justify-center text-2xl font-bold text-white">{initiales}</div>
                    )}
                    <div>
                      <label htmlFor="avatar-upload" className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition cursor-pointer inline-block">Changer la photo</label>
                      <input id="avatar-upload" type="file" accept="image/png,image/jpg,image/jpeg,image/gif,image/webp" className="hidden" onChange={handleAvatarUpload} />
                      <p className={`${textMuted} text-xs mt-2`}>PNG, JPG, GIF — Max 5 Mo</p>
                    </div>
                  </div>
                </div>

                <div className={`${cardBg} rounded-xl p-6 border mb-6`}>
                  <h3 className={`text-lg font-medium ${textPrimary} mb-4`}>Informations</h3>
                  <div className="flex flex-col gap-3">
                    <div><span className={`${textSecondary} text-sm`}>Nom complet</span><p className={textPrimary}>{currentUser.full_name}</p></div>
                    <div><span className={`${textSecondary} text-sm`}>Nom d'utilisateur</span><p className={textPrimary}>@{currentUser.username}</p></div>
                    <div><span className={`${textSecondary} text-sm`}>Membre depuis</span><p className={textPrimary}>{currentUser.created_at ? new Date(currentUser.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }) : "Inconnu"}</p></div>
                  </div>
                </div>

                <div className={`${cardBg} rounded-xl p-6 border`}>
                  <h3 className={`text-lg font-medium ${textPrimary} mb-4`}>Statistiques</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center"><p className={`text-2xl font-bold ${textPrimary}`}>{myArticles.length}</p><p className={`${textSecondary} text-xs`}>Articles</p></div>
                    <div className="text-center"><p className={`text-2xl font-bold ${textPrimary}`}>{feedArticles.length}</p><p className={`${textSecondary} text-xs`}>Dans le fil</p></div>
                    <div className="text-center"><p className={`text-2xl font-bold ${textPrimary}`}>{demandes.length}</p><p className={`${textSecondary} text-xs`}>Demandes</p></div>
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