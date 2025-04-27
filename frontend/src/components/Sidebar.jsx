import { useState } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase"; // adjust path if needed
import { useNavigate } from "react-router-dom";
import "./Sidebar.css";

export default function Sidebar() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false); // State to toggle sidebar visibility

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
      <div className="hamburger-menu" onClick={() => setIsOpen(!isOpen)}>
        <div className="bar"></div>
        <div className="bar"></div>
        <div className="bar"></div>
      </div>

      {/* Sidebar */}
      <div className={`sidebar ${isOpen ? "open" : ""}`}>
        <h2 className="sidebar-title">Dashboard</h2>
        <button onClick={handleLogout} className="sidebar-button">
          Logout
        </button>
      </div>
    </div>
  );
}
