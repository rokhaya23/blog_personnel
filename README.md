# 📝 Blog Personnel — React + Flask + MongoDB

Projet de blog personnel développé dans le cadre du cours **DSIA ISI**.  
Architecture **MVC** — Frontend React (Vite) + Backend Flask + Base de données MongoDB.

---

## 🗂️ Structure du projet

```
BLOG_PERSONNEL/
├── backend/                  # 🐍 Flask — Modèle + Contrôleur
│   ├── controllers/          # Routes Flask (Blueprint)
│   ├── database/             # Connexion MongoDB
│   │   ├── db.py             # Connexion à MongoDB
│   │   └── init_db.py        # Script d'initialisation de la base
│   ├── models/               # Schémas des collections
│   │   ├── user_model.py
│   │   ├── article_model.py
│   │   ├── friendship_model.py
│   │   └── comment_model.py
│   ├── venv/                 # Environnement virtuel Python (ne pas modifier)
│   ├── .env                  # Variables d'environnement (à créer manuellement)
│   ├── app.py                # Point d'entrée Flask
│   ├── config.py             # Lecture du fichier .env
│   └── requirements.txt      # Dépendances Python
├── src/                      # ⚛️ React — Vue
├── public/
├── .gitignore
├── index.html
├── package.json
└── vite.config.js
```

---

## ⚙️ Prérequis

Assure-toi d'avoir installé ces logiciels avant de commencer :

| Logiciel | Version | Lien |
|---|---|---|
| Python | 3.10 ou + | [python.org](https://python.org/downloads) |
| Node.js | 18 ou + | [nodejs.org](https://nodejs.org) |
| Git | Dernière version | [git-scm.com](https://git-scm.com) |
| MongoDB | 7.0 | [mongodb.com](https://www.mongodb.com/try/download/community) |
| MongoDB Compass | Dernière version | [mongodb.com/compass](https://www.mongodb.com/try/download/compass) |
| VSCode | Dernière version | [code.visualstudio.com](https://code.visualstudio.com) |

---

## 🚀 Installation — Guide pour le binôme

### Étape 1 — Cloner le projet

```bash
git clone https://github.com/TON_USERNAME/blog_personnel.git
cd blog_personnel
code .
```

---

### Étape 2 — Installer les packages Flask (Backend)

```bash
# Aller dans le dossier backend
cd backend

# Créer l'environnement virtuel Python
python -m venv venv

# Activer le venv (Windows PowerShell)
venv\Scripts\activate

# Tu dois voir (venv) au début de la ligne :
# (venv) PS C:\...\backend>

# Installer tous les packages en une seule commande
pip install -r requirements.txt
```

> ⚠️ **Important** : tu dois **toujours activer le venv** avant de travailler sur Flask.  
> À chaque nouvelle session VSCode → `cd backend` → `venv\Scripts\activate`

---

### Étape 3 — Installer les packages React (Frontend)

```bash
# Revenir à la racine du projet
cd ..

# Installer tous les packages React
npm install
```

---

### Étape 4 — Créer le fichier .env (Backend)

> ⚠️ Le fichier `.env` n'est **pas sur GitHub** (il est dans `.gitignore`).  
> Tu dois le créer **manuellement** dans le dossier `backend/`.

```bash
# Dans le dossier backend/, créer le fichier .env
New-Item .env -ItemType File
```

Colle ce contenu dans le fichier `.env` :

```
MONGO_URI=mongodb://localhost:27017/blog_personnel
JWT_SECRET_KEY=blog_personnel_secret_key
FLASK_ENV=development
```

---

### Étape 5 — Initialiser la base de données

> ⚠️ **MongoDB doit être installé et en cours d'exécution** avant cette étape.  
> Si MongoDB n'est pas démarré : **Windows + R** → `services.msc` → cherche **MongoDB** → Démarrer

```bash
# Dans backend/ avec le venv activé
cd backend
venv\Scripts\activate

# Lancer le script d'initialisation (une seule fois suffit)
python database/init_db.py
```

Tu dois voir :

```
✅ Collection 'users' créée
✅ Collection 'articles' créée
✅ Collection 'friendships' créée
✅ Collection 'comments' créée
✅ Index users créés
✅ Index articles créés
✅ Index friendships créés
✅ Index comments créés

📊 Collections disponibles :
   • users (0 documents)
   • articles (0 documents)
   • friendships (0 documents)
   • comments (0 documents)

🎉 Base de données prête !
```

> 💡 Ce script est **idempotent** — si tu le relances il ne recrée pas les collections existantes.

---

### Étape 6 — Configurer l'interpréteur Python dans VSCode

1. Appuie sur **Ctrl + Shift + P**
2. Tape `Python: Select Interpreter`
3. Choisis **Python 3.x.x (venv)** → celui avec `.\backend\venv\Scripts\python.exe`

> 💡 Si tu ne le vois pas → clique **Enter interpreter path** et colle :  
> `C:\...\blog_personnel\backend\venv\Scripts\python.exe`  
> (remplace `...` par ton chemin réel obtenu avec `python -c "import sys; print(sys.executable)"`)

---

### Étape 7 — Lancer le projet

Ouvre **2 terminaux** dans VSCode (`Ctrl + Shift + 5`) :

**Terminal 1 — Backend Flask :**
```bash
cd backend
venv\Scripts\activate
python app.py
# → http://localhost:5000
```

**Terminal 2 — Frontend React :**
```bash
npm run dev
# → http://localhost:5174
```

**Tester que Flask fonctionne :**  
Ouvre ton navigateur sur `http://localhost:5000/api/ping`  
Tu dois voir : `{"message": "✅ Flask fonctionne !"}`

---

## 📦 Packages installés

### 🐍 Backend Flask (Python)

| Package | Rôle |
|---|---|
| `flask` | Framework web principal — crée l'API REST |
| `flask-cors` | Autorise React à appeler Flask (ports différents) |
| `flask-jwt-extended` | Authentification par token JWT |
| `pymongo` | Connexion et requêtes MongoDB |
| `bcrypt` | Chiffrement des mots de passe |
| `python-dotenv` | Lecture du fichier .env |
| `dnspython` | Requis par pymongo pour MongoDB Atlas |

### ⚛️ Frontend React (Node.js)

| Package | Rôle |
|---|---|
| `axios` | Appels API vers Flask |
| `react-router-dom` | Navigation entre les pages |

---

## 🗄️ Base de données MongoDB

Le projet utilise **MongoDB en local** sur le port `27017`.  
La base de données s'appelle `blog_personnel` et contient **4 collections**.

### Collections et attributs

**👤 users** — Utilisateurs inscrits sur la plateforme

| Attribut | Type | Requis | Description |
|---|---|---|---|
| `_id` | ObjectId | Auto | ID unique généré par MongoDB |
| `full_name` | String | ✅ | Nom complet de l'utilisateur |
| `username` | String | ✅ | Identifiant unique de connexion |
| `password_hash` | String | ✅ | Mot de passe chiffré avec bcrypt |
| `is_online` | Boolean | ❌ | true si l'utilisateur est connecté |
| `last_seen` | Date | ❌ | Date de la dernière activité |
| `friend_groups` | Array | ❌ | Groupes d'amis embarqués `{name, member_ids}` |
| `created_at` | Date | ✅ | Date d'inscription |
| `updated_at` | Date | ✅ | Date de modification |

**📝 articles** — Articles créés par les utilisateurs

| Attribut | Type | Requis | Description |
|---|---|---|---|
| `_id` | ObjectId | Auto | ID unique de l'article |
| `author_id` | ObjectId | ✅ | Référence → users._id |
| `title` | String | ✅ | Titre de l'article |
| `content` | String | ✅ | Contenu de l'article |
| `is_public` | Boolean | ✅ | true = visible par les amis non bloqués |
| `allow_comments` | Boolean | ✅ | true = commentaires activés |
| `reactions` | Array | ❌ | Réactions embarquées `{user_id, type, created_at}` |
| `reactions_count` | Object | ❌ | Compteurs `{like, love, haha, wow, sad}` |
| `created_at` | Date | ✅ | Date de création |
| `updated_at` | Date | ✅ | Date de modification |

**🤝 friendships** — Relations entre utilisateurs

| Attribut | Type | Requis | Description |
|---|---|---|---|
| `_id` | ObjectId | Auto | ID unique de la relation |
| `sender_id` | ObjectId | ✅ | Référence → users._id (qui envoie) |
| `receiver_id` | ObjectId | ✅ | Référence → users._id (qui reçoit) |
| `status` | String | ✅ | `pending` / `accepted` / `blocked` |
| `seen_by_recipient` | Boolean | ✅ | false = badge notification non vu |
| `created_at` | Date | ✅ | Date de la demande |
| `updated_at` | Date | ✅ | Date du dernier changement |

**💬 comments** — Commentaires des articles

| Attribut | Type | Requis | Description |
|---|---|---|---|
| `_id` | ObjectId | Auto | ID unique du commentaire |
| `article_id` | ObjectId | ✅ | Référence → articles._id |
| `author_id` | ObjectId | ✅ | Référence → users._id |
| `content` | String | ✅ | Texte du commentaire |
| `created_at` | Date | ✅ | Date du commentaire |
| `updated_at` | Date | ✅ | Date de modification |

### Voir la base de données — MongoDB Compass

1. Ouvre **MongoDB Compass**
2. Connecte-toi sur `mongodb://localhost:27017`
3. Clique sur **Connect**
4. Tu verras la base `blog_personnel` avec les 4 collections

### Démarrer MongoDB si nécessaire

```bash
# Windows — démarrer le service MongoDB
net start MongoDB

# Vérifier que MongoDB tourne
mongod --version
```

---

## 🔧 Commandes utiles

```bash
# Activer le venv (à faire à chaque session)
cd backend
venv\Scripts\activate

# Lancer Flask
python app.py

# Lancer React
npm run dev

# Initialiser la base de données (une seule fois)
python database/init_db.py

# Après avoir ajouté un nouveau package Python
pip freeze > requirements.txt

# Récupérer les dernières modifications du binôme
git pull origin main

# Envoyer ses modifications
git add .
git commit -m "feat: description de ce que tu as fait"
git push origin main
```

---

## 👥 Équipe

Projet réalisé en binôme — **DSIA ISI 2026**

---

*Blog Personnel — React + Flask + MongoDB*
