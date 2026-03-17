# ============================================================
# article_controller.py
# CONTROLLER ARTICLES — Routes /api/articles/*
#
# Gère le CRUD des articles, les réactions emoji et les médias.
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
    repost_article,

)
from models.comment_model import get_comment_count
import os
import uuid
from bson.objectid import ObjectId
from werkzeug.utils import secure_filename

article_bp = Blueprint("articles", __name__, url_prefix="/api/articles")

# ── Configuration des uploads ──
UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads")
ALLOWED_IMAGE_EXTENSIONS = {"png", "jpg", "jpeg", "gif", "webp"}
ALLOWED_VIDEO_EXTENSIONS = {"mp4", "webm", "mov"}
ALLOWED_EXTENSIONS = ALLOWED_IMAGE_EXTENSIONS | ALLOWED_VIDEO_EXTENSIONS
MAX_FILE_SIZE = 50 * 1024 * 1024


def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


def get_file_size(file_storage):
    current_pos = file_storage.stream.tell()
    file_storage.stream.seek(0, os.SEEK_END)
    size = file_storage.stream.tell()
    file_storage.stream.seek(current_pos)
    return size


def get_file_type(filename):
    ext = filename.rsplit(".", 1)[1].lower()
    if ext in ALLOWED_IMAGE_EXTENSIONS:
        return "image"
    return "video"


def can_view_article(article, viewer_id, db):
    try:
        viewer_oid = ObjectId(viewer_id)
    except Exception:
        return False
    author_oid = article["author_id"]

    # L'auteur voit toujours son contenu
    if author_oid == viewer_oid:
        return True

    # Les articles privés restent visibles uniquement par l'auteur
    if not article.get("is_public", False):
        return False

    relation = db.friendships.find_one({
        "$or": [
            {"sender_id": author_oid, "receiver_id": viewer_oid},
            {"sender_id": viewer_oid, "receiver_id": author_oid},
        ]
    })
    return relation is not None and relation.get("status") == "accepted"


# ========================
# POST /api/articles — Créer un article (avec médias optionnels)
# ========================
@article_bp.route("", methods=["POST"])
@jwt_required()
def create():
    user_id = get_jwt_identity()

    if request.content_type and "multipart/form-data" in request.content_type:
        title = request.form.get("title")
        content = request.form.get("content")
        is_public = request.form.get("is_public", "true") == "true"
        allow_comments = request.form.get("allow_comments", "true") == "true"
        files = request.files.getlist("media")
    else:
        data = request.get_json(silent=True) or {}
        title = data.get("title")
        content = data.get("content")
        is_public = data.get("is_public", True)
        allow_comments = data.get("allow_comments", True)
        files = []

    if not title or not content:
        return jsonify({"message": "Le titre et le contenu sont obligatoires"}), 400

    if len(title.strip()) < 3:
        return jsonify({"message": "Le titre doit contenir au moins 3 caractères"}), 400

    media_list = []
    for file in files:
        if file and file.filename:
            if not allowed_file(file.filename):
                return jsonify({
                    "message": f"Type de fichier non autorisé: {file.filename}"
                }), 400
            if get_file_size(file) > MAX_FILE_SIZE:
                return jsonify({
                    "message": f"Le fichier {file.filename} depasse 50 Mo"
                }), 400

            ext = file.filename.rsplit(".", 1)[1].lower()
            unique_filename = f"{uuid.uuid4().hex}.{ext}"

            filepath = os.path.join(UPLOAD_FOLDER, unique_filename)
            os.makedirs(UPLOAD_FOLDER, exist_ok=True)
            file.save(filepath)

            media_list.append({
                "filename": unique_filename,
                "original_name": secure_filename(file.filename),
                "type": get_file_type(file.filename),
            })

    article_id = create_article(
        user_id, title.strip(), content.strip(),
        is_public, allow_comments, media_list
    )
    if not article_id:
        return jsonify({"message": "Auteur invalide"}), 400

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

    from database.db import get_db as get_database
    database = get_database()

    result = []
    for a in articles:
        formatted = format_article(a)
        # Si c'est un repost, ajouter le nom de l'auteur original
        if a.get("original_author_id"):
            original_author = database.users.find_one({"_id": a["original_author_id"]})
            if original_author:
                formatted["original_author_name"] = original_author["full_name"]
        result.append(formatted)

    return jsonify(result), 200


# ========================
# GET /api/articles/feed — Fil d'actualité
# ========================
@article_bp.route("/feed", methods=["GET"])
@jwt_required()
def get_feed():
    user_id = get_jwt_identity()

    from database.db import get_db
    from bson.objectid import ObjectId

    db = get_db()

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

    articles = get_feed_articles(friend_ids, blocked_ids, user_id)

    result = []
    for a in articles:
        formatted = format_article(a)
        author = db.users.find_one({"_id": a["author_id"]})
        if author:
            formatted["author_name"] = author["full_name"]
            formatted["author_username"] = author["username"]
            formatted["author_is_online"] = author.get("is_online", False)
            formatted["author_avatar"] = author.get("avatar")
            formatted["author_last_seen"] = author.get("last_seen").isoformat() if author.get("last_seen") else None
        # Si c'est un repost, ajouter le nom de l'auteur original
        if a.get("original_author_id"):
            original_author = db.users.find_one({"_id": a["original_author_id"]})
            if original_author:
                formatted["original_author_name"] = original_author["full_name"]
        result.append(formatted)

    return jsonify(result), 200


# ========================
# GET /api/articles/media/<filename> — Servir un fichier uploadé
# ========================
@article_bp.route("/media/<filename>", methods=["GET"])
@jwt_required()
def serve_media(filename):
    from flask import send_from_directory

    viewer_id = get_jwt_identity()
    from database.db import get_db
    db = get_db()

    article = db.articles.find_one({"media.filename": filename})
    if not article:
        return jsonify({"message": "Media introuvable"}), 404

    if not can_view_article(article, viewer_id, db):
        return jsonify({"message": "Acces refuse"}), 403

    return send_from_directory(UPLOAD_FOLDER, filename)


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
    data = request.get_json(silent=True) or {}

    updates = {}
    if "title" in data:
        title = (data.get("title") or "").strip()
        if len(title) < 3:
            return jsonify({"message": "Le titre doit contenir au moins 3 caracteres"}), 400
        updates["title"] = title
    if "content" in data:
        updates["content"] = (data.get("content") or "").strip()
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
    data = request.get_json(silent=True) or {}

    emoji_type = data.get("type")

    valid_emojis = ["like", "love", "haha", "wow", "sad", "angry"]
    if emoji_type not in valid_emojis:
        return jsonify({"message": "Type de reaction invalide"}), 400

    result = toggle_reaction(article_id, user_id, emoji_type)

    if result is None:
        return jsonify({"message": "Article introuvable"}), 404

    article = get_article_by_id(article_id)
    reactions_count = article.get("reactions_count", {}) if article else {}

    return jsonify({
        "message": f"Reaction {result}",
        "action": result,
        "reactions_count": reactions_count,
    }), 200

# ========================
# POST /api/articles/<id>/repost — Republier un article
# ========================
@article_bp.route("/<article_id>/repost", methods=["POST"])
@jwt_required()
def repost(article_id):
    user_id = get_jwt_identity()

    result = repost_article(user_id, article_id)

    if not result["success"]:
        return jsonify({"message": result["message"]}), 400

    return jsonify({
        "message": "Article republié avec succes",
        "article_id": result["article_id"],
    }), 201

# ============================================================
# FONCTION UTILITAIRE — Formater un article pour React
# ============================================================
def format_article(article):
    return {
        "id": str(article["_id"]),
        "author_id": str(article["author_id"]),
        "title": article["title"],
        "content": article["content"],
        "is_public": article["is_public"],
        "allow_comments": article["allow_comments"],
        "media": article.get("media", []),
        "reactions_count": article.get("reactions_count", {}),
        "comment_count": get_comment_count(str(article["_id"])),
        "created_at": article["created_at"].isoformat(),
        "updated_at": article["updated_at"].isoformat(),
        "repost_of": str(article["repost_of"]) if article.get("repost_of") else None,
        "original_author_id": str(article["original_author_id"]) if article.get("original_author_id") else None,
    }    
