from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from bson import ObjectId
from database.db import get_db

friend_bp = Blueprint("friends", __name__)

# ════════════════════════════════════════
# RECHERCHER UN UTILISATEUR
# ════════════════════════════════════════
@friend_bp.route("/api/users/search", methods=["GET"])
@jwt_required()
def search_users():
    db = get_db()
    current_user_id = get_jwt_identity()

    # Récupérer le paramètre q dans l'URL (?q=rokhaya)
    query = request.args.get("q", "").strip()

    if len(query) < 2:
        return jsonify({"message": "Minimum 2 caractères"}), 400

    # $regex = cherche le texte n'importe où dans le champ
    # $options: "i" = insensible à la casse (majuscules/minuscules)
    users = list(db.users.find({
        "username": {"$regex": query, "$options": "i"},
        "_id": {"$ne": ObjectId(current_user_id)} # exclure soi-même
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

    data = request.get_json()
    receiver_id = data.get("receiver_id")

    if not receiver_id:
        return jsonify({"message": "receiver_id requis"}), 400

    # Vérifier que le destinataire existe
    receiver = db.users.find_one({"_id": ObjectId(receiver_id)})
    if not receiver:
        return jsonify({"message": "Utilisateur introuvable"}), 404

    # Vérifier qu'une relation n'existe pas déjà
    existing = db.friendships.find_one({
        "$or": [
            {"sender_id":   ObjectId(current_user_id), "receiver_id": ObjectId(receiver_id)},
            {"sender_id":   ObjectId(receiver_id),     "receiver_id": ObjectId(current_user_id)}
        ]
    })
    if existing:
        return jsonify({"message": "Une relation existe déjà"}), 400

    from datetime import datetime
    db.friendships.insert_one({
        "sender_id":         ObjectId(current_user_id),
        "receiver_id":       ObjectId(receiver_id),
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

    # Trouver toutes les relations "accepted"
    relations = list(db.friendships.find({
        "$or": [
            {"sender_id":   ObjectId(current_user_id), "status": "accepted"},
            {"receiver_id": ObjectId(current_user_id), "status": "accepted"}
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

    # Trouver les demandes reçues (je suis le receiver)
    relations = list(db.friendships.find({
        "receiver_id": ObjectId(current_user_id),
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
        {"receiver_id": ObjectId(current_user_id), "seen_by_recipient": False},
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

    data = request.get_json()
    sender_id = data.get("sender_id")

    from datetime import datetime
    result = db.friendships.update_one(
        {
            "sender_id":   ObjectId(sender_id),
            "receiver_id": ObjectId(current_user_id),
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

    data = request.get_json()
    sender_id = data.get("sender_id")

    result = db.friendships.delete_one({
        "sender_id":   ObjectId(sender_id),
        "receiver_id": ObjectId(current_user_id),
        "status":      "pending"
    })

    if result.deleted_count == 0:
        return jsonify({"message": "Demande introuvable"}), 404

    return jsonify({"message": "Demande refusée"}), 200


# ════════════════════════════════════════
# SUPPRIMER UN AMI
# DELETE /api/friends/<ami_id>
# ════════════════════════════════════════
@friend_bp.route("/api/friends/<ami_id>", methods=["DELETE"])
@jwt_required()
def remove_friend(ami_id):
    db = get_db()
    current_user_id = get_jwt_identity()

    result = db.friendships.delete_one({
        "$or": [
            {"sender_id":   ObjectId(current_user_id), "receiver_id": ObjectId(ami_id)},
            {"sender_id":   ObjectId(ami_id),          "receiver_id": ObjectId(current_user_id)}
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

    from datetime import datetime

    # Chercher si une relation existe déjà
    existing = db.friendships.find_one({
        "$or": [
            {"sender_id":   ObjectId(current_user_id), "receiver_id": ObjectId(user_id)},
            {"sender_id":   ObjectId(user_id),         "receiver_id": ObjectId(current_user_id)}
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
            "sender_id":         ObjectId(current_user_id),
            "receiver_id":       ObjectId(user_id),
            "status":            "blocked",
            "seen_by_recipient": False,
            "created_at":        datetime.utcnow(),
            "updated_at":        datetime.utcnow()
        })

    return jsonify({"message": "Utilisateur bloqué"}), 200