import { useState } from "react";
import "./App.css";

function App() {
  const [concept, setConcept] = useState("");
  const [flashcards, setFlashcards] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Set generating state to true before fetch
    setIsGenerating(true);
    
    try {
      const res = await fetch("http://localhost:8000/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ concept }),
      });
      
      const data = await res.json();
      setFlashcards(data.flashcards);
    } catch (error) {
      console.error("Error generating flashcards:", error);
      // Optionally handle error state here
    } finally {
      // Set generating state to false after fetch completes (success or error)
      setIsGenerating(false);
    }
  };

  return (
    <div className="container">
      <div className="header">
        <h1 className="title">Ask a Concept</h1>
      </div>
      
      <div className="content-area">
        <div className="cards-column">
          {isGenerating ? (
            // Show loading indicators when generating
            <>
              <div className="flashcard loading">
                <div className="loading-animation"></div>
              </div>
              <div className="flashcard loading">
                <div className="loading-animation"></div>
              </div>
              <div className="flashcard loading">
                <div className="loading-animation"></div>
              </div>
            </>
          ) : flashcards.length > 0 ? (
            // Show actual flashcards when we have results
            flashcards.map((card, index) => (
              <div key={index} className="flashcard">
                <p className="flashcard-content">{card.text}</p>
              </div>
            ))
          ) : (
            // Show empty placeholders when not generating and no cards
            <>
              {/* <div className="flashcard empty"></div>
              <div className="flashcard empty"></div>
              <div className="flashcard empty"></div> */}
            </>
          )}
        </div>
        
      </div>
      
      <form onSubmit={handleSubmit} className="input-form">
        <input
          type="text"
          value={concept}
          onChange={(e) => setConcept(e.target.value)}
          className="input-field"
          placeholder="type the concept"
          required
          disabled={isGenerating}
        />
        <button 
          className="generate-button"
          disabled={isGenerating}
        >
          {isGenerating ? "Generating..." : "Generate"}
        </button>
      </form>
    </div>
  );
}

export default App;