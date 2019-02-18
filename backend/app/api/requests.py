from app.api import bp
from flask import jsonify, request
from app.solr import Solr

@bp.route('/search', methods=['POST'])
def search():
	data = request.get_json()
	query = data.get("query")

	solr = Solr()
	movies = solr.search(query, debug=False)
	movies_encoded = [dict(movie) for movie in movies]

	response = jsonify(movies_encoded)
	response.status_code = 200

	return response