import httpx
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

BRAVE_API_KEY = os.getenv("BRAVE_SEARCH_API_KEY")
BRAVE_API_URL = "https://api.search.brave.com/res/v1/web/search"

def search_web(query: str, num_results: int = 5):
    headers = {
        "Accept": "application/json",
        "X-Subscription-Token": BRAVE_API_KEY
    }

    params = {
        "q": query,
        "count": num_results
    }

    try:
        response = httpx.get(BRAVE_API_URL, headers=headers, params=params)
        response.raise_for_status()
        data = response.json()

        results = []
        for item in data.get("web", {}).get("results", []):
            results.append({
                "title": item.get("title"),
                "link": item.get("url"),
                "snippet": item.get("description")
            })

        return results

    except Exception as e:
        print(f"Brave search failed: {e}")
        return []
