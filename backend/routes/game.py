from flask import Blueprint, jsonify, request
from config import DEFAULT_STATE
from services.redis_service import redis_service

game_bp = Blueprint('game', __name__)


def _get_user_id():
    """Extrait le X-User-ID du header de la requête."""
    user_id = request.headers.get('X-User-ID')
    return user_id


@game_bp.route('/api/state', methods=['GET'])
def get_state():
    user_id = _get_user_id()
    if not user_id:
        return jsonify({"error": "User ID missing"}), 400

    state = redis_service.get_game(user_id)
    return jsonify(state)


@game_bp.route('/api/save', methods=['POST'])
def save_state():
    user_id = _get_user_id()
    if not user_id:
        return jsonify({"error": "User ID missing"}), 400

    data = request.json
    redis_service.save_game(user_id, data)
    return jsonify({"status": "success", "state": data})


@game_bp.route('/api/reset', methods=['DELETE'])
def reset_state():
    user_id = _get_user_id()
    if not user_id:
        return jsonify({"error": "User ID missing"}), 400

    redis_service.delete_game(user_id)
    return jsonify(DEFAULT_STATE)
