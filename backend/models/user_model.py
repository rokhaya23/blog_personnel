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
from bson.errors import InvalidId
from datetime import datetime
import bcrypt


def _to_object_id(value):
    try:
        return ObjectId(value)
    except (InvalidId, TypeError):
        return None


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
        "avatar": None,
        "is_admin": False,
        "is_blocked": False,
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
    user_oid = _to_object_id(user_id)
    if not user_oid:
        return None
    return db.users.find_one({"_id": user_oid})


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
    user_oid = _to_object_id(user_id)
    if not user_oid:
        return False
    db.users.update_one(
        {"_id": user_oid},
        {"$set": {
            "is_online": True,
            "last_seen": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
        }}
    )
    return True


def set_user_offline(user_id):
    """
    Marque un utilisateur comme hors ligne.
    Appelé lors de la déconnexion.
    """
    db = get_db()
    user_oid = _to_object_id(user_id)
    if not user_oid:
        return False
    db.users.update_one(
        {"_id": user_oid},
        {"$set": {
            "is_online": False,
            "last_seen": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
        }}
    )
    return True


def search_users(query, current_user_id):
    """
    Recherche des utilisateurs par username (recherche partielle).
    Exclut l'utilisateur courant des résultats.
    $regex permet une recherche "contient" (pas exact).
    $options: "i" rend la recherche insensible à la casse.
    """
    db = get_db()
    current_user_oid = _to_object_id(current_user_id)
    if not current_user_oid:
        return []
    users = db.users.find({
        "username": {"$regex": query, "$options": "i"},
        "_id": {"$ne": current_user_oid}
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

def get_all_users():
    """
    Récupère tous les utilisateurs de la base de données.
    Utile pour afficher la liste des utilisateurs en ligne.
    """
    db = get_db()
    users = db.users.find()

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

def update_user_profile(user_id, updates):
    """
    Met à jour le profil d'un utilisateur à partir d'un dictionnaire.
    """
    db = get_db()
    user_oid = _to_object_id(user_id)
    if not user_oid:
        return {"success": False, "message": "Utilisateur introuvable"}

    if not isinstance(updates, dict):
        return {"success": False, "message": "Format de mise a jour invalide"}

    update_fields = {"updated_at": datetime.utcnow()}
    allowed_fields = {"full_name", "username", "password", "avatar"}
    payload = {k: v for k, v in updates.items() if k in allowed_fields}

    if "full_name" in payload:
        full_name = (payload.get("full_name") or "").strip()
        if not full_name:
            return {"success": False, "message": "Le nom complet est obligatoire"}
        update_fields["full_name"] = full_name

    if "username" in payload:
        username = (payload.get("username") or "").strip()
        if not username or " " in username:
            return {"success": False, "message": "Nom d'utilisateur invalide"}
        if db.users.find_one({"username": username, "_id": {"$ne": user_oid}}):
            return {"success": False, "message": "Ce nom d'utilisateur est deja pris"}
        update_fields["username"] = username

    if "password" in payload:
        password = payload.get("password") or ""
        if len(password) < 6:
            return {"success": False, "message": "Mot de passe trop court"}
        password_hash = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())
        update_fields["password_hash"] = password_hash.decode("utf-8")

    if "avatar" in payload:
        update_fields["avatar"] = payload.get("avatar")

    if len(update_fields) == 1:
        return {"success": False, "message": "Rien a modifier"}

    db.users.update_one({"_id": user_oid}, {"$set": update_fields})
    return {"success": True}

def delete_user(user_id):
    """
    Supprime un utilisateur de la base de données.
    Utile pour les tests ou la gestion des comptes.
    """
    db = get_db()
    user_oid = _to_object_id(user_id)
    if not user_oid:
        return
    db.users.delete_one({"_id": user_oid})

def get_online_users():
    """
    Récupère la liste des utilisateurs actuellement en ligne.
    Utile pour afficher les utilisateurs connectés dans le dashboard.
    """
    db = get_db()
    users = db.users.find({"is_online": True})

    result = []
    for user in users:
        result.append({
            "id": str(user["_id"]),
            "full_name": user["full_name"],
            "username": user["username"],
            "last_seen": user.get("last_seen"),
        })
    return result

def get_user_status(user_id):
    """
    Récupère le statut en ligne d'un utilisateur.
    Retourne un dictionnaire avec is_online et last_seen.
    """
    db = get_db()
    user_oid = _to_object_id(user_id)
    if not user_oid:
        return None
    user = db.users.find_one({"_id": user_oid}, {"is_online": 1, "last_seen": 1})
    if user:
        return {
            "is_online": user.get("is_online", False),
            "last_seen": user.get("last_seen"),
        }
    return None

def get_user_profile(user_id):
    """
    Récupère le profil complet d'un utilisateur par son id.
    Retourne un dictionnaire avec les informations de l'utilisateur (sans password).
    """
    db = get_db()
    user_oid = _to_object_id(user_id)
    if not user_oid:
        return None
    user = db.users.find_one({"_id": user_oid})
    if user:
        return {
            "id": str(user["_id"]),
            "full_name": user["full_name"],
            "username": user["username"],
            "is_online": user.get("is_online", False),
            "last_seen": user.get("last_seen"),
            "created_at": user.get("created_at"),
            "updated_at": user.get("updated_at"),
        }
    return None

def get_user_by_username(username):
    """
    Récupère un utilisateur par son username.
    Retourne un dictionnaire avec les informations de l'utilisateur (sans password).
    """
    db = get_db()
    user = db.users.find_one({"username": username})
    if user:
        return {
            "id": str(user["_id"]),
            "full_name": user["full_name"],
            "username": user["username"],
            "is_online": user.get("is_online", False),
            "last_seen": user.get("last_seen"),
            "created_at": user.get("created_at"),
            "updated_at": user.get("updated_at"),
        }
    return None

def get_user_by_id(user_id):
    """
    Récupère un utilisateur par son id.
    Retourne un dictionnaire avec les informations de l'utilisateur (sans password).
    """
    db = get_db()
    user_oid = _to_object_id(user_id)
    if not user_oid:
        return None
    user = db.users.find_one({"_id": user_oid})
    if user:
        return {
            "id": str(user["_id"]),
            "full_name": user["full_name"],
            "username": user["username"],
            "is_online": user.get("is_online", False),
            "last_seen": user.get("last_seen"),
            "created_at": user.get("created_at"),
            "updated_at": user.get("updated_at"),
        }
    return None

def get_user_count():
    """
    Récupère le nombre total d'utilisateurs dans la base de données.
    Utile pour les statistiques du dashboard.
    """
    db = get_db()
    return db.users.count_documents({})

def get_online_user_count():
    """
    Récupère le nombre d'utilisateurs actuellement en ligne.
    Utile pour les statistiques du dashboard.
    """
    db = get_db()
    return db.users.count_documents({"is_online": True})

def get_recent_users(limit=5):
    """
    Récupère les utilisateurs les plus récemment inscrits.
    Retourne une liste de dictionnaires avec les informations des utilisateurs.
    """
    db = get_db()
    users = db.users.find().sort("created_at", -1).limit(limit)

    result = []
    for user in users:
        result.append({
            "id": str(user["_id"]),
            "full_name": user["full_name"],
            "username": user["username"],
            "is_online": user.get("is_online", False),
            "last_seen": user.get("last_seen"),
            "created_at": user.get("created_at"),
        })
    return result

def get_active_users(limit=5):
    """
    Récupère les utilisateurs les plus actifs (en ligne récemment).
    Retourne une liste de dictionnaires avec les informations des utilisateurs.
    """
    db = get_db()
    users = db.users.find().sort("last_seen", -1).limit(limit)

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

def change_user_avatar(user_id, avatar_url):
    """
    Met à jour l'avatar d'un utilisateur.
    Utile pour permettre aux utilisateurs de personnaliser leur profil.
    """
    db = get_db()
    user_oid = _to_object_id(user_id)
    if not user_oid:
        return False
    db.users.update_one(
        {"_id": user_oid},
        {"$set": {
            "avatar": avatar_url,
            "updated_at": datetime.utcnow(),
        }}
    )
    return True

def change_password(user_id, old_password, new_password):
    """
    Change le mot de passe d'un utilisateur.
    Verifie d'abord que l'ancien mot de passe est correct.
    """
    db = get_db()
    user_oid = _to_object_id(user_id)
    if not user_oid:
        return {"success": False, "message": "Utilisateur introuvable"}

    user = db.users.find_one({"_id": user_oid})
    if not user:
        return {"success": False, "message": "Utilisateur introuvable"}

    if not bcrypt.checkpw(old_password.encode("utf-8"), user["password_hash"].encode("utf-8")):
        return {"success": False, "message": "Ancien mot de passe incorrect"}

    new_hash = bcrypt.hashpw(new_password.encode("utf-8"), bcrypt.gensalt())

    db.users.update_one(
        {"_id": user_oid},
        {"$set": {
            "password_hash": new_hash.decode("utf-8"),
            "updated_at": datetime.utcnow(),
        }}
    )

    return {"success": True}

def is_admin(user_id):
    """
    Vérifie si un utilisateur est admin.
    """
    db = get_db()
    user_oid = _to_object_id(user_id)
    if not user_oid:
        return False
    user = db.users.find_one({"_id": user_oid})
    if not user:
        return False
    return user.get("is_admin", False)


def get_all_users_with_stats():
    """
    Récupère tous les utilisateurs avec leurs statistiques.
    Utilisé par le dashboard admin.
    """
    db = get_db()
    users = db.users.find().sort([("created_at", -1)])

    result = []
    for user in users:
        user_id = user["_id"]
        article_count = db.articles.count_documents({"author_id": user_id})
        comment_count = db.comments.count_documents({"author_id": user_id})

        result.append({
            "id": str(user_id),
            "full_name": user["full_name"],
            "username": user["username"],
            "avatar": user.get("avatar"),
            "is_online": user.get("is_online", False),
            "last_seen": user.get("last_seen").isoformat() if user.get("last_seen") else None,
            "is_admin": user.get("is_admin", False),
            "is_blocked": user.get("is_blocked", False),
            "article_count": article_count,
            "comment_count": comment_count,
            "created_at": user["created_at"].isoformat(),
        })

    return result


def toggle_block_user(user_id):
    """
    Bloque ou débloque un utilisateur.
    Un utilisateur bloqué ne peut plus se connecter.
    """
    db = get_db()
    user_oid = _to_object_id(user_id)
    if not user_oid:
        return {"success": False, "message": "Utilisateur introuvable"}
    user = db.users.find_one({"_id": user_oid})

    if not user:
        return {"success": False, "message": "Utilisateur introuvable"}

    # Inverser le statut de blocage
    new_status = not user.get("is_blocked", False)

    db.users.update_one(
        {"_id": user_oid},
        {"$set": {
            "is_blocked": new_status,
            "updated_at": datetime.utcnow(),
        }}
    )

    return {
        "success": True,
        "is_blocked": new_status,
        "message": f"Utilisateur {'bloque' if new_status else 'debloque'}",
    }


def get_platform_stats():
    """
    Récupère les statistiques globales de la plateforme.
    """
    db = get_db()

    return {
        "total_users": db.users.count_documents({}),
        "online_users": db.users.count_documents({"is_online": True}),
        "blocked_users": db.users.count_documents({"is_blocked": True}),
        "total_articles": db.articles.count_documents({}),
        "public_articles": db.articles.count_documents({"is_public": True}),
        "private_articles": db.articles.count_documents({"is_public": False}),
        "total_comments": db.comments.count_documents({}),
        "total_friendships": db.friendships.count_documents({"status": "accepted"}),
        "pending_friendships": db.friendships.count_documents({"status": "pending"}),
    }
