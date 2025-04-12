# backend/app/core/llm.py

import os
import requests
import json
from dotenv import load_dotenv

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"

def generate_flashcards(topic: str) -> list:
    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }

    SYSTEM_PROMPT = """
        You are an AI tutor that creates flashcards. 
        You must return a JSON array in the following format:
        [
            {"front": "Question?", "back": "Answer."},
            ...
        ]

        Do not include any explanations, markdown, or additional text.
        If you don't know the answer, still return a JSON array with 5 best-attempted flashcards.
    """

    data = {
        "model": "llama3-8b-8192",
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": f"Generate 5 flashcards on: {topic}"}
        ]
    }

    response = requests.post(GROQ_URL, headers=headers, json=data)
    response.raise_for_status()

    content = response.json()["choices"][0]["message"]["content"]

    print("Raw LLM content:", content)  # Add this for debugging

    try:
        flashcards = json.loads(content)
        if isinstance(flashcards, list):
            return flashcards
        else:
            print("Unexpected format:", flashcards)
            return []
    except json.JSONDecodeError as e:
        print("JSON parse error:", e)
        return []
