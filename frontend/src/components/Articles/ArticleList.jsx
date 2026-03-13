// ============================================================
// ArticleList.jsx
// PAGE PRINCIPALE DE GESTION DES ARTICLES
//
// Ce composant assemble tout ce qui concerne les articles :
// - Un bouton pour créer un nouvel article
// - Le formulaire (affiché/masqué selon le besoin)
// - La liste des articles sous forme de cartes
//
// C'est le composant "parent" qui orchestre ArticleForm et ArticleCard.
// ============================================================

import { useState } from "react"
import { useArticles } from "../../context/ArticleContext"
import ArticleCard from "./ArticleCard"
import ArticleForm from "./ArticleForm"

function ArticleList() {
  // --- États ---
  // showForm : contrôle si le formulaire est visible ou non
  const [showForm, setShowForm] = useState(false)

  // articleToEdit : l'article en cours de modification
  // null = on crée un nouveau, un objet = on modifie celui-là
  const [articleToEdit, setArticleToEdit] = useState(null)

  // --- Récupérer mes articles depuis le contexte ---
  const { getMyArticles } = useArticles()
  const myArticles = getMyArticles()

  // ========================
  // OUVRIR LE FORMULAIRE EN MODE CRÉATION
  // ========================
  const handleNewArticle = () => {
    setArticleToEdit(null)  // Pas d'article à modifier = mode création
    setShowForm(true)       // On affiche le formulaire
  }

  // ========================
  // OUVRIR LE FORMULAIRE EN MODE MODIFICATION
  // ========================
  // Cette fonction est passée à chaque ArticleCard via la prop "onEdit".
  // Quand l'utilisateur clique sur "Modifier" dans une carte,
  // la carte appelle onEdit(article) et on arrive ici.
  const handleEdit = (article) => {
    setArticleToEdit(article)  // On passe l'article au formulaire
    setShowForm(true)          // On affiche le formulaire

    // Petit bonus : on fait défiler la page vers le haut
    // pour que l'utilisateur voie le formulaire qui vient de s'ouvrir
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  // ========================
  // FERMER LE FORMULAIRE
  // ========================
  // Appelé quand l'utilisateur clique "Annuler" ou après une sauvegarde réussie.
  // C'est la fonction "onDone" qu'on passe au formulaire.
  const handleFormDone = () => {
    setShowForm(false)        // On masque le formulaire
    setArticleToEdit(null)    // On réinitialise l'article en cours d'édition
  }

  // ========================
  // AFFICHAGE
  // ========================
  return (
    <div>
      {/* --- EN-TÊTE : Titre + Bouton "Nouvel article" --- */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">
          Mes articles
          {/* On affiche le nombre d'articles entre parenthèses */}
          <span className="text-purple-300/50 text-lg ml-2">
            ({myArticles.length})
          </span>
        </h2>

        {/* Le bouton n'apparaît QUE si le formulaire est fermé */}
        {/* Ça évite d'avoir le bouton ET le formulaire en même temps */}
        {!showForm && (
          <button
            onClick={handleNewArticle}
            className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition duration-200 shadow-lg hover:shadow-purple-500/25"
          >
            + Nouvel article
          </button>
        )}
      </div>

      {/* --- FORMULAIRE (affiché/masqué) --- */}
      {/* Le formulaire n'existe dans la page QUE quand showForm est true */}
      {/* Quand showForm est false, React ne crée même pas le composant */}
      {showForm && (
        <div className="mb-8">
          <ArticleForm
            articleToEdit={articleToEdit}
            onDone={handleFormDone}
          />
        </div>
      )}

      {/* --- LISTE DES ARTICLES --- */}
      {myArticles.length === 0 ? (
        // Si l'utilisateur n'a aucun article, on affiche un message sympa
        <div className="text-center py-16">
          <p className="text-purple-200/60 text-lg mb-2">
            Vous n'avez pas encore d'articles
          </p>
          <p className="text-purple-300/40">
            Cliquez sur "Nouvel article" pour commencer à écrire
          </p>
        </div>
      ) : (
        // Sinon, on affiche chaque article sous forme de carte
        // gap-4 met un espace de 1rem entre chaque carte
        <div className="flex flex-col gap-4">
          {myArticles.map((article) => (
            // Pour chaque article, on crée une ArticleCard
            // key={article.id} : obligatoire en React quand on fait une liste
            // React utilise la key pour savoir quel élément a changé
            // sans avoir à recréer toute la liste
            <ArticleCard
              key={article.id}
              article={article}
              onEdit={handleEdit}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default ArticleList