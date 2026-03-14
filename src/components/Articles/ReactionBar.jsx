import { useState } from "react"
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
  const [showPicker, setShowPicker] = useState(false)

  const totalReactions = Object.values(counts).reduce((sum, c) => sum + c, 0)

  const handleEmojiClick = async (emojiType) => {
    try {
      const response = await articlesAPI.react(articleId, emojiType)

      // Mettre à jour les compteurs localement
      const action = response.data.action
      const newCounts = { ...counts }

      if (action === "added") {
        newCounts[emojiType] = (newCounts[emojiType] || 0) + 1
      } else if (action === "removed") {
        newCounts[emojiType] = Math.max((newCounts[emojiType] || 0) - 1, 0)
      }

      setCounts(newCounts)
    } catch (error) {
      console.error("Erreur reaction:", error)
    }

    setShowPicker(false)
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {AVAILABLE_EMOJIS.map((emojiData) => {
        const count = counts[emojiData.type] || 0
        if (count === 0) return null

        return (
          <button
            key={emojiData.type}
            onClick={() => handleEmojiClick(emojiData.type)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full text-sm bg-white/10 border border-white/10 hover:bg-white/20 transition"
            title={emojiData.label}
          >
            <span>{emojiData.emoji}</span>
            <span className="text-white/80 text-xs">{count}</span>
          </button>
        )
      })}

      <div className="relative">
        <button
          onClick={() => setShowPicker(!showPicker)}
          className="flex items-center justify-center w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white/60 text-sm transition"
        >
          {showPicker ? "✕" : "+"}
        </button>

        {showPicker && (
          <div className="absolute bottom-full left-0 mb-2 bg-slate-800 border border-white/20 rounded-xl p-2 flex gap-1 shadow-xl z-10">
            {AVAILABLE_EMOJIS.map((emojiData) => (
              <button
                key={emojiData.type}
                onClick={() => handleEmojiClick(emojiData.type)}
                className="w-9 h-9 flex items-center justify-center rounded-lg text-lg transition hover:scale-125 hover:bg-white/10"
                title={emojiData.label}
              >
                {emojiData.emoji}
              </button>
            ))}
          </div>
        )}
      </div>

      {totalReactions > 0 && (
        <span className="text-purple-300/40 text-xs ml-1">
          {totalReactions} reaction{totalReactions !== 1 ? "s" : ""}
        </span>
      )}
    </div>
  )
}

export default ReactionBar