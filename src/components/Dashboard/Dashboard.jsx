import { useState } from "react"
import { useAuth } from "../../context/AuthContext"
import { useArticles } from "../../context/ArticleContext"
import { useStatus } from "../../context/StatusContext"
import { useNavigate } from "react-router-dom"
import ArticleList from "../Articles/ArticleList"
import ArticleCard from "../Articles/ArticleCard"

function Dashboard() {
  const { currentUser, logout } = useAuth()
  const { getFeedArticles } = useArticles()
  const { setOffline } = useStatus()
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState("mine")

  const feedArticles = getFeedArticles()

  const handleLogout = () => {
    setOffline(currentUser.id)
    logout()
    navigate("/login")
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <nav className="bg-white/10 backdrop-blur-lg border-b border-white/10 px-6 py-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold text-white">Mon Blog</h1>
          <div className="flex items-center gap-4">
            <span className="text-purple-200">
              Bonjour, {currentUser.fullName}
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

      <main className="max-w-6xl mx-auto p-6">
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

        {activeTab === "mine" ? (
          <ArticleList />
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
                <p className="text-purple-300/40">
                  Les articles publics de vos amis apparaitront ici
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {feedArticles.map((article) => (
                  <ArticleCard
                    key={article.id}
                    article={article}
                    onEdit={() => {}}
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