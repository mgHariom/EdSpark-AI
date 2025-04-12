from fastapi import APIRouter
from pydantic import BaseModel
from core.llm import get_explanation
# from app.core.flashcard_agent import generate_flashcards_from_explanation

router = APIRouter()

class QueryRequest(BaseModel):
    question: str

@router.post("/generate")
async def generate_flashcards_and_explanation(request: QueryRequest):
    # Step 1: Get detailed explanation from the LLM
    explanation = get_explanation(request.question)
    return {"explanation": explanation}

    # Step 2: Generate flashcards from the explanation
    # flashcards = generate_flashcards_from_explanation(explanation)

    # return {"explanation": explanation, "flashcards": flashcards}
