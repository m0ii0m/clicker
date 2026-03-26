import os

# Redis
REDIS_HOST = os.environ.get('REDIS_HOST', 'localhost')
REDIS_PORT = int(os.environ.get('REDIS_PORT', 6379))

# TTL pour les sauvegardes (30 jours en secondes)
TTL_SECONDS = 2592000

# État par défaut d'un nouveau joueur
DEFAULT_STATE = {
    "trombones": 0,
    "production_rate": 0,
    "upgrades": {}
}
