from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from config import JWT_SECRET_KEY
from database.db import init_db

# Importer les controllers
from controllers.auth_controller import auth_bp
from controllers.article_controller import article_bp
from controllers.comment_controller import comment_bp

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

# ── Enregistrer les Blueprints (controllers) ──
app.register_blueprint(auth_bp)       # /api/auth/*
app.register_blueprint(article_bp)    # /api/articles/*
app.register_blueprint(comment_bp)    # /api/comments/*

# ── Route de test ──
@app.route("/api/ping")
def ping():
    return {"message": "✅ Flask fonctionne !"}, 200

# ── Lancer le serveur ──
if __name__ == "__main__":
    app.run(debug=True, port=5000)