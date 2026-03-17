// ============================================================
// CommentSection.jsx — VERSION AVEC RÉPONSES
//
// Améliorations :
// - Réponses imbriquées (fil de discussion)
// - Bouton "Répondre" sur chaque commentaire
// - Retrait visuel pour les réponses
// - Modération par l'auteur de l'article
// ============================================================

import { useState, useEffect, useCallback } from "react"
import { commentsAPI } from "../../services/api"
import { useAuth } from "../../context/AuthContext"

// ================================================================
// SOUS-COMPOSANT : SingleComment
// Affiche UN commentaire avec ses réponses
// ================================================================
function SingleComment({ comment, allComments, articleId, currentUser, onReload, depth = 0 }) {
  const [showReplyForm, setShowReplyForm] = useState(false)
  const [replyContent, setReplyContent] = useState("")
  const [showConfirmDelete, setShowConfirmDelete] = useState(false)

  // Trouver les réponses à ce commentaire
  // Une réponse est un commentaire dont parent_id === comment.id
  const replies = allComments.filter((c) => c.parent_id === comment.id)

  // Peut-on supprimer ce commentaire ?
  const canDelete = currentUser.id === comment.author_id

  // ========================
  // ENVOYER UNE RÉPONSE
  // ========================
  const handleReply = async (e) => {
    e.preventDefault()
    if (!replyContent.trim()) return

    try {
      await commentsAPI.create(articleId, replyContent.trim(), comment.id)
      setReplyContent("")
      setShowReplyForm(false)
      await onReload() // Recharger tous les commentaires
    } catch (error) {
      console.error("Erreur envoi reponse:", error)
    }
  }

  // ========================
  // SUPPRIMER CE COMMENTAIRE
  // ========================
  const handleDelete = async () => {
    try {
      await commentsAPI.delete(comment.id)
      setShowConfirmDelete(false)
      await onReload()
    } catch (error) {
      console.error("Erreur suppression:", error)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div
      className={`${
        depth > 0 ? "ml-8 pl-4 border-l-2 border-purple-500/20" : ""
      }`}
    >
      <div className="bg-white/5 rounded-lg p-4 mb-3">
        {/* En-tête */}
        <div className="flex justify-between items-center mb-2">
          <span className="text-purple-300 font-medium text-sm">
            {comment.author_name}
          </span>
          <span className="text-purple-300/40 text-xs">
            {formatDate(comment.created_at)}
          </span>
        </div>

        {/* Contenu */}
        <p className="text-purple-100/80 text-sm leading-relaxed">
          {comment.content}
        </p>

        {/* Actions */}
        <div className="flex gap-3 mt-3">
          {/* Bouton Répondre (limité à 2 niveaux) */}
          {depth < 2 && (
            <button
              onClick={() => setShowReplyForm(!showReplyForm)}
              className="text-xs text-purple-400 hover:text-purple-300 transition"
            >
              {showReplyForm ? "Annuler" : "Repondre"}
            </button>
          )}

          {/* Bouton Supprimer */}
          {canDelete && (
            <>
              {showConfirmDelete ? (
                <div className="flex gap-2">
                  <button
                    onClick={handleDelete}
                    className="text-xs text-red-400 hover:text-red-300 transition"
                  >
                    Confirmer
                  </button>
                  <button
                    onClick={() => setShowConfirmDelete(false)}
                    className="text-xs text-purple-400/50 hover:text-purple-300 transition"
                  >
                    Annuler
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowConfirmDelete(true)}
                  className="text-xs text-red-400/60 hover:text-red-300 transition"
                >
                  Supprimer
                </button>
              )}
            </>
          )}
        </div>

        {/* Formulaire de réponse */}
        {showReplyForm && (
          <form onSubmit={handleReply} className="mt-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                className="flex-1 px-3 py-2 text-sm rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-purple-400 transition"
                placeholder={`Repondre a ${comment.author_name}...`}
              />
              <button
                type="submit"
                className="px-4 py-2 text-sm bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition"
              >
                Envoyer
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Réponses (récursif) */}
      {replies.map((reply) => (
        <SingleComment
          key={reply.id}
          comment={reply}
          allComments={allComments}
          articleId={articleId}
          currentUser={currentUser}
          onReload={onReload}
          depth={depth + 1}
        />
      ))}
    </div>
  )
}

// ================================================================
// COMPOSANT PRINCIPAL : CommentSection
// ================================================================
function CommentSection({ articleId }) {
  const { currentUser } = useAuth()
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)

  const loadComments = useCallback(async () => {
    try {
      const response = await commentsAPI.getByArticle(articleId)
      setComments(response.data)
    } catch (error) {
      console.error("Erreur chargement commentaires:", error)
    }
    setLoading(false)
  }, [articleId])

  useEffect(() => {
    const load = async () => {
      await loadComments()
    }
    load()
  }, [loadComments])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    if (!newComment.trim()) {
      setError("Le commentaire ne peut pas etre vide")
      return
    }

    try {
      // null = pas de parent_id (commentaire racine)
      await commentsAPI.create(articleId, newComment.trim(), null)
      setNewComment("")
      await loadComments()
    } catch (error) {
      console.error("Erreur envoi commentaire:", error)
      setError("Erreur lors de l'envoi du commentaire")
    }
  }

  // Commentaires racines (ceux sans parent_id)
  const rootComments = comments.filter((c) => !c.parent_id)

  return (
    <div className="mt-6 pt-6 border-t border-white/10">
      <h4 className="text-lg font-semibold text-white mb-4">
        Commentaires
        <span className="text-purple-300/50 text-sm ml-2">({comments.length})</span>
      </h4>

      {/* Formulaire nouveau commentaire */}
      {error && (
        <div className="bg-red-500/20 border border-red-500 text-red-200 px-3 py-2 rounded-lg mb-3 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="flex-1 px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-purple-400 transition"
            placeholder="Ecrire un commentaire..."
          />
          <button
            type="submit"
            className="px-5 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition"
          >
            Envoyer
          </button>
        </div>
      </form>

      {/* Liste des commentaires */}
      {loading ? (
        <p className="text-purple-300/40 text-sm text-center py-4">Chargement...</p>
      ) : rootComments.length === 0 ? (
        <p className="text-purple-300/40 text-sm text-center py-4">
          Aucun commentaire. Soyez le premier !
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {rootComments.map((comment) => (
            <SingleComment
              key={comment.id}
              comment={comment}
              allComments={comments}
              articleId={articleId}
              currentUser={currentUser}
              onReload={loadComments}
              depth={0}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default CommentSection
