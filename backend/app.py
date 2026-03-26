import os
import json
import redis
from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Connexion à Redis
redis_host = os.environ.get('REDIS_HOST', 'localhost')
r = redis.Redis(host=redis_host, port=6379, decode_responses=True)

DEFAULT_STATE = {
    "trombones": 0,
    "production_rate": 0
}

# Fonction utilitaire pour récupérer l'ID utilisateur
def get_user_key(req):
    # On attend un header 'X-User-ID' envoyé par le frontend
    user_id = req.headers.get('X-User-ID')
    if not user_id:
        return None
    # La clé Redis sera unique par utilisateur (ex: "game:user-1234")
    return f"game:{user_id}"

@app.route('/api/state', methods=['GET'])
def get_state():
    key = get_user_key(request)
    if not key:
        return jsonify({"error": "User ID missing"}), 400

    saved_state = r.get(key)
    
    if saved_state:
        return jsonify(json.loads(saved_state))
    else:
        return jsonify(DEFAULT_STATE)

@app.route('/api/save', methods=['POST'])
def save_state():
    key = get_user_key(request)
    if not key:
        return jsonify({"error": "User ID missing"}), 400

    data = request.json
    r.set(key, json.dumps(data), ex=2592000)  # Expire après 30 jours d'inactivité
    return jsonify({"status": "success", "state": data})

@app.route('/api/reset', methods=['DELETE'])
def reset_state():
    key = get_user_key(request)
    if not key:
        return jsonify({"error": "User ID missing"}), 400
        
    r.delete(key)
    return jsonify(DEFAULT_STATE)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)