import os

class Config:
    SECRET_KEY = 'votre-clé-secrète-très-sécurisée'
    SQLALCHEMY_DATABASE_URI = 'sqlite:///legumes.db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = 'jwt-secret-key'