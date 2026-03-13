// ============================================================
// api.js
// SERVICE API — Centralise tous les appels vers Flask
//
// Ce fichier configure Axios et expose des fonctions
// pour chaque endpoint du backend.
// Tous les autres fichiers importent depuis ici
// au lieu de faire leurs propres appels HTTP.
//
// Axios est configuré pour :
// 1. Toujours envoyer les requêtes vers http://localhost:5000
// 2. Ajouter automatiquement le token JWT à chaque requête
// ============================================================

import axios from "axios"

// ── Créer une instance Axios configurée ──
// baseURL : toutes les requêtes commencent par cette URL
// Exemple : api.get("/auth/me") → GET http://localhost:5000/api/auth/me
const api = axios.create({
  baseURL: "http://localhost:5000/api",
})

// ── Intercepteur : ajouter le token automatiquement ──
// Un intercepteur s'exécute AVANT chaque requête.
// Il récupère le token dans le localStorage et l'ajoute
// dans le header Authorization.
// Sans ce header, Flask refusera les requêtes protégées (401).
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token")
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ============================================================
// AUTHENTIFICATION
// ============================================================

export const authAPI = {
  // POST /api/auth/register
  register: (fullName, username, password) =>
    api.post("/auth/register", {
      full_name: fullName,
      username,
      password,
    }),

  // POST /api/auth/login
  login: (username, password) =>
    api.post("/auth/login", { username, password }),

  // GET /api/auth/me
  getMe: () => api.get("/auth/me"),

  // POST /api/auth/logout
  logout: () => api.post("/auth/logout"),
}

// ============================================================
// ARTICLES
// ============================================================

export const articlesAPI = {
  // GET /api/articles — Mes articles
  getMyArticles: () => api.get("/articles"),

  // GET /api/articles/feed — Fil d'actualité
  getFeed: () => api.get("/articles/feed"),

  // GET /api/articles/:id — Détail d'un article
  getOne: (articleId) => api.get(`/articles/${articleId}`),

  // POST /api/articles — Créer un article
 // create accepte maintenant un FormData (avec fichiers) ou un objet JSON
  create: (data) => {
    if (data instanceof FormData) {
      // FormData = envoi avec fichiers
      // On ne met PAS le header Content-Type, Axios le détecte automatiquement
      return api.post("/articles", data, {
        headers: { "Content-Type": "multipart/form-data" },
      })
    }
    return api.post("/articles", data)
  },
  // PUT /api/articles/:id — Modifier un article
  update: (articleId, data) => api.put(`/articles/${articleId}`, data),

  // DELETE /api/articles/:id — Supprimer un article
  delete: (articleId) => api.delete(`/articles/${articleId}`),

  // POST /api/articles/:id/react — Réagir à un article
  react: (articleId, emojiType) =>
    api.post(`/articles/${articleId}/react`, { type: emojiType }),
}

// ============================================================
// COMMENTAIRES
// ============================================================

export const commentsAPI = {
  // GET /api/comments/article/:id — Commentaires d'un article
  getByArticle: (articleId) => api.get(`/comments/article/${articleId}`),

  // POST /api/comments — Ajouter un commentaire
  create: (articleId, content) =>
    api.post("/comments", { article_id: articleId, content }),

  // DELETE /api/comments/:id — Supprimer un commentaire
  delete: (commentId) => api.delete(`/comments/${commentId}`),

  // GET /api/comments/count/:id — Nombre de commentaires
  getCount: (articleId) => api.get(`/comments/count/${articleId}`),
}

export default api
