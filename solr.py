import pysolr
from pysolr import safe_urlencode
import json
import spacy
from wit import Wit
import pprint

nlp = spacy.load('en')
witClient = Wit("HILZOMTRVLI5K4EVVYSIOYC7FUP4R7PA")
pretty = pprint.PrettyPrinter(indent = 2)

class Query:
	def __init__(self, query):
		self.query = query
		self.reduced = query
		self.doc = nlp(self.query)

	def entities(self, debug = False):
		for entity in self.doc.ents:
			if debug:
				print("    %s : %s" % (entity.text, entity.label_))

			yield (entity.text, entity.text, entity.label_)


		for word in self.query.split(" "):
			witRequest = witClient.message(word)

			try:
				for release in witRequest["entities"]["release"]:
					yield word, release["value"], "RELEASE"
			except:
				pass


			try:
				for genre in witRequest["entities"]["genre"]:
					yield word, genre["value"], "GENRE"
			except:
				pass

	def reduce(self, debug = False):
		results = dict()

		results["original"] = self.query
		reducedQuery = " ".join(self.remove_stopwords())

		results["dates"] = []
		results["numbers"] = []
		results["people"] = None
		results["sort"] = []
		results["genres"] = []

		for original, entity, label in self.entities(debug):
			if label == "ORDINAL":
				continue

			# Keep location-specific movies but filter for names
			if label == "GPE":
				reducedQuery = reducedQuery.replace(original, self.require(original))
				continue

			# All other entities, remove entity from original query
			reducedQuery = reducedQuery.replace(original, "")
			if label == "PERSON":
				results["people"] = entity # Cannot differentiate between multiple names
			if label == "GENRE":
				results["genres"].append(entity)
			if label == "RELEASE":
				results["sort"].append(("release_date", entity))

		# Remove all superlatives and add to a special list
		for superlative, type, sentiment in self.superlatives(debug):
			reducedQuery = reducedQuery.replace(superlative, "")

			sortOrder = None
			if sentiment == "positive":
				sortOrder = "desc"
			if sentiment == "negative":
				sortOrder = "asc"

			if sortOrder:
				results["sort"].append(("vote_average", sortOrder))

		if not len(reducedQuery.strip()):
			results["reduced"] = "*"
		else:
			results["reduced"] = reducedQuery.strip()
		return results

	def remove_stopwords(self):
		for token in self.doc:
			if not token.is_stop and token.lemma_ not in ["movie", "film", "flick", "story"]:
				yield token.text

	@staticmethod
	def require(text):
		return '"' + text + '"'

	def superlatives(self, debug = False):
		if debug:
			print("Superlatives:")

		for token in self.doc:
			if token.tag_ in ['JJS', 'RBS']:
				witRequest = witClient.message(token.text)
				sentiment = witRequest["entities"]["sentiment"][0]["value"]
				if debug:
					print("--> %s, %s %s" % (token.text, token.tag_, sentiment))
				yield token.text, token.tag_, sentiment
			else:
				if debug:
					print("    %s, %s" % (token.text, token.tag_))

class Solr:
	url = 'http://ec2-54-167-51-90.compute-1.amazonaws.com:8983/solr/tmdb_core'

	def __init__(self):
		self.solr = pysolr.Solr(self.url)

		self.fields = {
			"main": ["title", "overview"],
			"people": ["cast.character", "cast.name"]
		}

		self.check_db()

	def check_db(self):
		if(len(self.search(debug=False))):
			print("Data is already loaded!")
			return True
		else:
			print("Loading data...")
			self.load_db()

	def create_URL(self, query, sort):
		return self.url + "/select?" + safe_urlencode({"q": query, "sort": sort})

	def load_db(self, url='tmdb_converted.json'):
		with open(url) as file:
			data = json.load(file)
			self.solr.add(data)

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
			# print("New Query: %s" % query)
			# print("With sorting: %s" % sort)
			print("URL: %s" % self.create_URL(query, sort))

			print("Saw {0} result(s).".format(len(results)))

			for result in results:
				print("The title is '{0}'.".format(result['title']))

		return results


if __name__ == "__main__":
	solr = Solr()
	# solr.recommend('title:lion', 'genres', True)

	# solr.search("best comedy movie last year")
	# solr.search("worst romantic comedy")
	# solr.search("first Harry Potter")
	# solr.search("Earliest action movie")
	# solr.search("latest horror movie")
	# solr.search("best horror movie last year")
	# solr.search("funny love stories")
	# solr.search("funny New York movies")
	# solr.search("most successful mystery")
	# solr.search("crappiest movie of 2017")
	# solr.search("shittiest movie of 2017")
	# solr.search("greatest James Bond movie")
