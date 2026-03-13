import { useState } from "react"

function ArticleForm({ articleToEdit, onCreate, onUpdate, onDone }) {
  // Initialiser les états directement avec les valeurs de articleToEdit
  // Si articleToEdit existe → mode modification (on pré-remplit)
  // Sinon → mode création (champs vides)
  const [title, setTitle] = useState(articleToEdit?.title || "")
  const [content, setContent] = useState(articleToEdit?.content || "")
  const [isPublic, setIsPublic] = useState(articleToEdit?.is_public ?? true)
  const [allowComments, setAllowComments] = useState(articleToEdit?.allow_comments ?? true)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const isEditMode = !!articleToEdit

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    if (!title.trim()) {
      setError("Le titre est obligatoire")
      return
    }
    if (!content.trim()) {
      setError("Le contenu est obligatoire")
      return
    }
    if (title.trim().length < 3) {
      setError("Le titre doit contenir au moins 3 caracteres")
      return
    }

    setIsLoading(true)

    const data = {
      title: title.trim(),
      content: content.trim(),
      is_public: isPublic,
      allow_comments: allowComments,
    }

    let result
    if (isEditMode) {
      result = await onUpdate(articleToEdit.id, data)
    } else {
      result = await onCreate(data)
    }

    setIsLoading(false)

    if (result && !result.success) {
      setError(result.message)
    }
  }

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/10">
      <h3 className="text-xl font-bold text-white mb-6">
        {isEditMode ? "Modifier l'article" : "Creer un nouvel article"}
      </h3>

      {error && (
        <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-purple-200 text-sm mb-2">Titre</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-purple-400 transition"
            placeholder="Un titre accrocheur..."
          />
        </div>

        <div className="mb-4">
          <label className="block text-purple-200 text-sm mb-2">Contenu</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={6}
            className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-purple-400 transition resize-y"
            placeholder="Ecrivez votre article ici..."
          />
        </div>

        <div className="flex flex-col gap-3 mb-6">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="w-5 h-5 rounded"
            />
            <span className="text-purple-200">Article public</span>
            <span className="text-purple-300/50 text-sm">
              {isPublic ? "(visible par vos amis)" : "(visible uniquement par vous)"}
            </span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={allowComments}
              onChange={(e) => setAllowComments(e.target.checked)}
              className="w-5 h-5 rounded"
            />
            <span className="text-purple-200">Autoriser les commentaires</span>
          </label>
        </div>




        <div className="flex gap-3">
            
          <button

            type="submit"
            disabled={isLoading}
            className="flex-1 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition disabled:opacity-50"
          >
            {isLoading ? "En cours..." : isEditMode ? "Enregistrer" : "Publier"}
          </button>

          <button
            type="button"
            onClick={onDone}
            className="px-6 py-3 bg-white/10 text-white/60 rounded-lg hover:bg-white/20 transition"
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  )
}

export default ArticleForm