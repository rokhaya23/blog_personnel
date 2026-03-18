// ============================================================
// AdminMonitoring.jsx
// DASHBOARD DE MONITORING — Vue d'ensemble de l'application
//
// L'admin observe le flux de l'app :
// - Statistiques globales (compteurs)
// - Utilisateurs en ligne en ce moment
// - Derniers inscrits, derniers articles, derniers commentaires
//
// Rafraîchissement automatique toutes les 30 secondes.
// Accessible uniquement avec un compte admin authentifié.
// ============================================================

import { useState, useEffect, useCallback } from "react"
import { adminAPI } from "../../services/api"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"

function AdminMonitoring() {
  const navigate = useNavigate()
  const { logout } = useAuth()

  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [articles, setArticles] = useState([])
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [lastRefresh, setLastRefresh] = useState(new Date())

  // Charger les données
  const loadData = useCallback(async () => {
    try {
      const [statsRes, usersRes, articlesRes, commentsRes] = await Promise.all([
        adminAPI.getStats(),
        adminAPI.getUsers(),
        adminAPI.getArticles(),
        adminAPI.getComments(),
      ])
      setStats(statsRes.data)
      setUsers(usersRes.data)
      setArticles(articlesRes.data)
      setComments(commentsRes.data)
      setLastRefresh(new Date())
    } catch (error) {
      console.error("Erreur chargement admin:", error)
      if (error.response?.status === 401 || error.response?.status === 403) {
        navigate("/admin/monitoring", { replace: true })
      }
    } finally {
      setLoading(false)
    }
  }, [navigate])

  // Chargement initial
  useEffect(() => {
    loadData()
  }, [loadData])

  // Rafraîchir toutes les 30 secondes
  useEffect(() => {
    const interval = setInterval(loadData, 30000)
    return () => clearInterval(interval)
  }, [loadData])

  // Se déconnecter du monitoring
  const handleLogout = async () => {
    await logout()
    navigate("/admin/monitoring", { replace: true })
  }

  const formatDate = (dateString) => {
    if (!dateString) return "Jamais"
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const timeAgo = (dateString) => {
    if (!dateString) return ""
    const diff = Math.floor((new Date() - new Date(dateString)) / 1000)
    if (diff < 60) return "a l'instant"
    if (diff < 3600) return `il y a ${Math.floor(diff / 60)} min`
    if (diff < 86400) return `il y a ${Math.floor(diff / 3600)}h`
    return `il y a ${Math.floor(diff / 86400)}j`
  }

  const onlineUsers = users.filter((u) => u.is_online)
  const recentUsers = [...users].slice(0, 5)
  const recentArticles = [...articles].slice(0, 8)
  const recentComments = [...comments].slice(0, 10)

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <p className="text-purple-200 text-lg">Chargement du monitoring...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900">

      {/* ── NAVBAR ── */}
      <nav className="bg-gradient-to-r from-slate-800 to-slate-900 border-b border-white/10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <span className="text-2xl">📊</span>
            <h1
              className="text-2xl font-black bg-gradient-to-r from-purple-400 via-violet-300 to-purple-500 bg-clip-text text-transparent"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Daily Post
            </h1>
            <span className="text-purple-300/50 text-sm">Monitoring</span>
            <span className="px-2 py-1 text-xs bg-green-500/20 text-green-300 rounded-full border border-green-500/30 animate-pulse">
              En direct
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-purple-300/40 text-xs">
              Derniere MAJ : {lastRefresh.toLocaleTimeString("fr-FR")}
            </span>
            <button
              onClick={loadData}
              className="px-4 py-2 bg-white/10 text-purple-200 rounded-lg hover:bg-white/20 transition text-sm"
            >
              🔄 Rafraichir
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition text-sm"
            >
              Quitter
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6">

        {/* ══════════════════════════════════════════════
            COMPTEURS PRINCIPAUX
        ══════════════════════════════════════════════ */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-gradient-to-br from-purple-500/20 to-purple-900/20 rounded-xl p-5 border border-purple-500/20">
              <p className="text-purple-300/70 text-sm mb-1">Utilisateurs inscrits</p>
              <p className="text-4xl font-bold text-white">{stats.total_users}</p>
              <p className="text-green-400 text-sm mt-2">🟢 {stats.online_users} en ligne</p>
            </div>

            <div className="bg-gradient-to-br from-blue-500/20 to-blue-900/20 rounded-xl p-5 border border-blue-500/20">
              <p className="text-blue-300/70 text-sm mb-1">Articles publies</p>
              <p className="text-4xl font-bold text-white">{stats.total_articles}</p>
              <div className="flex gap-3 mt-2 text-sm">
                <span className="text-green-400">🌍 {stats.public_articles}</span>
                <span className="text-yellow-400">🔒 {stats.private_articles}</span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-cyan-500/20 to-cyan-900/20 rounded-xl p-5 border border-cyan-500/20">
              <p className="text-cyan-300/70 text-sm mb-1">Commentaires</p>
              <p className="text-4xl font-bold text-white">{stats.total_comments}</p>
              <p className="text-cyan-300/50 text-sm mt-2">💬 Discussions actives</p>
            </div>

            <div className="bg-gradient-to-br from-pink-500/20 to-pink-900/20 rounded-xl p-5 border border-pink-500/20">
              <p className="text-pink-300/70 text-sm mb-1">Relations</p>
              <p className="text-4xl font-bold text-white">{stats.total_friendships}</p>
              <p className="text-yellow-400 text-sm mt-2">⏳ {stats.pending_friendships} en attente</p>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════
            DEUX COLONNES : EN LIGNE + DERNIERS INSCRITS
        ══════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

          {/* Utilisateurs en ligne */}
          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white">🟢 En ligne maintenant</h2>
              <span className="text-green-400 text-sm font-medium">
                {onlineUsers.length} utilisateur{onlineUsers.length !== 1 ? "s" : ""}
              </span>
            </div>
            {onlineUsers.length === 0 ? (
              <p className="text-purple-300/40 text-sm text-center py-6">Aucun utilisateur en ligne</p>
            ) : (
              <div className="flex flex-col gap-2">
                {onlineUsers.map((user) => (
                  <div key={user.id} className="flex items-center gap-3 py-2 px-3 rounded-lg bg-white/5">
                    {user.avatar ? (
                      <img
                        src={`http://localhost:5000/api/auth/avatar/${user.avatar}`}
                        alt=""
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold text-xs">
                        {user.full_name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <span className="text-white text-sm">{user.full_name}</span>
                      <span className="text-purple-300/50 text-xs ml-2">@{user.username}</span>
                    </div>
                    <span className="ml-auto w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Derniers inscrits */}
          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
            <h2 className="text-lg font-bold text-white mb-4">👤 Derniers inscrits</h2>
            <div className="flex flex-col gap-2">
              {recentUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between py-2 px-3 rounded-lg bg-white/5">
                  <div className="flex items-center gap-3">
                    {user.avatar ? (
                      <img
                        src={`http://localhost:5000/api/auth/avatar/${user.avatar}`}
                        alt=""
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold text-xs">
                        {user.full_name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <span className="text-white text-sm">{user.full_name}</span>
                      <span className="text-purple-300/50 text-xs ml-2">@{user.username}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-purple-300/50 text-xs">{user.article_count} articles</span>
                    <p className="text-purple-300/30 text-xs">{formatDate(user.created_at)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════
            DEUX COLONNES : ARTICLES + COMMENTAIRES
        ══════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Derniers articles */}
          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
            <h2 className="text-lg font-bold text-white mb-4">📝 Derniers articles</h2>
            <div className="flex flex-col gap-3">
              {recentArticles.map((article) => (
                <div key={article.id} className="py-3 px-3 rounded-lg bg-white/5">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-white text-sm font-medium">{article.title}</h3>
                    {article.is_public ? (
                      <span className="px-1.5 py-0.5 text-xs bg-green-500/20 text-green-300 rounded">Public</span>
                    ) : (
                      <span className="px-1.5 py-0.5 text-xs bg-yellow-500/20 text-yellow-300 rounded">Prive</span>
                    )}
                  </div>
                  <p className="text-purple-200/50 text-xs mb-1">{article.content}</p>
                  <div className="flex items-center gap-3 text-xs text-purple-300/40">
                    <span>Par @{article.author_username}</span>
                    <span>💬 {article.comment_count}</span>
                    {article.media_count > 0 && <span>📎 {article.media_count}</span>}
                    <span className="ml-auto">{timeAgo(article.created_at)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Derniers commentaires */}
          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
            <h2 className="text-lg font-bold text-white mb-4">💬 Derniers commentaires</h2>
            <div className="flex flex-col gap-3">
              {recentComments.length === 0 ? (
                <p className="text-purple-300/40 text-sm text-center py-6">Aucun commentaire</p>
              ) : (
                recentComments.map((comment) => (
                  <div key={comment.id} className="py-3 px-3 rounded-lg bg-white/5">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-purple-300 font-medium text-xs">{comment.author_name}</span>
                      <span className="text-purple-300/30 text-xs">sur</span>
                      <span className="text-purple-300/70 text-xs">{comment.article_title}</span>
                    </div>
                    <p className="text-purple-100/70 text-sm">{comment.content}</p>
                    <span className="text-purple-300/30 text-xs">{timeAgo(comment.created_at)}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default AdminMonitoring
