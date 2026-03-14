# ============================================================
# comment_controller.py
# CONTROLLER COMMENTAIRES — Routes /api/comments/*
#
# Gère l'ajout, la lecture et la suppression de commentaires.
# ============================================================

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.comment_model import (
    create_comment,
    get_article_comments,
    delete_comment,
    get_comment_count,
)

comment_bp = Blueprint("comments", __name__, url_prefix="/api/comments")


# ========================
# POST /api/comments — Ajouter un commentaire
# ========================
@comment_bp.route("", methods=["POST"])
@jwt_required()
def create():
    user_id = get_jwt_identity()
    data = request.get_json()

    article_id = data.get("article_id")
    content = data.get("content")

    if not article_id or not content:
        return jsonify({"message": "article_id et content sont obligatoires"}), 400

    if not content.strip():
        return jsonify({"message": "Le commentaire ne peut pas etre vide"}), 400

    result = create_comment(article_id, user_id, content.strip())

    if not result["success"]:
        return jsonify({"message": result["message"]}), 400

    return jsonify({
        "message": "Commentaire ajoute",
        "comment_id": result["comment_id"],
    }), 201


# ========================
# GET /api/comments/article/<id> — Commentaires d'un article
# ========================
@comment_bp.route("/article/<article_id>", methods=["GET"])
@jwt_required()
def get_comments(article_id):
    comments = get_article_comments(article_id)
    return jsonify(comments), 200


# ========================
# DELETE /api/comments/<id> — Supprimer un commentaire
# ========================
@comment_bp.route("/<comment_id>", methods=["DELETE"])
@jwt_required()
def delete(comment_id):
    user_id = get_jwt_identity()

    result = delete_comment(comment_id, user_id)

    if not result["success"]:
        return jsonify({"message": result["message"]}), 403

    return jsonify({"message": "Commentaire supprime"}), 200


# ========================
# GET /api/comments/count/<id> — Nombre de commentaires
# ========================
@comment_bp.route("/count/<article_id>", methods=["GET"])
@jwt_required()
def count(article_id):
    total = get_comment_count(article_id)
    return jsonify({"count": total}), 200