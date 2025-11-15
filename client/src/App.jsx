import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Game from "./pages/Game";
import Leaderboard from "./pages/Leaderboard";
import TimerPage from "./pages/TimerPage";
import AdminPage from "./pages/AdminPage";
import Navbar from "./components/Navbar";
import HackathonCountdown from "./components/QuestCountdown";
import "./index.css";

function App() {
  const token = localStorage.getItem("token");

  return (
    <div className="min-h-screen bg-brand-gray-900 text-gray-100">
      <BrowserRouter>
        <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-8 sm:px-8 lg:px-12">
          <Navbar />
          <main className="mt-12 flex-1">
            <Routes>
              {new Date() > new Date("2025-11-15T17:00:00Z") ? (
                <>
                  <Route path="/leaderboard" element={<Leaderboard />} />
                  <Route
                    path="*"
                    element={<Navigate to="/leaderboard" replace />}
                  />
                </>
              ) : (
                <>
                  <Route
                    path="/"
                    element={<Navigate to={token ? "/game" : "/login"} />}
                  />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/game" element={<Game />} />
                  <Route path="/leaderboard" element={<Leaderboard />} />
                  <Route path="/panel" element={<AdminPage />} />
                </>
              )}
            </Routes>
          </main>
          <footer className="mt-16 flex justify-center border-t-2 border-brand-primary pt-8">
            <HackathonCountdown variant="footer" />
          </footer>
        </div>
      </BrowserRouter>
    </div>
  );
}

export default App;
