// ============================================================
// ArticleContext.jsx
// GÈRE TOUS LES ARTICLES DE L'APPLICATION
//
// Même principe que AuthContext, mais pour les articles.
// Ce contexte permet à n'importe quel composant de :
// - Lire la liste des articles
// - Créer un nouvel article
// - Modifier un article existant
// - Supprimer un article
// - Voir le "feed" (articles publics des amis)
// ============================================================

import { createContext, useContext, useState } from "react"
import { useAuth } from "./AuthContext"

// ---------- ARTICLES FICTIFS (MOCK) ----------
// Ces articles simulés seront remplacés par de vrais
// appels API vers Flask plus tard.
const MOCK_ARTICLES = [
  {
    id: "1",
    title: "Mon premier article",
    content: "Bienvenue sur mon blog ! Ceci est mon tout premier article. Je suis ravie de partager mes pensées avec vous.",
    authorId: "1",       // Écrit par Lyliane (id: "1")
    isPublic: true,      // Visible par les amis
    allowComments: true,  // Les amis peuvent commenter
    createdAt: "2026-03-10T10:00:00",
    updatedAt: "2026-03-10T10:00:00",
  },
  {
    id: "2",
    title: "Mes notes personnelles",
    content: "Ceci est un article privé que moi seule peut voir. J'y note mes idées.",
    authorId: "1",
    isPublic: false,     // PRIVÉ : visible uniquement par l'auteur
    allowComments: false,
    createdAt: "2026-03-11T14:30:00",
    updatedAt: "2026-03-11T14:30:00",
  },
  {
    id: "3",
    title: "Les tendances tech en 2026",
    content: "L'intelligence artificielle continue de transformer notre quotidien. Voici les tendances à suivre cette année...",
    authorId: "2",       // Écrit par Rokhaye (id: "2")
    isPublic: true,
    allowComments: true,
    createdAt: "2026-03-11T09:15:00",
    updatedAt: "2026-03-11T09:15:00",
  },
  {
    id: "4",
    title: "Recette du thiéboudienne",
    content: "Aujourd'hui je partage la recette traditionnelle du thiéboudienne, le plat national sénégalais. Il vous faut du riz, du poisson frais...",
    authorId: "3",       // Écrit par Amadou (id: "3")
    isPublic: true,
    allowComments: true,
    createdAt: "2026-03-12T16:00:00",
    updatedAt: "2026-03-12T16:00:00",
  },
]

// ---------- CRÉATION DU CONTEXTE ----------
const ArticleContext = createContext(null)

// ---------- LE PROVIDER ----------
export function ArticleProvider({ children }) {
  const [articles, setArticles] = useState(MOCK_ARTICLES)
  const { currentUser } = useAuth()

  // ========================
  // CRÉER UN ARTICLE
  // ========================
  // Prend un objet avec title, content, isPublic, allowComments
  // Génère un id unique et ajoute la date de création
  const createArticle = ({ title, content, isPublic, allowComments }) => {
    const newArticle = {
      // Date.now() génère un nombre unique basé sur l'heure actuelle
      // toString() le convertit en texte pour être cohérent avec nos autres ids
      id: Date.now().toString(),
      title,
      content,
      authorId: currentUser.id,  // L'auteur est l'utilisateur connecté
      isPublic,
      allowComments,
      createdAt: new Date().toISOString(),  // Date actuelle au format standard
      updatedAt: new Date().toISOString(),
    }

    // On ajoute le nouvel article AU DÉBUT de la liste
    // pour qu'il apparaisse en premier (le plus récent d'abord)
    setArticles([newArticle, ...articles])

    return { success: true, article: newArticle }
  }

  // ========================
  // MODIFIER UN ARTICLE
  // ========================
  // Prend l'id de l'article et un objet avec les nouvelles valeurs.
  // On ne peut modifier QUE ses propres articles.
  const updateArticle = (articleId, updates) => {
    // On cherche l'article dans la liste
    const article = articles.find((a) => a.id === articleId)

    // Vérification : l'article existe-t-il ?
    if (!article) {
      return { success: false, message: "Article introuvable" }
    }

    // Vérification : est-ce bien MON article ?
    if (article.authorId !== currentUser.id) {
      return { success: false, message: "Vous ne pouvez modifier que vos propres articles" }
    }

    // On met à jour la liste des articles.
    // map() parcourt chaque article :
    //   - Si c'est celui qu'on veut modifier → on le remplace par la version mise à jour
    //   - Sinon → on le garde tel quel
    setArticles(
      articles.map((a) => {
        if (a.id === articleId) {
          return {
            ...a,           // On garde toutes les anciennes valeurs
            ...updates,     // On écrase avec les nouvelles valeurs
            updatedAt: new Date().toISOString(),  // On met à jour la date
          }
        }
        return a  // Les autres articles ne changent pas
      })
    )

    return { success: true }
  }

  // ========================
  // SUPPRIMER UN ARTICLE
  // ========================
  // Prend l'id de l'article à supprimer.
  // On ne peut supprimer QUE ses propres articles.
  const deleteArticle = (articleId) => {
    const article = articles.find((a) => a.id === articleId)

    if (!article) {
      return { success: false, message: "Article introuvable" }
    }

    if (article.authorId !== currentUser.id) {
      return { success: false, message: "Vous ne pouvez supprimer que vos propres articles" }
    }

    // filter() garde uniquement les articles dont l'id est DIFFÉRENT
    // de celui qu'on veut supprimer. Résultat : l'article disparaît.
    setArticles(articles.filter((a) => a.id !== articleId))

    return { success: true }
  }

  // ========================
  // RÉCUPÉRER MES ARTICLES
  // ========================
  // Retourne tous les articles écrits par l'utilisateur connecté
  // (publics ET privés, puisque c'est l'auteur)
  const getMyArticles = () => {
    if (!currentUser) return []
    return articles.filter((a) => a.authorId === currentUser.id)
  }

  // ========================
  // RÉCUPÉRER LE FEED (ARTICLES DES AMIS)
  // ========================
  // Retourne les articles PUBLICS des AUTRES utilisateurs.
  // Pour l'instant, on affiche tous les articles publics des autres.
  // Quand Rokhaye aura fait la gestion des amis, on filtrera
  // pour ne montrer que ceux des amis confirmés.
  const getFeedArticles = () => {
    if (!currentUser) return []
    return articles.filter(
      (a) => a.authorId !== currentUser.id && a.isPublic === true
    )
  }

  // --- Ce qu'on partage avec toute l'application ---
  const value = {
    articles,        // La liste complète (rarement utilisé directement)
    createArticle,   // Fonction pour créer
    updateArticle,   // Fonction pour modifier
    deleteArticle,   // Fonction pour supprimer
    getMyArticles,   // Fonction pour récupérer mes articles
    getFeedArticles, // Fonction pour récupérer le feed
  }

  return (
    <ArticleContext.Provider value={value}>
      {children}
    </ArticleContext.Provider>
  )
}

// ---------- HOOK PERSONNALISÉ ----------
// Même principe que useAuth() mais pour les articles
// Utilisation : const { createArticle, getMyArticles } = useArticles()
export function useArticles() {
  const context = useContext(ArticleContext)
  if (!context) {
    throw new Error("useArticles doit être utilisé dans un ArticleProvider")
  }
  return context
}