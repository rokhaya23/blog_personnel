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
    <div className="flex items-center gap-2 flex-wrap">
      {AVAILABLE_EMOJIS.map((emojiData) => {
        const count = counts[emojiData.type] || 0
        const isActive = myReaction === emojiData.type
        return (
          <button
            key={emojiData.type}
            onClick={() => handleEmojiClick(emojiData.type)}
            disabled={isSubmitting}
            className="flex items-center gap-1 text-lg transition disabled:opacity-60"
            title={emojiData.label}
            style={{ background: "transparent", border: "none", padding: 0, color: isDark ? "#e5e7eb" : "#0f172a" }}
          >
            <span className={isActive ? "scale-110" : ""}>{emojiData.emoji}</span>
            {count > 0 && (
              <span className="text-xs font-semibold" style={{ color: isDark ? "#cbd5e1" : "#334155" }}>
                {count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

export default ReactionBar
