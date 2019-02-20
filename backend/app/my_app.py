from flask import Flask, jsonify, request
from flask_cors import CORS
import solr


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

    my_solr = solr.Solr()
    movies = my_solr.search(query, debug=False)
    movies_encoded = [dict(movie) for movie in movies]

    response = jsonify(movies_encoded)
    response.status_code = 200

    return response

@app.route('/api/morelikethis', methods=['POST'])
def morelikethis():
    data = request.get_json()
    query = data.get("query")

    my_solr = solr.Solr()
    movies = my_solr.recommend(query, 'overview,genres.name', debug=True)
    movies = dict(movies.raw_response)['moreLikeThis'][query[3:]]['docs']
    movies_encoded = [dict(movie) for movie in movies]

    response = jsonify(movies_encoded)
    response.status_code = 200

    return response
