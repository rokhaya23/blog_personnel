# ============================================================
# comment_model.py
# MODÈLE COMMENTAIRE — Accès à la collection "comments" MongoDB
#
# Gère les commentaires sur les articles :
# - Ajouter un commentaire
# - Récupérer les commentaires d'un article
# - Supprimer un commentaire (auteur du commentaire ou de l'article)
# ============================================================

from database.db import get_db
from bson.objectid import ObjectId
from datetime import datetime


def create_comment(article_id, author_id, content):
    """
    Crée un nouveau commentaire sur un article.
    Vérifie d'abord que l'article existe et autorise les commentaires.
    """
    db = get_db()

    # Vérifier que l'article existe et que les commentaires sont activés
    article = db.articles.find_one({"_id": ObjectId(article_id)})

    if not article:
        return {"success": False, "message": "Article introuvable"}

    if not article.get("allow_comments", False):
        return {"success": False, "message": "Les commentaires sont desactives sur cet article"}

    comment = {
        "article_id": ObjectId(article_id),
        "author_id": ObjectId(author_id),
        "content": content,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }

    result = db.comments.insert_one(comment)

    return {
        "success": True,
        "comment_id": str(result.inserted_id),
    }


def get_article_comments(article_id):
    """
    Récupère tous les commentaires d'un article.
    Triés du plus ancien au plus récent (ordre chronologique).
    sort([("created_at", 1)]) → 1 = ordre croissant (ancien d'abord)
    """
    db = get_db()

    comments = db.comments.find(
        {"article_id": ObjectId(article_id)}
    ).sort([("created_at", 1)])

    # Convertir en liste et ajouter les infos de l'auteur
    result = []
    for comment in comments:
        # Chercher le nom de l'auteur du commentaire
        author = db.users.find_one({"_id": comment["author_id"]})

        result.append({
            "id": str(comment["_id"]),
            "article_id": str(comment["article_id"]),
            "author_id": str(comment["author_id"]),
            "author_name": author["full_name"] if author else "Utilisateur inconnu",
            "author_username": author["username"] if author else "inconnu",
            "content": comment["content"],
            "created_at": comment["created_at"].isoformat(),
        })

    return result


def delete_comment(comment_id, user_id):
    """
    Supprime un commentaire.
    Autorisé pour :
    - L'auteur du commentaire
    - L'auteur de l'article (modération)
    """
    db = get_db()

    # Trouver le commentaire
    comment = db.comments.find_one({"_id": ObjectId(comment_id)})

    if not comment:
        return {"success": False, "message": "Commentaire introuvable"}

    # Trouver l'article associé pour vérifier si l'utilisateur est l'auteur de l'article
    article = db.articles.find_one({"_id": comment["article_id"]})

    # Vérifier les permissions
    is_comment_author = comment["author_id"] == ObjectId(user_id)
    is_article_author = article and article["author_id"] == ObjectId(user_id)

    if not is_comment_author and not is_article_author:
        return {"success": False, "message": "Vous ne pouvez pas supprimer ce commentaire"}

    # Supprimer le commentaire
    db.comments.delete_one({"_id": ObjectId(comment_id)})

    return {"success": True}


def get_comment_count(article_id):
    """
    Compte le nombre de commentaires d'un article.
    Utile pour afficher "3 commentaires" sur la carte d'article.
    """
    db = get_db()
    return db.comments.count_documents({"article_id": ObjectId(article_id)})