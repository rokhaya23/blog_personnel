import { useState, useEffect } from "react"
import { useAuth } from "../../context/AuthContext"
import { useNavigate } from "react-router-dom"
import { articlesAPI } from "../../services/api"
import ArticleCard from "../Articles/ArticleCard"
import ArticleForm from "../Articles/ArticleForm"

function Dashboard() {
  const { currentUser, logout } = useAuth()

  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState("mine")
  const [myArticles, setMyArticles] = useState([])
  const [feedArticles, setFeedArticles] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [articleToEdit, setArticleToEdit] = useState(null)
  const [loading, setLoading] = useState(true)

  // ========================
  // CHARGER LES ARTICLES AU DÉMARRAGE
  // ========================
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
    (async () => {
      await loadArticles()
    })()
  }, [])

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
    } catch (error) {
      return { success: false, message: error.response?.data?.message || "Erreur" }
    }
    return { success: true }
  }

  const handleDeleteArticle = async (articleId) => {
    try {
      await articlesAPI.delete(articleId)
      await loadArticles()
    } catch (error) {
      console.error("Erreur suppression:", error)
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

  return (
    <div className="min-h-screen bg-slate-900">
      {/* NAVBAR */}
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

      {/* CONTENU */}
      <main className="max-w-6xl mx-auto p-6">
        {/* ONGLETS */}
        <div className="flex gap-2 mb-8">
          <button
            onClick={() => setActiveTab("mine")}
            className={`px-5 py-2.5 rounded-lg font-medium transition ${
              activeTab === "mine"
                ? "bg-purple-600 text-white"
                : "bg-white/10 text-purple-200 hover:bg-white/20"
            }`}
          >
            Mes articles
          </button>
          <button
            onClick={() => setActiveTab("feed")}
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

        {loading ? (
          <p className="text-purple-200 text-center py-16">Chargement...</p>
        ) : activeTab === "mine" ? (
          <div>
            {/* EN-TÊTE + BOUTON */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">
                Mes articles
                <span className="text-purple-300/50 text-lg ml-2">
                  ({myArticles.length})
                </span>
              </h2>
              {!showForm && (
                <button
                  onClick={() => { setArticleToEdit(null); setShowForm(true); }}
                  className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition"
                >
                  + Nouvel article
                </button>
              )}
            </div>

            {/* FORMULAIRE */}
            {showForm && (
              <div className="mb-8">
                <ArticleForm
                  articleToEdit={articleToEdit}
                  onCreate={handleCreateArticle}
                  onUpdate={handleUpdateArticle}
                  onDone={handleFormDone}
                />
              </div>
            )}

            {/* LISTE */}
            {myArticles.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-purple-200/60 text-lg mb-2">
                  Vous n'avez pas encore d'articles
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {myArticles.map((article) => (
                  <ArticleCard
                    key={article.id}
                    article={article}
                    isOwner={true}
                    onEdit={handleEdit}
                    onDelete={handleDeleteArticle}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">
              Fil d'actualite
              <span className="text-purple-300/50 text-lg ml-2">
                ({feedArticles.length})
              </span>
            </h2>
            {feedArticles.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-purple-200/60 text-lg mb-2">
                  Aucun article dans votre fil
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {feedArticles.map((article) => (
                  <ArticleCard
                    key={article.id}
                    article={article}
                    isOwner={false}
                    onEdit={() => {}}
                    onDelete={() => {}}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

export default Dashboard