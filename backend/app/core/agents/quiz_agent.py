# from langchain.agents import Tool, initialize_agent
# from langchain.llms.base import LLM
# from typing import List
# from core.llm import call_llm  # Use your existing Groq Llama wrapper

# # Custom LLM Wrapper
# class GroqLLM(LLM):
#     def _call(self, prompt: str, stop: List[str] = None) -> str:
#         system_prompt = "You are a helpful AI for quizzes."
#         return call_llm(system_prompt, prompt)

#     @property
#     def _llm_type(self) -> str:
#         return "custom-groq-llm"

# # Tool 1: Quiz Generator
# def generate_quiz(summary: str) -> str:
#     prompt = f"Create 5 multiple choice questions with 4 options each based on:\n{summary}"
#     return call_llm("You're a quiz master AI.", prompt)

# # Tool 2: Answer Evaluator
# def evaluate_answers(questions: str, answers: str) -> str:
#     prompt = (
#         f"Here are the questions:\n{questions}\n\n"
#         f"Here are the student's answers:\n{answers}\n\n"
#         "Evaluate them, give a score out of 5, and provide feedback."
#     )
#     return call_llm("You're an exam evaluator AI.", prompt)

# # Register tools
# tools = [
#     Tool(name="QuizGenerator", func=generate_quiz, description="Generates a quiz from a topic summary"),
#     Tool(name="AnswerEvaluator", func=evaluate_answers, description="Evaluates user answers"),
# ]

# # Setup LangChain Agent
# def get_quiz_agent():
#     llm = GroqLLM()
#     agent = initialize_agent(
#         tools=tools,
#         llm=llm,
#         agent="zero-shot-react-description",
#         verbose=True,
#         handle_parsing_errors=True,
#         max_iterations=3
#     )
#     return agent

import json
from core.llm import call_llm  # Use your existing Groq Llama wrapper

# app/core/agent/quiz_agent.py
def generate_quiz_direct(summary: str) -> list[dict]:
    """Return questions in structured JSON the UI expects."""
    prompt = (
        "Generate exactly 5 multiple‑choice questions (a, b, c, d) in JSON:\n"
        '[{"question": "...", "options": ["a","b","c","d"]} ...]\n\n'
        f"Summary:\n{summary}"
    )
    raw = call_llm("You are a quiz generator.", prompt)
    return json.loads(raw)   # ensure LLM outputs valid JSON
