from serpapi import GoogleSearch
import os

def search_web(query: str, num_results: int = 5):
    search = GoogleSearch({
        "q": query,
        "api_key": os.getenv("SERPAPI_API_KEY"),
        "num": num_results
    })
    results = search.get_dict()
    return results.get("organic_results", [])
