import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import AuthPage from "./AuthPage";
import Dashboard from "./Dashboard"; // adjust paths
import { useAuth } from "./contexts/AuthContext";

function App() {
  const { currentUser } = useAuth();

  return (
    <Router>
      <Routes>
        {/* If user is logged in, go to dashboard; else login */}
        <Route
          path="/"
          element={currentUser ? <Navigate to="/" /> : <AuthPage />}
        />
        <Route
          path="/dashboard"
          element={currentUser ? <Dashboard /> : <Navigate to="/" />}
        />
        {/* Catch all other wrong routes */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
