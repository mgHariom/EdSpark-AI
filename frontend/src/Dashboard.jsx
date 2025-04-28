import { useState, useEffect } from "react";
import "./Dashboard.css";
import { AuthProvider } from "./contexts/AuthContext";
import Sidebar from "./components/Sidebar";
import { saveUserSearch } from "./services/firestore";
import { auth } from "../firebase";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

function Dashboard() {
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
  const [feedback, setFeedback] = useState(null);
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [showQuizCard, setShowQuizCard] = useState(false);
  const [showResultCard, setShowResultCard] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsGenerating(true);

    try {
      const res = await fetch("https://edspark-ai.onrender.com/query", {
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
        console.log("Search results:", searchResults);
      }
    } catch (error) {
      console.error("Error generating response:", error);
    } finally {
      setIsGenerating(false);
    }
    const user = auth.currentUser;
    if (user) {
      var searchData = { question: concept };
      await saveUserSearch(user.uid, searchData);
    }
  };

  const handleGenerateQuiz = async () => {
    setLoadingQuiz(true);

    try {
      const res = await fetch("https://edspark-ai.onrender.com/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ explanation }),
      });

      const data = await res.json();
      if (data.quiz) {
        setQuizData(data.quiz);
        setShowQuizCard(true); // Show the quiz card
      }
    } catch (error) {
      console.error("Error generating quiz:", error);
    } finally {
      setLoadingQuiz(false);
    }
  };

  const handleAnswerChange = (questionIndex, answer) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionIndex]: answer,
    }));
  };

  const handleSubmitQuiz = async () => {
    try {
      const res = await fetch("https://edspark-ai.onrender.com/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quiz: quizData,
          answers: Object.values(selectedAnswers),
        }),
      });

      const data = await res.json();
      if (data.evaluation) {
        setResult(data.evaluation);
      }
      if (data.feedback) {
        setFeedback(data.feedback);
      }

      setShowQuizCard(false); // Hide the quiz card
      setShowResultCard(true); // Show the result card
    } catch (error) {
      console.error("Error evaluating quiz:", error);
    }
  };

  useEffect(() => {
    console.log("Updated flashcards:", flashcards);
  }, [flashcards]);

  return (
    <AuthProvider>
      <div className="dashboard-container">
        <Sidebar />
        <div className="container">
          <div className="header">
            <h1 className="title">Ask a Concept</h1>

            {isModalOpen && (
              <div className="modal-backdrop">
                <div className="quiz-modal">
                  <button
                    className="close-btn"
                    onClick={() => setIsModalOpen(false)}
                  >
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
                                onChange={() =>
                                  handleAnswerChange(index, option)
                                }
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
                  <div className="submit-container">
                    <button
                      className="submit-btn"
                      onClick={handleSubmitQuiz}
                      disabled={submitted}
                    >
                      {submitted ? "Submitted" : "Submit"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Result Modal */}
            {isResultModalOpen && (
              <div className="modal-backdrop">
                <div className="result-modal">
                  <button
                    className="close-btn"
                    onClick={() => setIsResultModalOpen(false)} // Close the result modal
                  >
                    ✖
                  </button>
                  <h2 className="result-title">Quiz Results</h2>
                  {result && (
                    <div className="result-content">
                      <p>
                        You scored {result.score} out of {result.total}.
                      </p>
                      <ul>
                        {result.results.map((res, index) => (
                          <li key={index}>
                            <strong>Question:</strong> {res.question}
                            <br />
                            <strong>Your Answer:</strong> {res.your_answer}
                            <br />
                            <strong>Correct Answer:</strong>{" "}
                            {res.correct_answer}
                            <br />
                            <strong>Correct:</strong>{" "}
                            {res.is_correct ? "Yes" : "No"}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {feedback && (
                    <div className="feedback-content">
                      <h3>Feedback</h3>
                      <p>{feedback}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Flashcards Section */}
            {isGenerating ? (
              // Show loading indicators when generating
              <div className="loading-container">
                <div className="cards-grid">
                  <div className="flashcard loading">
                    <div className="loading-animation"></div>
                  </div>
                  <div className="flashcard loading">
                    <div className="loading-animation"></div>
                  </div>
                  <div className="flashcard loading">
                    <div className="loading-animation"></div>
                  </div>
                </div>
              </div>
            ) : showResultCard ? (
              // Result Card
              <div className="result-container">
                <button
                  className="close-btn"
                  onClick={() => setShowResultCard(false)} // Close the result card
                >
                  ✖
                </button>
                <h2 className="result-title">Quiz Results</h2>

                {/* Circular Progress Bar for Score */}
                <div className="score-dial">
                  <CircularProgressbar
                    value={(result.score / result.total) * 100}
                    text={`${result.score}/${result.total}`}
                    styles={buildStyles({
                      textColor: "#ffca2c",
                      pathColor: "#ffca2c",
                      trailColor: "#f9fafb",
                    })}
                  />
                </div>

                {/* Results in Separate Cards */}
                <div className="results-grid">
                  {result.results.map((res, index) => (
                    <div key={index} className="result-card">
                      <h3 className="result-question">Question {index + 1}</h3>
                      <p>
                        <strong>Question:</strong> {res.question}
                      </p>
                      <p>
                        <strong>Your Answer:</strong> {res.your_answer}
                      </p>
                      <p>
                        <strong>Correct Answer:</strong> {res.correct_answer}
                      </p>
                      <p>
                        <strong>Correct:</strong>{" "}
                        {res.is_correct ? "Yes" : "No"}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Feedback in a Separate Card */}
                {feedback && (
                  <div className="feedback-card">
                    <h3>Feedback</h3>
                    <p>{feedback}</p>
                  </div>
                )}
              </div>
            ) : showQuizCard ? (
              // Quiz Card
              <div className="quiz-container">
                <h2 className="quiz-title">Quiz</h2>
                <button
                  className="close-btn"
                  onClick={() => setShowQuizCard(false)} // Close the quiz card
                >
                  ✖
                </button>
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
                              onChange={() => handleAnswerChange(index, option)}
                            />
                            {option}
                          </label>
                        ))}
                      </div>
                      
                    ))
                  ) : (
                    <p>No quiz data available.</p>
                  )}
                  <div className="submit-container">
                          <button
                            className="submit-btn"
                            onClick={handleSubmitQuiz}
                            disabled={submitted}
                          >
                            {submitted ? "Submitted" : "Submit"}
                          </button>
                        </div>
                </div>
              </div>
            ) : (
              // Other Sections (Explanation, Flashcards, Links)
              <div className="content-area">
                {/* Explanation Section */}
                {explanation && (
                  <div className="explanation-container">
                    <h2 className="explanation-title">
                      Simplified Explanation
                    </h2>
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
                          <a
                            href={item.link}
                            target="_blank"
                            className="link-item"
                          >
                            <h3 className="link-title">{item.title}</h3>
                            <p className="link-snippet">
                              {item.link.length > 25 ? `${item.link.substring(0, 25)}...` : item.link}
                            </p>
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
          <form onSubmit={handleSubmit} className="input-form">
              <input
                type="text"
                value={concept}
                onChange={(e) => setConcept(e.target.value)}
                className="input-field"
                placeholder="Type a concept"
                required
                disabled={isGenerating}
              />
              <div className="btns-container">
              <button className="generate-button" disabled={isGenerating}>
                {isGenerating ? "Generating..." : "Generate"}
              </button>

              {explanation && (
                <button
                  onClick={handleGenerateQuiz}
                  disabled={loadingQuiz}
                  className="generate-button"
                >
                  {loadingQuiz ? "Generating..." : "Generate Quiz"}
                </button>
              )}
              </div>
            </form>
        </div>
      </div>
    </AuthProvider>
  );
}

export default Dashboard;
