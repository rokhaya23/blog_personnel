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
  const [myArticles, setMyArticles] = useState([])
  const [feedArticles, setFeedArticles] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [articleToEdit, setArticleToEdit] = useState(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const ARTICLES_PER_PAGE = 10

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
    if (hour < 18) return "Bon après-midi"
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
    if (!window.confirm("Supprimer cet article ?")) return
    try {
      await articlesAPI.delete(articleId)
      await loadArticles()
      showToast("Article supprimé avec succès !", "info")
    } catch (err) {
      console.error("Erreur lors de la suppression article :", err)
      showToast("Erreur lors de la suppression", "error")
    }
  }

  const handleEdit = (article) => {
    setArticleToEdit(article)
    setShowForm(true)
    setActivePage("articles")
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

  const handleNavClick = (pageId) => {
    setActivePage(pageId)
    setSearchQuery("")
    setCurrentPage(1)
    setSidebarOpen(false)
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

  // ═══ PALETTE BLEU / INDIGO ═══
  const bg = isDark ? "bg-slate-900" : "bg-[#f0f4f8]"
  const sidebarBg = isDark
    ? "bg-white/5 border-white/10"
    : "bg-white/90 border-slate-200/80 shadow-[0_18px_40px_rgba(15,23,42,0.08)] backdrop-blur-xl"
  const cardBg = isDark
    ? "bg-white/10 border-white/10"
    : "bg-white/92 border-slate-200/70 shadow-[0_16px_32px_rgba(15,23,42,0.06)]"
  const textPrimary = isDark ? "text-white" : "text-gray-800"
  const textSecondary = isDark ? "text-blue-300/60" : "text-slate-600"
  const textMuted = isDark ? "text-blue-300/40" : "text-slate-500"
  const inputBg = isDark
    ? "bg-white/10 border-white/20 text-white placeholder-white/40"
    : "bg-white border-slate-200 text-gray-800 placeholder:text-slate-400"
  const btnActive = isDark
    ? "bg-blue-700 text-white shadow-[0_14px_30px_rgba(37,99,235,0.28)] hover:bg-blue-600"
    : "bg-blue-700 text-white shadow-[0_14px_30px_rgba(37,99,235,0.18)] hover:bg-blue-800"
  const btnInactive = isDark
    ? "bg-white/10 text-blue-200 hover:bg-white/20"
    : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200/80 shadow-sm"
  const topBarBg = isDark
    ? "bg-white/5 border-white/10"
    : "bg-white/90 border-slate-200/80 shadow-[0_12px_28px_rgba(15,23,42,0.06)] backdrop-blur-xl"
  const primaryButton = isDark
    ? "bg-blue-700 hover:bg-blue-600 text-white shadow-[0_14px_30px_rgba(37,99,235,0.30)]"
    : "bg-blue-700 hover:bg-blue-800 text-white shadow-[0_12px_28px_rgba(37,99,235,0.18)]"
  const toggleButton = isDark
    ? "bg-white/10 hover:bg-white/20 text-blue-200"
    : "bg-slate-100 hover:bg-slate-200 text-slate-700"
  const brandGradient = isDark
    ? "from-blue-400 via-indigo-300 to-blue-500"
    : "from-blue-900 via-indigo-700 to-blue-600"

  return (
    <div className={`h-screen ${bg} flex flex-col overflow-hidden`}>

      {/* ═══ BARRE DU HAUT — DAILY POST ═══ */}
      <div className={`${topBarBg} border-b px-4 md:px-6 py-3 flex items-center justify-between`}>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className={`md:hidden ${textPrimary} text-2xl`}
        >
          {sidebarOpen ? "✕" : "☰"}
        </button>

        <div className="flex-1" />

        <div className="flex items-center gap-4">
          <button
            onClick={toggleTheme}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition ${toggleButton}`}
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
        <aside className={`
          ${sidebarBg} border-r flex flex-col p-3 gap-1
          fixed md:static inset-y-0 left-0 z-40 w-60
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
          mt-[57px] md:mt-0
        `}>

          {/* Avatar + nom */}
          <div
            className={`flex items-center gap-3 px-2 py-3 mb-2 border-b cursor-pointer hover:opacity-80 transition ${isDark ? "border-white/10" : "border-slate-200/80"}`}
            onClick={() => setActivePage("profil")}>
            {currentUser.avatar ? (
              <img
                src={`http://localhost:5000/api/auth/avatar/${currentUser.avatar}`}
                alt="Avatar"
                className="w-9 h-9 rounded-full object-cover border-2 border-blue-500 flex-shrink-0"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-sm font-medium text-white flex-shrink-0">
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
              ${activePage === item.id ? btnActive : isDark ? "text-blue-200 hover:bg-white/10" : "text-slate-700 hover:bg-slate-50"}`}
            >
              <span>{item.icon}</span>
              {item.label}
              {item.badge > 0 && (
                <span className="ml-auto px-2 py-0.5 text-xs bg-red-500 text-white rounded-full">{item.badge}</span>
              )}
            </button>
          ))}

          <div className={`mt-auto border-t pt-3 ${isDark ? "border-white/10" : "border-slate-200/80"}`}>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition w-full bg-red-500 text-white border border-red-600"
            >
              <span>🚪</span>
              Déconnexion
            </button>
          </div>
        </aside>

        {/* Overlay sombre (mobile) */}
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

            {/* ═══ PAGE : TABLEAU DE BORD (FIL D'ACTUALITÉ UNIQUEMENT) ═══ */}
            {activePage === "dashboard" && (
              <div>
                {/* Bienvenue */}
                <div className="mb-8">
                  <h1 className={`text-2xl md:text-3xl font-bold ${textPrimary} mb-2`}>
                    {getGreeting()}, {prenom} 👋
                  </h1>
                  <p className={textSecondary}>
                    Bienvenue sur Daily Post. Découvrez les derniers articles de vos amis.
                  </p>
                </div>


                {/* Recherche */}
                {feedArticles.length > 0 && (
                  <div className="mb-6">
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg">🔍</span>
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1) }}
                        className={`w-full pl-12 pr-4 py-3 rounded-lg border focus:outline-none focus:border-blue-400 transition ${inputBg}`}
                        placeholder="Rechercher par titre ou contenu..."
                      />
                      {searchQuery && (
                        <button
                          onClick={() => { setSearchQuery(""); setCurrentPage(1) }}
                          className={`absolute right-4 top-1/2 -translate-y-1/2 transition ${textMuted} ${isDark ? "hover:text-white" : "hover:text-slate-900"}`}
                        >
                          ✕
                        </button>
                      )}
                    </div>
                    {searchQuery && (
                      <p className={`${textMuted} text-sm mt-2`}>
                        {filterArticles(feedArticles).length} resultat{filterArticles(feedArticles).length !== 1 ? "s" : ""} pour "{searchQuery}"
                      </p>
                    )}
                  </div>
                )}

                {/* Titre fil d'actualité */}
                <h2 className={`text-2xl font-bold ${textPrimary} mb-6`}>
                  Fil d'actualité
                  <span className={`${textMuted} text-lg ml-2`}>({filterArticles(feedArticles).length})</span>
                </h2>

                {/* Articles du fil */}
                {loading ? (
                  <p className={`${textSecondary} text-center py-16`}>Chargement...</p>
                ) : paginateArticles(filterArticles(feedArticles)).length === 0 ? (
                  <div className="text-center py-16">
                    <p className={`${textSecondary} text-lg`}>
                      {searchQuery ? "Aucun article ne correspond" : "Aucun article dans votre fil"}
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    {paginateArticles(filterArticles(feedArticles)).map((article) => (
                      <ArticleCard key={article._id || article.id} article={article} isOwner={false} onReload={loadArticles} />
                    ))}
                  </div>
                )}

                {/* Pagination */}
                {Math.ceil(filterArticles(feedArticles).length / ARTICLES_PER_PAGE) > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-8 flex-wrap">
                    <button onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))} disabled={currentPage === 1} className={`px-4 py-2 rounded-lg transition disabled:opacity-30 ${btnInactive}`}>←</button>
                    {Array.from({ length: Math.ceil(filterArticles(feedArticles).length / ARTICLES_PER_PAGE) }, (_, i) => i + 1).map((page) => (
                      <button key={page} onClick={() => setCurrentPage(page)} className={`w-10 h-10 rounded-lg font-medium transition ${currentPage === page ? btnActive : btnInactive}`}>{page}</button>
                    ))}
                    <button onClick={() => setCurrentPage((p) => Math.min(p + 1, Math.ceil(filterArticles(feedArticles).length / ARTICLES_PER_PAGE)))} disabled={currentPage === Math.ceil(filterArticles(feedArticles).length / ARTICLES_PER_PAGE)} className={`px-4 py-2 rounded-lg transition disabled:opacity-30 ${btnInactive}`}>→</button>
                  </div>
                )}
              </div>
            )}

            {/* ═══ PAGE : MES AMIS ═══ */}
            {activePage === "amis" && <FriendsList />}

            {/* ═══ PAGE : MES ARTICLES ═══ */}
            {activePage === "articles" && (
              <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
                  <h2 className={`text-2xl font-bold ${textPrimary}`}>
                    Mes articles <span className={`${textMuted} text-lg ml-2`}>({myArticles.length})</span>
                  </h2>
                  {!showForm && (
                    <button onClick={() => { setArticleToEdit(null); setShowForm(true) }}
                      className={`px-5 py-2.5 font-semibold rounded-lg transition ${primaryButton}`}>+ Nouvel article</button>
                  )}
                </div>

                {showForm && (
                  <div className="mb-8">
                    <ArticleForm articleToEdit={articleToEdit} onCreate={handleCreateArticle} onUpdate={handleUpdateArticle} onDone={handleFormDone} />
                  </div>
                )}

                {myArticles.length === 0 && !showForm ? (
                  <div className="text-center py-16"><p className={textSecondary}>Vous n'avez pas encore d'articles</p></div>
                ) : (
                  myArticles.map((article) => (
                    <ArticleCard key={article._id || article.id} article={article} isOwner={true} onEdit={handleEdit} onDelete={handleDeleteArticle} onReload={loadArticles} />
                  ))
                )}
              </div>
            )}

            {/* ═══ PAGE : DEMANDES ═══ */}
            {activePage === "demandes" && <FriendRequests />}

            {/* ═══ PAGE : PROFIL ═══ */}
            {activePage === "profil" && (
              <div className="max-w-3xl">

                {/* Carte principale avec bannière */}
                <div className={`border rounded-2xl overflow-hidden mb-6 ${cardBg}`}>
                  <div className={`h-36 relative ${isDark
                    ? "bg-gradient-to-r from-blue-900 via-indigo-700 to-blue-900"
                    : "bg-gradient-to-r from-blue-900 via-indigo-600 to-blue-500"
                  }`}>
                    <div className="absolute top-4 right-8 w-16 h-16 rounded-full bg-white/5 border border-white/10"></div>
                    <div className="absolute top-8 right-20 w-8 h-8 rounded-full bg-white/5 border border-white/10"></div>
                    <div className="absolute bottom-4 left-1/3 w-12 h-12 rounded-full bg-white/5 border border-white/10"></div>
                  </div>

                  <div className="px-6 pb-6">
                    <div className="flex items-end justify-between -mt-12 mb-4">
                      <div className="relative">
                        {currentUser.avatar ? (
                          <img
                            src={`http://localhost:5000/api/auth/avatar/${currentUser.avatar}`}
                            alt="Avatar"
                            className={`w-24 h-24 rounded-full object-cover border-4 ${isDark ? "border-slate-900" : "border-white"}`}
                          />
                        ) : (
                          <div className={`w-24 h-24 rounded-full border-4 flex items-center justify-center text-3xl font-bold text-white
                            bg-gradient-to-br from-blue-500 to-indigo-700
                            ${isDark ? "border-slate-900" : "border-white"}`}>
                            {initiales}
                          </div>
                        )}
                        <label
                          htmlFor="avatar-upload"
                          className="absolute bottom-1 right-1 w-7 h-7 bg-blue-600 hover:bg-blue-500 rounded-full flex items-center justify-center cursor-pointer transition border-2 border-slate-900"
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

                      <div className="mb-2 flex flex-col items-end gap-2">
                        <span className="flex items-center gap-1.5 px-3 py-1 bg-green-500/15 border border-green-500/30 text-green-400 rounded-full text-xs">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block"></span>
                          En ligne
                        </span>
                      </div>
                    </div>

                    <h3 className={`text-2xl font-bold ${textPrimary}`}>{currentUser.full_name}</h3>
                    <p className={`text-sm mb-4 ${textSecondary}`}>@{currentUser.username}</p>

                    <div className={`flex gap-6 pt-4 border-t ${isDark ? "border-white/10" : "border-slate-200/70"}`}>

                    </div>
                  </div>
                </div>

                {/* Grille 2 colonnes */}
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
                            : "Date inconnue"
                        },
                      ].map(info => (
                        <div key={info.label} className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0
                            ${isDark ? "bg-blue-500/15 border border-blue-500/20" : "bg-blue-50 border border-blue-200"}`}>
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
                        { icon: "📝", label: "Articles publiés",    valeur: myArticles.length,   color: textPrimary,                                  bg: isDark ? "bg-blue-500/15 border-blue-500/20"     : "bg-blue-50 border-blue-200" },
                        { icon: "📰", label: "Articles dans le fil", valeur: feedArticles.length, color: textPrimary,                                  bg: isDark ? "bg-teal-500/15 border-teal-500/20"     : "bg-teal-50 border-teal-200" },
                        { icon: "🔔", label: "Demandes en attente",  valeur: demandes.length,     color: textPrimary,                                  bg: isDark ? "bg-indigo-500/15 border-indigo-500/20" : "bg-indigo-50 border-indigo-200" },
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

                {/* Changer la photo */}
                <div className={`border rounded-2xl p-6 ${cardBg}`}>
                  <h3 className={`text-xs font-semibold uppercase tracking-widest mb-5 ${textMuted}`}>
                    Photo de profil
                  </h3>
                  <div className="flex items-center gap-5">
                    {currentUser.avatar ? (
                      <img
                        src={`http://localhost:5000/api/auth/avatar/${currentUser.avatar}`}
                        alt="Avatar"
                        className="w-16 h-16 rounded-full object-cover border-2 border-blue-500"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-700 flex items-center justify-center text-xl font-bold text-white">
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
