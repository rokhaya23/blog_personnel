# ============================================================
# auth_controller.py
# CONTROLLER AUTHENTIFICATION — Routes /api/auth/*
#
# Gère l'inscription, la connexion, la déconnexion
# et la récupération du profil.
#
# Un Blueprint Flask est comme un mini-module de routes
# qu'on branche ensuite dans l'application principale (app.py).
# ============================================================

from flask import Blueprint, request, jsonify
from flask_jwt_extended import (
    create_access_token,
    jwt_required,
    get_jwt_identity,
)
from models.user_model import (
    create_user,
    find_user_by_username,
    find_user_by_id,
    verify_password,
    set_user_online,
    set_user_offline,
)

# Créer le Blueprint — toutes les routes commencent par /api/auth
auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")


# ========================
# POST /api/auth/register — Inscription
# ========================
@auth_bp.route("/register", methods=["POST"])
def register():
    # request.get_json() récupère les données envoyées par React
    # React envoie : { "full_name": "...", "username": "...", "password": "..." }
    data = request.get_json()

    # Vérifier que tous les champs sont présents
    full_name = data.get("full_name")
    username = data.get("username")
    password = data.get("password")

    if not full_name or not username or not password:
        return jsonify({"message": "Tous les champs sont obligatoires"}), 400

    if len(password) < 6:
        return jsonify({"message": "Le mot de passe doit contenir au moins 6 caracteres"}), 400

    if " " in username:
        return jsonify({"message": "Le nom d'utilisateur ne doit pas contenir d'espaces"}), 400

    # Créer l'utilisateur dans MongoDB
    user_id = create_user(full_name, username, password)

    if not user_id:
        return jsonify({"message": "Ce nom d'utilisateur est deja pris"}), 409

    # Marquer comme en ligne
    set_user_online(user_id)

    # Créer le token JWT
    # Le token contient l'id de l'utilisateur (identity)
    # React le stockera et l'enverra à chaque requête
    access_token = create_access_token(identity=user_id)

    return jsonify({
        "message": "Inscription reussie",
        "token": access_token,
        "user": {
            "id": user_id,
            "full_name": full_name,
            "username": username,
        }
    }), 201


# ========================
# POST /api/auth/login — Connexion
# ========================
@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()

    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return jsonify({"message": "Tous les champs sont obligatoires"}), 400

    # Chercher l'utilisateur dans la base
    user = find_user_by_username(username)

    if not user:
        return jsonify({"message": "Nom d'utilisateur ou mot de passe incorrect"}), 401

    # Vérifier le mot de passe
    if not verify_password(user["password_hash"], password):
        return jsonify({"message": "Nom d'utilisateur ou mot de passe incorrect"}), 401

    user_id = str(user["_id"])

    # Marquer comme en ligne
    set_user_online(user_id)

    # Créer le token JWT
    access_token = create_access_token(identity=user_id)

    return jsonify({
        "message": "Connexion reussie",
        "token": access_token,
        "user": {
            "id": user_id,
            "full_name": user["full_name"],
            "username": user["username"],
        }
    }), 200


# ========================
# GET /api/auth/me — Mon profil
# ========================
# @jwt_required() signifie que cette route nécessite un token valide
# Si le token est absent ou invalide, Flask renvoie automatiquement une erreur 401
@auth_bp.route("/me", methods=["GET"])
@jwt_required()
def get_me():
    # get_jwt_identity() récupère l'id stocké dans le token
    user_id = get_jwt_identity()
    user = find_user_by_id(user_id)

    if not user:
        return jsonify({"message": "Utilisateur introuvable"}), 404

    return jsonify({
        "id": str(user["_id"]),
        "full_name": user["full_name"],
        "username": user["username"],
        "is_online": user.get("is_online", False),
        "last_seen": user.get("last_seen").isoformat() if user.get("last_seen") else None,
        "created_at": user["created_at"].isoformat(),
    }), 200


# ========================
# POST /api/auth/logout — Déconnexion
# ========================
@auth_bp.route("/logout", methods=["POST"])
@jwt_required()
def logout():
    user_id = get_jwt_identity()
    set_user_offline(user_id)

    return jsonify({"message": "Deconnexion reussie"}), 200