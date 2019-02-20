# NLP Project 1 - IR

- Our frontend code is stored in `src/index.js`
- Our backend code is stored in `backend/app`
	- `solr.py` stores our abstracted interface for interacting with Solr
	- `query.py` is the custom Query processor we wrote which leverages SpaCy and WitAI
- Sample screenshots are stored in `screenshots/`

- As mentioned in our report, there were two approaches to searching. The first (git `cd90581f0eda66945f3c90fc434e090a0c36758f`) was to sort by temporal/contextual information in Solr and then send the results to the client. This led to higher accuracy for general queries but not for queries that contained specific movie names. The latest commit has a modified search that sorts the top results within the client. Both have pros/cons, but the original is more accurate for general non-movie specific queries.