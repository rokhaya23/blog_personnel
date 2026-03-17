# ============================================================
# admin_controller.py
# CONTROLLER ADMIN — Routes /api/admin/*
#
# Monitoring de la plateforme.
# Pas de JWT ici — l'admin utilise un code secret
# vérifié côté frontend. Le backend vérifie un header secret.
# ============================================================

from flask import Blueprint, request, jsonify
from database.db import get_db

admin_bp = Blueprint("admin", __name__, url_prefix="/api/admin")

# Code secret admin — doit correspondre à celui du frontend
ADMIN_SECRET = "dailypost2026"


def check_admin():
    """Vérifie le header X-Admin-Secret."""
    secret = request.headers.get("X-Admin-Secret")
    if secret != ADMIN_SECRET:
        return jsonify({"message": "Acces refuse"}), 403
    return None


# ========================
# GET /api/admin/stats — Statistiques globales
# ========================
@admin_bp.route("/stats", methods=["GET"])
def stats():
    error = check_admin()
    if error:
        return error

    db = get_db()

    return jsonify({
        "total_users": db.users.count_documents({}),
        "online_users": db.users.count_documents({"is_online": True}),
        "total_articles": db.articles.count_documents({}),
        "public_articles": db.articles.count_documents({"is_public": True}),
        "private_articles": db.articles.count_documents({"is_public": False}),
        "total_comments": db.comments.count_documents({}),
        "total_friendships": db.friendships.count_documents({"status": "accepted"}),
        "pending_friendships": db.friendships.count_documents({"status": "pending"}),
    }), 200


# ========================
# GET /api/admin/users — Tous les utilisateurs
# ========================
@admin_bp.route("/users", methods=["GET"])
def list_users():
    error = check_admin()
    if error:
        return error

    db = get_db()
    users = db.users.find().sort([("created_at", -1)])

    result = []
    for user in users:
        user_id = user["_id"]
        result.append({
            "id": str(user_id),
            "full_name": user["full_name"],
            "username": user["username"],
            "avatar": user.get("avatar"),
            "is_online": user.get("is_online", False),
            "last_seen": user.get("last_seen").isoformat() if user.get("last_seen") else None,
            "article_count": db.articles.count_documents({"author_id": user_id}),
            "comment_count": db.comments.count_documents({"author_id": user_id}),
            "created_at": user["created_at"].isoformat(),
        })

    return jsonify(result), 200


# ========================
# GET /api/admin/articles — Tous les articles
# ========================
@admin_bp.route("/articles", methods=["GET"])
def list_articles():
    error = check_admin()
    if error:
        return error

    db = get_db()
    articles = db.articles.find().sort([("created_at", -1)])

    result = []
    for a in articles:
        author = db.users.find_one({"_id": a["author_id"]})
        result.append({
            "id": str(a["_id"]),
            "title": a["title"],
            "content": a["content"][:100] + "..." if len(a["content"]) > 100 else a["content"],
            "is_public": a["is_public"],
            "author_username": author["username"] if author else "inconnu",
            "comment_count": db.comments.count_documents({"article_id": a["_id"]}),
            "media_count": len(a.get("media", [])),
            "created_at": a["created_at"].isoformat(),
        })

    return jsonify(result), 200


# ========================
# GET /api/admin/comments — Derniers commentaires
# ========================
@admin_bp.route("/comments", methods=["GET"])
def list_comments():
    error = check_admin()
    if error:
        return error

    db = get_db()
    comments = db.comments.find().sort([("created_at", -1)]).limit(50)

    result = []
    for c in comments:
        author = db.users.find_one({"_id": c["author_id"]})
        article = db.articles.find_one({"_id": c["article_id"]})
        result.append({
            "id": str(c["_id"]),
            "content": c["content"],
            "author_name": author["full_name"] if author else "Inconnu",
            "article_title": article["title"] if article else "Article supprime",
            "created_at": c["created_at"].isoformat(),
        })

    return jsonify(result), 200