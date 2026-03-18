import { useState } from "react"
import { articlesAPI } from "../../services/api"
import { useTheme } from "../../context/ThemeContext"

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
  const { isDark } = useTheme()

  const totalReactions = Object.values(counts).reduce((sum, c) => sum + c, 0)

  const handleEmojiClick = async (emojiType) => {
    try {
      const response = await articlesAPI.react(articleId, emojiType)
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
  }

  return (
    <div>
      <p className={`text-xs mb-2 ${isDark ? "text-purple-300/50" : "text-violet-900/60"}`}>
        Reagir a cet article :
      </p>
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
                  : isDark
                  ? "bg-white/5 border border-white/10 hover:bg-white/15"
                  : "bg-white border border-violet-200 hover:bg-violet-50"
              }`}
              title={emojiData.label}
            >
              <span className="text-base">{emojiData.emoji}</span>
              {hasReactions && (
                <span className={`text-xs font-medium ${isDark ? "text-white/80" : "text-violet-900"}`}>{count}</span>
              )}
            </button>
          )
        })}

        {totalReactions > 0 && (
          <span className={`text-xs ml-2 ${isDark ? "text-purple-300/40" : "text-violet-800/55"}`}>
            {totalReactions} reaction{totalReactions !== 1 ? "s" : ""}
          </span>
        )}
      </div>
    </div>
  )
}

export default ReactionBar
