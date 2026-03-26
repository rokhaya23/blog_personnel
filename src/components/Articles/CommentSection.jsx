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

  const borderClass = isDark ? "border-blue-500/30" : "border-blue-200/80"
  const commentBg = isDark ? "bg-white/5" : "bg-white border border-blue-200/80 shadow-sm"
  const nameClass = isDark ? "text-blue-100" : "text-slate-900"
  const dateClass = isDark ? "text-blue-200/55" : "text-slate-600"
  const contentClass = isDark ? "text-slate-100/85" : "text-slate-700"
  const inputClass = isDark
    ? "bg-white/10 border-white/20 text-white placeholder-white/40"
    : "bg-white border-blue-200 text-gray-800 placeholder:text-blue-500/55"
  const secondaryAction = isDark ? "text-blue-200/70 hover:text-blue-100" : "text-blue-700/70 hover:text-blue-800"
  const primaryButton = isDark ? "bg-blue-600 hover:bg-blue-500 text-white" : "bg-blue-600 hover:bg-blue-700 text-white"

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
            <button
              onClick={() => setShowReplyForm(!showReplyForm)}
              className={`text-xs px-3 py-1 rounded-md transition ${primaryButton}`}
            >
              {showReplyForm ? "Annuler" : "Répondre"}
            </button>
          )}
          {canDelete && (
            <>
              {showConfirmDelete ? (
                <div className="flex gap-2">
                  <button onClick={handleDelete} className="text-xs text-blue-300 hover:text-blue-100 transition">Confirmer</button>
                  <button onClick={() => setShowConfirmDelete(false)} className={`text-xs px-3 py-1 rounded-md transition ${secondaryAction}`}>Annuler</button>
                </div>
              ) : (
                <button onClick={() => setShowConfirmDelete(true)} className="text-xs px-3 py-1 rounded-md bg-slate-800/70 hover:bg-slate-700 text-white transition">
                  Supprimer
                </button>
              )}
            </>
          )}
        </div>
        {showReplyForm && (
          <form onSubmit={handleReply} className="mt-3">
            <div className="flex gap-2">
              <input type="text" value={replyContent} onChange={(e) => setReplyContent(e.target.value)}
                className={`flex-1 px-3 py-2 text-sm rounded-lg border focus:outline-none focus:border-blue-400 transition ${inputClass}`}
                placeholder={`Répondre à ${comment.author_name}...`} />
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
  const borderTop = isDark ? "border-white/10" : "border-blue-200/70"
  const titleClass = isDark ? "text-white" : "text-gray-800"
  const countClass = isDark ? "text-blue-200/60" : "text-blue-800/60"
  const inputClass = isDark
    ? "bg-white/10 border-white/20 text-white placeholder-white/40"
    : "bg-white border-blue-200 text-gray-800 placeholder:text-blue-500/55"
  const emptyClass = isDark ? "text-blue-200/50" : "text-blue-800/60"
  const primaryButton = isDark ? "bg-blue-600 hover:bg-blue-500 text-white" : "bg-blue-600 hover:bg-blue-700 text-white"

  return (
    <div className={`mt-6 pt-6 border-t ${borderTop}`}>
      <h4 className={`text-lg font-semibold mb-4 ${titleClass}`}>
        Commentaires
        <span className={`text-sm ml-2 ${countClass}`}>({comments.length})</span>
      </h4>

      {error && (
        <div className="bg-blue-500/15 border border-blue-400 text-blue-900 px-3 py-2 rounded-lg mb-3 text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="mb-6">
        <div className="flex gap-2">
          <input type="text" value={newComment} onChange={(e) => setNewComment(e.target.value)}
            className={`flex-1 px-4 py-3 rounded-lg border focus:outline-none focus:border-blue-400 transition ${inputClass}`}
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
