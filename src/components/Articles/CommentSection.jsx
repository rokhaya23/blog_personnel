// ============================================================
// CommentSection.jsx
// SECTION COMMENTAIRES SOUS UN ARTICLE
//
// Affiche :
// - Le formulaire pour ajouter un commentaire
// - La liste des commentaires racines
// - Les réponses sous chaque commentaire (en retrait visuel)
// - Le bouton "Répondre" sur chaque commentaire
// - Le bouton "Supprimer" (pour l'auteur du commentaire ou de l'article)
//
// Ce composant est composé de 2 sous-composants :
// 1. CommentSection (le conteneur principal)
// 2. SingleComment (un commentaire individuel, réutilisé pour les réponses)
// ============================================================

import { useState } from "react"
import { useAuth } from "../../context/AuthContext"
import { useComments } from "../../context/CommentContext"
import ReactionBar from "./ReactionBar"


// ================================================================
// SOUS-COMPOSANT : SingleComment
// Affiche UN commentaire avec ses actions et ses réponses
// ================================================================
// On le définit dans le même fichier car il n'est utilisé que ici.
// C'est un pattern courant : garder les sous-composants proches
// du composant qui les utilise.

function SingleComment({ comment, articleAuthorId, users, depth = 0 }) {
  // depth = le niveau d'imbrication (0 = racine, 1 = réponse, 2 = réponse de réponse...)
  // On limite à 2 niveaux pour que ça reste lisible

  const { currentUser } = useAuth()
  const { getReplies, addComment, deleteComment } = useComments()

  // --- États ---
  const [showReplyForm, setShowReplyForm] = useState(false)
  const [replyContent, setReplyContent] = useState("")
  const [showConfirmDelete, setShowConfirmDelete] = useState(false)

  // Trouver le nom de l'auteur du commentaire
  // find() cherche dans la liste des utilisateurs celui dont l'id correspond
  const author = users.find((u) => u.id === comment.authorId)
  const authorName = author ? author.fullName : "Utilisateur inconnu"

  // Récupérer les réponses à ce commentaire
  const replies = getReplies(comment.id)

  // Peut-on supprimer ce commentaire ?
  const canDelete =
    currentUser.id === comment.authorId ||    // Je suis l'auteur du commentaire
    currentUser.id === articleAuthorId          // Je suis l'auteur de l'article

  // ========================
  // ENVOYER UNE RÉPONSE
  // ========================
  const handleReply = (e) => {
    e.preventDefault()

    if (!replyContent.trim()) return

    // On passe comment.id comme parentId → c'est une réponse
    addComment(comment.articleId, replyContent, comment.id)

    // Réinitialiser et fermer le formulaire de réponse
    setReplyContent("")
    setShowReplyForm(false)
  }

  // ========================
  // SUPPRIMER CE COMMENTAIRE
  // ========================
  const handleDelete = () => {
    deleteComment(comment.id, articleAuthorId)
    setShowConfirmDelete(false)
  }

  // ========================
  // FORMATER LA DATE
  // ========================
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
      // Si depth > 0 (c'est une réponse), on ajoute un retrait à gauche
      // et une bordure pour montrer visuellement la hiérarchie
      className={`${
        depth > 0
          ? "ml-8 pl-4 border-l-2 border-purple-500/20"
          : ""
      }`}
    >
      {/* --- LE COMMENTAIRE --- */}
      <div className="bg-white/5 rounded-lg p-4 mb-3">
        {/* En-tête : nom de l'auteur + date */}
        <div className="flex justify-between items-center mb-2">
          <span className="text-purple-300 font-medium text-sm">
            {authorName}
            {/* Si c'est l'auteur de l'article, on affiche un badge */}
            {comment.authorId === articleAuthorId && (
              <span className="ml-2 px-2 py-0.5 text-xs bg-purple-500/20 text-purple-300 rounded-full">
                Auteur
              </span>
            )}
          </span>
          <span className="text-purple-300/40 text-xs">
            {formatDate(comment.createdAt)}
          </span>
        </div>

        {/* Contenu du commentaire */}
        <p className="text-purple-100/80 text-sm leading-relaxed">
          {comment.content}
        </p>
        {/* --- RÉACTIONS SUR CE COMMENTAIRE --- */}
        <div className="mt-2">
          <ReactionBar targetType="comment" targetId={comment.id} />
        </div>
        {/* --- ACTIONS --- */}
        <div className="flex gap-3 mt-3">
          {/* Bouton Répondre (limité à 2 niveaux de profondeur) */}
          {/* Au-delà, ça devient illisible sur mobile */}
          {depth < 2 && (
            <button
              onClick={() => setShowReplyForm(!showReplyForm)}
              className="text-xs text-purple-400 hover:text-purple-300 transition"
            >
              {showReplyForm ? "Annuler" : "Répondre"}
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

        {/* --- FORMULAIRE DE RÉPONSE (affiché/masqué) --- */}
        {showReplyForm && (
          <form onSubmit={handleReply} className="mt-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                className="flex-1 px-3 py-2 text-sm rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-purple-400 transition"
                placeholder={`Répondre à ${authorName}...`}
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

      {/* --- RÉPONSES À CE COMMENTAIRE --- */}
      {/* On appelle SingleComment de manière RÉCURSIVE pour chaque réponse */}
      {/* depth + 1 augmente le niveau d'imbrication (et donc le retrait) */}
      {replies.map((reply) => (
        <SingleComment
          key={reply.id}
          comment={reply}
          articleAuthorId={articleAuthorId}
          users={users}
          depth={depth + 1}
        />
      ))}
    </div>
  )
}

// ================================================================
// COMPOSANT PRINCIPAL : CommentSection
// ================================================================

function CommentSection({ article }) {
  const { users } = useAuth()
  const { getArticleComments, addComment, getCommentCount } = useComments()

  // --- États ---
  const [newComment, setNewComment] = useState("")
  const [error, setError] = useState("")

  // Récupérer les commentaires racines de cet article
  const rootComments = getArticleComments(article.id)
  const totalComments = getCommentCount(article.id)

  // ========================
  // POSTER UN NOUVEAU COMMENTAIRE
  // ========================
  const handleSubmit = (e) => {
    e.preventDefault()
    setError("")

    if (!newComment.trim()) {
      setError("Le commentaire ne peut pas être vide")
      return
    }

    // parentId = null car c'est un commentaire racine (pas une réponse)
    const result = addComment(article.id, newComment, null)

    if (result.success) {
      setNewComment("")  // Vider le champ après envoi
    } else {
      setError(result.message)
    }
  }

  return (
    <div className="mt-6 pt-6 border-t border-white/10">
      {/* --- TITRE --- */}
      <h4 className="text-lg font-semibold text-white mb-4">
        Commentaires
        <span className="text-purple-300/50 text-sm ml-2">
          ({totalComments})
        </span>
      </h4>

      {/* --- FORMULAIRE POUR NOUVEAU COMMENTAIRE --- */}
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
            placeholder="Écrire un commentaire..."
          />
          <button
            type="submit"
            className="px-5 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition"
          >
            Envoyer
          </button>
        </div>
      </form>

      {/* --- LISTE DES COMMENTAIRES --- */}
      {rootComments.length === 0 ? (
        <p className="text-purple-300/40 text-sm text-center py-4">
          Aucun commentaire pour le moment. Soyez le premier !
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {rootComments.map((comment) => (
            <SingleComment
              key={comment.id}
              comment={comment}
              articleAuthorId={article.authorId}
              users={users}
              depth={0}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default CommentSection