from fastapi import APIRouter, Request
from pydantic import BaseModel
# from core.llm import get_explanation
from core.planner import generate_search_prompts
from core.llm import call_llm  

router = APIRouter()

class QueryRequest(BaseModel):
    question: str

@router.post("/plan")
async def generate_plan(request: QueryRequest):
    topic = request.question
    print(topic) # Debugging line to check the topic

    if not topic:
        return {"error": "Topic is required."}

    # Generate search prompts using the planner
    result = generate_search_prompts(topic)
    return {"prompts": result}


@router.post("/generate")
async def generate_flashcards_and_explanation(request: QueryRequest):
    # Step 1: Get detailed explanation from the LLM
    explanation = get_explanation(request.question)
    return {"explanation": explanation}

    # Step 2: Generate flashcards from the explanation
    # flashcards = generate_flashcards_from_explanation(explanation)

    # return {"explanation": explanation, "flashcards": flashcards}
