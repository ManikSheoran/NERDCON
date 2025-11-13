import { useEffect, useState } from "react";
import { ArrowPathIcon, ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import axios from "../api/axios";
import MapComponent from "../components/MapComponent";
import AuthenticatedImage from "../components/AuthenticatedImage";

export default function Game() {
  const [hint, setHint] = useState(null);
  const [score, setScore] = useState(0);
  const [penalties, setPenalties] = useState(0);
  const [pins, setPins] = useState([]);
  const [position, setPosition] = useState(null);
  const [isFinalHint, setIsFinalHint] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);

  const downloadHintImage = async () => {
    if (!hint?.imagePath) return;

    try {
      const token = localStorage.getItem("token");
      const backendURL =
        import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";
      const baseURL = backendURL.replace(/\/api$/, "");

      const response = await fetch(`${baseURL}/hints/${hint.imagePath}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch image");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;

      const filename = hint.imagePath.split("/").pop() || "hint-image.jpg";
      a.download = filename;

      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Failed to download image:", error);
      alert("Failed to download image. Please try again.");
    }
  };

  // get current hint
  const fetchHint = async () => {
    try {
      const { data } = await axios.get("/game/hint");
      setHint(data.hint);
      setIsFinalHint(data.isFinalHint || false);
    } catch (error) {
      if (error.response?.status === 404) {
        setGameCompleted(true);
      }
    }
  };

  const fetchState = async () => {
    const { data } = await axios.get("/game/state");
    setScore(data.score);
    setPenalties(data.penalties);
  };

  const fetchPins = async (lat, lng) => {
    const { data } = await axios.get(`/game/pins/nearby?lat=${lat}&lng=${lng}`);
    setPins(data.pins);
  };

  const refreshLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setPosition({ lat: latitude, lng: longitude });
        fetchPins(latitude, longitude);
      },
      (err) => alert("Unable to get location. Please check permissions!")
    );
  };

  useEffect(() => {
    fetchHint();
    fetchState();
    refreshLocation();
  }, []);

  const handlePinSelect = async (pinId) => {
    if (!position) return;

    try {
      const { data } = await axios.post("/game/submit", {
        pinId,
        lat: position.lat,
        lng: position.lng,
      });

      if (data.success) {
        if (data.gameCompleted) {
          alert(
            `🎉 CONGRATULATIONS! You've completed all hints!\n\n✅ Final Score: ${data.totalScore}\n⚠️ Penalties: ${data.penalties}\n\nYou are a true champion! 🏆`
          );
          setGameCompleted(true);
        } else {
          alert(`✅ Correct! Earned ${data.earned} points.`);
        }
        fetchHint();
        fetchState();
      } else {
        const penaltyWarning =
          data.penalties >= 20
            ? "\n\n🚫 Maximum penalties reached! You cannot submit anymore."
            : data.penalties >= 15
            ? "\n\n⚠️ Warning: Close to maximum penalties!"
            : "";
        alert(
          `❌ ${data.message}\nPenalties: ${data.penalties}${penaltyWarning}`
        );
        setPenalties(data.penalties);
      }
    } catch (error) {
      if (error.response?.status === 403) {
        const message =
          error.response?.data?.message ||
          "Maximum penalties reached! You cannot submit anymore.";
        alert(`🚫 ${message}`);
      } else {
        alert("Error submitting answer. Please try again.");
      }
    }
  };

  return (
    <div className="space-y-10">
      {/* Game Completed Message */}
      {gameCompleted && (
        <div className="pixel-card bg-gradient-to-r from-brand-primary to-brand-pink-700 border-brand-primary">
          <div className="text-center py-8">
            <h2 className="font-pixel text-3xl uppercase tracking-[0.35em] text-white mb-4">
              🏆 Mission Complete! 🏆
            </h2>
            <p className="text-white text-lg font-semibold mb-2">
              Congratulations! You've completed all hints!
            </p>
            <p className="text-white/90 text-sm">
              Check the leaderboard to see your final ranking!
            </p>
          </div>
        </div>
      )}

      {/* Combined Hint and Map Section */}
      <section className="pixel-card">
        {/* Current Hint */}
        {hint && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-brand-primary uppercase tracking-wider">
                {isFinalHint ? "🎯 Final Challenge" : "Current Intel"}
              </h3>
              <span
                className={`px-3 py-1 rounded text-xs font-bold uppercase tracking-wider ${
                  isFinalHint
                    ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/50"
                    : "bg-green-500/20 text-green-400 border border-green-500/50"
                }`}
              >
                {isFinalHint ? "Final" : "Live"}
              </span>
            </div>
            {hint.imagePath ? (
              <div className="relative group rounded-lg overflow-hidden border-2 border-brand-gray-700">
                <AuthenticatedImage
                  src={`/hints/${hint.imagePath}`}
                  alt="Hint"
                  className="w-full h-auto max-h-96 object-contain bg-brand-gray-900"
                />
                {/* Download Button Overlay */}
                <button
                  onClick={downloadHintImage}
                  className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-brand-primary/90 hover:bg-brand-primary text-white rounded-lg p-3 shadow-lg hover:shadow-glow-pink hover:scale-110 active:scale-100"
                  title="Download hint image"
                >
                  <ArrowDownTrayIcon className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <div className="text-center py-8 px-4 bg-brand-gray-900 rounded-lg border-2 border-brand-gray-700">
                {hint.text ? (
                  <div>
                    <div className="text-6xl mb-4">🔒</div>
                    <p className="text-gray-300 text-lg">{hint.text}</p>
                  </div>
                ) : (
                  <p className="text-gray-300">No hint available</p>
                )}
              </div>
            )}
            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="text-gray-400">
                Worth:{" "}
                <span className="text-brand-primary font-bold">
                  {hint.scoreValue} points
                </span>
              </span>
            </div>
          </div>
        )}

        {/* Divider */}
        <div className="border-t-2 border-brand-gray-700 my-6"></div>

        {/* Map Section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-pixel text-lg uppercase tracking-[0.3em] text-brand-primary">
              Mission Map
            </h3>
            <button
              type="button"
              onClick={refreshLocation}
              className="pixel-button-sm bg-brand-gray-700 hover:bg-brand-gray-600 border-brand-gray-600 text-white flex items-center gap-2 group"
              title="Refresh location and nearby pins"
            >
              <ArrowPathIcon className="h-4 w-4 group-hover:rotate-180 transition-transform duration-500" />
              <span className="group-hover:animate-pulse">Refresh</span>
            </button>
          </div>
          {position ? (
            <MapComponent
              pins={pins}
              position={position}
              onSelect={handlePinSelect}
            />
          ) : (
            <div className="h-[28rem] flex items-center justify-center bg-brand-gray-900 rounded-lg border-2 border-brand-gray-700">
              <div className="text-center">
                <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-brand-primary border-t-transparent"></div>
                <p className="text-gray-400">Acquiring GPS coordinates...</p>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="pixel-card">
          <h3 className="font-pixel text-lg uppercase tracking-[0.3em] text-brand-primary mb-6">
            Team Status
          </h3>
          <div className="flex flex-wrap gap-4">
            <div className="pixel-pill bg-brand-primary text-white flex-1 justify-center border-brand-primary">
              <span>Score:</span>
              <span className="font-bold text-xl">{score}</span>
            </div>
            <div
              className={`pixel-pill text-white flex-1 justify-center ${
                penalties >= 20
                  ? "bg-red-600 border-red-600"
                  : penalties >= 15
                  ? "bg-orange-600 border-orange-600"
                  : "bg-brand-gray-700 border-brand-gray-700"
              }`}
            >
              <span>Penalties:</span>
              <span className="font-bold text-xl">{penalties}</span>
            </div>
          </div>
          {penalties >= 20 && (
            <div className="mt-4 p-3 bg-red-900/50 border-2 border-red-600 rounded-lg">
              <p className="text-red-300 font-semibold text-sm text-center">
                🚫 Maximum penalties reached! Cannot submit answers.
              </p>
            </div>
          )}
          {penalties >= 15 && penalties < 20 && (
            <div className="mt-4 p-3 bg-orange-900/50 border-2 border-orange-600 rounded-lg">
              <p className="text-orange-300 font-semibold text-sm text-center">
                ⚠️ Warning: {20 - penalties} penalties remaining!
              </p>
            </div>
          )}
        </div>

        <div className="pixel-card text-sm leading-relaxed">
          <h3 className="font-pixel text-lg uppercase tracking-[0.3em] text-brand-primary mb-6">
            Mission Brief
          </h3>
          <ul className="space-y-3 text-gray-300">
            <li className="flex items-start gap-3">
              <span className="text-brand-primary mt-1 font-bold">▸</span>
              <span>Read intel and triangulate the target zone.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-brand-primary mt-1 font-bold">▸</span>
              <span>Move in real world & tap a pin to submit.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-brand-primary mt-1 font-bold">▸</span>
              <span>Correct hits boost score, misses add penalties.</span>
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
}
