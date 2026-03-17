// ============================================================
// ReactionBar.jsx — VERSION AMÉLIORÉE
//
// Les emojis sont maintenant TOUJOURS visibles (pas juste un +).
// L'utilisateur voit directement 👍❤️😂😮😢😡 et clique dessus.
// Les emojis avec des réactions ont un compteur affiché.
// ============================================================

import { useState, useEffect } from "react"
import { articlesAPI } from "../../services/api"

const AVAILABLE_EMOJIS = [
  { type: "like", emoji: "👍", label: "J'aime" },
  { type: "love", emoji: "❤️", label: "J'adore" },
  { type: "haha", emoji: "😂", label: "Haha" },
  { type: "wow", emoji: "😮", label: "Wow" },
  { type: "sad", emoji: "😢", label: "Triste" },
  { type: "angry", emoji: "😡", label: "Grrr" },
]

function ReactionBar({ articleId, reactionsCount }) {
  const [counts, setCounts] = useState(reactionsCount || {})

  useEffect(() => {
    setCounts(reactionsCount || {})
  }, [reactionsCount])

  const totalReactions = Object.values(counts).reduce((sum, c) => sum + c, 0)

  const handleEmojiClick = async (emojiType) => {
    try {
      const response = await articlesAPI.react(articleId, emojiType)
      if (response.data?.reactions_count) {
        setCounts(response.data.reactions_count)
      }
    } catch (error) {
      console.error("Erreur reaction:", error)
    }
  }

  return (
    <div>
      {/* ── LABEL "Réagir" pour guider l'utilisateur ── */}
      <p className="text-purple-300/50 text-xs mb-2">Reagir a cet article :</p>

      {/* ── TOUS LES EMOJIS TOUJOURS VISIBLES ── */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {AVAILABLE_EMOJIS.map((emojiData) => {
          const count = counts[emojiData.type] || 0
          const hasReactions = count > 0

          return (
            <button
              key={emojiData.type}
              onClick={() => handleEmojiClick(emojiData.type)}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-sm transition hover:scale-110 ${
                hasReactions
                  ? "bg-purple-500/20 border border-purple-400/40"
                  : "bg-white/5 border border-white/10 hover:bg-white/15"
              }`}
              title={emojiData.label}
            >
              <span className="text-base">{emojiData.emoji}</span>
              {/* Afficher le compteur uniquement si > 0 */}
              {hasReactions && (
                <span className="text-white/80 text-xs font-medium">{count}</span>
              )}
            </button>
          )
        })}

        {/* Total des réactions */}
        {totalReactions > 0 && (
          <span className="text-purple-300/40 text-xs ml-2">
            {totalReactions} reaction{totalReactions !== 1 ? "s" : ""}
          </span>
        )}
      </div>
    </div>
  )
}

export default ReactionBar
