import { useState } from "react"
import { useAuth } from "../../context/AuthContext"
import { useArticles } from "../../context/ArticleContext"
import { useComments } from "../../context/CommentContext"
import { useStatus } from "../../context/StatusContext"
import CommentSection from "./CommentSection"
import ReactionBar from "./ReactionBar"

function ArticleCard({ article, onEdit }) {
  const { currentUser, users } = useAuth()
  const { deleteArticle } = useArticles()
  const { getCommentCount } = useComments()
  const { getStatus, getLastSeenText } = useStatus()

  const [showConfirmDelete, setShowConfirmDelete] = useState(false)
  const [showComments, setShowComments] = useState(false)

  const isAuthor = currentUser.id === article.authorId
  const commentCount = getCommentCount(article.id)

  // Trouver l'auteur de l'article
  const articleAuthor = users.find((u) => u.id === article.authorId)
  const authorStatus = getStatus(article.authorId)

  const handleDelete = () => {
    deleteArticle(article.id)
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

      {/* --- EN-TETE --- */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1 mr-4">
          <h3 className="text-xl font-bold text-white">
            {article.title}
          </h3>
          {/* Nom de l'auteur + statut en ligne (uniquement pour les articles des autres) */}
          {!isAuthor && articleAuthor && (
            <div className="flex items-center gap-2 mt-1">
              <span
                className={`w-2 h-2 rounded-full ${
                  authorStatus.isOnline
                    ? "bg-green-400"
                    : "bg-gray-500"
                }`}
              />
              <span className="text-sm text-purple-300/70">
                {articleAuthor.fullName}
              </span>
              <span className="text-xs text-purple-300/40">
                — {getLastSeenText(article.authorId)}
              </span>
            </div>
          )}
        </div>

        <div className="flex gap-2 flex-shrink-0">
          {article.isPublic ? (
            <span className="px-2 py-1 text-xs rounded-full bg-green-500/20 text-green-300 border border-green-500/30">
              Public
            </span>
          ) : (
            <span className="px-2 py-1 text-xs rounded-full bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
              Prive
            </span>
          )}
          {article.allowComments && (
            <span className="px-2 py-1 text-xs rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
              Commentaires
            </span>
          )}
        </div>
      </div>

      {/* --- CONTENU --- */}
      <p className="text-purple-200/80 mb-4 leading-relaxed">
        {article.content.length > 150
          ? article.content.slice(0, 150) + "..."
          : article.content}
      </p>

      {/* --- REACTIONS EMOJI --- */}
      <div className="mb-4">
        <ReactionBar targetType="article" targetId={article.id} />
      </div>

      {/* --- DATE + COMPTEUR COMMENTAIRES --- */}
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-purple-300/50">
          Publie le {formatDate(article.createdAt)}
          {article.updatedAt !== article.createdAt && (
            <span> · Modifie le {formatDate(article.updatedAt)}</span>
          )}
        </p>

        {article.allowComments && (
          <button
            onClick={() => setShowComments(!showComments)}
            className="text-sm text-purple-400 hover:text-purple-300 transition"
          >
            {commentCount} commentaire{commentCount !== 1 ? "s" : ""}
            <span className="ml-1">{showComments ? "▲" : "▼"}</span>
          </button>
        )}
      </div>

      {/* --- BOUTONS MODIFIER / SUPPRIMER --- */}
      {isAuthor && (
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

      {/* --- SECTION COMMENTAIRES --- */}
      {article.allowComments && showComments && (
        <CommentSection article={article} />
      )}
    </div>
  )
}

export default ArticleCard