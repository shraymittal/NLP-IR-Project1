from flask import Flask, jsonify, request
from flask_cors import CORS
from app.solr import Solr


app = Flask(__name__)
CORS(app)

@app.route('/')
@app.route('/index')
def index():
    return "Hello, World!"

@app.route('/api/search', methods=['POST'])
def search():
    data = request.get_json()
    query = data.get("query")

    solr = Solr()
    results = solr.search(query, debug=True)

    response = jsonify(results)
    response.status_code = 200

    return response
