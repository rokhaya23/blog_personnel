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

  // PUT /api/auth/profile — Modifier le profil (avec avatar)
  updateProfile: (data) => {
    if (data instanceof FormData) {
      return api.put("/auth/profile", data, {
        headers: { "Content-Type": "multipart/form-data" },
      })
    }
    return api.put("/auth/profile", data)
  },

  // PUT /api/auth/password — Changer le mot de passe
  changePassword: (oldPassword, newPassword) =>
    api.put("/auth/password", {
      old_password: oldPassword,
      new_password: newPassword,
    }),
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
  react: (articleId, emojiType) => api.post(`/articles/${articleId}/react`, { type: emojiType }),
  // POST /api/articles/:id/repost — Republier un article
  repost: (articleId) => api.post(`/articles/${articleId}/repost`),
  
}

// ============================================================
// COMMENTAIRES
// ============================================================

export const commentsAPI = {
  // GET /api/comments/article/:id — Commentaires d'un article
  getByArticle: (articleId) => api.get(`/comments/article/${articleId}`),

  // POST /api/comments — Ajouter un commentaire
// parent_id est optionnel : null = commentaire racine, sinon = réponse
  create: (articleId, content, parentId = null) =>
    api.post("/comments", { article_id: articleId, content, parent_id: parentId }),

  // DELETE /api/comments/:id — Supprimer un commentaire
  delete: (commentId) => api.delete(`/comments/${commentId}`),

  // GET /api/comments/count/:id — Nombre de commentaires
  getCount: (articleId) => api.get(`/comments/count/${articleId}`),
}

// ============================================================
// ADMIN (utilise un header secret au lieu de JWT)
// ============================================================

export const adminAPI = {
  getStats: () => api.get("/admin/stats", {
    headers: { "X-Admin-Secret": "dailypost2026" }
  }),

  getUsers: () => api.get("/admin/users", {
    headers: { "X-Admin-Secret": "dailypost2026" }
  }),

  getArticles: () => api.get("/admin/articles", {
    headers: { "X-Admin-Secret": "dailypost2026" }
  }),

  getComments: () => api.get("/admin/comments", {
    headers: { "X-Admin-Secret": "dailypost2026" }
  }),
}

export default api
