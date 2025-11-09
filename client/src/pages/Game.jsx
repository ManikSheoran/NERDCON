import { useEffect, useState } from "react";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import axios from "../api/axios";
import MapComponent from "../components/MapComponent";

export default function Game() {
  const [hint, setHint] = useState(null);
  const [score, setScore] = useState(0);
  const [penalties, setPenalties] = useState(0);
  const [pins, setPins] = useState([]);
  const [position, setPosition] = useState(null);
  const [isFinalHint, setIsFinalHint] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);

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

  const refreshPins = async () => {
    if (!position) return;
    await fetchPins(position.lat, position.lng);
  };

  useEffect(() => {
    fetchHint();
    fetchState();

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setPosition({ lat: latitude, lng: longitude });
        fetchPins(latitude, longitude);
      },
      (err) => alert("Please allow location access!")
    );
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
        alert(`❌ Wrong! Penalties: ${data.penalties}${penaltyWarning}`);
        setPenalties(data.penalties);
      }
    } catch (error) {
      if (error.response?.status === 403) {
        alert("🚫 Maximum penalties reached! You cannot submit anymore.");
      } else {
        alert("Error submitting answer. Please try again.");
      }
    }
  };

  return (
    <div className="space-y-10">
      {/* Game Completed Message */}
      {gameCompleted && (
        <div className="pixel-card bg-gradient-to-r from-brand-highlight to-brand-accent">
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

      {/* Current Hint */}
      <section className="pixel-card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-pixel text-xl uppercase tracking-[0.35em] text-brand-secondary">
            {isFinalHint ? "🎯 Final Challenge" : "Current Intel"}
          </h2>
          <div className="flex items-center gap-2">
            <div
              className={`h-3 w-3 rounded-full animate-pulse ${
                isFinalHint ? "bg-brand-highlight" : "bg-brand-accent"
              }`}
            ></div>
            <span className="text-xs text-brand-secondary uppercase tracking-wider font-pixel">
              {isFinalHint ? "Final" : "Live"}
            </span>
          </div>
        </div>
        <div
          className={`rounded-2xl p-6 border-2 ${
            isFinalHint
              ? "bg-gradient-to-r from-brand-highlight/20 to-brand-accent/20 border-brand-highlight"
              : "bg-brand-highlight/10 border-brand-primary"
          }`}
        >
          <p className="text-lg leading-relaxed text-nerd-darker font-medium">
            {hint?.text ? (
              hint.text
            ) : gameCompleted ? (
              <span className="text-brand-highlight font-bold">
                All hints completed! 🎉
              </span>
            ) : (
              <span className="animate-pulse text-brand-primary">
                Calibrating scanners...
              </span>
            )}
          </p>
        </div>
        <br />
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-pixel text-lg uppercase tracking-[0.3em] text-brand-secondary">
            Mission Map
          </h3>
          <button
            type="button"
            onClick={refreshPins}
            disabled={!position}
            className="pixel-button px-4 py-2 text-[0.6rem] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            aria-label="Refresh pins"
          >
            <ArrowPathIcon className="h-5 w-5" />
            Refresh
          </button>
        </div>
        <div className="overflow-hidden rounded-2xl border-4 border-brand-primary">
          {position ? (
            <MapComponent
              pins={pins}
              position={position}
              onSelect={handlePinSelect}
            />
          ) : (
            <div className="flex h-[28rem] items-center justify-center bg-white text-nerd-dark">
              <div className="text-center">
                <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-brand-primary border-t-transparent"></div>
                <p className="font-medium">
                  Enable location services to deploy your scanner.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="pixel-card">
          <h3 className="font-pixel text-lg uppercase tracking-[0.3em] text-brand-secondary mb-6">
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
                  ? "bg-red-500 border-red-500"
                  : penalties >= 15
                  ? "bg-orange-500 border-orange-500"
                  : "bg-brand-secondary border-brand-secondary"
              }`}
            >
              <span>Penalties:</span>
              <span className="font-bold text-xl">{penalties}</span>
            </div>
          </div>
          {penalties >= 20 && (
            <div className="mt-4 p-3 bg-red-100 border-2 border-red-500 rounded-lg">
              <p className="text-red-700 font-semibold text-sm text-center">
                🚫 Maximum penalties reached! Cannot submit answers.
              </p>
            </div>
          )}
          {penalties >= 15 && penalties < 20 && (
            <div className="mt-4 p-3 bg-orange-100 border-2 border-orange-500 rounded-lg">
              <p className="text-orange-700 font-semibold text-sm text-center">
                ⚠️ Warning: {20 - penalties} penalties remaining!
              </p>
            </div>
          )}
        </div>

        <div className="pixel-card text-sm leading-relaxed">
          <h3 className="font-pixel text-lg uppercase tracking-[0.3em] text-brand-secondary mb-6">
            Mission Brief
          </h3>
          <ul className="space-y-3 text-nerd-dark">
            <li className="flex items-start gap-3">
              <span className="text-brand-accent mt-1 font-bold">▸</span>
              <span>Read intel and triangulate the target zone.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-brand-accent mt-1 font-bold">▸</span>
              <span>Move in real world & tap a pin to submit.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-brand-accent mt-1 font-bold">▸</span>
              <span>Correct hits boost score, misses add penalties.</span>
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
}
