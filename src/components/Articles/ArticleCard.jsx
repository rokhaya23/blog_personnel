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
      console.error("Repost error:", error)
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
    ? "bg-white/10 backdrop-blur-lg border-white/10 hover:border-blue-500/30"
    : "bg-white/92 border-blue-200/70 shadow-sm hover:shadow-[0_18px_34px_rgba(29,78,216,0.08)] hover:border-blue-300"
  const accentText = isDark ? "text-blue-200/70" : "text-blue-900/70"
  const authorText = isDark ? "text-blue-200/80" : "text-blue-900/65"
  const bodyText = isDark ? "text-slate-100/85" : "text-slate-600"
  const metaText = isDark ? "text-blue-200/60" : "text-blue-800/60"
  const actionText = isDark ? "text-blue-300 hover:text-blue-200" : "text-blue-700 hover:text-blue-900"
  const editButton = isDark
    ? "bg-blue-700 hover:bg-blue-600 text-white border border-blue-600"
    : "bg-blue-700 hover:bg-blue-800 text-white border border-blue-800"
  const neutralButton = isDark
    ? "bg-blue-900/30 text-white/80 hover:bg-blue-800/40 border border-blue-800"
    : "bg-blue-50 text-blue-900 hover:bg-blue-100 border border-blue-200"

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
                <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
                  {article.author_name.charAt(0).toUpperCase()}
                </div>
              )}
              <span className={`w-2 h-2 rounded-full ${article.author_is_online ? "bg-blue-400" : "bg-gray-400"}`} />
              <span className={`text-sm ${authorText}`}>
                {article.author_name}
              </span>
            </div>
          )}
        </div>

        <div className="flex gap-2 flex-shrink-0">
          {article.is_public ? (
            <span className={`px-2 py-1 text-xs rounded-full border ${
              isDark ? "bg-blue-600/70 text-white border-blue-400/60" : "bg-blue-700 text-white border-blue-800"
            }`}>Public</span>
          ) : (
            <span className={`px-2 py-1 text-xs rounded-full border ${
              isDark ? "bg-slate-700/70 text-white border-slate-500/60" : "bg-slate-200 text-slate-900 border-slate-300"
            }`}>Privé</span>
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
          Publié le {formatDate(article.created_at)}
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
        <div className={`flex gap-3 pt-3 border-t flex-wrap ${isDark ? "border-white/10" : "border-blue-200/70"}`}>
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
              className={`px-4 py-2 text-sm rounded-lg transition ${isDark ? "bg-blue-800/50 text-white hover:bg-blue-700/60" : "bg-blue-50 text-blue-900 hover:bg-blue-100 border border-blue-200"}`}
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
            className={`px-4 py-2 text-sm rounded-lg transition ${isDark ? "bg-slate-800/60 text-white hover:bg-slate-700/60" : "bg-slate-100 text-slate-900 hover:bg-slate-200 border border-slate-300"}`}
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
