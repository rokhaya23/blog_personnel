# ============================================================
# comment_model.py — VERSION AVEC RÉPONSES
# Ajout du champ parent_id pour les fils de discussion
# ============================================================

from database.db import get_db
from bson.objectid import ObjectId
from bson.errors import InvalidId
from datetime import datetime


def _to_object_id(value):
    try:
        return ObjectId(value)
    except (InvalidId, TypeError):
        return None


def create_comment(article_id, author_id, content, parent_id=None):
    """
    Crée un commentaire ou une réponse.
    Si parent_id est fourni, c'est une réponse à un autre commentaire.
    """
    db = get_db()
    article_oid = _to_object_id(article_id)
    author_oid = _to_object_id(author_id)
    if not article_oid or not author_oid:
        return {"success": False, "message": "Identifiant invalide"}

    article = db.articles.find_one({"_id": article_oid})

    if not article:
        return {"success": False, "message": "Article introuvable"}

    if not article.get("allow_comments", False):
        return {"success": False, "message": "Les commentaires sont desactives sur cet article"}

    parent_oid = None
    if parent_id:
        parent_oid = _to_object_id(parent_id)
        if not parent_oid:
            return {"success": False, "message": "Commentaire parent invalide"}
        parent_comment = db.comments.find_one({"_id": parent_oid, "article_id": article_oid})
        if not parent_comment:
            return {"success": False, "message": "Commentaire parent introuvable"}

    comment = {
        "article_id": article_oid,
        "author_id": author_oid,
        "content": content,
        "parent_id": parent_oid,
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
    Récupère tous les commentaires d'un article (racines + réponses).
    Le frontend les organisera en arbre grâce au parent_id.
    """
    db = get_db()
    article_oid = _to_object_id(article_id)
    if not article_oid:
        return []

    comments = db.comments.find(
        {"article_id": article_oid}
    ).sort([("created_at", 1)])

    result = []
    for comment in comments:
        author = db.users.find_one({"_id": comment["author_id"]})

        result.append({
            "id": str(comment["_id"]),
            "article_id": str(comment["article_id"]),
            "author_id": str(comment["author_id"]),
            "author_name": author["full_name"] if author else "Utilisateur inconnu",
            "author_username": author["username"] if author else "inconnu",
            "content": comment["content"],
            "parent_id": str(comment["parent_id"]) if comment.get("parent_id") else None,
            "created_at": comment["created_at"].isoformat(),
        })

    return result


def delete_comment(comment_id, user_id):
    """
    Supprime un commentaire et toutes ses réponses.
    """
    db = get_db()
    comment_oid = _to_object_id(comment_id)
    user_oid = _to_object_id(user_id)
    if not comment_oid or not user_oid:
        return {"success": False, "message": "Commentaire introuvable"}

    comment = db.comments.find_one({"_id": comment_oid})

    if not comment:
        return {"success": False, "message": "Commentaire introuvable"}

    article = db.articles.find_one({"_id": comment["article_id"]})

    is_comment_author = comment["author_id"] == user_oid
    is_article_author = article and article["author_id"] == user_oid

    if not is_comment_author and not is_article_author:
        return {"success": False, "message": "Vous ne pouvez pas supprimer ce commentaire"}

    # Supprimer le commentaire ET ses réponses
    db.comments.delete_many({
        "$or": [
            {"_id": comment_oid},
            {"parent_id": comment_oid},
        ]
    })

    return {"success": True}


def get_comment_count(article_id):
    db = get_db()
    article_oid = _to_object_id(article_id)
    if not article_oid:
        return 0
    return db.comments.count_documents({"article_id": article_oid})
