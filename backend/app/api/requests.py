from app.api import bp

@bp.route('/search', methods=['POST'])
def search(query):
	return