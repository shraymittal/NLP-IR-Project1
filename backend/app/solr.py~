import pysolr
from pysolr import safe_urlencode
from query import Query
import pprint

pretty = pprint.PrettyPrinter(indent = 2)

class Solr:
	url = 'http://ec2-54-167-51-90.compute-1.amazonaws.com:8983/solr/tmdb_core'

	def __init__(self):
		self.solr = pysolr.Solr(self.url)

		self.fields = {
			"main": ["title", "overview"],
			"people": ["cast.character", "cast.name"]
		}

	def create_URL(self, query, sort):
		return self.url + "/select?" + safe_urlencode({"q": query, "sort": sort})

	def process(self, query, debug = False):
		results = Query(query).reduce(debug)

		if debug:
			print(results)

		fields = [field +": "+ results["reduced"] for field in self.fields["main"]]
		query = "(" + " OR ".join(fields) + ")"

		if results["people"]:
			fields = [field +": "+ Query.require(results["people"]) for field in self.fields["people"]]
			subQuery = "(" + " OR ".join(fields) + ")"
			query += " AND " + subQuery

		if results["genres"]:
			fields = ["genres.name: " + Query.require(genre) for genre in results["genres"]]
			subQuery = "(" + " AND ".join(fields) + ")"
			query += " AND " + subQuery

		sortBy = ",".join(sortTuple[0] +" "+ sortTuple[1] for sortTuple in results["sort"])

		return query, sortBy

	def recommend(self, query, similarityField, debug=False):
		results = self.solr.more_like_this(q=query, mltfl=similarityField, mlt="true", handler=None)

		if debug:
			print("Saw {0} result(s).".format(len(results.moreLikeThis)))

			for movieID, result in results.moreLikeThis.items():
				print(result)
				# print("The title is '{0}'.".format(result['title']))

				print(result.keys())


		return results

	def search(self, rawQuery='*', debug=True):
		query, sort = self.process(rawQuery, debug=False)
		results = self.solr.search(query, sort=sort)

		if debug:
			print()
			print("Query: %s" % rawQuery)
			print("New Query: %s" % query)
			print("With sorting: %s" % sort)
			print("URL: %s" % self.create_URL(query, sort))

			print("Saw {0} result(s).".format(len(results)))

			for result in results:
				print("The title is '{0}'.".format(result['title']))

		return results


if __name__ == "__main__":
	solr = Solr()
	# solr.recommend('title:lion', 'genres', True)

	solr.search("best comedy movie last year")
	solr.search("worst romantic comedy")
	solr.search("first Harry Potter")
	solr.search("Earliest action movie")
	solr.search("latest horror movie")
	solr.search("best horror movie last year")
	solr.search("funny love stories")
	solr.search("funny New York movies")
	solr.search("shittiest movie")
	solr.search("greatest James Bond movie")
