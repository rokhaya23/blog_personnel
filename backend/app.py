from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from config import JWT_SECRET_KEY
from database.db import init_db
from controllers.admin_controller import admin_bp
from controllers.auth_controller import auth_bp
from controllers.article_controller import article_bp
from controllers.comment_controller import comment_bp
from controllers.friend_controller import friend_bp
from controllers.dashboard_controller import dashboard_bp

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
app.register_blueprint(auth_bp)       # /api/login, /api/register, /api/logout
app.register_blueprint(article_bp)    # /api/articles
app.register_blueprint(comment_bp)    # /api/comments
app.register_blueprint(friend_bp)     # /api/friends, /api/users/search
app.register_blueprint(dashboard_bp)  # /api/dashboard
app.register_blueprint(admin_bp)       # /api/admin/*

# ── Route de test ──
@app.route("/api/ping")
def ping():
    return {"message": "✅ Flask fonctionne !"}, 200

# ── Lancer le serveur ──
if __name__ == "__main__":
    app.run(debug=True, port=5000)
