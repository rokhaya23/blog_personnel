import { useState, useEffect } from "react"
import { commentsAPI } from "../../services/api"
import { useAuth } from "../../context/AuthContext"

function CommentSection({ articleId }) {
  const { currentUser } = useAuth()
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)

  // Charger les commentaires
  const loadComments = async () => {
    try {
      const response = await commentsAPI.getByArticle(articleId)
      setComments(response.data)
    } catch (error) {
      console.error("Erreur chargement commentaires:", error)
    }
    setLoading(false)
  }

  useEffect(() => {
    const fetchComments = async () => {
      await loadComments()
    }
    fetchComments()
  }, [articleId])

  // Poster un commentaire
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    if (!newComment.trim()) {
      setError("Le commentaire ne peut pas etre vide")
      return
    }

    try {
      await commentsAPI.create(articleId, newComment)
      setNewComment("")
      await loadComments() // Recharger la liste
    } catch (error) {
      setError(error.response?.data?.message || "Erreur")
    }
  }

  // Supprimer un commentaire
  const handleDelete = async (commentId) => {
    try {
      await commentsAPI.delete(commentId)
      await loadComments()
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
  
  <div className="mt-6 pt-6 border-t border-white/10">
      <h4 className="text-lg font-semibold text-white mb-4">
        Commentaires
        <span className="text-purple-300/50 text-sm ml-2">({comments.length})</span>
      </h4>

      {/* FORMULAIRE */}
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

      {/* LISTE */}
      {loading ? (
        <p className="text-purple-300/40 text-sm text-center py-4">Chargement...</p>
      ) : comments.length === 0 ? (
        <p className="text-purple-300/40 text-sm text-center py-4">
          Aucun commentaire. Soyez le premier !
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {comments.map((comment) => (
            <div key={comment.id} className="bg-white/5 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-purple-300 font-medium text-sm">
                  {comment.author_name}
                </span>
                <span className="text-purple-300/40 text-xs">
                  {formatDate(comment.created_at)}
                </span>
              </div>
              <p className="text-purple-100/80 text-sm">{comment.content}</p>
              {currentUser.id === comment.author_id && (
                <button
                  onClick={() => handleDelete(comment.id)}
                  className="text-xs text-red-400/60 hover:text-red-300 mt-2 transition"
                >
                  Supprimer
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default CommentSection