// ============================================================
// Dashboard.jsx — VERSION AMÉLIORÉE
//
// Améliorations ajoutées :
// 1. RECHERCHE : barre de recherche qui filtre les articles
//    par titre ou contenu en temps réel
// 2. PAGINATION : affiche 10 articles par page avec navigation
//
// Note : Ce dashboard est temporaire. Rokhaye le remplacera
// par sa version avec la gestion des amis intégrée.
// Les fonctions handleCreateArticle, handleUpdateArticle,
// handleDeleteArticle et la logique de recherche/pagination
// seront réutilisées dans sa version.
// ============================================================

import { useState, useEffect } from "react"
import { useAuth } from "../../context/AuthContext"
import { useNavigate } from "react-router-dom"
import { articlesAPI } from "../../services/api"
import ArticleCard from "../Articles/ArticleCard"
import ArticleForm from "../Articles/ArticleForm"
import { useToast } from "../Layout/Toast"

function Dashboard() {
  const { currentUser, logout } = useAuth()
  const navigate = useNavigate()

  // --- États principaux ---
  const [activeTab, setActiveTab] = useState("mine")
  const [myArticles, setMyArticles] = useState([])
  const [feedArticles, setFeedArticles] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [articleToEdit, setArticleToEdit] = useState(null)
  const [loading, setLoading] = useState(true)

  // --- État de la recherche ---
  // searchQuery contient ce que l'utilisateur tape dans la barre.
  // Le filtrage se fait côté frontend (pas d'appel API) pour être instantané.
  const [searchQuery, setSearchQuery] = useState("")

  // --- États de la pagination ---
  // currentPage = la page actuellement affichée (commence à 1)
  // ARTICLES_PER_PAGE = combien d'articles on montre par page
  const [currentPage, setCurrentPage] = useState(1)
  const ARTICLES_PER_PAGE = 10
  // --- Toast ---
  const { showToast } = useToast()

  // ========================
  // CHARGER LES ARTICLES AU DÉMARRAGE
  // ========================
  // Promise.all() lance les deux requêtes EN MÊME TEMPS
  // au lieu de les faire l'une après l'autre.
  // C'est plus rapide : 1 seconde au lieu de 2.
  const loadArticles = async () => {
    setLoading(true)
    try {
      const [mineRes, feedRes] = await Promise.all([
        articlesAPI.getMyArticles(),
        articlesAPI.getFeed(),
      ])
      setMyArticles(mineRes.data)
      setFeedArticles(feedRes.data)
    } catch (error) {
      console.error("Erreur chargement articles:", error)
    }
    setLoading(false)
  }

  useEffect(() => {
    const fetchArticles = async () => {
      await loadArticles()
    }
    fetchArticles()
  }, [])

  // ========================
  // DÉCONNEXION
  // ========================
  const handleLogout = async () => {
    await logout()
    navigate("/login")
  }

  // ========================
  // CRUD ARTICLES
  // ========================
const handleCreateArticle = async (data) => {
    try {
      await articlesAPI.create(data)
      await loadArticles()
      setShowForm(false)
      showToast("Article publie avec succes !", "success")
    } catch (error) {
      return { success: false, message: error.response?.data?.message || "Erreur" }
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
    } catch (error) {
      return { success: false, message: error.response?.data?.message || "Erreur" }
    }
    return { success: true }
  }

  const handleDeleteArticle = async (articleId) => {
    try {
      await articlesAPI.delete(articleId)
      await loadArticles()
      showToast("Article supprime", "info")
    } catch (error) {
      console.error("Erreur suppression article:", error)
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

  // ========================
  // FILTRER PAR RECHERCHE
  // ========================
  // Cette fonction prend une liste d'articles et ne garde que ceux
  // dont le titre OU le contenu contient le texte recherché.
  // toLowerCase() rend la recherche insensible à la casse :
  // "BLOG" trouvera "blog", "Blog", "BLOG", etc.
  const filterArticles = (articles) => {
    if (!searchQuery.trim()) return articles

    const query = searchQuery.toLowerCase()
    return articles.filter(
      (article) =>
        article.title.toLowerCase().includes(query) ||
        article.content.toLowerCase().includes(query)
    )
  }

  // ========================
  // PAGINATION
  // ========================
  // On découpe la liste filtrée en "pages" de 10 articles.
  // Exemple : 25 articles → page 1 (1-10), page 2 (11-20), page 3 (21-25)
  const paginateArticles = (articles) => {
    const startIndex = (currentPage - 1) * ARTICLES_PER_PAGE
    const endIndex = startIndex + ARTICLES_PER_PAGE
    return articles.slice(startIndex, endIndex)
  }

  // Calculer le nombre total de pages
  const getTotalPages = (articles) => {
    return Math.ceil(articles.length / ARTICLES_PER_PAGE)
  }

  // ========================
  // PRÉPARER LES ARTICLES À AFFICHER
  // ========================
  // Étape 1 : choisir la bonne liste selon l'onglet
  // Étape 2 : filtrer par recherche
  // Étape 3 : paginer
  const currentArticles = activeTab === "mine" ? myArticles : feedArticles
  const filteredArticles = filterArticles(currentArticles)
  const totalPages = getTotalPages(filteredArticles)
  const displayedArticles = paginateArticles(filteredArticles)

  // Réinitialiser la page quand on change d'onglet ou de recherche
  // pour ne pas rester sur une page qui n'existe plus
  const handleTabChange = (tab) => {
    setActiveTab(tab)
    setCurrentPage(1)
    setSearchQuery("")
  }

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value)
    setCurrentPage(1) // Revenir à la page 1 quand on cherche
  }

  // ========================
  // AFFICHAGE
  // ========================
  return (
    <div className="min-h-screen bg-slate-900">
      {/* ── NAVBAR ── */}
      <nav className="bg-white/10 backdrop-blur-lg border-b border-white/10 px-6 py-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold text-white">Mon Blog</h1>
          <div className="flex items-center gap-4">
            <span className="text-purple-200">
              Bonjour, {currentUser.full_name || currentUser.fullName}
            </span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition"
            >
              Deconnexion
            </button>
          </div>
        </div>
      </nav>

      {/* ── CONTENU PRINCIPAL ── */}
      <main className="max-w-6xl mx-auto p-6">

        {/* ── ONGLETS ── */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => handleTabChange("mine")}
            className={`px-5 py-2.5 rounded-lg font-medium transition ${
              activeTab === "mine"
                ? "bg-purple-600 text-white"
                : "bg-white/10 text-purple-200 hover:bg-white/20"
            }`}
          >
            Mes articles
          </button>
          <button
            onClick={() => handleTabChange("feed")}
            className={`px-5 py-2.5 rounded-lg font-medium transition ${
              activeTab === "feed"
                ? "bg-purple-600 text-white"
                : "bg-white/10 text-purple-200 hover:bg-white/20"
            }`}
          >
            Fil d'actualite
            {feedArticles.length > 0 && (
              <span className="ml-2 px-2 py-0.5 text-xs bg-purple-400/30 rounded-full">
                {feedArticles.length}
              </span>
            )}
          </button>
        </div>

        {/* ── BARRE DE RECHERCHE ── */}
        {/* Affichée uniquement si on a des articles à chercher */}
        {currentArticles.length > 0 && (
          <div className="mb-6">
            <div className="relative">
              {/* L'icône loupe est en position absolute à gauche du champ */}
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-300/50">
                🔍
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full pl-12 pr-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-purple-400 transition"
                placeholder="Rechercher par titre ou contenu..."
              />
              {/* Bouton pour effacer la recherche */}
              {searchQuery && (
                <button
                  onClick={() => { setSearchQuery(""); setCurrentPage(1); }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-purple-300/50 hover:text-white transition"
                >
                  ✕
                </button>
              )}
            </div>
            {/* Résultat de la recherche */}
            {searchQuery && (
              <p className="text-purple-300/50 text-sm mt-2">
                {filteredArticles.length} resultat{filteredArticles.length !== 1 ? "s" : ""} pour "{searchQuery}"
              </p>
            )}
          </div>
        )}

        {/* ── CONTENU SELON L'ONGLET ── */}
        {loading ? (
          <p className="text-purple-200 text-center py-16">Chargement...</p>
        ) : (
          <div>
            {/* ── EN-TÊTE + BOUTON NOUVEL ARTICLE (onglet "mine" seulement) ── */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">
                {activeTab === "mine" ? "Mes articles" : "Fil d'actualite"}
                <span className="text-purple-300/50 text-lg ml-2">
                  ({filteredArticles.length})
                </span>
              </h2>
              {activeTab === "mine" && !showForm && (
                <button
                  onClick={() => { setArticleToEdit(null); setShowForm(true); }}
                  className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition"
                >
                  + Nouvel article
                </button>
              )}
            </div>

            {/* ── FORMULAIRE (onglet "mine" seulement) ── */}
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

            {/* ── LISTE DES ARTICLES ── */}
            {displayedArticles.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-purple-200/60 text-lg mb-2">
                  {searchQuery
                    ? "Aucun article ne correspond a votre recherche"
                    : activeTab === "mine"
                    ? "Vous n'avez pas encore d'articles"
                    : "Aucun article dans votre fil"}
                </p>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="text-purple-400 hover:text-purple-300 underline mt-2"
                  >
                    Effacer la recherche
                  </button>
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {displayedArticles.map((article) => (
                  <ArticleCard
                    key={article.id}
                    article={article}
                    isOwner={activeTab === "mine"}
                    onEdit={handleEdit}
                    onDelete={handleDeleteArticle}
                  />
                ))}
              </div>
            )}

            {/* ── PAGINATION ── */}
            {/* Affichée uniquement s'il y a plus d'une page */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-3 mt-8">
                {/* Bouton "Précédent" */}
                <button
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-lg bg-white/10 text-purple-200 hover:bg-white/20 transition disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  ← Precedent
                </button>

                {/* Numéros de pages */}
                {/* Array.from crée un tableau [1, 2, 3, ...totalPages] */}
                {/* qu'on parcourt pour créer un bouton par page */}
                <div className="flex gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-10 h-10 rounded-lg font-medium transition ${
                          currentPage === page
                            ? "bg-purple-600 text-white"
                            : "bg-white/10 text-purple-200 hover:bg-white/20"
                        }`}
                      >
                        {page}
                      </button>
                    )
                  )}
                </div>

                {/* Bouton "Suivant" */}
                <button
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded-lg bg-white/10 text-purple-200 hover:bg-white/20 transition disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Suivant →
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

export default Dashboard