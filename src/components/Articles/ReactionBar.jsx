import { useEffect, useState } from "react"
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

function ReactionBar({ articleId, reactionsCount, currentUserReaction }) {
  const [counts, setCounts] = useState(reactionsCount || {})
  const [myReaction, setMyReaction] = useState(currentUserReaction || null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { isDark } = useTheme()

  useEffect(() => {
    setCounts(reactionsCount || {})
  }, [reactionsCount])

  useEffect(() => {
    setMyReaction(currentUserReaction || null)
  }, [currentUserReaction])

  const totalReactions = Object.values(counts).reduce((sum, c) => sum + c, 0)

  const handleEmojiClick = async (emojiType) => {
    if (isSubmitting) return

    setIsSubmitting(true)
    try {
      const response = await articlesAPI.react(articleId, emojiType)
      setCounts(response.data.reactions_count || {})
      setMyReaction(response.data.current_user_reaction || null)
    } catch (error) {
      console.error("Erreur reaction:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div>
      <p className={`text-xs mb-2 ${isDark ? "text-blue-200/60" : "text-blue-800/65"}`}>
        Réagir à cet article :
      </p>
      <div className="flex items-center gap-1.5 flex-wrap">
        {AVAILABLE_EMOJIS.map((emojiData) => {
          const count = counts[emojiData.type] || 0
          const hasReactions = count > 0
          const isActive = myReaction === emojiData.type

          return (
            <button
              key={emojiData.type}
              onClick={() => handleEmojiClick(emojiData.type)}
              disabled={isSubmitting}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-sm transition disabled:opacity-70 ${
                isActive
                  ? isDark
                    ? "bg-blue-700/25 border border-blue-400/50 text-white"
                    : "bg-blue-200 border border-blue-400 text-blue-950"
                  : hasReactions
                  ? isDark
                    ? "bg-blue-500/15 border border-blue-400/30"
                    : "bg-blue-50 border border-blue-200"
                  : isDark
                  ? "bg-white/5 border border-white/10 hover:bg-white/15"
                  : "bg-white border border-blue-200 hover:bg-blue-50"
              }`}
              title={emojiData.label}
            >
              <span className="text-base">{emojiData.emoji}</span>
              {hasReactions && (
                <span className={`text-xs font-medium ${isDark ? "text-white/80" : "text-blue-900"}`}>{count}</span>
              )}
            </button>
          )
        })}

        {totalReactions > 0 && (
          <span className={`text-xs ml-2 ${isDark ? "text-blue-200/60" : "text-blue-800/60"}`}>
            {totalReactions} reaction{totalReactions !== 1 ? "s" : ""}
          </span>
        )}
      </div>
    </div>
  )
}

export default ReactionBar
