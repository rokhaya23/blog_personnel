from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from bson import ObjectId
from database.db import get_db

dashboard_bp = Blueprint("dashboard", __name__)


# ════════════════════════════════════════
# TABLEAU DE BORD
# GET /api/dashboard
# Renvoie les articles de l'utilisateur + les articles
# publics de ses amis non bloqués
# ════════════════════════════════════════
@dashboard_bp.route("/api/dashboard", methods=["GET"])
@jwt_required()
def get_dashboard():
    db = get_db()
    current_user_id = get_jwt_identity()

    # ── 1. Trouver les amis acceptés ──
    relations = list(db.friendships.find({
        "$or": [
            {"sender_id":   ObjectId(current_user_id), "status": "accepted"},
            {"receiver_id": ObjectId(current_user_id), "status": "accepted"}
        ]
    }))

    # Récupérer les ids des amis
    ami_ids = []
    for r in relations:
        if str(r["sender_id"]) == current_user_id:
            ami_ids.append(r["receiver_id"])
        else:
            ami_ids.append(r["sender_id"])

    # ── 2. Trouver les utilisateurs bloqués ──
    # (pour ne pas afficher leurs articles)
    bloqués = list(db.friendships.find({
        "$or": [
            {"sender_id":   ObjectId(current_user_id), "status": "blocked"},
            {"receiver_id": ObjectId(current_user_id), "status": "blocked"}
        ]
    }))

    bloque_ids = []
    for b in bloqués:
        if str(b["sender_id"]) == current_user_id:
            bloque_ids.append(b["receiver_id"])
        else:
            bloque_ids.append(b["sender_id"])

    # ── 3. Articles de l'utilisateur connecté ──
    mes_articles = list(db.articles.find(
        {"author_id": ObjectId(current_user_id)},
    ).sort("created_at", -1))  # -1 = du plus récent au plus ancien

    # ── 4. Articles publics des amis non bloqués ──
    amis_non_bloques = [
        id for id in ami_ids if id not in bloque_ids
    ]

    fil_articles = list(db.articles.find({
        "author_id": {"$in": amis_non_bloques},
        "is_public": True
    }).sort("created_at", -1))

    # ── 5. Formater les articles pour JSON ──
    # MongoDB utilise des ObjectId — il faut les convertir en string
    def formater_article(article):
        article["_id"]       = str(article["_id"])
        article["author_id"] = str(article["author_id"])
        # Formater les réactions si elles existent
        if "reactions" in article:
            for r in article["reactions"]:
                r["user_id"] = str(r["user_id"])
        return article

    mes_articles  = [formater_article(a) for a in mes_articles]
    fil_articles  = [formater_article(a) for a in fil_articles]

    # ── 6. Compter les demandes reçues non vues ──
    nb_demandes = db.friendships.count_documents({
        "receiver_id":       ObjectId(current_user_id),
        "status":            "pending",
        "seen_by_recipient": False
    })

    return jsonify({
        "mes_articles": mes_articles,
        "fil_articles":  fil_articles,
        "nb_demandes":   nb_demandes,
    }), 200