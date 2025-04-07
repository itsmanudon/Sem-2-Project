from eventregistry import *
import os
from dotenv import load_dotenv
import json

load_dotenv()

YOUR_API_KEY = str(os.getenv("EVENT_REGISTRY_API_KEY"))
'''er = EventRegistry(apiKey = YOUR_API_KEY)

# get the USA URI
usUri = er.getLocationUri("USA")    # = http://en.wikipedia.org/wiki/United_States

q = QueryArticlesIter(
    keywords = QueryItems.OR(["George Clooney", "Sandra Bullock"]),
    minSentiment = 0.4,
    sourceLocationUri = usUri,
    dataType = ["news", "blog"])

print("Hello")

# obtain at most 500 newest articles or blog posts, remove maxItems to get all
for art in q.execQuery(er, sortBy = "date", maxItems = 500):
    print(art)'''

# since we want recent results, just prevent use of archive - in this way we don't need to set any date constraints
er = EventRegistry(apiKey = YOUR_API_KEY, allowUseOfArchive = False)

q = QueryArticlesIter(
    keywords = "Tesla Inc",
    sourceLocationUri=QueryItems.OR([
        "http://en.wikipedia.org/wiki/United_Kingdom",
        "http://en.wikipedia.org/wiki/United_States",
        "http://en.wikipedia.org/wiki/Canada"]),
    ignoreSourceGroupUri="paywall/paywalled_sources",
    dataType= ["news", "pr"])

# we limit here the results to 100. If you want more, remove or increasae maxItems
for article in q.execQuery(er, sortBy="date", sortByAsc=False, maxItems=10):
    print(article)

# alternatively, the same query using the query language could look something like this:
qStr = """
{
    "$query": {
        keyword": "Tesla Inc",
        "sourceLocationUri": {
            "$or": [
                "http://en.wikipedia.org/wiki/United_Kingdom",
                "http://en.wikipedia.org/wiki/United_States",
                "http://en.wikipedia.org/wiki/Canada"
            ]},
        "$not": {
            "sourceGroupUri": "paywall/paywalled_sources"
        }
    },
    "$filter": {
        "dataType": ["news", "pr"]
    }
}
"""
q = QueryArticlesIter.initWithComplexQuery(qStr)