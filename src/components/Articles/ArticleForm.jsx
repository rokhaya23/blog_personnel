import { useState } from "react"
import { useTheme } from "../../context/ThemeContext"

function ArticleForm({ articleToEdit, onCreate, onUpdate, onDone }) {
  const [title, setTitle] = useState(articleToEdit?.title || "")
  const [content, setContent] = useState(articleToEdit?.content || "")
  const [isPublic, setIsPublic] = useState(articleToEdit?.is_public ?? true)
  const [allowComments, setAllowComments] = useState(articleToEdit?.allow_comments ?? true)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState([])
  const [previews, setPreviews] = useState([])

  const { isDark } = useTheme()
  const isEditMode = !!articleToEdit

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files)
    if (files.length + selectedFiles.length > 5) {
      setError("Maximum 5 fichiers par article")
      return
    }
    const maxSize = 50 * 1024 * 1024
    for (const file of files) {
      if (file.size > maxSize) {
        setError(`Le fichier "${file.name}" depasse 50 Mo`)
        return
      }
    }
    setError("")
    setSelectedFiles((prev) => [...prev, ...files])
    const newPreviews = files.map((file) => ({
      url: URL.createObjectURL(file),
      type: file.type.startsWith("video/") ? "video" : "image",
      name: file.name,
    }))
    setPreviews((prev) => [...prev, ...newPreviews])
  }

  const removeFile = (index) => {
    URL.revokeObjectURL(previews[index].url)
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
    setPreviews((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    if (!title.trim()) { setError("Le titre est obligatoire"); return }
    if (!content.trim()) { setError("Le contenu est obligatoire"); return }
    if (title.trim().length < 3) { setError("Le titre doit contenir au moins 3 caracteres"); return }

    setIsLoading(true)
    let result

    if (isEditMode) {
      result = await onUpdate(articleToEdit.id, {
        title: title.trim(), content: content.trim(), is_public: isPublic, allow_comments: allowComments,
      })
    } else {
      if (selectedFiles.length > 0) {
        const formData = new FormData()
        formData.append("title", title.trim())
        formData.append("content", content.trim())
        formData.append("is_public", isPublic.toString())
        formData.append("allow_comments", allowComments.toString())
        for (const file of selectedFiles) { formData.append("media", file) }
        result = await onCreate(formData)
      } else {
        result = await onCreate({
          title: title.trim(), content: content.trim(), is_public: isPublic, allow_comments: allowComments,
        })
      }
    }

    setIsLoading(false)
    if (result && !result.success) { setError(result.message) }
  }

  // Classes dynamiques
  const cardClass = isDark
    ? "bg-white/10 backdrop-blur-lg border-white/10"
    : "bg-white/92 border-violet-200/70 shadow-[0_16px_34px_rgba(29,78,216,0.08)]"
  const titleClass = isDark ? "text-white" : "text-gray-800"
  const labelClass = isDark ? "text-purple-200" : "text-violet-900/80"
  const inputClass = isDark
    ? "bg-white/10 border-white/20 text-white placeholder-white/50"
    : "bg-white border-violet-200 text-gray-800 placeholder:text-violet-500/55"
  const checkLabel = isDark ? "text-purple-200" : "text-violet-900/80"
  const hintClass = isDark ? "text-purple-300/50" : "text-violet-800/55"
  const primaryButton = isDark
    ? "bg-slate-800 hover:bg-slate-700 text-white shadow-[0_14px_30px_rgba(15,23,42,0.32)]"
    : "bg-slate-900 hover:bg-slate-800 text-white shadow-[0_12px_28px_rgba(15,23,42,0.20)]"
  const neutralButton = isDark
    ? "bg-white/10 text-white/60 hover:bg-white/20"
    : "bg-white text-slate-600 hover:bg-violet-50 border border-violet-200"

  return (
    <div className={`rounded-xl p-6 border ${cardClass}`}>
      <h3 className={`text-xl font-bold mb-6 ${titleClass}`}>
        {isEditMode ? "Modifier l'article" : "Creer un nouvel article"}
      </h3>

      {error && (
        <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded-lg mb-4">{error}</div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className={`block text-sm mb-2 ${labelClass}`}>Titre</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:border-purple-400 transition ${inputClass}`}
            placeholder="Un titre accrocheur..."
          />
        </div>

        <div className="mb-4">
          <label className={`block text-sm mb-2 ${labelClass}`}>Contenu</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={6}
            className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:border-purple-400 transition resize-y ${inputClass}`}
            placeholder="Ecrivez votre article ici..."
          />
        </div>

        {/* Upload médias */}
        {!isEditMode && (
          <div className="mb-4">
            <label className={`block text-sm mb-2 ${labelClass}`}>Photos et videos (optionnel, max 5)</label>
            <div className="relative">
              <input type="file" onChange={handleFileChange} accept="image/png,image/jpg,image/jpeg,image/gif,image/webp,video/mp4,video/webm,video/quicktime" multiple className="hidden" id="media-upload" />
              <label
                htmlFor="media-upload"
                className={`flex items-center justify-center gap-2 w-full py-4 border-2 border-dashed rounded-lg cursor-pointer transition ${
                  isDark ? "border-white/20 hover:border-purple-400 hover:bg-white/5" : "border-violet-200 hover:border-violet-400 hover:bg-violet-50/60"
                }`}
              >
                <span className="text-2xl">📎</span>
                <span className={isDark ? "text-purple-200/70" : "text-violet-800/70"}>Cliquer pour ajouter des photos ou videos</span>
              </label>
            </div>

            {previews.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
                {previews.map((preview, index) => (
                  <div key={index} className="relative group rounded-lg overflow-hidden">
                    {preview.type === "image" ? (
                      <img src={preview.url} alt={preview.name} className="w-full h-32 object-cover rounded-lg" />
                    ) : (
                      <video src={preview.url} className="w-full h-32 object-cover rounded-lg" />
                    )}
                    <button type="button" onClick={() => removeFile(index)}
                      className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition">✕</button>
                    {preview.type === "video" && (
                      <span className="absolute bottom-1 left-1 px-2 py-0.5 text-xs bg-black/60 text-white rounded">Video</span>
                    )}
                  </div>
                ))}
              </div>
            )}
            <p className={`text-xs mt-2 ${hintClass}`}>PNG, JPG, GIF, WEBP, MP4, WEBM, MOV — Max 50 Mo</p>
          </div>
        )}

        {/* Options */}
        <div className="flex flex-col gap-3 mb-6">
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} className="w-5 h-5 rounded accent-violet-600" />
            <span className={checkLabel}>Article public</span>
            <span className={`text-sm ${hintClass}`}>{isPublic ? "(visible par vos amis)" : "(visible uniquement par vous)"}</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={allowComments} onChange={(e) => setAllowComments(e.target.checked)} className="w-5 h-5 rounded accent-violet-600" />
            <span className={checkLabel}>Autoriser les commentaires</span>
          </label>
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={isLoading}
            className={`flex-1 py-3 font-semibold rounded-lg transition disabled:opacity-50 ${primaryButton}`}>
            {isLoading ? "En cours..." : isEditMode ? "Enregistrer" : "Publier"}
          </button>
          <button type="button" onClick={onDone}
            className={`px-6 py-3 rounded-lg transition ${neutralButton}`}>
            Annuler
          </button>
        </div>
      </form>
    </div>
  )
}

export default ArticleForm
