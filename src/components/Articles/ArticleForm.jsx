// ============================================================
// ArticleForm.jsx — VERSION AVEC UPLOAD DE MÉDIAS
//
// Ajout : les utilisateurs peuvent attacher des images et vidéos
// à leurs articles. Les fichiers sont envoyés au backend Flask
// qui les stocke dans le dossier uploads/.
//
// Formats acceptés :
// - Images : PNG, JPG, JPEG, GIF, WEBP
// - Vidéos : MP4, WEBM, MOV
// - Taille max : 50 Mo par fichier
// ============================================================

import { useState } from "react"

function ArticleForm({ articleToEdit, onCreate, onUpdate, onDone }) {
  const [title, setTitle] = useState(articleToEdit?.title || "")
  const [content, setContent] = useState(articleToEdit?.content || "")
  const [isPublic, setIsPublic] = useState(articleToEdit?.is_public ?? true)
  const [allowComments, setAllowComments] = useState(articleToEdit?.allow_comments ?? true)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // --- États pour les médias ---
  // selectedFiles : les fichiers choisis par l'utilisateur (pas encore envoyés)
  // previews : les URLs de prévisualisation générées par le navigateur
  const [selectedFiles, setSelectedFiles] = useState([])
  const [previews, setPreviews] = useState([])

  const isEditMode = !!articleToEdit

  // ========================
  // QUAND L'UTILISATEUR CHOISIT DES FICHIERS
  // ========================
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files)

    // Vérifier le nombre de fichiers (max 5)
    if (files.length + selectedFiles.length > 5) {
      setError("Maximum 5 fichiers par article")
      return
    }

    // Vérifier la taille de chaque fichier (max 50 Mo)
    const maxSize = 50 * 1024 * 1024
    for (const file of files) {
      if (file.size > maxSize) {
        setError(`Le fichier "${file.name}" depasse 50 Mo`)
        return
      }
    }

    setError("")

    // Ajouter les nouveaux fichiers à la liste existante
    setSelectedFiles((prev) => [...prev, ...files])

    // Créer des URLs de prévisualisation pour chaque fichier
    // URL.createObjectURL() génère une URL temporaire locale
    // qui permet d'afficher l'image/vidéo AVANT l'envoi au serveur
    const newPreviews = files.map((file) => ({
      url: URL.createObjectURL(file),
      type: file.type.startsWith("video/") ? "video" : "image",
      name: file.name,
    }))
    setPreviews((prev) => [...prev, ...newPreviews])
  }

  // ========================
  // RETIRER UN FICHIER DE LA SÉLECTION
  // ========================
  const removeFile = (index) => {
    // Libérer l'URL de prévisualisation pour éviter les fuites mémoire
    URL.revokeObjectURL(previews[index].url)

    setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
    setPreviews((prev) => prev.filter((_, i) => i !== index))
  }

  // ========================
  // SOUMISSION DU FORMULAIRE
  // ========================
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

    let result

    if (isEditMode) {
      // Mode modification : pas d'upload de médias pour l'instant
      // (on pourrait l'ajouter plus tard)
      result = await onUpdate(articleToEdit.id, {
        title: title.trim(),
        content: content.trim(),
        is_public: isPublic,
        allow_comments: allowComments,
      })
    } else {
      // Mode création : utiliser FormData si des fichiers sont sélectionnés
      if (selectedFiles.length > 0) {
        // FormData est le format standard pour envoyer des fichiers via HTTP.
        // C'est comme un formulaire HTML classique avec enctype="multipart/form-data".
        const formData = new FormData()
        formData.append("title", title.trim())
        formData.append("content", content.trim())
        formData.append("is_public", isPublic.toString())
        formData.append("allow_comments", allowComments.toString())

        // Ajouter chaque fichier au FormData
        // Le même nom "media" est utilisé pour tous les fichiers
        // Flask les récupère avec request.files.getlist("media")
        for (const file of selectedFiles) {
          formData.append("media", file)
        }

        result = await onCreate(formData)
      } else {
        // Pas de fichiers → envoi JSON classique
        result = await onCreate({
          title: title.trim(),
          content: content.trim(),
          is_public: isPublic,
          allow_comments: allowComments,
        })
      }
    }

    setIsLoading(false)

    if (result && !result.success) {
      setError(result.message)
    }
  }

  // ========================
  // AFFICHAGE
  // ========================
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
        {/* Champ : Titre */}
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

        {/* Champ : Contenu */}
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

        {/* ── UPLOAD DE MÉDIAS ── */}
        {/* Affiché uniquement en mode création (pas modification) */}
        {!isEditMode && (
          <div className="mb-4">
            <label className="block text-purple-200 text-sm mb-2">
              Photos et videos (optionnel, max 5 fichiers)
            </label>

            {/* Zone de sélection de fichiers */}
            {/* accept : restreint le sélecteur de fichiers aux types autorisés */}
            {/* multiple : permet de sélectionner plusieurs fichiers d'un coup */}
            <div className="relative">
              <input
                type="file"
                onChange={handleFileChange}
                accept="image/png,image/jpg,image/jpeg,image/gif,image/webp,video/mp4,video/webm,video/quicktime"
                multiple
                className="hidden"
                id="media-upload"
              />
              {/* Label stylisé qui sert de bouton d'upload */}
              {/* htmlFor="media-upload" lie ce label au input caché */}
              <label
                htmlFor="media-upload"
                className="flex items-center justify-center gap-2 w-full py-4 border-2 border-dashed border-white/20 rounded-lg cursor-pointer hover:border-purple-400 hover:bg-white/5 transition"
              >
                <span className="text-2xl">📎</span>
                <span className="text-purple-200/70">
                  Cliquer pour ajouter des photos ou vidéos
                </span>
              </label>
            </div>

            {/* ── PRÉVISUALISATIONS ── */}
            {previews.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
                {previews.map((preview, index) => (
                  <div key={index} className="relative group rounded-lg overflow-hidden">
                    {/* Afficher l'image ou la vidéo */}
                    {preview.type === "image" ? (
                      <img
                        src={preview.url}
                        alt={preview.name}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    ) : (
                      <video
                        src={preview.url}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    )}

                    {/* Bouton supprimer (visible au survol) */}
                    {/* group-hover : s'affiche quand on survole le parent .group */}
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                    >
                      ✕
                    </button>

                    {/* Badge video */}
                    {preview.type === "video" && (
                      <span className="absolute bottom-1 left-1 px-2 py-0.5 text-xs bg-black/60 text-white rounded">
                        Vidéo
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}

            <p className="text-purple-300/40 text-xs mt-2">
              Formats : PNG, JPG, GIF, WEBP, MP4, WEBM, MOV — Max 50 Mo par fichier
            </p>
          </div>
        )}

        {/* Options */}
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

        {/* Boutons */}
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