import { useState, useEffect } from "react";
import "./App.css";
import { postQuiz } from "./api/api";

function App() {
  const [concept, setConcept] = useState("");
  const [flashcards, setFlashcards] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [explanation, setExplanation] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadingQuiz, setLoadingQuiz] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizData, setQuizData] = useState([]);
  const [result, setResult] = useState(null); 

  const handleGenerateQuiz = async () => {
    setLoadingQuiz(true);
    try {
      const res = await postQuiz({ topic: concept, explanation });
      console.log("API Response:", res); // Debug the response
      if (res && Array.isArray(res.quiz)) {
        setQuizData(res.quiz); // Set quizData directly
        console.log("Quiz Data:", res.quiz); // Debug the quiz data
      } else {
        console.error("Quiz data is not valid:", res.quiz);
        setQuizData([]); // Fallback to an empty array
      }
      setIsModalOpen(true); // Open the modal
    } catch (e) {
      alert("Quiz generation failed: " + e.message);
    } finally {
      setLoadingQuiz(false);
    }
  };

  const handleOptionSelect = (questionIndex, option) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionIndex]: option,
    }));
  };

  const handleSubmitQuiz = async () => {
    setSubmitted(true);
    console.log("Submitted Answers:", selectedAnswers);

    // Simulate evaluation logic or send to backend
    const feedback = await evaluateAndGetFeedback(quizData, selectedAnswers);
    if (feedback) {
      setResult(feedback); // Set the result state with feedback
    }

    setIsModalOpen(false); // Close the modal
  };

  // if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsGenerating(true);

    try {
      const res = await fetch("http://localhost:8000/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: concept }),
      });

      const data = await res.json();
      console.log(data);

      if (data.explanation) {
        setExplanation(data.explanation);
      }

      if (Array.isArray(data.flashcards)) {
        setFlashcards(data.flashcards);
      }

      if (Array.isArray(data.results)) {
        setSearchResults(data.results);
        // setSearchResults(data.results);
        console.log("Search results:", searchResults);
      }
    } catch (error) {
      console.error("Error generating response:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    console.log("Updated flashcards:", flashcards);
  }, [flashcards]);

  async function evaluateAndGetFeedback(quiz, answers) {
    try {
      const response = await fetch("http://localhost:8000/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quiz, answers }),
      });

      if (!response.ok) throw new Error("Evaluation failed");

      const result = await response.json();

      console.log("Evaluation:", result.evaluation);
      console.log("Feedback:", result.feedback);

      return result;
    } catch (err) {
      console.error("❌ Error:", err);
      return null;
    }
  }

  // const quizData = [
  //   {
  //     question: "What is a Large Language Model (LLM)?",
  //     options: [
  //       "A weather prediction model",
  //       "A human brain simulation",
  //       "A program that understands and generates human language",
  //       "An image classification tool"
  //     ]
  //   },
  //   {
  //     question: "What makes LLMs 'large'?",
  //     options: [
  //       "Their physical size",
  //       "The amount of data and connections",
  //       "Their speed",
  //       "Their energy consumption"
  //     ]
  //   },
  //   {
  //     question: "What can LLMs NOT do?",
  //     options: [
  //       "Translate languages",
  //       "Answer questions",
  //       "Generate images",
  //       "Generate human-like text"
  //     ]
  //   },
  //   {
  //     question: "How do LLMs learn?",
  //     options: [
  //       "By trial and error",
  //       "By watching videos",
  //       "By reading huge amounts of language data",
  //       "By playing games"
  //     ]
  //   },
  //   {
  //     question: "Which of the following is an example of an LLM?",
  //     options: [
  //       "GPT-3",
  //       "Photoshop",
  //       "Excel",
  //       "Google Maps"
  //     ]
  //   }
  // ];

  return (
    <div className="container">
      <div className="header">
        <h1 className="title">Ask a Concept</h1>
      </div>

      <div className="content-area">
        {/* Explanation Card */}
        {explanation && (
          <div className="explanation-container">
            <h2 className="explanation-title">Simplified Explanation</h2>
            <p className="explanation-text">{explanation}</p>
          </div>
        )}

        {/* Flashcards Section */}
        {flashcards && flashcards.length > 0 && (
          <div className="flashcards-container">
            <h2 className="flashcard-title">Flashcards</h2>
            <div className="cards-grid">
              {flashcards.map((card, index) => (
                <div key={index} className="flashcard">
                  <p className="flashcard-content">
                    <b>
                      <strong>Q:</strong> {card.question}
                    </b>
                  </p>
                  <p className="flashcard-content">
                    <strong>A:</strong> {card.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Links Section */}
        {searchResults && searchResults.length > 0 && (
          <div className="links-container">
            <h2 className="links-title">Sources</h2>
            <ul className="links-list">
              {searchResults.map((item, index) => (
                <li key={index} className="link-card">
                  <a href={item.link} target="_blank" className="link-item">
                    <h3 className="link-title">{item.title}</h3>
                    <p className="link-snippet">{item.snippet}</p>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="input-form">
        <input
          type="text"
          value={concept}
          onChange={(e) => setConcept(e.target.value)}
          className="input-field"
          placeholder="Type the concept"
          required
          disabled={isGenerating}
        />
        <button className="generate-button" disabled={isGenerating}>
          {isGenerating ? "Generating..." : "Generate"}
        </button>

        {explanation && (
          <button
            onClick={handleGenerateQuiz}
            disabled={loadingQuiz || isModalOpen}
            className="generate-button"
          >
            {loadingQuiz ? "Generating..." : "Generate Quiz"}
          </button>
        )}
      </form>

      {isModalOpen && (
        <div className="modal-backdrop">
          <div className="quiz-modal">
            <button className="close-btn" onClick={() => setIsModalOpen(false)}>
              ✖
            </button>
            <h2 className="quiz-title">Quiz</h2>
            <div className="quiz-content">
              {Array.isArray(quizData) && quizData.length > 0 ? (
                quizData.map((q, index) => (
                  <div className="question-block" key={index}>
                    <p className="question">
                      {index + 1}. {q.question}
                    </p>
                    {q.options.map((option, optIdx) => (
                      <label key={optIdx} className="option-label">
                        <input
                          type="radio"
                          name={`question-${index}`}
                          value={option}
                          checked={selectedAnswers[index] === option}
                          onChange={() => handleOptionSelect(index, option)}
                        />
                        {option}
                      </label>
                    ))}
                  </div>
                ))
              ) : (
                <p>No quiz data available.</p>
              )}
            </div>
          </div>

          {result && (
            <>
              <h2 className="text-xl font-bold">
                Your Score: {result.evaluation.score} / 5
              </h2>
              {result.feedback.map((item, index) => (
                <div key={index} className="bg-red-100 p-3 rounded mb-2">
                  <p>
                    <strong>Q:</strong> {item.question}
                  </p>
                  <p>
                    <strong>Your Answer:</strong> {item.your_answer}
                  </p>
                  <p>
                    <strong>Correct Answer:</strong> {item.correct_answer}
                  </p>
                  <p>
                    <em>{item.feedback}</em>
                  </p>
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
