from pymongo import MongoClient   # Importation de MongoClient pour se connecter à MongoDB
from config import MONGO_URI

client = None
db     = None

def init_db(app):
    global client, db
    if not MONGO_URI:
        raise ValueError("MONGO_URI est manquant. Verifiez le fichier .env du backend.")
    client = MongoClient(MONGO_URI)
    db = client['blog_personnel']
    print("✅ MongoDB connecté !")

def get_db():
    return db
