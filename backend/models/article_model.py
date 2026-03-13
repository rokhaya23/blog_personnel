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
from datetime import datetime

def create_article(author_id, title, content, is_public, allow_comments, media=None):
    """
    Crée un nouvel article dans la base de données.
    media est une liste optionnelle de fichiers (images/vidéos)
    stockés sous forme de chemins vers les fichiers uploadés.
    Chaque élément de media est un dict : { "filename": "...", "type": "image" ou "video" }
    """
    db = get_db()

    article = {
        "author_id": ObjectId(author_id),
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
    return db.articles.find_one({"_id": ObjectId(article_id)})


def get_user_articles(user_id):
    """
    Récupère tous les articles d'un utilisateur (publics ET privés).
    Triés du plus récent au plus ancien.
    sort([("created_at", -1)]) → -1 = ordre décroissant (récent d'abord)
    """
    db = get_db()
    articles = db.articles.find(
        {"author_id": ObjectId(user_id)}
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
    friend_oids = [ObjectId(fid) for fid in friend_ids]
    blocked_oids = [ObjectId(bid) for bid in blocked_ids]

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

    # Vérifier que l'article appartient bien à l'auteur
    article = db.articles.find_one({
        "_id": ObjectId(article_id),
        "author_id": ObjectId(author_id),
    })

    if not article:
        return False

    # Ajouter la date de modification
    updates["updated_at"] = datetime.utcnow()

    # $set met à jour uniquement les champs spécifiés
    # Les autres champs du document ne sont pas touchés
    db.articles.update_one(
        {"_id": ObjectId(article_id)},
        {"$set": updates}
    )
    return True


def delete_article(article_id, author_id):
    """
    Supprime un article. Seul l'auteur peut supprimer.
    Supprime aussi tous les commentaires associés.
    """
    db = get_db()

    # Vérifier que l'article appartient à l'auteur
    result = db.articles.delete_one({
        "_id": ObjectId(article_id),
        "author_id": ObjectId(author_id),
    })

    if result.deleted_count > 0:
        # Supprimer tous les commentaires de cet article
        db.comments.delete_many({"article_id": ObjectId(article_id)})
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
    article = db.articles.find_one({"_id": ObjectId(article_id)})

    if not article:
        return None

    reactions = article.get("reactions", [])
    user_oid = ObjectId(user_id)

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
                {"_id": ObjectId(article_id)},
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
                {"_id": ObjectId(article_id), "reactions.user_id": user_oid},
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
            {"_id": ObjectId(article_id)},
            {
                "$push": {"reactions": new_reaction},
                "$inc": {f"reactions_count.{emoji_type}": 1},
            }
        )
        return "added"