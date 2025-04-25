from fastapi import APIRouter
from pydantic import BaseModel
import ast
from core.planner import generate_search_prompts
from core.llm import call_llm
from core.search import search_web  # Brave API-based search
from core.flashcards import generate_flashcards_from_explanation
# from core.agents.quiz_agent import generate_quiz_direct
from core.agents.quiz_agent import get_quiz_agent

router = APIRouter()

class QueryRequest(BaseModel):
    question: str

@router.post("/query")
async def process_query(request: QueryRequest):
    topic = request.question

    # Step 1: Generate search prompts
    search_prompts = generate_search_prompts(topic)

    try:
        # Handle both stringified and native lists
        prompt_list = ast.literal_eval(search_prompts) if isinstance(search_prompts, str) else search_prompts
        first_prompt = prompt_list[0]
            # Remove any leading number/bullet like '1. ', '2. ', etc.
        if "." in first_prompt[:4]:
            first_prompt = first_prompt.split(".", 1)[1].strip()
            # Remove any stray quotes
        first_prompt = first_prompt.strip('"').strip("'")

        print(f"🔍 Searching for: {first_prompt, prompt_list}")

        # Step 2: Search the web using the first prompt (Brave API)
        results = search_web(first_prompt, num_results=5)
        print(f"🔍 Search results: {results}")

        # Step 3: Extract snippets and prepare input for LLM
        content_to_summarize = "\n".join([
            res.get("snippet", "") for res in results if res.get("snippet")
        ]).strip()

        if not content_to_summarize:
            return {"error": "No snippet data available to summarize."}

        # Step 4: Simplify content with LLM
        system_prompt = "You are a helpful tutor who explains complex topics in simple terms for students."
        user_prompt = f"Based on the following info from the web, explain '{topic}' in simple terms:\n\n{content_to_summarize}"

        simplified_explanation = call_llm(system_prompt, user_prompt)

        # Step 5: Generate flashcards
        flashcards = generate_flashcards_from_explanation(simplified_explanation)

        return {
            "search_prompt": first_prompt,
            "results": results,
            "explanation": simplified_explanation,
            "flashcards": flashcards
        }

    except Exception as e:
        return {"error": str(e)}
    
class QuizRequest(BaseModel):
    topic: str
    explanation: str  # directly passed from the /query endpoint output

# @router.post("/quiz")
# async def generate_quiz_from_summary(request: QuizRequest):
#     agent = get_quiz_agent()

#     # Use the passed explanation to generate the quiz
#     quiz = agent.run(f"Generate a quiz from the following explanation:\n\n{request.explanation}")

#     return {
#         "topic": request.topic,
#         "quiz": quiz
#     }

quiz_agent = get_quiz_agent()

@router.post("/quiz")
def quiz_route(data: dict):
    explanation = data["explanation"]
    quiz = quiz_agent["generate_quiz"](explanation)
    return {"quiz": quiz}

@router.post("/evaluate")
def evaluate_route(data: dict):
    questions = data["quiz"]
    answers = data["answers"]
    evaluation = quiz_agent["evaluate_answers"](questions, answers)
    feedback = quiz_agent["generate_feedback"](evaluation)
    print("Evaluation:", evaluation)
    print("Feedback:", feedback)
    return {"evaluation": evaluation, "feedback": feedback}


