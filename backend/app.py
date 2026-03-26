from flask import Flask
from flask_cors import CORS
from routes.game import game_bp


def create_app():
    app = Flask(__name__)
    CORS(app)
    app.register_blueprint(game_bp)
    return app


if __name__ == '__main__':
    app = create_app()
    app.run(host='0.0.0.0', port=5000)