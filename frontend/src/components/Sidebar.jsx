import { useState, useEffect } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase"; // adjust path if needed
import { useNavigate } from "react-router-dom";
import "./Sidebar.css";
import { db } from "../../firebase";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";

export default function Sidebar() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false); // State to toggle sidebar visibility
  const [searchHistory, setSearchHistory] = useState([]);

  async function getUserSearchHistory(uid) {
    try {
      const searchesRef = collection(db, "users", uid, "searches");
      const q = query(searchesRef, orderBy("createdAt", "desc"), limit(5));
  
      const querySnapshot = await getDocs(q);
      const searches = [];
      querySnapshot.forEach((doc) => {
        searches.push(doc.data().query); // only storing the query text
      });
      return searches;
    } catch (error) {
      console.error("Error fetching search history:", error);
      return [];
    }
  }

  useEffect(() => {
    async function fetchHistory() {
      const user = auth.currentUser;
      if (user) {
        const history = await getUserSearchHistory(user.uid);
        setSearchHistory(history);
      }
    }

    fetchHistory();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login"); // or your auth page route
    } catch (error) {
      console.error("Logout failed:", error.message);
    }
  };

  return (
    <div className="sidebar-container">
      {/* Hamburger Menu */}
      <div className="hamburger-menu" onClick={() => setIsOpen(!isOpen)} >
        <div className="bar"></div>
        <div className="bar"></div>
        <div className="bar"></div>
      </div>

      {/* Sidebar */}
      <div className={`sidebar ${isOpen ? "open" : ""}`}>
        <h2 className="sidebar-title">Dashboard</h2>
        <div className="sidebar-content">
          <h3 className="search-title">Recent Searches</h3>
          <ul className="sidebar-list">
            {searchHistory.length > 0 ? (
              searchHistory.map((query, index) => (
                <li key={index} className="sidebar-item">
                  {query.question}
                </li>
              ))
            ) : (
              <li className="sidebar-item-empty">No recent searches</li>
            )}
          </ul>
        </div>
        <div className="sidebar-footer">
        <button onClick={handleLogout} className="logout-button">
          Log Out
        </button>
      </div>
      </div>
    </div>
  );
}
