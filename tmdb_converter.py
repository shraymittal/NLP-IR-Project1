import json

with open('tmdb.json') as original_file:
	original_data = json.load(original_file)

	movies = []
	for movie in original_data.itervalues():
		movies.append(movie)

	json.dump(movies, open('tmdb_converted.json', 'w+'), indent=2)