from flask import Flask
from flask_cors import CORS
import os

def create_app():
	app = Flask(__name__)

	from app.api import bp as api_bp
	app.register_blueprint(api_bp, url_prefix='/api')

	CORS(app)
	return app
