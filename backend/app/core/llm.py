import os
import requests
from dotenv import load_dotenv

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"

def get_explanation(topic: str) -> str:
    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }

    SYSTEM_PROMPT = """
    You are an AI tutor that explains concepts in detail using analogies. 
    For the given concept, provide a detailed explanation along with relevant analogies to help the user understand it better.
    """

    data = {
        "model": "llama-3.3-70b-specdec",  # Replace with your model
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": f"Explain the concept of: {topic}"}
        ]
    }

    response = requests.post(GROQ_URL, headers=headers, json=data)
    response.raise_for_status()
    return response.json()["choices"][0]["message"]["content"]
