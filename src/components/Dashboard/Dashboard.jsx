import { useState } from "react"
import { useAuth } from "../../context/AuthContext"
import { useArticles } from "../../context/ArticleContext"
import { useStatus } from "../../context/StatusContext"
import { useNavigate } from "react-router-dom"
import ArticleList from "../Articles/ArticleList"
import ArticleCard from "../Articles/ArticleCard"
import FriendSearch from "../Friends/FriendSearch"
import FriendsList from "../Friends/FriendsList"
import FriendRequests from "../Friends/FriendRequests"

function Dashboard() {
  const { currentUser, logout } = useAuth()
  const { getFeedArticles, articles } = useArticles()
  const { setOffline } = useStatus()
  const navigate = useNavigate()

  const [activeTab,  setActiveTab]  = useState("mine")
  const [activePage, setActivePage] = useState("dashboard")

  const feedArticles = getFeedArticles()

  const handleLogout = () => {
    setOffline(currentUser.id)
    logout()
    navigate("/login")
  }

  // Initiales pour l'avatar (ex: "Rokhaya Diallo" → "RD")
  const initiales = currentUser?.fullName
    ?.split(" ")
    .map(n => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "?"

  // Liste des pages de la sidebar
  // On met les données dans un tableau pour éviter de répéter le même code 4 fois
  const navItems = [
    { id: "dashboard", label: "Tableau de bord", icon: "🏠" },
    { id: "amis",      label: "Mes amis",        icon: "👥" },
    { id: "articles",  label: "Mes articles",    icon: "✍️" },
    { id: "demandes",  label: "Demandes",        icon: "🔔" },
  ]

  return (
    // min-h-screen = occupe au moins toute la hauteur de l'écran
    // flex = les enfants sont côte à côte (sidebar + contenu)
    // bg-slate-900 = même fond sombre que ton binôme
    <div className="min-h-screen flex bg-slate-900">

      {/* ══════════════════════════════
          SIDEBAR — colonne gauche
      ══════════════════════════════ */}
      <aside className="w-60 flex-shrink-0 bg-white/5 border-r border-white/10 flex flex-col p-3 gap-1">

        {/* Avatar + nom */}
        <div className="flex items-center gap-3 px-2 py-3 mb-2 border-b border-white/10">
          {/* Cercle violet avec les initiales */}
          <div className="w-9 h-9 rounded-full bg-purple-600 flex items-center justify-center text-sm font-medium text-white flex-shrink-0">
            {initiales}
          </div>
          <div>
            <div className="text-sm font-medium text-white">
              {currentUser?.fullName}
            </div>
            {/* Point vert + "En ligne" */}
            <div className="flex items-center gap-1 text-xs text-purple-300/60">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block"></span>
              En ligne
            </div>
          </div>
        </div>

        {/* Label NAVIGATION */}
        <div className="text-xs text-purple-300/40 px-2 py-1 mt-1">
          NAVIGATION
        </div>

        {/* Boutons de navigation
            On parcourt navItems avec .map() pour éviter de répéter le code */}
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => setActivePage(item.id)}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition w-full text-left
              ${activePage === item.id
                ? "bg-purple-600 text-white"           // page active → fond violet
                : "text-purple-200 hover:bg-white/10"  // inactif → transparent
              }`}
          >
            <span>{item.icon}</span>
            {item.label}
          </button>
        ))}

        {/* Déconnexion — poussé tout en bas avec mt-auto */}
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

      {/* ══════════════════════════════
          CONTENU PRINCIPAL — colonne droite
      ══════════════════════════════ */}
      <main className="flex-1 flex flex-col overflow-hidden">

        {/* Barre du haut avec la recherche */}
        <div className="bg-white/5 border-b border-white/10 px-6 py-3 flex items-center gap-3">
          <FriendSearch />
        </div>

        {/* Zone de contenu scrollable */}
        <div className="flex-1 overflow-auto p-6">

          {/* ── Page : Tableau de bord ── */}
          {activePage === "dashboard" && (
            <div>

              {/* Cartes de stats */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                {[
                  { label: "Mes articles",    valeur: articles?.length    || 0 },
                  { label: "Fil d'actualité", valeur: feedArticles?.length || 0 },
                  { label: "Demandes reçues", valeur: 0, violet: true },
                ].map(stat => (
                  <div key={stat.label} className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <div className="text-xs text-purple-300/60 mb-2">{stat.label}</div>
                    <div className={`text-3xl font-bold ${stat.violet ? "text-purple-400" : "text-white"}`}>
                      {stat.valeur}
                    </div>
                  </div>
                ))}
              </div>

              {/* Onglets Mes articles / Fil d'actualité */}
              <div className="flex gap-2 mb-6">
                {[
                  { id: "mine", label: "Mes articles" },
                  { id: "feed", label: `Fil d'actualité (${feedArticles.length})` },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
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

              {/* Contenu de l'onglet actif */}
              {activeTab === "mine" ? (
                <ArticleList />
              ) : (
                <div>
                  {feedArticles.length === 0 ? (
                    <div className="text-center py-16">
                      <p className="text-purple-200/60 text-lg mb-2">
                        Aucun article dans votre fil
                      </p>
                      <p className="text-purple-300/40">
                        Les articles publics de vos amis apparaîtront ici
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4">
                      {feedArticles.map(article => (
                        <ArticleCard key={article.id} article={article} onEdit={() => {}} />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── Page : Mes amis ── */}
          {activePage === "amis" && <FriendsList />}

          {/* ── Page : Mes articles ── */}
          {activePage === "articles" && <ArticleList />}

          {/* ── Page : Demandes reçues ── */}
          {activePage === "demandes" && <FriendRequests />}

        </div>
      </main>
    </div>
  )
}

export default Dashboard