import os
import requests
from dotenv import load_dotenv
from groq import Groq

load_dotenv()

client = Groq(
    api_key=os.getenv("GROQ_API_KEY")
)

def call_llm(system_prompt: str, user_prompt: str) -> str:
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile", 
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ]
    )
    return response.choices[0].message.content.strip()
    print(response.choices[0].message.content.strip())


# GROQ_API_KEY = os.getenv("GROQ_API_KEY")
# GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"

# def get_explanation(topic: str) -> str:
#     headers = {
#         "Authorization": f"Bearer {GROQ_API_KEY}",
#         "Content-Type": "application/json"
#     }

#     SYSTEM_PROMPT = """
#     You are an AI tutor that explains concepts in detail using analogies. 
#     For the given concept, provide a simple explanation around 300 words long. give an suitable analogy to help 
#     the user understand the concept better. Explain the concept in a way that a 10-year-old can understand.
#     """

#     data = {
#         "model": "llama-3.3-70b-specdec",  # Replace with your model
#         "messages": [
#             {"role": "system", "content": SYSTEM_PROMPT},
#             {"role": "user", "content": f"Explain the concept of: {topic}"}
#         ]
#     }

#     response = requests.post(GROQ_URL, headers=headers, json=data)
#     response.raise_for_status()
#     return response.json()["choices"][0]["message"]["content"]
