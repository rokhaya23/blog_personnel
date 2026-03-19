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
  const { currentUser, logout, refreshCurrentUser } = useAuth()
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
      await refreshCurrentUser()
      showToast("Photo de profil mise a jour !", "success")
    } catch { showToast("Erreur lors du changement de photo", "error") }
  }

// ═══ CLASSES DYNAMIQUES SELON LE THÈME ═══
  const bg = isDark ? "bg-slate-900" : "bg-[#f6f2fb]"
  const sidebarBg = isDark
    ? "bg-white/5 border-white/10"
    : "bg-white/90 border-violet-200/80 shadow-[0_18px_40px_rgba(76,29,149,0.08)] backdrop-blur-xl"
  const cardBg = isDark
    ? "bg-white/10 border-white/10"
    : "bg-white/92 border-violet-200/70 shadow-[0_16px_32px_rgba(76,29,149,0.08)]"
  const textPrimary = isDark ? "text-white" : "text-gray-800"
  const textSecondary = isDark ? "text-purple-300/60" : "text-violet-900/70"
  const textMuted = isDark ? "text-purple-300/40" : "text-violet-800/55"
  const inputBg = isDark
    ? "bg-white/10 border-white/20 text-white placeholder-white/40"
    : "bg-white border-violet-200 text-gray-800 placeholder:text-violet-500/55"
  const btnActive = isDark
    ? "bg-violet-600 text-white shadow-[0_14px_30px_rgba(46,16,101,0.35)] hover:bg-violet-500"
    : "bg-violet-700 text-white shadow-[0_14px_30px_rgba(76,29,149,0.16)] hover:bg-violet-800"
  const btnInactive = isDark
    ? "bg-white/10 text-purple-200 hover:bg-white/20"
    : "bg-white text-violet-900 hover:bg-violet-50 border border-violet-200/80 shadow-sm"
  const hoverCard = isDark ? "hover:bg-white/10" : "hover:bg-violet-50/70"
  const topBarBg = isDark
    ? "bg-white/5 border-white/10"
    : "bg-white/90 border-violet-200/80 shadow-[0_12px_28px_rgba(76,29,149,0.08)] backdrop-blur-xl"
  const statCardBg = isDark
    ? "bg-white/5 border-white/10"
    : "bg-gradient-to-br from-white via-violet-50/80 to-fuchsia-50/50 border-violet-200/80 shadow-[0_12px_30px_rgba(76,29,149,0.08)]"
  const primaryButton = isDark
    ? "bg-violet-600 hover:bg-violet-500 text-white shadow-[0_14px_30px_rgba(46,16,101,0.30)]"
    : "bg-violet-700 hover:bg-violet-800 text-white shadow-[0_12px_28px_rgba(76,29,149,0.14)]"
  const toggleButton = isDark
    ? "bg-white/10 hover:bg-white/20 text-purple-200"
    : "bg-violet-100 hover:bg-violet-200 text-violet-900"
  const brandGradient = isDark
    ? "from-purple-400 via-violet-300 to-purple-500"
    : "from-violet-900 via-fuchsia-700 to-violet-600"

  return (
    <div className={`h-screen ${bg} flex flex-col overflow-hidden`}>

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
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition ${
              toggleButton
            }`}
          >
            {isDark ? "☀️ Mode clair" : "🌙 Mode sombre"}
          </button>


          <h1
            className={`text-3xl md:text-4xl font-black tracking-tight bg-gradient-to-r ${brandGradient} bg-clip-text text-transparent`}
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
            <div
              className={`flex items-center gap-3 px-2 py-3 mb-2 border-b cursor-pointer hover:opacity-80 transition ${isDark ? "border-white/10" : "border-violet-200/80"}`}
              onClick={() => setActivePage("profil")}>
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
              ${activePage === item.id ? btnActive : isDark ? "text-purple-200 hover:bg-white/10" : "text-violet-900 hover:bg-violet-50/70"}`}
                >
              <span>{item.icon}</span>
              {item.label}
              {item.badge > 0 && (
                <span className="ml-auto px-2 py-0.5 text-xs bg-red-500 text-white rounded-full">{item.badge}</span>
              )}
            </button>
          ))}

          <div className={`mt-auto border-t pt-3 ${isDark ? "border-white/10" : "border-violet-200/80"}`}>
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
                      className={`${statCardBg} rounded-xl p-5 border ${stat.page ? `cursor-pointer ${hoverCard} transition` : ""}`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">{stat.icon}</span>
                        <span className={`text-xs ${textSecondary}`}>{stat.label}</span>
                      </div>
                      <div className={`text-3xl font-bold ${stat.violet ? (isDark ? "text-purple-400" : "text-violet-700") : textPrimary}`}>
                        {stat.valeur}
                      </div>
                      {stat.page && stat.valeur > 0 && (
                        <p className={`text-xs mt-2 ${isDark ? "text-purple-400" : "text-violet-700/70"}`}>Cliquer pour voir →</p>
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
                        <button
                          onClick={() => { setSearchQuery(""); setCurrentPage(1) }}
                          className={`absolute right-4 top-1/2 -translate-y-1/2 transition ${textMuted} ${isDark ? "hover:text-white" : "hover:text-violet-900"}`}
                        >
                          ✕
                        </button>
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
                      className={`px-5 py-2.5 font-semibold rounded-lg transition ${primaryButton}`}
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
                    className={`px-5 py-2.5 font-semibold rounded-lg transition ${primaryButton}`}>+ Nouvel article</button>
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
            <div className="max-w-3xl">

              {/* ── Carte principale avec bannière ── */}
              <div className={`border rounded-2xl overflow-hidden mb-6 ${cardBg}`}>
                {/* Bannière */}
                <div className={`h-36 relative ${isDark
                  ? "bg-gradient-to-r from-purple-900 via-violet-700 to-purple-900"
                  : "bg-gradient-to-r from-violet-900 via-fuchsia-700 to-rose-400"
                }`}>
                  <div className="absolute top-4 right-8 w-16 h-16 rounded-full bg-white/5 border border-white/10"></div>
                  <div className="absolute top-8 right-20 w-8 h-8 rounded-full bg-white/5 border border-white/10"></div>
                  <div className="absolute bottom-4 left-1/3 w-12 h-12 rounded-full bg-white/5 border border-white/10"></div>
                </div>

                <div className="px-6 pb-6">
                  <div className="flex items-end justify-between -mt-12 mb-4">
                    {/* Avatar avec bouton changer photo */}
                    <div className="relative">
                      {currentUser.avatar ? (
                        <img
                          src={`http://localhost:5000/api/auth/avatar/${currentUser.avatar}`}
                          alt="Avatar"
                          className={`w-24 h-24 rounded-full object-cover border-4 ${isDark ? "border-slate-900" : "border-white"}`}
                        />
                      ) : (
                        <div className={`w-24 h-24 rounded-full border-4 flex items-center justify-center text-3xl font-bold text-white
                          bg-gradient-to-br from-purple-500 to-violet-700
                          ${isDark ? "border-slate-900" : "border-white"}`}>
                          {initiales}
                        </div>
                      )}
                      <label
                        htmlFor="avatar-upload"
                        className="absolute bottom-1 right-1 w-7 h-7 bg-purple-600 hover:bg-purple-500 rounded-full flex items-center justify-center cursor-pointer transition border-2 border-slate-900"
                        title="Changer la photo"
                      >
                        <span style={{ fontSize: "11px" }}>📷</span>
                      </label>
                      <input
                        id="avatar-upload"
                        type="file"
                        accept="image/png,image/jpg,image/jpeg,image/gif,image/webp"
                        className="hidden"
                        onChange={handleAvatarUpload}
                      />
                    </div>

                    {/* Badges */}
                    <div className="mb-2 flex flex-col items-end gap-2">
                      <span className="flex items-center gap-1.5 px-3 py-1 bg-green-500/15 border border-green-500/30 text-green-400 rounded-full text-xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block"></span>
                        En ligne
                      </span>
                    </div>
                  </div>

                  {/* Nom + username */}
                  <h3 className={`text-2xl font-bold ${textPrimary}`}>{currentUser.full_name}</h3>
                  <p className={`text-sm mb-4 ${textSecondary}`}>@{currentUser.username}</p>

                  {/* Mini stats */}
                  <div className={`flex gap-6 pt-4 border-t ${isDark ? "border-white/10" : "border-violet-200/70"}`}>
                    <div>
                      <span className={`text-xl font-bold ${textPrimary}`}>{myArticles.length}</span>
                      <span className={`text-sm ml-1 ${textSecondary}`}>articles</span>
                    </div>
                    <div>
                      <span className={`text-xl font-bold ${textPrimary}`}>{feedArticles.length}</span>
                      <span className={`text-sm ml-1 ${textSecondary}`}>dans le fil</span>
                    </div>
                    <div>
                      <span className={`text-xl font-bold ${isDark ? "text-purple-400" : "text-violet-700"}`}>{demandes.length}</span>
                      <span className={`text-sm ml-1 ${textSecondary}`}>demandes</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Grille 2 colonnes ── */}
              <div className="grid grid-cols-2 gap-6 mb-6">

                {/* Informations */}
                <div className={`border rounded-2xl p-6 ${cardBg}`}>
                  <h3 className={`text-xs font-semibold uppercase tracking-widest mb-5 ${textMuted}`}>
                    Informations
                  </h3>
                  <div className="flex flex-col gap-5">
                    {[
                      { icon: "👤", label: "Nom complet",       valeur: currentUser.full_name },
                      { icon: "🔖", label: "Nom d'utilisateur", valeur: `@${currentUser.username}` },
                      { icon: "📅", label: "Membre depuis",      valeur: currentUser.created_at
                          ? new Date(currentUser.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
                          : "Inconnu"
                      },
                    ].map(info => (
                      <div key={info.label} className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0
                          ${isDark ? "bg-purple-500/15 border border-purple-500/20" : "bg-violet-100 border border-violet-200"}`}>
                          {info.icon}
                        </div>
                        <div>
                          <p className={`text-xs ${textMuted}`}>{info.label}</p>
                          <p className={`text-sm font-medium ${textPrimary}`}>{info.valeur}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Statistiques */}
                <div className={`border rounded-2xl p-6 ${cardBg}`}>
                  <h3 className={`text-xs font-semibold uppercase tracking-widest mb-5 ${textMuted}`}>
                    Statistiques
                  </h3>
                  <div className="flex flex-col gap-4">
                    {[
                      { icon: "📝", label: "Articles publiés",    valeur: myArticles.length,   color: textPrimary,                                    bg: isDark ? "bg-blue-500/15 border-blue-500/20"   : "bg-blue-50 border-blue-200" },
                      { icon: "📰", label: "Articles dans le fil", valeur: feedArticles.length, color: textPrimary,                                    bg: isDark ? "bg-teal-500/15 border-teal-500/20"   : "bg-teal-50 border-teal-200" },
                      { icon: "🔔", label: "Demandes en attente",  valeur: demandes.length,     color: isDark ? "text-purple-400" : "text-violet-700", bg: isDark ? "bg-purple-500/15 border-purple-500/20" : "bg-violet-100 border-violet-200" },
                    ].map(s => (
                      <div key={s.label} className={`flex items-center justify-between p-3 rounded-xl border ${s.bg}`}>
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0 ${s.bg}`}>
                            {s.icon}
                          </div>
                          <p className={`text-sm ${textSecondary}`}>{s.label}</p>
                        </div>
                        <span className={`text-2xl font-bold ${s.color}`}>{s.valeur}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* ── Changer la photo ── */}
              <div className={`border rounded-2xl p-6 ${cardBg}`}>
                <h3 className={`text-xs font-semibold uppercase tracking-widest mb-5 ${textMuted}`}>
                  Photo de profil
                </h3>
                <div className="flex items-center gap-5">
                  {currentUser.avatar ? (
                    <img
                      src={`http://localhost:5000/api/auth/avatar/${currentUser.avatar}`}
                      alt="Avatar"
                      className="w-16 h-16 rounded-full object-cover border-2 border-purple-500"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-violet-700 flex items-center justify-center text-xl font-bold text-white">
                      {initiales}
                    </div>
                  )}
                  <div>
                    <p className={`text-sm font-medium mb-2 ${textPrimary}`}>Mettre à jour votre photo</p>
                    <label
                      htmlFor="avatar-upload-2"
                      className={`px-4 py-2 text-sm font-medium rounded-lg transition cursor-pointer inline-block ${primaryButton}`}
                    >
                      Choisir une photo
                    </label>
                    <input
                      id="avatar-upload-2"
                      type="file"
                      accept="image/png,image/jpg,image/jpeg,image/gif,image/webp"
                      className="hidden"
                      onChange={handleAvatarUpload}
                    />
                    <p className={`text-xs mt-2 ${textMuted}`}>PNG, JPG, GIF — Max 5 Mo</p>
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
