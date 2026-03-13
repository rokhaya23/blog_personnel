// ============================================================
// ReactionContext.jsx
// GÈRE LES RÉACTIONS EMOJI SUR LES ARTICLES ET COMMENTAIRES
//
// Permet de :
// - Ajouter une réaction (emoji) sur un article ou un commentaire
// - Changer sa réaction (cliquer sur un autre emoji)
// - Retirer sa réaction (cliquer sur le même emoji)
// - Compter les réactions par type d'emoji
//
// Les emojis disponibles : 👍 ❤️ 😂 😮 😢 😡
// ============================================================

import { createContext, useContext, useState } from "react"
import { useAuth } from "./AuthContext"

// ---------- LISTE DES EMOJIS DISPONIBLES ----------
// On les définit ici pour les réutiliser partout.
// "export" permet aux autres fichiers d'importer cette liste.
export const AVAILABLE_EMOJIS = [
  { type: "like", emoji: "👍", label: "J'aime" },
  { type: "love", emoji: "❤️", label: "J'adore" },
  { type: "haha", emoji: "😂", label: "Haha" },
  { type: "wow", emoji: "😮", label: "Wow" },
  { type: "sad", emoji: "😢", label: "Triste" },
  { type: "angry", emoji: "😡", label: "Grrr" },
]

// ---------- RÉACTIONS FICTIVES (MOCK) ----------
const MOCK_REACTIONS = [
  {
    id: "r1",
    userId: "2",              // Rokhaye
    targetType: "article",    // C'est une réaction sur un ARTICLE
    targetId: "1",            // L'article "Mon premier article"
    emoji: "like",            // Type d'emoji
    createdAt: "2026-03-10T12:30:00",
  },
  {
    id: "r2",
    userId: "3",              // Amadou
    targetType: "article",
    targetId: "1",
    emoji: "love",
    createdAt: "2026-03-10T13:00:00",
  },
  {
    id: "r3",
    userId: "1",              // Lyliane
    targetType: "article",
    targetId: "3",            // L'article de Rokhaye
    emoji: "like",
    createdAt: "2026-03-11T11:00:00",
  },
  {
    id: "r4",
    userId: "1",              // Lyliane
    targetType: "comment",    // C'est une réaction sur un COMMENTAIRE
    targetId: "c1",           // Le commentaire de Rokhaye
    emoji: "love",
    createdAt: "2026-03-10T14:30:00",
  },
]

const ReactionContext = createContext(null)

export function ReactionProvider({ children }) {
  const [reactions, setReactions] = useState(MOCK_REACTIONS)
  const { currentUser } = useAuth()

  // ========================
  // BASCULER UNE RÉACTION (TOGGLE)
  // ========================
  // C'est la fonction principale. Elle gère 3 cas :
  //
  // Cas 1 : Je n'ai pas encore réagi → AJOUTER ma réaction
  // Cas 2 : J'ai réagi avec le MÊME emoji → RETIRER ma réaction
  // Cas 3 : J'ai réagi avec un AUTRE emoji → CHANGER ma réaction
  //
  // targetType : "article" ou "comment"
  // targetId : l'id de l'article ou du commentaire
  // emojiType : le type d'emoji cliqué ("like", "love", etc.)
  const toggleReaction = (targetType, targetId, emojiType) => {
    if (!currentUser) return

    // Chercher si j'ai déjà une réaction sur ce contenu
    const existingReaction = reactions.find(
      (r) =>
        r.userId === currentUser.id &&
        r.targetType === targetType &&
        r.targetId === targetId
    )

    if (existingReaction) {
      if (existingReaction.emoji === emojiType) {
        // CAS 2 : Même emoji → on retire la réaction
        // C'est comme un bouton "toggle" : cliquer une 2e fois annule
        setReactions(reactions.filter((r) => r.id !== existingReaction.id))
      } else {
        // CAS 3 : Emoji différent → on remplace
        // map() parcourt la liste et remplace juste celui qu'on veut
        setReactions(
          reactions.map((r) => {
            if (r.id === existingReaction.id) {
              return { ...r, emoji: emojiType }
            }
            return r
          })
        )
      }
    } else {
      // CAS 1 : Pas encore de réaction → on en crée une nouvelle
      const newReaction = {
        id: "r" + Date.now(),
        userId: currentUser.id,
        targetType,
        targetId,
        emoji: emojiType,
        createdAt: new Date().toISOString(),
      }
      setReactions([...reactions, newReaction])
    }
  }

  // ========================
  // RÉCUPÉRER LES RÉACTIONS D'UN CONTENU
  // ========================
  // Retourne toutes les réactions d'un article ou commentaire
  const getReactions = (targetType, targetId) => {
    return reactions.filter(
      (r) => r.targetType === targetType && r.targetId === targetId
    )
  }

  // ========================
  // COMPTER LES RÉACTIONS PAR EMOJI
  // ========================
  // Retourne un objet comme { like: 3, love: 1, haha: 0, ... }
  // Utile pour afficher "👍 3  ❤️ 1" sous un article
  const getReactionCounts = (targetType, targetId) => {
    const targetReactions = getReactions(targetType, targetId)

    // reduce() parcourt le tableau et construit un objet résumé
    // Pour chaque réaction, on incrémente le compteur de son emoji
    const counts = targetReactions.reduce((acc, reaction) => {
      acc[reaction.emoji] = (acc[reaction.emoji] || 0) + 1
      return acc
    }, {})

    return counts
  }

  // ========================
  // QUELLE EST MA RÉACTION SUR CE CONTENU ?
  // ========================
  // Retourne le type d'emoji si j'ai réagi, ou null sinon.
  // Utile pour mettre en surbrillance l'emoji que j'ai choisi.
  const getMyReaction = (targetType, targetId) => {
    if (!currentUser) return null

    const myReaction = reactions.find(
      (r) =>
        r.userId === currentUser.id &&
        r.targetType === targetType &&
        r.targetId === targetId
    )

    return myReaction ? myReaction.emoji : null
  }

  const value = {
    toggleReaction,     // Ajouter/changer/retirer une réaction
    getReactions,       // Toutes les réactions d'un contenu
    getReactionCounts,  // Compteur par emoji
    getMyReaction,      // Ma réaction actuelle
  }

  return (
    <ReactionContext.Provider value={value}>
      {children}
    </ReactionContext.Provider>
  )
}

export function useReactions() {
  const context = useContext(ReactionContext)
  if (!context) {
    throw new Error("useReactions doit être utilisé dans un ReactionProvider")
  }
  return context
}