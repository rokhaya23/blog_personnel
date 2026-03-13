# ============================================================
# user_model.py
# MODÈLE UTILISATEUR — Accès à la collection "users" MongoDB
#
# Ce fichier contient toutes les fonctions pour manipuler
# les utilisateurs dans la base de données :
# - Créer un utilisateur (inscription)
# - Trouver un utilisateur (connexion, recherche)
# - Mettre à jour le statut en ligne
# ============================================================

from database.db import get_db
from bson.objectid import ObjectId
from datetime import datetime
import bcrypt


def create_user(full_name, username, password):
    """
    Crée un nouvel utilisateur dans la base de données.
    Le mot de passe est hashé avec bcrypt avant d'être stocké.
    Retourne l'id du nouvel utilisateur ou None si le username existe déjà.
    """
    db = get_db()

    # Vérifier si le username est déjà pris
    if db.users.find_one({"username": username}):
        return None

    # Hasher le mot de passe
    # bcrypt.hashpw() transforme le mot de passe en une chaîne illisible
    # encode("utf-8") convertit le texte en bytes (requis par bcrypt)
    password_hash = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())

    # Créer le document utilisateur
    user = {
        "full_name": full_name,
        "username": username,
        "password_hash": password_hash.decode("utf-8"),  # Stocker en texte
        "is_online": False,
        "last_seen": None,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }

    # Insérer dans MongoDB et retourner l'id généré
    result = db.users.insert_one(user)
    return str(result.inserted_id)


def find_user_by_username(username):
    """
    Cherche un utilisateur par son username.
    Retourne le document complet ou None si non trouvé.
    """
    db = get_db()
    return db.users.find_one({"username": username})


def find_user_by_id(user_id):
    """
    Cherche un utilisateur par son _id MongoDB.
    Retourne le document complet ou None si non trouvé.
    """
    db = get_db()
    return db.users.find_one({"_id": ObjectId(user_id)})


def verify_password(stored_hash, password):
    """
    Vérifie si le mot de passe correspond au hash stocké.
    bcrypt.checkpw() compare le mot de passe en clair avec le hash.
    Retourne True si c'est correct, False sinon.
    """
    return bcrypt.checkpw(
        password.encode("utf-8"),
        stored_hash.encode("utf-8")
    )


def set_user_online(user_id):
    """
    Marque un utilisateur comme en ligne.
    Appelé lors de la connexion.
    """
    db = get_db()
    db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {
            "is_online": True,
            "last_seen": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
        }}
    )


def set_user_offline(user_id):
    """
    Marque un utilisateur comme hors ligne.
    Appelé lors de la déconnexion.
    """
    db = get_db()
    db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {
            "is_online": False,
            "last_seen": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
        }}
    )


def search_users(query, current_user_id):
    """
    Recherche des utilisateurs par username (recherche partielle).
    Exclut l'utilisateur courant des résultats.
    $regex permet une recherche "contient" (pas exact).
    $options: "i" rend la recherche insensible à la casse.
    """
    db = get_db()
    users = db.users.find({
        "username": {"$regex": query, "$options": "i"},
        "_id": {"$ne": ObjectId(current_user_id)}
    })

    # Convertir les résultats en liste de dictionnaires
    # On ne renvoie PAS le password_hash pour des raisons de sécurité
    result = []
    for user in users:
        result.append({
            "id": str(user["_id"]),
            "full_name": user["full_name"],
            "username": user["username"],
            "is_online": user.get("is_online", False),
            "last_seen": user.get("last_seen"),
        })
    return result