# app/core/planner.py
from app.core.llm import call_llm 

def generate_search_prompts(topic: str) -> list[str]:
    system_prompt = (
        "You are a helpful assistant that generates 3 highly relevant and specific Google search queries "
        "based on a given topic. The goal is to find the best explanations, articles, or videos for the user."
        "ONLY provide the search queries without any additional text or explanations."
    )

    user_prompt = f"Generate 3 search queries for this topic: '{topic}'"

    response = call_llm(system_prompt=system_prompt, user_prompt=user_prompt)

    # You can make this more robust depending on LLM output format
    return [line.strip("-• ") for line in response.split("\n") if line.strip()]
