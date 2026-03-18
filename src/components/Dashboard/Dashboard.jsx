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
    <div className="h-screen bg-slate-900 flex flex-col">

      {/* BARRE DU HAUT */}
      <div className="flex-shrink-0 bg-white/5 border-b border-white/10 px-6 py-4 flex items-center justify-end">
        <h1
          className="text-4xl font-black tracking-tight bg-gradient-to-r from-purple-400 via-violet-300 to-purple-500 bg-clip-text text-transparent"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Daily Post
        </h1>
      </div>

      {/* SIDEBAR + MAIN */}
      <div className="flex flex-1 overflow-hidden">

        {/* SIDEBAR — flex-shrink-0 = ne rétrécit jamais, overflow-y-auto = scroll interne si besoin */}
        <aside className="w-60 flex-shrink-0 bg-white/5 border-r border-white/10 flex flex-col p-3 gap-1 overflow-y-auto">

          <div
            className="flex items-center gap-3 px-2 py-3 mb-2 border-b border-white/10 cursor-pointer hover:bg-white/5 rounded-lg transition"
            onClick={() => setActivePage("profil")}
          >      
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

          <div className="text-xs text-purple-300/40 px-2 py-1 mt-1">NAVIGATION</div>

          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                if (item.id === "admin") { navigate("/admin"); return }
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

        {/* MAIN — flex-1 + overflow-hidden pour que seul le contenu scrolle */}
        <main className="flex-1 flex flex-col overflow-hidden">

          <div className="flex-shrink-0 bg-white/5 border-b border-white/10 px-6 py-3">
            <FriendSearch />
          </div>

          {/* SEUL CET ÉLÉMENT SCROLLE */}
          <div className="flex-1 overflow-y-auto p-6">

            {/* PAGE : TABLEAU DE BORD */}
            {activePage === "dashboard" && (
              <div>
                <div className="mb-8">
                  <h1 className="text-3xl font-bold text-white mb-2">
                    {getGreeting()}, {prenom} 👋
                  </h1>
                  <p className="text-purple-300/60">
                    Bienvenue sur Daily Post. Découvrez les derniers articles de vos amis ou partagez vos idées.
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-8">
                  {[
                    { label: "Mes articles", valeur: myArticles.length, page: null, icon: "📝" },
                    { label: "Fil d'actualité", valeur: feedArticles.length, page: null, icon: "📰" },
                    { label: "Demandes reçues", valeur: demandes.length, violet: true, page: "demandes", icon: "🔔" },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      onClick={() => stat.page && setActivePage(stat.page)}
                      className={`bg-white/5 rounded-xl p-5 border border-white/10 ${stat.page ? "cursor-pointer hover:bg-white/10 transition" : ""}`}
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

                <div className="flex gap-2 mb-6">
                  {[
                    { id: "mine", label: "Mes articles" },
                    { id: "feed", label: `Fil d'actualité (${feedArticles.length})` },
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
                        {filteredArticles.length} résultat{filteredArticles.length !== 1 ? "s" : ""} pour "{searchQuery}"
                      </p>
                    )}
                  </div>
                )}

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

                {loading ? (
                  <p className="text-purple-200 text-center py-16">Chargement...</p>
                ) : displayedArticles.length === 0 ? (
                  <div className="text-center py-16">
                    <p className="text-purple-200/60 text-lg">
                      {searchQuery ? "Aucun article ne correspond à votre recherche"
                        : activeTab === "mine" ? "Vous n'avez pas encore d'articles"
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

                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-3 mt-8">
                    <button onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))} disabled={currentPage === 1} className="px-4 py-2 rounded-lg bg-white/10 text-purple-200 hover:bg-white/20 transition disabled:opacity-30">← Précédent</button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button key={page} onClick={() => setCurrentPage(page)} className={`w-10 h-10 rounded-lg font-medium transition ${currentPage === page ? "bg-purple-600 text-white" : "bg-white/10 text-purple-200 hover:bg-white/20"}`}>{page}</button>
                    ))}
                    <button onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} className="px-4 py-2 rounded-lg bg-white/10 text-purple-200 hover:bg-white/20 transition disabled:opacity-30">Suivant →</button>
                  </div>
                )}
              </div>
            )}

            {activePage === "amis"     && <FriendsList />}
            {activePage === "demandes" && <FriendRequests />}

            {activePage === "articles" && (
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold text-white">
                    Mes articles <span className="text-purple-300/50 text-lg ml-2">({myArticles.length})</span>
                  </h2>
                  <button
                    onClick={() => { setArticleToEdit(null); setShowForm(true); setActivePage("dashboard"); setActiveTab("mine") }}
                    className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition"
                  >+ Nouvel article</button>
                </div>
                {myArticles.length === 0 ? (
                  <p className="text-purple-200/60 text-center py-16">Vous n'avez pas encore d'articles</p>
                ) : myArticles.map((article) => (
                  <ArticleCard key={article._id || article.id} article={article} isOwner={true} onEdit={handleEdit} onDelete={handleDeleteArticle} onReload={loadArticles} />
                ))}
              </div>
            )}

            {/* ════════════════════════════════
                PAGE : MON PROFIL — redesign
            ════════════════════════════════ */}
            {activePage === "profil" && (
              <div className="max-w-3xl">

                {/* ── Carte principale avec bannière ── */}
                <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden mb-6">
                  {/* Bannière avec motif */}
                  <div className="h-36 bg-gradient-to-r from-purple-900 via-violet-700 to-purple-900 relative">
                    {/* Cercles décoratifs */}
                    <div className="absolute top-4 right-8 w-16 h-16 rounded-full bg-white/5 border border-white/10"></div>
                    <div className="absolute top-8 right-20 w-8 h-8 rounded-full bg-white/5 border border-white/10"></div>
                    <div className="absolute bottom-4 left-1/3 w-12 h-12 rounded-full bg-white/5 border border-white/10"></div>
                  </div>

                  <div className="px-6 pb-6">
                    <div className="flex items-end justify-between -mt-12 mb-4">
                      {/* Avatar cliquable pour changer */}
                      <div className="relative">
                        {currentUser.avatar ? (
                          <img
                            src={`http://localhost:5000/api/auth/avatar/${currentUser.avatar}`}
                            alt="Avatar"
                            className="w-24 h-24 rounded-full object-cover border-4 border-slate-900"
                          />
                        ) : (
                          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-violet-700 border-4 border-slate-900 flex items-center justify-center text-3xl font-bold text-white">
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
                        <input id="avatar-upload" type="file" accept="image/png,image/jpg,image/jpeg,image/gif,image/webp" className="hidden" onChange={handleAvatarUpload}/>
                      </div>

                      {/* Badge en ligne */}
                      <div className="mb-2 flex flex-col items-end gap-2">
                        <span className="flex items-center gap-1.5 px-3 py-1 bg-green-500/15 border border-green-500/30 text-green-400 rounded-full text-xs">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block"></span>
                          En ligne
                        </span>
                        {currentUser.is_admin && (
                          <span className="px-3 py-1 bg-purple-500/20 border border-purple-500/30 text-purple-300 rounded-full text-xs">
                            ⭐ Admin
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Nom + username */}
                    <h3 className="text-2xl font-bold text-white">{currentUser.full_name}</h3>
                    <p className="text-purple-300/60 text-sm mb-4">@{currentUser.username}</p>

                    {/* Mini stats inline */}
                    <div className="flex gap-6 pt-4 border-t border-white/10">
                      <div>
                        <span className="text-xl font-bold text-white">{myArticles.length}</span>
                        <span className="text-purple-300/50 text-sm ml-1">articles</span>
                      </div>
                      <div>
                        <span className="text-xl font-bold text-white">{feedArticles.length}</span>
                        <span className="text-purple-300/50 text-sm ml-1">dans le fil</span>
                      </div>
                      <div>
                        <span className="text-xl font-bold text-purple-400">{demandes.length}</span>
                        <span className="text-purple-300/50 text-sm ml-1">demandes</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── Grille 2 colonnes ── */}
                <div className="grid grid-cols-2 gap-6 mb-6">

                  {/* Informations */}
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <h3 className="text-xs font-semibold text-purple-300/50 uppercase tracking-widest mb-5">
                      Informations
                    </h3>
                    <div className="flex flex-col gap-5">
                      {[
                        { icon: "👤", label: "Nom complet",        valeur: currentUser.full_name },
                        { icon: "🔖", label: "Nom d'utilisateur",  valeur: `@${currentUser.username}` },
                        { icon: "📅", label: "Membre depuis",       valeur: currentUser.created_at
                            ? new Date(currentUser.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
                            : "Inconnu"
                        },
                      ].map(info => (
                        <div key={info.label} className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-purple-500/15 border border-purple-500/20 flex items-center justify-center text-base flex-shrink-0">
                            {info.icon}
                          </div>
                          <div>
                            <p className="text-xs text-purple-300/40">{info.label}</p>
                            <p className="text-sm font-medium text-white">{info.valeur}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Statistiques */}
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <h3 className="text-xs font-semibold text-purple-300/50 uppercase tracking-widest mb-5">
                      Statistiques
                    </h3>
                    <div className="flex flex-col gap-4">
                      {[
                        { icon: "📝", label: "Articles publiés",    valeur: myArticles.length,    color: "text-white",        bg: "bg-blue-500/15",   border: "border-blue-500/20" },
                        { icon: "📰", label: "Articles dans le fil", valeur: feedArticles.length,  color: "text-white",        bg: "bg-teal-500/15",   border: "border-teal-500/20" },
                        { icon: "🔔", label: "Demandes en attente",  valeur: demandes.length,      color: "text-purple-400",   bg: "bg-purple-500/15", border: "border-purple-500/20" },
                      ].map(s => (
                        <div key={s.label} className="flex items-center justify-between p-3 bg-white/3 rounded-xl border border-white/5">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-xl ${s.bg} border ${s.border} flex items-center justify-center text-base flex-shrink-0`}>
                              {s.icon}
                            </div>
                            <p className="text-sm text-purple-200/70">{s.label}</p>
                          </div>
                          <span className={`text-2xl font-bold ${s.color}`}>{s.valeur}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* ── Changer la photo ── */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                  <h3 className="text-xs font-semibold text-purple-300/50 uppercase tracking-widest mb-5">
                    Photo de profil
                  </h3>
                  <div className="flex items-center gap-5">
                    {currentUser.avatar ? (
                      <img src={`http://localhost:5000/api/auth/avatar/${currentUser.avatar}`} alt="Avatar" className="w-16 h-16 rounded-full object-cover border-2 border-purple-500"/>
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-violet-700 flex items-center justify-center text-xl font-bold text-white">{initiales}</div>
                    )}
                    <div>
                      <p className="text-sm text-white font-medium mb-2">Mettre à jour votre photo</p>
                      <label htmlFor="avatar-upload-2" className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition cursor-pointer inline-block">
                        Choisir une photo
                      </label>
                      <input id="avatar-upload-2" type="file" accept="image/png,image/jpg,image/jpeg,image/gif,image/webp" className="hidden" onChange={handleAvatarUpload}/>
                      <p className="text-purple-300/40 text-xs mt-2">PNG, JPG, GIF — Max 5 Mo</p>
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
