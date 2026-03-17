// ============================================================
// ArticleCard.jsx — VERSION AVEC REPOST + MÉDIAS CORRIGÉS
// ============================================================

import { useState } from "react"
import { articlesAPI } from "../../services/api"
import CommentSection from "./CommentSection"
import ReactionBar from "./ReactionBar"
import { useToast } from "../Layout/Toast"

function ArticleCard({ article, isOwner, onEdit, onDelete, onReload }) {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false)
  const [showComments, setShowComments] = useState(false)

  const { showToast } = useToast()

  const handleDelete = () => {
    onDelete(article.id)
    setShowConfirmDelete(false)
  }

  // ========================
  // REPUBLIER UN ARTICLE
  // ========================
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

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/10 hover:border-purple-500/30 transition duration-300">

      {/* ── BADGE REPOST ── */}
      {article.repost_of && (
        <div className="flex items-center gap-2 mb-3 text-purple-300/60 text-sm">
          <span>🔁</span>
          <span>
            {isOwner
              ? `Vous avez republié un article de ${article.original_author_name || "quelqu'un"}`
              : `${article.author_name || "Quelqu'un"} a republié un article de ${article.original_author_name || "quelqu'un"}`}
          </span>
        </div>
      )}

      {/* ── EN-TÊTE ── */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1 mr-4">
          <h3 className="text-xl font-bold text-white">{article.title}</h3>
          
          {!isOwner && article.author_name && (
            <div className="flex items-center gap-2 mt-1">
              {/* Avatar de l'auteur */}
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
              <span
                className={`w-2 h-2 rounded-full ${
                  article.author_is_online ? "bg-green-400" : "bg-gray-500"
                }`}
              />
              <span className="text-sm text-purple-300/70">
                {article.author_name}
              </span>
            </div>
          )}
        </div>

        <div className="flex gap-2 flex-shrink-0">
          {article.is_public ? (
            <span className="px-2 py-1 text-xs rounded-full bg-green-500/20 text-green-300 border border-green-500/30">
              Public
            </span>
          ) : (
            <span className="px-2 py-1 text-xs rounded-full bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
              Prive
            </span>
          )}
        </div>
      </div>

      {/* ── MÉDIAS ── */}
      {article.media && article.media.length > 0 && (
        <div className="mb-4">
          {article.media.length === 1 ? (
            <div className="rounded-lg overflow-hidden">
              {article.media[0].type === "image" ? (
                <img
                  src={`http://localhost:5000/api/articles/media/${article.media[0].filename}`}
                  alt={article.media[0].original_name || "Image"}
                  className="w-full max-h-96 object-contain rounded-lg bg-black/20"
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

      {/* ── CONTENU ── */}
      <p className="text-purple-200/80 mb-4 leading-relaxed">
        {article.content.length > 150
          ? article.content.slice(0, 150) + "..."
          : article.content}
      </p>

      {/* ── RÉACTIONS ── */}
      <div className="mb-4">
        <ReactionBar articleId={article.id} reactionsCount={article.reactions_count} />
      </div>

      {/* ── DATE + ACTIONS SOCIALES ── */}
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-purple-300/50">
          Publie le {formatDate(article.created_at)}
        </p>

        <div className="flex items-center gap-4">
          {/* Bouton Republier (uniquement sur les articles des autres) */}
          {!isOwner && !article.repost_of && (
            <button
              onClick={handleRepost}
              className="flex items-center gap-1 text-sm text-purple-400 hover:text-purple-300 transition"
              title="Republier sur votre profil"
            >
              <span>🔁</span>
              <span>Republier</span>
            </button>
          )}

          {/* Bouton Commentaires */}
          {article.allow_comments && (
            <button
              onClick={() => setShowComments(!showComments)}
              className="text-sm text-purple-400 hover:text-purple-300 transition"
            >
              💬 {article.comment_count || 0} commentaire{(article.comment_count || 0) !== 1 ? "s" : ""}
              <span className="ml-1">{showComments ? "▲" : "▼"}</span>
            </button>
          )}
        </div>
      </div>

      {/* ── BOUTONS MODIFIER / SUPPRIMER ── */}
      {isOwner && (
        <div className="flex gap-3 pt-3 border-t border-white/10">
          {/* Pas de modification pour les reposts */}
          {!article.repost_of && (
            <button
              onClick={() => onEdit(article)}
              className="px-4 py-2 text-sm bg-purple-500/20 text-purple-300 rounded-lg hover:bg-purple-500/30 transition"
            >
              Modifier
            </button>
          )}
          {showConfirmDelete ? (
            <div className="flex gap-2">
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-sm bg-red-500/30 text-red-300 rounded-lg hover:bg-red-500/40 transition"
              >
                Confirmer
              </button>
              <button
                onClick={() => setShowConfirmDelete(false)}
                className="px-4 py-2 text-sm bg-white/10 text-white/60 rounded-lg hover:bg-white/20 transition"
              >
                Annuler
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowConfirmDelete(true)}
              className="px-4 py-2 text-sm bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition"
            >
              Supprimer
            </button>
          )}
        </div>
      )}

      {/* ── COMMENTAIRES ── */}
      {article.allow_comments && showComments && (
        <CommentSection articleId={article.id} />
      )}
    </div>
  )
}

export default ArticleCard