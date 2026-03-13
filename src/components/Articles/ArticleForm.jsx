// ============================================================
// ArticleForm.jsx
// FORMULAIRE DE CRÉATION ET DE MODIFICATION D'ARTICLE
//
// Ce composant fait DEUX choses selon la situation :
// - Si on lui passe un article existant → mode MODIFICATION
// - Si on ne lui passe rien → mode CRÉATION
//
// C'est le même formulaire, mais pré-rempli ou vide.
// Cela évite de créer deux composants séparés pour la même chose.
// ============================================================

import { useState } from "react"
import { useArticles } from "../../context/ArticleContext"

// --- Props ---
// articleToEdit : l'article à modifier (null si on crée un nouveau)
// onDone : fonction appelée quand on a fini (créer ou modifier)
//          Le parent l'utilise pour fermer le formulaire
function ArticleForm({ articleToEdit, onDone }) {
// --- Déterminer le mode ---
  const isEditMode = !!articleToEdit

  // --- États du formulaire ---
  // Au lieu d'utiliser useEffect pour pré-remplir les champs,
  // on initialise directement useState avec les bonnes valeurs.
  // Si articleToEdit existe → on prend ses valeurs (mode modification)
  // Sinon → valeurs par défaut vides (mode création)
  // L'opérateur "?." (optional chaining) évite une erreur si articleToEdit est null :
  //   articleToEdit?.title → retourne le titre si articleToEdit existe, sinon undefined
  //   ?? "" → si le résultat est undefined, on met "" (chaîne vide) à la place
  const [title, setTitle] = useState(articleToEdit?.title ?? "")
  const [content, setContent] = useState(articleToEdit?.content ?? "")
  const [isPublic, setIsPublic] = useState(articleToEdit?.isPublic ?? true)
  const [allowComments, setAllowComments] = useState(articleToEdit?.allowComments ?? true)
  const [error, setError] = useState("")

  // --- Outils ---
  const { createArticle, updateArticle } = useArticles()


  // ========================
  // SOUMISSION DU FORMULAIRE
  // ========================
  const handleSubmit = (e) => {
    e.preventDefault()
    setError("")

    // --- Validations ---
    if (!title.trim()) {
      setError("Le titre est obligatoire")
      return
    }
    // trim() enlève les espaces au début et à la fin.
    // Ça empêche de soumettre un titre qui ne contient que des espaces.

    if (!content.trim()) {
      setError("Le contenu est obligatoire")
      return
    }

    if (title.trim().length < 3) {
      setError("Le titre doit contenir au moins 3 caractères")
      return
    }

    // --- Créer ou Modifier selon le mode ---
    if (isEditMode) {
      // MODE MODIFICATION
      const result = updateArticle(articleToEdit.id, {
        title: title.trim(),
        content: content.trim(),
        isPublic,
        allowComments,
      })

      if (!result.success) {
        setError(result.message)
        return
      }
    } else {
      // MODE CRÉATION
      const result = createArticle({
        title: title.trim(),
        content: content.trim(),
        isPublic,
        allowComments,
      })

      if (!result.success) {
        setError(result.message)
        return
      }
    }

    // Tout s'est bien passé → on appelle onDone()
    // Le parent fermera le formulaire
    onDone()
  }

  // ========================
  // AFFICHAGE
  // ========================
  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/10">
      {/* --- TITRE DU FORMULAIRE --- */}
      <h3 className="text-xl font-bold text-white mb-6">
        {isEditMode ? "Modifier l'article" : "Créer un nouvel article"}
      </h3>

      {/* --- MESSAGE D'ERREUR --- */}
      {error && (
        <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Champ : Titre */}
        <div className="mb-4">
          <label className="block text-purple-200 text-sm mb-2">
            Titre de l'article
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-purple-400 transition"
            placeholder="Un titre accrocheur..."
          />
        </div>

        {/* Champ : Contenu */}
        {/* textarea au lieu de input car le contenu peut être long */}
        {/* rows={6} définit la hauteur initiale (6 lignes) */}
        <div className="mb-4">
          <label className="block text-purple-200 text-sm mb-2">
            Contenu
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={6}
            className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-purple-400 transition resize-y"
            placeholder="Écrivez votre article ici..."
          />
        </div>

        {/* --- OPTIONS (TOGGLES) --- */}
        {/* Ces deux options sont des cases à cocher stylisées */}
        <div className="flex flex-col gap-3 mb-6">

          {/* Option : Public ou Privé */}
          <label className="flex items-center gap-3 cursor-pointer">
            {/* L'input checkbox est caché visuellement mais reste fonctionnel */}
            {/* checked={isPublic} : la case est cochée si isPublic est true */}
            {/* onChange : quand on clique, on inverse la valeur (true→false, false→true) */}
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="w-5 h-5 rounded bg-white/10 border-white/20 text-purple-500 focus:ring-purple-400"
            />
            <span className="text-purple-200">
              Article public
            </span>
            <span className="text-purple-300/50 text-sm">
              {isPublic
                ? "(visible par vos amis)"
                : "(visible uniquement par vous)"}
            </span>
          </label>

          {/* Option : Autoriser les commentaires */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={allowComments}
              onChange={(e) => setAllowComments(e.target.checked)}
              className="w-5 h-5 rounded bg-white/10 border-white/20 text-purple-500 focus:ring-purple-400"
            />
            <span className="text-purple-200">
              Autoriser les commentaires
            </span>
          </label>
        </div>

        {/* --- BOUTONS --- */}
        <div className="flex gap-3">
          {/* Bouton principal : Créer ou Modifier */}
          <button
            type="submit"
            className="flex-1 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition duration-200 shadow-lg"
          >
            {isEditMode ? "Enregistrer les modifications" : "Publier l'article"}
          </button>

          {/* Bouton Annuler : ferme le formulaire sans sauvegarder */}
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