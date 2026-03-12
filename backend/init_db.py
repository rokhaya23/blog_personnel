from pymongo import MongoClient

# Connexion à MongoDB
client = MongoClient("mongodb://localhost:27017/")
db = client["blog_personnel"]

print("🔄 Création de la base de données...")

# ── Créer les collections ──
collections = ["users", "articles", "friendships", "comments"]
existing = db.list_collection_names()

for col in collections:
    if col not in existing:
        db.create_collection(col)
        print(f"✅ Collection '{col}' créée")
    else:
        print(f"⚠️  Collection '{col}' existe déjà")

# ── Créer les index ──
print("\n🔄 Création des index...")

# users
db.users.create_index("username", unique=True)
db.users.create_index("is_online")
db.users.create_index("last_seen")
print("✅ Index users créés")

# articles
db.articles.create_index("author_id")
db.articles.create_index([("author_id", 1), ("is_public", 1)])
db.articles.create_index([("created_at", -1)])
db.articles.create_index("reactions.user_id")
print("✅ Index articles créés")

# friendships
db.friendships.create_index(
    [("sender_id", 1), ("receiver_id", 1)], unique=True
)
db.friendships.create_index([("receiver_id", 1), ("status", 1)])
db.friendships.create_index([("sender_id", 1),  ("status", 1)])
print("✅ Index friendships créés")

# comments
db.comments.create_index([("article_id", 1), ("created_at", -1)])
db.comments.create_index("author_id")
print("✅ Index comments créés")

# ── Résumé ──
print("\n📊 Collections disponibles :")
for col in db.list_collection_names():
    count = db[col].count_documents({})
    print(f"   • {col} ({count} documents)")

print("\n🎉 Base de données prête !")
client.close()
