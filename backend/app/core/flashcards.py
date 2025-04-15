from core.llm import call_llm

def generate_flashcards_from_explanation(explanation: str):
    system_prompt = (
        "You are an AI tutor creating flashcards to help students actively recall information. "
        "Your flashcards must be in Q&A format. Each question should encourage the student to recall key concepts, "
        "and each answer should be short and precise. Format output as a list of JSON objects like:\n"
        "[{\"question\": \"...\", \"answer\": \"...\"}, ...]"
    )

    user_prompt = f"Generate 5 flashcards from the following explanation:\n\n{explanation}"

    response = call_llm(system_prompt, user_prompt)

    try:
        flashcards = eval(response) if isinstance(response, str) else response
        # Optional: validate structure
        valid_flashcards = [
            fc for fc in flashcards
            if isinstance(fc, dict) and "question" in fc and "answer" in fc
        ]
        return valid_flashcards
    except Exception as e:
        print("Error parsing flashcards:", e)
        return []
