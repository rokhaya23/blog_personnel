import os
from dotenv import load_dotenv

load_dotenv()  # lit le fichier .env

MONGO_URI      = os.getenv("MONGO_URI")
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
FLASK_ENV      = os.getenv("FLASK_ENV")
