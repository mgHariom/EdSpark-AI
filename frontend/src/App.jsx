import { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [concept, setConcept] = useState("");
  const [flashcards, setFlashcards] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [explanation, setExplanation] = useState("");
  const [searchResults, setSearchResults] = useState([]);


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
          <h2 className="links-title">Helpful Resources</h2>
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
      </form>
    </div>
  );
  
}

export default App;
