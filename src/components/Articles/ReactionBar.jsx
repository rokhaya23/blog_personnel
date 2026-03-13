// ============================================================
// ReactionBar.jsx
// BARRE DE RÉACTIONS EMOJI
//
// Affiche sous chaque article ou commentaire :
// - Les emojis avec leur compteur (ex: 👍 3  ❤️ 1)
// - Un bouton "+" pour ouvrir le sélecteur d'emojis
// - Le sélecteur avec les 6 emojis disponibles
//
// Ce composant est RÉUTILISABLE : il fonctionne aussi bien
// pour les articles que pour les commentaires grâce aux props
// targetType ("article" ou "comment") et targetId.
// ============================================================

import { useState } from "react"
import { useReactions, AVAILABLE_EMOJIS } from "../../context/ReactionContext"

// --- Props ---
// targetType : "article" ou "comment"
// targetId : l'id de l'article ou du commentaire
function ReactionBar({ targetType, targetId }) {
  // --- États ---
  // showPicker : affiche/masque le sélecteur d'emojis
  const [showPicker, setShowPicker] = useState(false)

  // --- Outils ---
  const { toggleReaction, getReactionCounts, getMyReaction } = useReactions()

  // Récupérer les compteurs et ma réaction actuelle
  const counts = getReactionCounts(targetType, targetId)
  const myReaction = getMyReaction(targetType, targetId)

  // Calculer le total de toutes les réactions
  // Object.values(counts) → [3, 1, 0, ...] → on additionne tout
  const totalReactions = Object.values(counts).reduce(
    (sum, count) => sum + count,
    0
  )

  // ========================
  // CLIQUER SUR UN EMOJI
  // ========================
  const handleEmojiClick = (emojiType) => {
    toggleReaction(targetType, targetId, emojiType)
    setShowPicker(false) // Fermer le sélecteur après le clic
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* --- EMOJIS AVEC COMPTEURS --- */}
      {/* On parcourt les emojis disponibles et on affiche */}
      {/* uniquement ceux qui ont au moins 1 réaction */}
      {AVAILABLE_EMOJIS.map((emojiData) => {
        const count = counts[emojiData.type] || 0

        // Si personne n'a utilisé cet emoji, on ne l'affiche pas
        if (count === 0) return null

        // Est-ce que MOI j'ai utilisé cet emoji ?
        const isMyReaction = myReaction === emojiData.type

        return (
          <button
            key={emojiData.type}
            onClick={() => handleEmojiClick(emojiData.type)}
            // Si c'est ma réaction, on la met en surbrillance (bordure violette)
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-sm transition ${
              isMyReaction
                ? "bg-purple-500/30 border border-purple-400"
                : "bg-white/10 border border-white/10 hover:bg-white/20"
            }`}
            // title : texte qui apparaît quand on survole le bouton
            title={emojiData.label}
          >
            <span>{emojiData.emoji}</span>
            <span className="text-white/80 text-xs">{count}</span>
          </button>
        )
      })}

      {/* --- BOUTON "+" POUR OUVRIR LE SÉLECTEUR --- */}
      <div className="relative">
        <button
          onClick={() => setShowPicker(!showPicker)}
          className="flex items-center justify-center w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white/60 text-sm transition"
          title="Ajouter une réaction"
        >
          {showPicker ? "✕" : "+"}
        </button>

        {/* --- SÉLECTEUR D'EMOJIS (popup) --- */}
        {/* Position "absolute" : le sélecteur flotte au-dessus du contenu */}
        {/* Il ne pousse pas les autres éléments */}
        {showPicker && (
          <div className="absolute bottom-full left-0 mb-2 bg-slate-800 border border-white/20 rounded-xl p-2 flex gap-1 shadow-xl z-10">
            {AVAILABLE_EMOJIS.map((emojiData) => (
              <button
                key={emojiData.type}
                onClick={() => handleEmojiClick(emojiData.type)}
                className={`w-9 h-9 flex items-center justify-center rounded-lg text-lg transition hover:scale-125 ${
                  myReaction === emojiData.type
                    ? "bg-purple-500/30"
                    : "hover:bg-white/10"
                }`}
                title={emojiData.label}
              >
                {emojiData.emoji}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* --- TOTAL (si au moins 1 réaction) --- */}
      {totalReactions > 0 && (
        <span className="text-purple-300/40 text-xs ml-1">
          {totalReactions} réaction{totalReactions !== 1 ? "s" : ""}
        </span>
      )}
    </div>
  )
}

export default ReactionBar