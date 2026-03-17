# ============================================================
# article_model.py
# MODÈLE ARTICLE — Accès à la collection "articles" MongoDB
#
# Gère le CRUD complet des articles :
# - Créer, lire, modifier, supprimer
# - Récupérer le feed (articles publics des amis)
# - Gérer les réactions emoji (embarquées dans le document)
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


def create_article(author_id, title, content, is_public, allow_comments, media=None):
    """
    Crée un nouvel article dans la base de données.
    media est une liste optionnelle de fichiers (images/vidéos)
    stockés sous forme de chemins vers les fichiers uploadés.
    Chaque élément de media est un dict : { "filename": "...", "type": "image" ou "video" }
    """
    db = get_db()
    author_oid = _to_object_id(author_id)
    if not author_oid:
        return None

    article = {
        "author_id": author_oid,
        "title": title,
        "content": content,
        "is_public": is_public,
        "allow_comments": allow_comments,
        "media": media or [],        # Liste des fichiers attachés
        "reactions": [],
        "reactions_count": {
            "like": 0,
            "love": 0,
            "haha": 0,
            "wow": 0,
            "sad": 0,
            "angry": 0,
        },
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }

    result = db.articles.insert_one(article)
    return str(result.inserted_id)


def get_article_by_id(article_id):
    """
    Récupère un article par son _id.
    """
    db = get_db()
    article_oid = _to_object_id(article_id)
    if not article_oid:
        return None
    return db.articles.find_one({"_id": article_oid})


def get_user_articles(user_id):
    """
    Récupère tous les articles d'un utilisateur (publics ET privés).
    Triés du plus récent au plus ancien.
    sort([("created_at", -1)]) → -1 = ordre décroissant (récent d'abord)
    """
    db = get_db()
    user_oid = _to_object_id(user_id)
    if not user_oid:
        return []
    articles = db.articles.find(
        {"author_id": user_oid}
    ).sort([("created_at", -1)])

    return list(articles)


def get_feed_articles(friend_ids, blocked_ids, current_user_id):
    """
    Récupère les articles publics des amis pour le fil d'actualité.

    - friend_ids : liste des ids des amis confirmés
    - blocked_ids : liste des ids des utilisateurs bloqués
    - current_user_id : l'utilisateur connecté (exclu du feed)

    $in : l'auteur doit être dans la liste des amis
    $nin : l'auteur ne doit PAS être dans la liste des bloqués
    """
    db = get_db()

    # Convertir les ids texte en ObjectId MongoDB
    friend_oids = [oid for oid in (_to_object_id(fid) for fid in friend_ids) if oid]
    blocked_oids = [oid for oid in (_to_object_id(bid) for bid in blocked_ids) if oid]

    if not friend_oids:
        return []

    articles = db.articles.find({
        "author_id": {
            "$in": friend_oids,       # Seulement les amis
            "$nin": blocked_oids,     # Exclure les bloqués
        },
        "is_public": True,            # Seulement les articles publics
    }).sort([("created_at", -1)])

    return list(articles)


def update_article(article_id, author_id, updates):
    """
    Modifie un article. Seul l'auteur peut modifier son article.
    "updates" est un dictionnaire avec les champs à modifier.
    """
    db = get_db()
    article_oid = _to_object_id(article_id)
    author_oid = _to_object_id(author_id)
    if not article_oid or not author_oid:
        return False

    # Vérifier que l'article appartient bien à l'auteur
    article = db.articles.find_one({
        "_id": article_oid,
        "author_id": author_oid,
    })

    if not article:
        return False

    # Ajouter la date de modification
    updates["updated_at"] = datetime.utcnow()

    # $set met à jour uniquement les champs spécifiés
    # Les autres champs du document ne sont pas touchés
    db.articles.update_one(
        {"_id": article_oid},
        {"$set": updates}
    )
    return True


def delete_article(article_id, author_id):
    """
    Supprime un article. Seul l'auteur peut supprimer.
    Supprime aussi tous les commentaires associés.
    """
    db = get_db()
    article_oid = _to_object_id(article_id)
    author_oid = _to_object_id(author_id)
    if not article_oid or not author_oid:
        return False

    # Vérifier que l'article appartient à l'auteur
    result = db.articles.delete_one({
        "_id": article_oid,
        "author_id": author_oid,
    })

    if result.deleted_count > 0:
        # Supprimer tous les commentaires de cet article
        db.comments.delete_many({"article_id": article_oid})
        return True

    return False


# ============================================================
# RÉACTIONS EMOJI
# Les réactions sont EMBARQUÉES dans le document article
# sous forme de tableau : reactions: [{user_id, type, created_at}]
# ============================================================

def toggle_reaction(article_id, user_id, emoji_type):
    """
    Gère les réactions sur un article (ajouter/changer/retirer).

    3 cas possibles :
    1. Pas encore de réaction → ajouter
    2. Même emoji → retirer (toggle off)
    3. Emoji différent → changer
    """
    db = get_db()
    article_oid = _to_object_id(article_id)
    user_oid = _to_object_id(user_id)
    if not article_oid or not user_oid:
        return None

    article = db.articles.find_one({"_id": article_oid})

    if not article:
        return None

    reactions = article.get("reactions", [])

    # Chercher si l'utilisateur a déjà réagi
    existing = None
    existing_index = -1
    for i, r in enumerate(reactions):
        if r["user_id"] == user_oid:
            existing = r
            existing_index = i
            break

    if existing:
        if existing["type"] == emoji_type:
            # CAS 2 : Même emoji → retirer
            # $pull retire un élément du tableau
            db.articles.update_one(
                {"_id": article_oid},
                {
                    "$pull": {"reactions": {"user_id": user_oid}},
                    "$inc": {f"reactions_count.{emoji_type}": -1},
                }
            )
            return "removed"
        else:
            # CAS 3 : Emoji différent → changer
            old_type = existing["type"]
            db.articles.update_one(
                {"_id": article_oid, "reactions.user_id": user_oid},
                {
                    "$set": {
                        "reactions.$.type": emoji_type,
                        "reactions.$.created_at": datetime.utcnow(),
                    },
                    "$inc": {
                        f"reactions_count.{old_type}": -1,
                        f"reactions_count.{emoji_type}": 1,
                    },
                }
            )
            return "changed"
    else:
        # CAS 1 : Pas encore de réaction → ajouter
        # $push ajoute un élément au tableau
        new_reaction = {
            "user_id": user_oid,
            "type": emoji_type,
            "created_at": datetime.utcnow(),
        }
        db.articles.update_one(
            {"_id": article_oid},
            {
                "$push": {"reactions": new_reaction},
                "$inc": {f"reactions_count.{emoji_type}": 1},
            }
        )
        return "added"


def repost_article(user_id, original_article_id):
    """
    Republier un article d'un autre utilisateur.
    Crée une copie avec une référence vers l'original.
    L'utilisateur ne peut pas republier son propre article
    ni republier un article déjà republié par lui.
    """
    db = get_db()
    user_oid = _to_object_id(user_id)
    original_oid = _to_object_id(original_article_id)
    if not user_oid or not original_oid:
        return {"success": False, "message": "Article introuvable"}

    # Récupérer l'article original
    original = db.articles.find_one({"_id": original_oid})

    if not original:
        return {"success": False, "message": "Article introuvable"}

    # On ne peut pas republier son propre article
    if original["author_id"] == user_oid:
        return {"success": False, "message": "Vous ne pouvez pas republier votre propre article"}

    # Vérifier qu'on n'a pas déjà republié cet article
    already_reposted = db.articles.find_one({
        "author_id": user_oid,
        "repost_of": original_oid,
    })

    if already_reposted:
        return {"success": False, "message": "Vous avez deja republié cet article"}

    # Créer le repost
    repost = {
        "author_id": user_oid,
        "title": original["title"],
        "content": original["content"],
        "is_public": True,
        "allow_comments": True,
        "media": original.get("media", []),
        "reactions": [],
        "reactions_count": {
            "like": 0, "love": 0, "haha": 0,
            "wow": 0, "sad": 0, "angry": 0,
        },
        "repost_of": original_oid,
        "original_author_id": original["author_id"],
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }

    result = db.articles.insert_one(repost)
    return {"success": True, "article_id": str(result.inserted_id)}
