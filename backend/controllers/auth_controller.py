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
    update_user_profile,
    change_password,
)

import os
import uuid

UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads")
ALLOWED_IMAGE_EXTENSIONS = {"png", "jpg", "jpeg", "gif", "webp"}

# Créer le Blueprint — toutes les routes commencent par /api/auth
auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")


# ========================
# POST /api/auth/register — Inscription
# ========================
@auth_bp.route("/register", methods=["POST"])
def register():
    # request.get_json() récupère les données envoyées par React
    # React envoie : { "full_name": "...", "username": "...", "password": "..." }
    data = request.get_json(silent=True) or {}

    # Vérifier que tous les champs sont présents
    full_name = (data.get("full_name") or "").strip()
    username = (data.get("username") or "").strip()
    password = data.get("password") or ""

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
            "is_admin": False,
            "avatar": None,
            
        }
    }), 201


# ========================
# POST /api/auth/login — Connexion
# ========================
@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json(silent=True) or {}

    username = (data.get("username") or "").strip()
    password = data.get("password") or ""

    if not username or not password:
        return jsonify({"message": "Tous les champs sont obligatoires"}), 400

    # Chercher l'utilisateur dans la base
    user = find_user_by_username(username)

    if not user:
        return jsonify({"message": "Nom d'utilisateur ou mot de passe incorrect"}), 401

    if user.get("is_blocked", False):
        return jsonify({"message": "Ce compte est bloque. Contactez un administrateur."}), 403

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
            "avatar": user.get("avatar"),
            "is_online": user.get("is_online", False),
            "last_seen": user.get("last_seen").isoformat() if user.get("last_seen") else None,
            "is_admin": user.get("is_admin", False),
            "created_at": user["created_at"].isoformat(),
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
        "avatar": user.get("avatar"),
        "is_online": user.get("is_online", False),
        "last_seen": user.get("last_seen").isoformat() if user.get("last_seen") else None,
        "is_admin": user.get("is_admin", False),
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

# ========================
# PUT /api/auth/profile — Modifier mon profil (nom + avatar)
# ========================
@auth_bp.route("/profile", methods=["PUT"])
@jwt_required()
def update_profile():
    user_id = get_jwt_identity()

    if request.content_type and "multipart/form-data" in request.content_type:
        # Mode avec fichier avatar
        full_name = request.form.get("full_name")
        avatar_file = request.files.get("avatar")

        updates = {}
        if full_name:
            cleaned_name = full_name.strip()
            if not cleaned_name:
                return jsonify({"message": "Le nom complet ne peut pas etre vide"}), 400
            updates["full_name"] = cleaned_name

        if avatar_file and avatar_file.filename:
            if "." not in avatar_file.filename:
                return jsonify({"message": "Nom de fichier invalide"}), 400

            # Vérifier l'extension
            ext = avatar_file.filename.rsplit(".", 1)[1].lower()
            if ext not in ALLOWED_IMAGE_EXTENSIONS:
                return jsonify({"message": "Format d'image non autorise"}), 400

            # Sauvegarder le fichier
            unique_filename = f"avatar_{uuid.uuid4().hex}.{ext}"
            filepath = os.path.join(UPLOAD_FOLDER, unique_filename)
            os.makedirs(UPLOAD_FOLDER, exist_ok=True)
            avatar_file.save(filepath)

            updates["avatar"] = unique_filename

        if not updates:
            return jsonify({"message": "Rien a modifier"}), 400

        result = update_user_profile(user_id, updates)
        if not result["success"]:
            return jsonify({"message": result["message"]}), 400

    else:
        # Mode JSON (sans fichier)
        data = request.get_json(silent=True) or {}
        updates = {}
        if "full_name" in data:
            full_name = (data.get("full_name") or "").strip()
            if not full_name:
                return jsonify({"message": "Le nom complet ne peut pas etre vide"}), 400
            updates["full_name"] = full_name

        if not updates:
            return jsonify({"message": "Rien a modifier"}), 400

        result = update_user_profile(user_id, updates)
        if not result["success"]:
            return jsonify({"message": result["message"]}), 400

    # Retourner le profil mis à jour
    user = find_user_by_id(user_id)
    return jsonify({
        "message": "Profil mis a jour",
        "user": {
            "id": str(user["_id"]),
            "full_name": user["full_name"],
            "username": user["username"],
            "avatar": user.get("avatar"),
        }
    }), 200


# ========================
# PUT /api/auth/password — Changer mon mot de passe
# ========================
@auth_bp.route("/password", methods=["PUT"])
@jwt_required()
def update_password():
    user_id = get_jwt_identity()
    data = request.get_json(silent=True) or {}

    old_password = data.get("old_password")
    new_password = data.get("new_password")

    if not old_password or not new_password:
        return jsonify({"message": "Les deux mots de passe sont obligatoires"}), 400

    if len(new_password) < 6:
        return jsonify({"message": "Le nouveau mot de passe doit contenir au moins 6 caracteres"}), 400

    result = change_password(user_id, old_password, new_password)

    if not result["success"]:
        return jsonify({"message": result["message"]}), 400

    return jsonify({"message": "Mot de passe modifie avec succes"}), 200


# ========================
# GET /api/auth/avatar/<filename> — Servir un avatar
# ========================
@auth_bp.route("/avatar/<filename>", methods=["GET"])
def serve_avatar(filename):
    from flask import send_from_directory
    return send_from_directory(UPLOAD_FOLDER, filename)
