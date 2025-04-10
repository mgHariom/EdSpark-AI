from fastapi import APIRouter, Request
from pydantic import BaseModel

router = APIRouter()

class ConceptRequest(BaseModel):
    concept: str

@router.post("/generate")
def generate_flashcard(req: ConceptRequest):
    
    concept = req.concept
    return {
        "flashcards": [
            {"text": f"{concept} is the study of motion."},
            {"text": f"{concept} is the study of forces."},
            {"text": f"{concept} is the study of energy."},
            {"text": f"{concept} is the study of matter."},
            {"text": f"{concept} is the study of waves."},
            {"text": f"{concept} is the study of electricity."},
        ]
    }