import { useState } from "react"
import CommentSection from "./CommentSection"
import ReactionBar from "./ReactionBar"

function ArticleCard({ article, isOwner, onEdit, onDelete }) {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false)
  const [showComments, setShowComments] = useState(false)


  const handleDelete = () => {
    onDelete(article.id)
    setShowConfirmDelete(false)
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
      {/* EN-TÊTE */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1 mr-4">
          <h3 className="text-xl font-bold text-white">{article.title}</h3>
          {/* Nom de l'auteur pour les articles du feed */}
          {!isOwner && article.author_name && (
            <div className="flex items-center gap-2 mt-1">
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
              Privé
            </span>
          )}
          {article.allow_comments && (
            <span className="px-2 py-1 text-xs rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
              Commentaires
            </span>
          )}
        </div>
      </div>

{/* ── MÉDIAS (IMAGES ET VIDÉOS) ── */}
      {article.media && article.media.length > 0 && (
        <div className={`grid gap-2 mb-4 ${
          article.media.length === 1 ? "grid-cols-1" : "grid-cols-2"
        }`}>
          {article.media.map((media, index) => (
            <div key={index} className="rounded-lg overflow-hidden">
              {media.type === "image" ? (
                <img
                  src={`http://localhost:5000/api/articles/media/${media.filename}`}
                  alt={media.original_name || "Image"}
                  className="w-full h-64 object-cover rounded-lg hover:scale-105 transition duration-300"
                />
              ) : (
                <video
                  src={`http://localhost:5000/api/articles/media/${media.filename}`}
                  controls
                  className="w-full h-64 object-cover rounded-lg"
                />
              )}
            </div>
          ))}
        </div>
      )}

      {/* CONTENU */}
      <p className="text-purple-200/80 mb-4 leading-relaxed">
        {article.content.length > 150
          ? article.content.slice(0, 150) + "..."
          : article.content}
      </p>

      {/* RÉACTIONS */}
      <div className="mb-4">
        <ReactionBar articleId={article.id} reactionsCount={article.reactions_count} />
      </div>

      {/* DATE + COMMENTAIRES */}
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-purple-300/50">
          Publié le {formatDate(article.created_at)}
        </p>
        {article.allow_comments && (
          <button
            onClick={() => setShowComments(!showComments)}
            className="text-sm text-purple-400 hover:text-purple-300 transition"
          >
            {article.comment_count || 0} commentaire{(article.comment_count || 0) !== 1 ? "s" : ""}
            <span className="ml-1">{showComments ? "▲" : "▼"}</span>
          </button>
        )}
      </div>

      {/* BOUTONS MODIFIER / SUPPRIMER */}
      {isOwner && (
        <div className="flex gap-3 pt-3 border-t border-white/10">
          <button
            onClick={() => onEdit(article)}
            className="px-4 py-2 text-sm bg-purple-500/20 text-purple-300 rounded-lg hover:bg-purple-500/30 transition"
          >
            Modifier
          </button>
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

      {/* COMMENTAIRES */}
      {article.allow_comments && showComments && (
        <CommentSection articleId={article.id} />
      )}
    </div>
  )
}

export default ArticleCard