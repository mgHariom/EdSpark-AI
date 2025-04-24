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

  const handleGenerateQuiz = async () => {
    setLoadingQuiz(true);
    try {
      const res = await postQuiz({ topic: concept, explanation });
      setQuizData(res.quiz);    
      console.log(res)      // array of questions
      setIsModalOpen(true);
    } catch (e) {
      alert("Quiz generation failed: " + e.message);
    } finally {
      setLoadingQuiz(false);
    }
  };

  const handleOptionSelect = (questionIndex, option) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionIndex]: option,
    }));
  };

  const handleSubmitQuiz = () => {
    setSubmitted(true);
    console.log("Submitted Answers:", selectedAnswers);
    setIsModalOpen(false);
    // You can add evaluation logic here or send to backend
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
                  <p className="flashcard-content"><b><strong>Q:</strong> {card.question}</b></p>
                  <p className="flashcard-content"><strong>A:</strong> {card.answer}</p>
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
          <button onClick={handleGenerateQuiz} disabled={loadingQuiz || isModalOpen} className="generate-button">
            {loadingQuiz ? "Generating..." : "Generate Quiz"}
          </button>
        )}
      </form>

      {isModalOpen && (
        <div className="modal-backdrop">
          <div className="quiz-modal">
            <button className="close-btn" onClick={() => setIsModalOpen(false)}>✖</button>
            <h2 className="quiz-title">Quiz</h2>
            <div className="quiz-content">
              {quizData.map((q, index) => (
                <div className="question-block" key={index}>
                  <p className="question">{index + 1}. {q.question}</p>
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
              ))}

              <div className="submit-container">
                <button className="submit-btn" onClick={handleSubmitQuiz} disabled={submitted}>
                  {submitted ? "Submitted" : "Submit"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
  
}

export default App;
