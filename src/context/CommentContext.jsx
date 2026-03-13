// ============================================================
// CommentContext.jsx
// GÈRE TOUS LES COMMENTAIRES DE L'APPLICATION
//
// Permet de :
// - Ajouter un commentaire sous un article
// - Répondre à un commentaire existant (fil de discussion)
// - Supprimer un commentaire (par l'auteur du commentaire ou de l'article)
// - Récupérer les commentaires d'un article organisés en arbre
// ============================================================

import { createContext, useContext, useState } from "react"
import { useAuth } from "./AuthContext"

// ---------- COMMENTAIRES FICTIFS (MOCK) ----------
const MOCK_COMMENTS = [
  {
    id: "c1",
    articleId: "1",          // Commentaire sur l'article "Mon premier article"
    authorId: "2",           // Écrit par Rokhaye
    content: "Super article, bienvenue sur la plateforme !",
    parentId: null,          // null = commentaire racine (pas une réponse)
    createdAt: "2026-03-10T12:00:00",
  },
  {
    id: "c2",
    articleId: "1",
    authorId: "3",           // Écrit par Amadou
    content: "Merci pour le partage, hâte de lire la suite !",
    parentId: null,
    createdAt: "2026-03-10T13:30:00",
  },
  {
    id: "c3",
    articleId: "1",
    authorId: "1",           // Réponse de Lyliane (l'auteur de l'article)
    content: "Merci beaucoup Rokhaye, ça fait plaisir !",
    parentId: "c1",          // C'est une RÉPONSE au commentaire c1
    createdAt: "2026-03-10T14:00:00",
  },
  {
    id: "c4",
    articleId: "3",          // Commentaire sur l'article de Rokhaye
    authorId: "1",           // Écrit par Lyliane
    content: "Très intéressant, surtout la partie sur l'IA générative.",
    parentId: null,
    createdAt: "2026-03-11T10:00:00",
  },
]

const CommentContext = createContext(null)

export function CommentProvider({ children }) {
  const [comments, setComments] = useState(MOCK_COMMENTS)
  const { currentUser } = useAuth()

  // ========================
  // RÉCUPÉRER LES COMMENTAIRES D'UN ARTICLE
  // ========================
  // Retourne uniquement les commentaires RACINES (parentId === null)
  // d'un article donné. Les réponses seront récupérées séparément
  // par chaque commentaire avec getReplies().
  const getArticleComments = (articleId) => {
    return comments.filter(
      (c) => c.articleId === articleId && c.parentId === null
    )
  }

  // ========================
  // RÉCUPÉRER LES RÉPONSES À UN COMMENTAIRE
  // ========================
  // Retourne tous les commentaires dont le parentId correspond
  // au commentaire donné. C'est comme ça qu'on construit le fil.
  const getReplies = (commentId) => {
    return comments.filter((c) => c.parentId === commentId)
  }

  // ========================
  // AJOUTER UN COMMENTAIRE
  // ========================
  // articleId : l'article concerné
  // content : le texte du commentaire
  // parentId : null si c'est un commentaire racine,
  //            l'id du commentaire parent si c'est une réponse
  const addComment = (articleId, content, parentId = null) => {
    if (!currentUser) {
      return { success: false, message: "Vous devez être connecté" }
    }

    if (!content.trim()) {
      return { success: false, message: "Le commentaire ne peut pas être vide" }
    }

    const newComment = {
      id: "c" + Date.now(),   // Préfixe "c" pour différencier des ids d'articles
      articleId,
      authorId: currentUser.id,
      content: content.trim(),
      parentId,
      createdAt: new Date().toISOString(),
    }

    // On ajoute le commentaire à la fin de la liste
    setComments([...comments, newComment])

    return { success: true, comment: newComment }
  }

  // ========================
  // SUPPRIMER UN COMMENTAIRE
  // ========================
  // Deux personnes peuvent supprimer un commentaire :
  // 1. L'auteur du commentaire (c'est mon commentaire, je le supprime)
  // 2. L'auteur de l'article (c'est mon article, je modère)
  const deleteComment = (commentId, articleAuthorId) => {
    const comment = comments.find((c) => c.id === commentId)

    if (!comment) {
      return { success: false, message: "Commentaire introuvable" }
    }

    // Vérifier les permissions
    const isCommentAuthor = comment.authorId === currentUser.id
    const isArticleAuthor = articleAuthorId === currentUser.id

    if (!isCommentAuthor && !isArticleAuthor) {
      return { success: false, message: "Vous ne pouvez pas supprimer ce commentaire" }
    }

    // On supprime le commentaire ET toutes ses réponses
    // Si on supprime un commentaire parent, ses réponses
    // n'ont plus de sens, donc on les retire aussi
    setComments(
      comments.filter(
        (c) => c.id !== commentId && c.parentId !== commentId
      )
    )

    return { success: true }
  }

  // ========================
  // COMPTER LES COMMENTAIRES D'UN ARTICLE
  // ========================
  // Utile pour afficher "3 commentaires" sur la carte d'article
  const getCommentCount = (articleId) => {
    return comments.filter((c) => c.articleId === articleId).length
  }

  const value = {
    getArticleComments,  // Commentaires racines d'un article
    getReplies,          // Réponses à un commentaire
    addComment,          // Ajouter un commentaire ou une réponse
    deleteComment,       // Supprimer un commentaire
    getCommentCount,     // Nombre total de commentaires d'un article
  }

  return (
    <CommentContext.Provider value={value}>
      {children}
    </CommentContext.Provider>
  )
}

export function useComments() {
  const context = useContext(CommentContext)
  if (!context) {
    throw new Error("useComments doit être utilisé dans un CommentProvider")
  }
  return context
}