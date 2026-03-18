import { useState, useEffect, useCallback } from "react"
import { commentsAPI } from "../../services/api"
import { useAuth } from "../../context/AuthContext"
import { useTheme } from "../../context/ThemeContext"

function SingleComment({ comment, allComments, articleId, articleAuthorId, currentUser, onReload, depth = 0 }) {
  const [showReplyForm, setShowReplyForm] = useState(false)
  const [replyContent, setReplyContent] = useState("")
  const [showConfirmDelete, setShowConfirmDelete] = useState(false)
  const { isDark } = useTheme()

  const replies = allComments.filter((c) => c.parent_id === comment.id)
  const canDelete = currentUser.id === comment.author_id || currentUser.id === articleAuthorId

  const handleReply = async (e) => {
    e.preventDefault()
    if (!replyContent.trim()) return
    try {
      await commentsAPI.create(articleId, replyContent.trim(), comment.id)
      setReplyContent("")
      setShowReplyForm(false)
      await onReload()
    } catch (error) {
      console.error("Erreur envoi reponse:", error)
    }
  }

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
      day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
    })
  }

  const borderClass = isDark ? "border-purple-500/20" : "border-violet-300/70"
  const commentBg = isDark ? "bg-white/5" : "bg-white border border-violet-200/70 shadow-sm"
  const nameClass = isDark ? "text-purple-300" : "text-violet-900/80"
  const dateClass = isDark ? "text-purple-300/40" : "text-violet-800/55"
  const contentClass = isDark ? "text-purple-100/80" : "text-gray-700"
  const inputClass = isDark
    ? "bg-white/10 border-white/20 text-white placeholder-white/40"
    : "bg-white border-violet-200 text-gray-800 placeholder:text-violet-500/55"
  const linkClass = isDark ? "text-purple-400 hover:text-purple-300" : "text-violet-700 hover:text-violet-900"
  const secondaryAction = isDark ? "text-purple-400/50 hover:text-purple-300" : "text-violet-800/50 hover:text-violet-900"
  const primaryButton = isDark ? "bg-violet-600 hover:bg-violet-500 text-white" : "bg-violet-700 hover:bg-violet-800 text-white"

  return (
    <div className={`${depth > 0 ? `ml-8 pl-4 border-l-2 ${borderClass}` : ""}`}>
      <div className={`rounded-lg p-4 mb-3 ${commentBg}`}>
        <div className="flex justify-between items-center mb-2">
          <span className={`font-medium text-sm ${nameClass}`}>{comment.author_name}</span>
          <span className={`text-xs ${dateClass}`}>{formatDate(comment.created_at)}</span>
        </div>
        <p className={`text-sm leading-relaxed ${contentClass}`}>{comment.content}</p>
        <div className="flex gap-3 mt-3">
          {depth < 2 && (
            <button onClick={() => setShowReplyForm(!showReplyForm)}
              className={`text-xs transition ${linkClass}`}>
              {showReplyForm ? "Annuler" : "Repondre"}
            </button>
          )}
          {canDelete && (
            <>
              {showConfirmDelete ? (
                <div className="flex gap-2">
                  <button onClick={handleDelete} className="text-xs text-red-400 hover:text-red-300 transition">Confirmer</button>
                  <button onClick={() => setShowConfirmDelete(false)} className={`text-xs transition ${secondaryAction}`}>Annuler</button>
                </div>
              ) : (
                <button onClick={() => setShowConfirmDelete(true)} className="text-xs text-red-400/60 hover:text-red-300 transition">Supprimer</button>
              )}
            </>
          )}
        </div>
        {showReplyForm && (
          <form onSubmit={handleReply} className="mt-3">
            <div className="flex gap-2">
              <input type="text" value={replyContent} onChange={(e) => setReplyContent(e.target.value)}
                className={`flex-1 px-3 py-2 text-sm rounded-lg border focus:outline-none focus:border-purple-400 transition ${inputClass}`}
                placeholder={`Repondre a ${comment.author_name}...`} />
              <button type="submit" className={`px-4 py-2 text-sm rounded-lg transition ${primaryButton}`}>Envoyer</button>
            </div>
          </form>
        )}
      </div>
      {replies.map((reply) => (
        <SingleComment
          key={reply.id}
          comment={reply}
          allComments={allComments}
          articleId={articleId}
          articleAuthorId={articleAuthorId}
          currentUser={currentUser}
          onReload={onReload}
          depth={depth + 1}
        />
      ))}
    </div>
  )
}

function CommentSection({ articleId, articleAuthorId }) {
  const { currentUser } = useAuth()
  const { isDark } = useTheme()
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

  useEffect(() => { loadComments() }, [loadComments])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    if (!newComment.trim()) { setError("Le commentaire ne peut pas etre vide"); return }
    try {
      await commentsAPI.create(articleId, newComment.trim(), null)
      setNewComment("")
      await loadComments()
    } catch (error) {
      console.error("Erreur envoi commentaire:", error)
      setError("Erreur lors de l'envoi du commentaire")
    }
  }

  const rootComments = comments.filter((c) => !c.parent_id)
  const borderTop = isDark ? "border-white/10" : "border-violet-200/70"
  const titleClass = isDark ? "text-white" : "text-gray-800"
  const countClass = isDark ? "text-purple-300/50" : "text-violet-800/55"
  const inputClass = isDark
    ? "bg-white/10 border-white/20 text-white placeholder-white/40"
    : "bg-white border-violet-200 text-gray-800 placeholder:text-violet-500/55"
  const emptyClass = isDark ? "text-purple-300/40" : "text-violet-800/55"
  const primaryButton = isDark ? "bg-violet-600 hover:bg-violet-500 text-white" : "bg-violet-700 hover:bg-violet-800 text-white"

  return (
    <div className={`mt-6 pt-6 border-t ${borderTop}`}>
      <h4 className={`text-lg font-semibold mb-4 ${titleClass}`}>
        Commentaires
        <span className={`text-sm ml-2 ${countClass}`}>({comments.length})</span>
      </h4>

      {error && (
        <div className="bg-red-500/20 border border-red-500 text-red-200 px-3 py-2 rounded-lg mb-3 text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="mb-6">
        <div className="flex gap-2">
          <input type="text" value={newComment} onChange={(e) => setNewComment(e.target.value)}
            className={`flex-1 px-4 py-3 rounded-lg border focus:outline-none focus:border-purple-400 transition ${inputClass}`}
            placeholder="Ecrire un commentaire..." />
          <button type="submit" className={`px-5 py-3 font-medium rounded-lg transition ${primaryButton}`}>Envoyer</button>
        </div>
      </form>

      {loading ? (
        <p className={`text-sm text-center py-4 ${emptyClass}`}>Chargement...</p>
      ) : rootComments.length === 0 ? (
        <p className={`text-sm text-center py-4 ${emptyClass}`}>Aucun commentaire. Soyez le premier !</p>
      ) : (
        <div className="flex flex-col gap-2">
          {rootComments.map((comment) => (
            <SingleComment
              key={comment.id}
              comment={comment}
              allComments={comments}
              articleId={articleId}
              articleAuthorId={articleAuthorId}
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
