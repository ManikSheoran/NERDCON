import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Game from "./pages/Game";
import Leaderboard from "./pages/Leaderboard";
import Navbar from "./components/Navbar";
import "./index.css";

function App() {
  const token = localStorage.getItem("token");

  return (
    <div className="min-h-screen text-brand-highlight">
      <BrowserRouter>
        <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-10 sm:px-8 lg:px-12">
          <Navbar />
          <main className="mt-10 flex-1">
            <Routes>
              <Route
                path="/"
                element={<Navigate to={token ? "/game" : "/login"} />}
              />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/game" element={<Game />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </div>
  );
}

export default App;
