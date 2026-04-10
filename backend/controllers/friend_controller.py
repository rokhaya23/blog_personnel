from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from bson import ObjectId
from bson.errors import InvalidId
from database.db import get_db
from controllers.article_controller import format_article
from models.article_model import get_user_articles as fetch_articles
import re


friend_bp = Blueprint("friends", __name__)


def to_object_id(value):
    try:
        return ObjectId(value)
    except (InvalidId, TypeError):
        return None

# ════════════════════════════════════════
# RECHERCHER UN UTILISATEUR
# ════════════════════════════════════════
@friend_bp.route("/api/users/search", methods=["GET"])
@jwt_required()
def search_users():
    db = get_db()
    current_user_id = get_jwt_identity()
    current_user_oid = to_object_id(current_user_id)
    if not current_user_oid:
        return jsonify({"message": "Session invalide"}), 401

    # Récupérer le paramètre q dans l'URL (?q=rokhaya)
    query = request.args.get("q", "").strip()

    if len(query) < 2 or len(query) > 50:
        return jsonify({"message": "Minimum 2 caractères"}), 400

    safe_query = re.escape(query)

    # $regex = cherche le texte n'importe où dans le champ
    # $options: "i" = insensible à la casse (majuscules/minuscules)
    users = list(db.users.find({
        "username": {"$regex": safe_query, "$options": "i"},
        "_id": {"$ne": current_user_oid} # exclure soi-même
    }, {
        "password_hash": 0 # ne jamais renvoyer le mot de passe
    }).limit(10))

    # Convertir les ObjectId en string pour JSON
    for u in users:
        u["_id"] = str(u["_id"])

    return jsonify({"users": users}), 200


# ════════════════════════════════════════
# ENVOYER UNE DEMANDE D'AMI
# POST /api/friends/request
# ════════════════════════════════════════
@friend_bp.route("/api/friends/request", methods=["POST"])
@jwt_required()
def send_request():
    db = get_db()
    current_user_id = get_jwt_identity()
    current_user_oid = to_object_id(current_user_id)
    if not current_user_oid:
        return jsonify({"message": "Session invalide"}), 401

    data = request.get_json(silent=True) or {}
    receiver_id = data.get("receiver_id")
    receiver_oid = to_object_id(receiver_id)

    if not receiver_oid:
        return jsonify({"message": "receiver_id requis"}), 400

    if current_user_oid == receiver_oid:
        return jsonify({"message": "Vous ne pouvez pas vous ajouter vous-meme"}), 400

    # Vérifier que le destinataire existe
    receiver = db.users.find_one({"_id": receiver_oid})
    if not receiver:
        return jsonify({"message": "Utilisateur introuvable"}), 404

    # Vérifier qu'une relation n'existe pas déjà
    existing = db.friendships.find_one({
        "$or": [
            {"sender_id": current_user_oid, "receiver_id": receiver_oid},
            {"sender_id": receiver_oid, "receiver_id": current_user_oid}
        ]
    })
    if existing:
        return jsonify({"message": "Une relation existe déjà"}), 400

    from datetime import datetime
    db.friendships.insert_one({
        "sender_id":         current_user_oid,
        "receiver_id":       receiver_oid,
        "status":            "pending",
        "seen_by_recipient": False,
        "created_at":        datetime.utcnow(),
        "updated_at":        datetime.utcnow()
    })

    return jsonify({"message": "Demande envoyée !"}), 201


# ════════════════════════════════════════
# LISTE DES AMIS ACCEPTÉS
# GET /api/friends
# ════════════════════════════════════════
@friend_bp.route("/api/friends", methods=["GET"])
@jwt_required()
def get_friends():
    db = get_db()
    current_user_id = get_jwt_identity()
    current_user_oid = to_object_id(current_user_id)
    if not current_user_oid:
        return jsonify({"message": "Session invalide"}), 401

    # Trouver toutes les relations "accepted"
    relations = list(db.friendships.find({
        "$or": [
            {"sender_id": current_user_oid, "status": "accepted"},
            {"receiver_id": current_user_oid, "status": "accepted"}
        ]
    }))

    # Pour chaque relation, récupérer les infos de l'ami
    amis = []
    for r in relations:
        # L'ami c'est l'autre personne dans la relation
        ami_id = r["receiver_id"] if str(r["sender_id"]) == current_user_id else r["sender_id"]

        ami = db.users.find_one(
            {"_id": ami_id},
            {"password_hash": 0} # ne jamais renvoyer le mot de passe
        )
        if ami:
            ami["_id"] = str(ami["_id"])
            ami["avatar"] = ami.get("avatar", None)
            amis.append(ami)

    return jsonify({"amis": amis}), 200


# ════════════════════════════════════════
# DEMANDES REÇUES EN ATTENTE
# GET /api/friends/requests
# ════════════════════════════════════════
@friend_bp.route("/api/friends/requests", methods=["GET"])
@jwt_required()
def get_requests():
    db = get_db()
    current_user_id = get_jwt_identity()
    current_user_oid = to_object_id(current_user_id)
    if not current_user_oid:
        return jsonify({"message": "Session invalide"}), 401

    # Trouver les demandes reçues (je suis le receiver)
    relations = list(db.friendships.find({
        "receiver_id": current_user_oid,
        "status":      "pending"
    }))

    # Pour chaque demande, récupérer les infos de l'expéditeur
    demandes = []
    for r in relations:
        sender = db.users.find_one(
            {"_id": r["sender_id"]},
            {"password_hash": 0}
        )
        if sender:
            demandes.append({
                "sender_id": str(r["sender_id"]),
                "full_name": sender["full_name"],
                "username":  sender["username"],
                "seen":      r["seen_by_recipient"]
            })

    # Marquer les demandes comme vues
    db.friendships.update_many(
        {"receiver_id": current_user_oid, "seen_by_recipient": False},
        {"$set": {"seen_by_recipient": True}}
    )

    return jsonify({"demandes": demandes}), 200


# ════════════════════════════════════════
# ACCEPTER UNE DEMANDE
# PUT /api/friends/accept
# ════════════════════════════════════════
@friend_bp.route("/api/friends/accept", methods=["PUT"])
@jwt_required()
def accept_request():
    db = get_db()
    current_user_id = get_jwt_identity()
    current_user_oid = to_object_id(current_user_id)
    if not current_user_oid:
        return jsonify({"message": "Session invalide"}), 401

    data = request.get_json(silent=True) or {}
    sender_id = data.get("sender_id")
    sender_oid = to_object_id(sender_id)
    if not sender_oid:
        return jsonify({"message": "sender_id invalide"}), 400

    from datetime import datetime
    result = db.friendships.update_one(
        {
            "sender_id": sender_oid,
            "receiver_id": current_user_oid,
            "status":      "pending"
        },
        {"$set": {
            "status":     "accepted",
            "updated_at": datetime.utcnow()
        }}
    )

    if result.modified_count == 0:
        return jsonify({"message": "Demande introuvable"}), 404

    return jsonify({"message": "Demande acceptée !"}), 200


# ════════════════════════════════════════
# REFUSER UNE DEMANDE
# PUT /api/friends/decline
# ════════════════════════════════════════
@friend_bp.route("/api/friends/decline", methods=["PUT"])
@jwt_required()
def decline_request():
    db = get_db()
    current_user_id = get_jwt_identity()
    current_user_oid = to_object_id(current_user_id)
    if not current_user_oid:
        return jsonify({"message": "Session invalide"}), 401

    data = request.get_json(silent=True) or {}
    sender_id = data.get("sender_id")
    sender_oid = to_object_id(sender_id)
    if not sender_oid:
        return jsonify({"message": "sender_id invalide"}), 400

    result = db.friendships.delete_one({
        "sender_id": sender_oid,
        "receiver_id": current_user_oid,
        "status":      "pending"
    })

    if result.deleted_count == 0:
        return jsonify({"message": "Demande introuvable"}), 404

    return jsonify({"message": "Demande refusée"}), 200


# ════════════════════════════════════════
# ANNULER UNE DEMANDE ENVOYÉE
# DELETE /api/friends/request/<receiver_id>
# ════════════════════════════════════════
@friend_bp.route("/api/friends/request/<receiver_id>", methods=["DELETE"])
@jwt_required()
def cancel_request(receiver_id):
    db = get_db()
    current_user_id = get_jwt_identity()
    current_user_oid = to_object_id(current_user_id)
    receiver_oid = to_object_id(receiver_id)

    if not current_user_oid or not receiver_oid:
        return jsonify({"message": "Identifiants invalides"}), 400

    result = db.friendships.delete_one({
        "sender_id": current_user_oid,
        "receiver_id": receiver_oid,
        "status": "pending"
    })

    if result.deleted_count == 0:
        return jsonify({"message": "Aucune demande à annuler"}), 404

    return jsonify({"message": "Demande annulée"}), 200


# ════════════════════════════════════════
# DEMANDES ENVOYÉES EN ATTENTE
# GET /api/friends/pending-sent
# ════════════════════════════════════════
@friend_bp.route("/api/friends/pending-sent", methods=["GET"])
@jwt_required()
def pending_sent():
    db = get_db()
    current_user_id = get_jwt_identity()
    current_user_oid = to_object_id(current_user_id)
    if not current_user_oid:
        return jsonify({"message": "Session invalide"}), 401

    relations = list(db.friendships.find({
        "sender_id": current_user_oid,
        "status": "pending"
    }))

    pending = []
    for r in relations:
        user = db.users.find_one({"_id": r["receiver_id"]}, {"password_hash": 0})
        if user:
            user["_id"] = str(user["_id"])
            pending.append(user)

    return jsonify({"pending": pending}), 200


# ════════════════════════════════════════
# SUPPRIMER UN AMI
# DELETE /api/friends/<ami_id>
# ════════════════════════════════════════
@friend_bp.route("/api/friends/<ami_id>", methods=["DELETE"])
@jwt_required()
def remove_friend(ami_id):
    db = get_db()
    current_user_id = get_jwt_identity()
    current_user_oid = to_object_id(current_user_id)
    ami_oid = to_object_id(ami_id)
    if not current_user_oid:
        return jsonify({"message": "Session invalide"}), 401
    if not ami_oid:
        return jsonify({"message": "Ami invalide"}), 400

    result = db.friendships.delete_one({
        "$or": [
            {"sender_id": current_user_oid, "receiver_id": ami_oid},
            {"sender_id": ami_oid, "receiver_id": current_user_oid}
        ],
        "status": "accepted"
    })

    if result.deleted_count == 0:
        return jsonify({"message": "Ami introuvable"}), 404

    return jsonify({"message": "Ami supprimé"}), 200


# ════════════════════════════════════════
# BLOQUER UN UTILISATEUR
# PUT /api/friends/<user_id>/block
# ════════════════════════════════════════
@friend_bp.route("/api/friends/<user_id>/block", methods=["PUT"])
@jwt_required()
def block_user(user_id):
    db = get_db()
    current_user_id = get_jwt_identity()
    current_user_oid = to_object_id(current_user_id)
    target_oid = to_object_id(user_id)
    if not current_user_oid:
        return jsonify({"message": "Session invalide"}), 401
    if not target_oid:
        return jsonify({"message": "Utilisateur invalide"}), 400
    if current_user_oid == target_oid:
        return jsonify({"message": "Vous ne pouvez pas vous bloquer vous-meme"}), 400

    from datetime import datetime

    # Chercher si une relation existe déjà
    existing = db.friendships.find_one({
        "$or": [
            {"sender_id": current_user_oid, "receiver_id": target_oid},
            {"sender_id": target_oid, "receiver_id": current_user_oid}
        ]
    })

    if existing:
        # Mettre à jour la relation existante
        db.friendships.update_one(
            {"_id": existing["_id"]},
            {"$set": {"status": "blocked", "updated_at": datetime.utcnow()}}
        )
    else:
        # Créer une nouvelle relation bloquée
        db.friendships.insert_one({
            "sender_id":         current_user_oid,
            "receiver_id":       target_oid,
            "status":            "blocked",
            "seen_by_recipient": False,
            "created_at":        datetime.utcnow(),
            "updated_at":        datetime.utcnow()
        })

    return jsonify({"message": "Utilisateur bloqué"}), 200

# GET /api/users/<user_id> — Profil public d'un utilisateur
@friend_bp.route("/api/users/<user_id>", methods=["GET"])
@jwt_required()
def get_user_profile(user_id):
    db = get_db()
    target_oid = to_object_id(user_id)
    if not target_oid:
        return jsonify({"message": "Utilisateur invalide"}), 400
    user = db.users.find_one(
        {"_id": target_oid},
        {"password_hash": 0}
    )
    if not user:
        return jsonify({"message": "Utilisateur introuvable"}), 404

    user["_id"] = str(user["_id"])
    # Convertir les dates en string pour JSON
    if user.get("last_seen"):
        user["last_seen"] = user["last_seen"].isoformat()
    if user.get("created_at"):
        user["created_at"] = user["created_at"].isoformat()

    return jsonify(user), 200


# GET /api/users/<user_id>/articles — Articles publics d'un utilisateur
@friend_bp.route("/api/users/<user_id>/articles", methods=["GET"])
@jwt_required()
def get_user_articles(user_id):
    user_oid = to_object_id(user_id)
    if not user_oid:
        return jsonify({"articles": []}), 200

    try:
        # Récupérer tous les articles de l'utilisateur (publics ET privés)
        articles = fetch_articles(str(user_oid))

        # Filtrer uniquement les articles publics
        # car on consulte le profil d'un AUTRE utilisateur —
        # il ne doit pas voir les articles privés
        result = [
            format_article(a)
            for a in articles
            if a.get("is_public")
        ]

        return jsonify({"articles": result}), 200

    except Exception as e:
        # En cas d'erreur on retourne une liste vide
        # plutôt qu'un 500 qui bloquerait l'affichage du profil
        print(f"Erreur get_user_articles: {e}")
        return jsonify({"articles": []}), 200

# GET /api/users/<user_id>/friends — Amis visibles d'un utilisateur
@friend_bp.route("/api/users/<user_id>/friends", methods=["GET"])
@jwt_required()
def get_user_friends(user_id):
    db = get_db()
    user_oid = to_object_id(user_id)
    if not user_oid:
        return jsonify({"amis": []}), 200

    relations = list(db.friendships.find({
        "$or": [
            {"sender_id": user_oid, "status": "accepted"},
            {"receiver_id": user_oid, "status": "accepted"}
        ]
    }))

    amis = []
    for r in relations:
        ami_id = r["receiver_id"] if str(r["sender_id"]) == user_id else r["sender_id"]
        ami = db.users.find_one(
            {"_id": ami_id},
            {"password_hash": 0}
        )
        if ami:
            amis.append({
                "_id":       str(ami["_id"]),
                "full_name": ami["full_name"],
                "username":  ami["username"],
                "is_online": ami.get("is_online", False),
                "avatar":    ami.get("avatar", None)
            })

    return jsonify({"amis": amis}), 200

# ════════════════════════════════════════
# LISTE DES UTILISATEURS BLOQUÉS
# GET /api/friends/blocked
# ════════════════════════════════════════
@friend_bp.route("/api/friends/blocked", methods=["GET"])
@jwt_required()
def get_blocked():
    db = get_db()
    current_user_id = get_jwt_identity()

    # Trouver les relations où JE suis celui qui a bloqué
    relations = list(db.friendships.find({
        "sender_id": ObjectId(current_user_id),
        "status":    "blocked"
    }))

    bloques = []
    for r in relations:
        user = db.users.find_one(
            {"_id": r["receiver_id"]},
            {"password_hash": 0}
        )
        if user:
            bloques.append({
                "_id":       str(user["_id"]),
                "full_name": user["full_name"],
                "username":  user["username"],
                "avatar":    user.get("avatar", None),
            })

    return jsonify({"bloques": bloques}), 200


# ════════════════════════════════════════
# DÉBLOQUER UN UTILISATEUR
# DELETE /api/friends/<user_id>/block
# ════════════════════════════════════════
@friend_bp.route("/api/friends/<user_id>/block", methods=["DELETE"])
@jwt_required()
def unblock_user(user_id):
    db = get_db()
    current_user_id = get_jwt_identity()

    result = db.friendships.delete_one({
        "sender_id":   ObjectId(current_user_id),
        "receiver_id": ObjectId(user_id),
        "status":      "blocked"
    })

    if result.deleted_count == 0:
        return jsonify({"message": "Relation introuvable"}), 404

    return jsonify({"message": "Utilisateur débloqué"}), 200
