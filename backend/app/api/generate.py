from fastapi import APIRouter, Request
from pydantic import BaseModel
from typing import List
import ast
from core.planner import generate_search_prompts
from core.llm import call_llm  
from core.search import search_web

router = APIRouter()

class QueryRequest(BaseModel):
    question: str

class PromptList(BaseModel):
    prompts: List[str]

@router.post("/query")
async def process_query(request: QueryRequest):
    topic = request.question

    # Step 1: Generate search prompts
    search_prompts = generate_search_prompts(topic)

    try:
        prompt_list = prompt_list = ast.literal_eval(search_prompts) if isinstance(search_prompts, str) else search_prompts
        first_prompt = prompt_list[0].strip('"')

        # Step 2: Search the web using first prompt
        results = search_web(first_prompt)

        # Step 3: Concatenate snippets for LLM input
        content_to_summarize = "\n".join([
            res.get("snippet", "") for res in results
        ]).strip()

        if not content_to_summarize:
            return {"error": "No snippet data available to summarize."}

        # Step 4: Ask the LLM to summarize
        system_prompt = "You are a helpful tutor who explains complex topics in simple terms for students."
        user_prompt = f"Based on the following info from the web, explain '{topic}' in simple terms:\n\n{content_to_summarize}"

        simplified_explanation = call_llm(system_prompt, user_prompt)

        return {
            "search_prompt": first_prompt,
            "results": results,
            "explanation": simplified_explanation
        }
    except Exception as e:
        return {"error": str(e)}

# @router.post("/search")
# async def search_from_prompt(prompt_list: PromptList):
#     try:
#         # For now, pick the first prompt
#         query = prompt_list.prompts[0].strip('"')  # remove quotes if LLM returns quoted strings
#         print(f"🔍 Searching for: {query}")
#         results = search_web(query)
#         return {"results": results}
#     except Exception as e:
#         print("🔥 Error during search:", e)
#         return {"error": str(e)}


# @router.post("/plan")
# async def generate_plan(request: QueryRequest):
#     topic = request.question
#     print(topic) # Debugging line to check the topic

#     if not topic:
#         return {"error": "Topic is required."}

#     # Generate search prompts using the planner
#     result = generate_search_prompts(topic)
#     return {"prompts": result}


# @router.post("/generate")
# async def generate_flashcards_and_explanation(request: QueryRequest):
#     # Step 1: Get detailed explanation from the LLM
#     explanation = get_explanation(request.question)
#     return {"explanation": explanation}

#     # Step 2: Generate flashcards from the explanation
#     # flashcards = generate_flashcards_from_explanation(explanation)

#     # return {"explanation": explanation, "flashcards": flashcards}
