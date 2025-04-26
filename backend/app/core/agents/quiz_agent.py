from typing import Callable, Dict
from core.llm import call_llm  # your existing Groq wrapper
import json

def get_quiz_agent() -> Dict[str, Callable]:
        # Step 1: Generate quiz
    
    def generate_quiz(summary: str) -> dict:
        prompt = f"""You're a quiz master AI. Based on the explanation below, create 5 multiple-choice questions with 4 options each and indicate the correct answer.

                Explanation:
                {summary}

                Return ONLY ARRAY in this format:
                   [
                    {{
                      "question": "Your question here?",
                      "options": ["Option A", "Option B", "Option C", "Option D"],
                      "answer": "Correct option (return the actual option, not the letter)"
                    }},
                    ...
                  ]
                
                """

        response = call_llm("You're a quiz master AI.", prompt)
        # print("LLM response:", response)

        try:
            quiz = json.loads(response)  # Ensure the response is valid JSON
            if isinstance(quiz, list) and all(
                "question" in q and "options" in q and "answer" in q for q in quiz
            ):
                print("Generated quiz:", quiz)
                return quiz
            else:
                raise ValueError("Invalid quiz format")
        except (json.JSONDecodeError, ValueError) as e:
            print("Error processing LLM response:", e)
            return {"error": "Invalid quiz format"}


    # Step 2: Evaluate answers
    def evaluate_answers(quiz, user_answers):
        results = []
        score = 0

        for idx, question in enumerate(quiz):
            correct = question['answer']
            user_ans = user_answers[idx]
            is_correct = user_ans.strip().lower() == correct.strip().lower()

            results.append({
                "question": question["question"],
                "your_answer": user_ans,
                "correct_answer": correct,
                "is_correct": is_correct
            })

            if is_correct:
                score += 1

        return {
            "score": score,
            "total": len(quiz),
            "results": results
        }

    # Step 3: Generate feedback
    def generate_feedback(evaluation_json: str) -> str:
        prompt = f"""You're a tutor AI. Based on this quiz evaluation:

        {evaluation_json}

        Give positive and constructive feedback in 3-5 sentences.
        """
        return call_llm("You're a tutor AI.", prompt)

    return {
        "generate_quiz": generate_quiz,
        "evaluate_answers": evaluate_answers,
        "generate_feedback": generate_feedback,
    }
