from flask import Flask
from flask_cors import CORS
from app.webhook_listener import webhook
from app.routes import routes

def create_app():
    app = Flask(__name__)

    CORS(app, resources={r"/api/*": {"origins": "*"}})

    app.register_blueprint(webhook)  # register webhook routes
    app.register_blueprint(routes)   # register payment routes
    return app