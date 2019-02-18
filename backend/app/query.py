import spacy
from wit import Wit

nlp = spacy.load('en')
witClient = Wit("HILZOMTRVLI5K4EVVYSIOYC7FUP4R7PA")

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
			for word in original.split(" "):
				reducedQuery = reducedQuery.replace(word, "")

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
