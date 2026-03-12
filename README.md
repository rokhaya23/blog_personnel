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
│   │   └── db.py
│   ├── models/               # Schémas des collections
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

### Étape 5 — Configurer l'interpréteur Python dans VSCode

1. Appuie sur **Ctrl + Shift + P**
2. Tape `Python: Select Interpreter`
3. Choisis **Python 3.x.x (venv)** → celui avec `.\backend\venv\Scripts\python.exe`

> 💡 Si tu ne le vois pas → clique **Enter interpreter path** et colle :  
> `C:\...\blog_personnel\backend\venv\Scripts\python.exe`  
> (remplace `...` par ton chemin réel obtenu avec `python -c "import sys; print(sys.executable)"`)

---

### Étape 6 — Lancer le projet

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

Le projet utilise **MongoDB en local**.  
La base de données `blog_personnel` contient 4 collections :

| Collection | Rôle |
|---|---|
| `users` | Utilisateurs (statut en ligne, groupes d'amis) |
| `articles` | Articles du blog (réactions embarquées) |
| `friendships` | Relations entre utilisateurs |
| `comments` | Commentaires des articles |

> 💡 La base de données est créée **automatiquement** par MongoDB lors du premier `insert`.  
> Pas besoin de la créer manuellement !

---

## 🔧 Commandes utiles

```bash
# Activer le venv (à faire à chaque session)
cd backend && venv\Scripts\activate

# Lancer Flask
python app.py

# Lancer React
npm run dev

# Après avoir ajouté un nouveau package Python
pip freeze > requirements.txt

# Récupérer les dernières modifications du binôme
git pull origin develop

# Envoyer ses modifications
git add .
git commit -m "feat: description de ce que tu as fait"
git push origin feature/nom-de-ta-branche
```

---

## 👥 Équipe

Projet réalisé en binôme — **DSIA ISI 2026**

---

*Blog Personnel — React + Flask + MongoDB*