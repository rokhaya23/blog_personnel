// ============================================================
// ArticleCard.jsx — VERSION DARK/LIGHT
// ============================================================

import { useState } from "react"
import { articlesAPI } from "../../services/api"
import { useTheme } from "../../context/ThemeContext"
import CommentSection from "./CommentSection"
import ReactionBar from "./ReactionBar"
import { useToast } from "../Layout/Toast"

function ArticleCard({ article, isOwner, onEdit, onDelete, onReload }) {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const { isDark } = useTheme()
  const { showToast } = useToast()

  const handleDelete = () => {
    onDelete(article.id)
    setShowConfirmDelete(false)
  }

  const handleRepost = async () => {
    try {
      await articlesAPI.repost(article.id)
      showToast("Article republié sur votre profil !", "success")
      if (onReload) onReload()
    } catch (error) {
      const message = error.response?.data?.message || "Erreur lors du repost"
      showToast(message, "error")
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  }

  const cardClass = isDark
    ? "bg-white/10 backdrop-blur-lg border-white/10 hover:border-purple-500/30"
    : "bg-white/92 border-violet-200/70 shadow-sm hover:shadow-[0_18px_34px_rgba(76,29,149,0.08)] hover:border-violet-300"
  const accentText = isDark ? "text-purple-300/60" : "text-violet-900/70"
  const authorText = isDark ? "text-purple-300/70" : "text-violet-900/65"
  const bodyText = isDark ? "text-purple-200/80" : "text-slate-600"
  const metaText = isDark ? "text-purple-300/50" : "text-violet-800/55"
  const actionText = isDark ? "text-purple-400 hover:text-purple-300" : "text-violet-700 hover:text-violet-900"
  const editButton = isDark
    ? "bg-purple-500/30 text-purple-200 hover:bg-purple-500/40"
    : "bg-violet-100 text-violet-950 hover:bg-violet-200 border border-violet-300"
  const neutralButton = isDark
    ? "bg-white/10 text-white/60 hover:bg-white/20"
    : "bg-white text-slate-600 hover:bg-violet-50 border border-violet-200"

  return (
    <div className={`rounded-xl p-6 border transition duration-300 ${cardClass}`}>

      {/* Badge repost */}
      {article.repost_of && (
        <div className={`flex items-center gap-2 mb-3 text-sm ${accentText}`}>
          <span>🔁</span>
          <span>
            {isOwner
              ? `Vous avez republié un article de ${article.original_author_name || "quelqu'un"}`
              : `${article.author_name || "Quelqu'un"} a republié un article de ${article.original_author_name || "quelqu'un"}`}
          </span>
        </div>
      )}

      {/* En-tête */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1 mr-4">
          <h3 className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-800"}`}>
            {article.title}
          </h3>
          {!isOwner && article.author_name && (
            <div className="flex items-center gap-2 mt-1">
              {article.author_avatar ? (
                <img
                  src={`http://localhost:5000/api/auth/avatar/${article.author_avatar}`}
                  alt=""
                  className="w-6 h-6 rounded-full object-cover"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold text-xs">
                  {article.author_name.charAt(0).toUpperCase()}
                </div>
              )}
              <span className={`w-2 h-2 rounded-full ${article.author_is_online ? "bg-green-400" : "bg-gray-400"}`} />
              <span className={`text-sm ${authorText}`}>
                {article.author_name}
              </span>
            </div>
          )}
        </div>

        <div className="flex gap-2 flex-shrink-0">
          {article.is_public ? (
            <span className={`px-2 py-1 text-xs rounded-full border ${
              isDark ? "bg-green-500/30 text-green-200 border-green-400/40" : "bg-green-100 text-green-800 border-green-300"
            }`}>Public</span>
          ) : (
            <span className={`px-2 py-1 text-xs rounded-full border ${
              isDark ? "bg-amber-500/30 text-amber-200 border-amber-400/40" : "bg-amber-100 text-amber-800 border-amber-300"
            }`}>Prive</span>
          )}
        </div>
      </div>

      {/* Médias */}
      {article.media && article.media.length > 0 && (
        <div className="mb-4">
          {article.media.length === 1 ? (
            <div className="rounded-lg overflow-hidden">
              {article.media[0].type === "image" ? (
                <img
                  src={`http://localhost:5000/api/articles/media/${article.media[0].filename}`}
                  alt={article.media[0].original_name || "Image"}
                  className={`w-full max-h-96 object-contain rounded-lg ${isDark ? "bg-black/20" : "bg-slate-100"}`}
                />
              ) : (
                <video
                  src={`http://localhost:5000/api/articles/media/${article.media[0].filename}`}
                  controls
                  className="w-full max-h-96 rounded-lg"
                />
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {article.media.map((media, index) => (
                <div key={index} className="rounded-lg overflow-hidden">
                  {media.type === "image" ? (
                    <img
                      src={`http://localhost:5000/api/articles/media/${media.filename}`}
                      alt={media.original_name || "Image"}
                      className="w-full h-48 object-cover rounded-lg hover:opacity-90 transition"
                    />
                  ) : (
                    <video
                      src={`http://localhost:5000/api/articles/media/${media.filename}`}
                      controls
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Contenu */}
      <p className={`mb-4 leading-relaxed ${bodyText}`}>
        {article.content.length > 150
          ? article.content.slice(0, 150) + "..."
          : article.content}
      </p>

      {/* Réactions */}
      <div className="mb-4">
        <ReactionBar
          articleId={article.id}
          reactionsCount={article.reactions_count}
          currentUserReaction={article.current_user_reaction}
        />
      </div>

      {/* Date + actions sociales */}
      <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
        <p className={`text-sm ${metaText}`}>
          Publie le {formatDate(article.created_at)}
        </p>

        <div className="flex items-center gap-4">
          {/* Republier */}
          {!isOwner && !article.repost_of && (
            <button
              onClick={handleRepost}
              className={`flex items-center gap-1 text-sm transition ${actionText}`}
            >
              <span>🔁</span>
              <span>Republier</span>
            </button>
          )}

          {/* Commentaires */}
          {article.allow_comments && (
            <button
              onClick={() => setShowComments(!showComments)}
              className={`text-sm transition ${actionText}`}
            >
              💬 {article.comment_count || 0} commentaire{(article.comment_count || 0) !== 1 ? "s" : ""}
              <span className="ml-1">{showComments ? "▲" : "▼"}</span>
            </button>
          )}
        </div>
      </div>

      {/* Boutons Modifier / Supprimer */}
      {isOwner && (
        <div className={`flex gap-3 pt-3 border-t flex-wrap ${isDark ? "border-white/10" : "border-violet-200/70"}`}>
          {!article.repost_of && (
            <button
              onClick={() => onEdit(article)}
              className={`px-4 py-2 text-sm rounded-lg transition ${editButton}`}
            >
              Modifier
            </button>
          )}
          {showConfirmDelete ? (
            <div className="flex gap-2">
              <button
                onClick={handleDelete}
                className={`px-4 py-2 text-sm rounded-lg transition ${isDark ? "bg-red-500/35 text-red-200 hover:bg-red-500/45" : "bg-red-100 text-red-700 hover:bg-red-200 border border-red-300"}`}
              >
                Confirmer
              </button>
              <button
                onClick={() => setShowConfirmDelete(false)}
                className={`px-4 py-2 text-sm rounded-lg transition ${neutralButton}`}
              >
                Annuler
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowConfirmDelete(true)}
              className={`px-4 py-2 text-sm rounded-lg transition ${isDark ? "bg-red-500/30 text-red-200 hover:bg-red-500/40" : "bg-red-100 text-red-700 hover:bg-red-200 border border-red-300"}`}
            >
              Supprimer
            </button>
          )}
        </div>
      )}

      {/* Commentaires */}
      {article.allow_comments && showComments && (
        <CommentSection articleId={article.id} articleAuthorId={article.author_id} />
      )}
    </div>
  )
}

export default ArticleCard
