# ============================================================
# article_controller.py
# CONTROLLER ARTICLES — Routes /api/articles/*
#
# Gère le CRUD des articles et les réactions emoji.
# Toutes les routes nécessitent un token JWT.
# ============================================================

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.article_model import (
    create_article,
    get_article_by_id,
    get_user_articles,
    get_feed_articles,
    update_article,
    delete_article,
    toggle_reaction,
)
from models.comment_model import get_comment_count

article_bp = Blueprint("articles", __name__, url_prefix="/api/articles")


# ========================
# POST /api/articles — Créer un article
# ========================
@article_bp.route("", methods=["POST"])
@jwt_required()
def create():
    user_id = get_jwt_identity()
    data = request.get_json()

    title = data.get("title")
    content = data.get("content")
    is_public = data.get("is_public", True)
    allow_comments = data.get("allow_comments", True)

    if not title or not content:
        return jsonify({"message": "Le titre et le contenu sont obligatoires"}), 400

    if len(title.strip()) < 3:
        return jsonify({"message": "Le titre doit contenir au moins 3 caracteres"}), 400

    article_id = create_article(user_id, title.strip(), content.strip(), is_public, allow_comments)

    return jsonify({
        "message": "Article cree avec succes",
        "article_id": article_id,
    }), 201


# ========================
# GET /api/articles — Mes articles
# ========================
@article_bp.route("", methods=["GET"])
@jwt_required()
def get_mine():
    user_id = get_jwt_identity()
    articles = get_user_articles(user_id)

    # Formater chaque article pour l'envoyer à React
    result = []
    for a in articles:
        result.append(format_article(a))

    return jsonify(result), 200


# ========================
# GET /api/articles/feed — Fil d'actualité
# ========================
@article_bp.route("/feed", methods=["GET"])
@jwt_required()
def get_feed():
    user_id = get_jwt_identity()

    # Récupérer les ids des amis confirmés
    # Pour l'instant on importe la logique ici
    # Quand Rokhaye aura fait le friendship_model, on utilisera sa fonction
    from database.db import get_db
    from bson.objectid import ObjectId

    db = get_db()

    # Trouver les amis confirmés (accepted)
    friendships = db.friendships.find({
        "$or": [
            {"sender_id": ObjectId(user_id), "status": "accepted"},
            {"receiver_id": ObjectId(user_id), "status": "accepted"},
        ]
    })

    friend_ids = []
    for f in friendships:
        if str(f["sender_id"]) == user_id:
            friend_ids.append(str(f["receiver_id"]))
        else:
            friend_ids.append(str(f["sender_id"]))

    # Trouver les utilisateurs bloqués
    blocked = db.friendships.find({
        "$or": [
            {"sender_id": ObjectId(user_id), "status": "blocked"},
            {"receiver_id": ObjectId(user_id), "status": "blocked"},
        ]
    })

    blocked_ids = []
    for b in blocked:
        if str(b["sender_id"]) == user_id:
            blocked_ids.append(str(b["receiver_id"]))
        else:
            blocked_ids.append(str(b["sender_id"]))

    # Récupérer les articles du feed
    articles = get_feed_articles(friend_ids, blocked_ids, user_id)

    # Ajouter les infos de l'auteur à chaque article
    result = []
    for a in articles:
        formatted = format_article(a)
        # Ajouter le nom de l'auteur
        author = db.users.find_one({"_id": a["author_id"]})
        if author:
            formatted["author_name"] = author["full_name"]
            formatted["author_username"] = author["username"]
            formatted["author_is_online"] = author.get("is_online", False)
            formatted["author_last_seen"] = author.get("last_seen").isoformat() if author.get("last_seen") else None
        result.append(formatted)

    return jsonify(result), 200


# ========================
# GET /api/articles/<id> — Détail d'un article
# ========================
@article_bp.route("/<article_id>", methods=["GET"])
@jwt_required()
def get_one(article_id):
    article = get_article_by_id(article_id)

    if not article:
        return jsonify({"message": "Article introuvable"}), 404

    return jsonify(format_article(article)), 200


# ========================
# PUT /api/articles/<id> — Modifier un article
# ========================
@article_bp.route("/<article_id>", methods=["PUT"])
@jwt_required()
def update(article_id):
    user_id = get_jwt_identity()
    data = request.get_json()

    # Construire le dictionnaire des modifications
    updates = {}
    if "title" in data:
        if len(data["title"].strip()) < 3:
            return jsonify({"message": "Le titre doit contenir au moins 3 caracteres"}), 400
        updates["title"] = data["title"].strip()
    if "content" in data:
        updates["content"] = data["content"].strip()
    if "is_public" in data:
        updates["is_public"] = data["is_public"]
    if "allow_comments" in data:
        updates["allow_comments"] = data["allow_comments"]

    if not updates:
        return jsonify({"message": "Rien a modifier"}), 400

    success = update_article(article_id, user_id, updates)

    if not success:
        return jsonify({"message": "Article introuvable ou non autorise"}), 404

    return jsonify({"message": "Article modifie avec succes"}), 200


# ========================
# DELETE /api/articles/<id> — Supprimer un article
# ========================
@article_bp.route("/<article_id>", methods=["DELETE"])
@jwt_required()
def delete(article_id):
    user_id = get_jwt_identity()

    success = delete_article(article_id, user_id)

    if not success:
        return jsonify({"message": "Article introuvable ou non autorise"}), 404

    return jsonify({"message": "Article supprime avec succes"}), 200


# ========================
# POST /api/articles/<id>/react — Réagir à un article
# ========================
@article_bp.route("/<article_id>/react", methods=["POST"])
@jwt_required()
def react(article_id):
    user_id = get_jwt_identity()
    data = request.get_json()

    emoji_type = data.get("type")

    # Vérifier que l'emoji est valide
    valid_emojis = ["like", "love", "haha", "wow", "sad", "angry"]
    if emoji_type not in valid_emojis:
        return jsonify({"message": "Type de reaction invalide"}), 400

    result = toggle_reaction(article_id, user_id, emoji_type)

    if result is None:
        return jsonify({"message": "Article introuvable"}), 404

    return jsonify({
        "message": f"Reaction {result}",
        "action": result,
    }), 200


# ============================================================
# FONCTION UTILITAIRE — Formater un article pour React
# ============================================================
def format_article(article):
    """
    Convertit un document MongoDB en dictionnaire JSON propre.
    MongoDB utilise des ObjectId et des dates qu'il faut convertir
    en texte pour que React puisse les lire.
    """
    return {
        "id": str(article["_id"]),
        "author_id": str(article["author_id"]),
        "title": article["title"],
        "content": article["content"],
        "is_public": article["is_public"],
        "allow_comments": article["allow_comments"],
        "reactions_count": article.get("reactions_count", {}),
        "comment_count": get_comment_count(str(article["_id"])),
        "created_at": article["created_at"].isoformat(),
        "updated_at": article["updated_at"].isoformat(),
    }