import json
import redis
from config import REDIS_HOST, REDIS_PORT, TTL_SECONDS, DEFAULT_STATE


class RedisService:
    def __init__(self):
        self.client = redis.Redis(
            host=REDIS_HOST,
            port=REDIS_PORT,
            decode_responses=True,
            socket_timeout=5
        )

    def _get_key(self, user_id):
        return f"game:{user_id}"

    def get_game(self, user_id):
        """Récupère l'état du jeu pour un utilisateur."""
        data = self.client.get(self._get_key(user_id))
        if data:
            return json.loads(data)
        return DEFAULT_STATE.copy()

    def save_game(self, user_id, state):
        """Sauvegarde l'état du jeu avec un TTL de 30 jours."""
        key = self._get_key(user_id)
        self.client.set(key, json.dumps(state), ex=TTL_SECONDS)

    def delete_game(self, user_id):
        """Supprime la sauvegarde d'un utilisateur."""
        self.client.delete(self._get_key(user_id))


# Singleton
redis_service = RedisService()
