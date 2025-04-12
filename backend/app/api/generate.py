# backend/app/api/generate.py

from fastapi import APIRouter
from pydantic import BaseModel
from core.llm import generate_flashcards

router = APIRouter()

class QueryRequest(BaseModel):
    question: str

@router.post("/flashcards")
async def generate_flashcards_endpoint(request: QueryRequest):
    flashcards = generate_flashcards(request.question)
    return {"flashcards": flashcards}

