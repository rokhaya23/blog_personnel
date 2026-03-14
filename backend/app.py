from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from config import JWT_SECRET_KEY
from database.db import init_db

# ── Importer les blueprints ──
#from controllers.AuthController import auth_bp
from controllers.FriendController import friend_bp
from controllers.DashboardController import dashboard_bp

# ── Créer l'application Flask ──
app = Flask(__name__)

# ── Configuration JWT ──
app.config["JWT_SECRET_KEY"] = JWT_SECRET_KEY

# ── Activer CORS (permet à React de parler à Flask) ──
CORS(app)

# ── Initialiser JWT ──
JWTManager(app)

# ── Connecter MongoDB ──
init_db(app)

# ── Enregistrer les blueprints ──
# Chaque blueprint apporte ses routes à l'application
#app.register_blueprint(auth_bp)        # /api/login, /api/register, /api/logout
app.register_blueprint(friend_bp)       # /api/friends, /api/users/search...
app.register_blueprint(dashboard_bp)   # /api/dashboard

# ── Route de test ──
@app.route("/api/ping")
def ping():
    return {"message": "✅ Flask fonctionne !"}, 200

# ── Lancer le serveur ──
if __name__ == "__main__":
    app.run(debug=True, port=5000)