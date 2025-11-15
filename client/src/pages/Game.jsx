import { useEffect, useState } from "react";
import {
  ArrowPathIcon,
  ArrowDownTrayIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import axios from "../api/axios";
import MapComponent from "../components/MapComponent";
import AuthenticatedImage from "../components/AuthenticatedImage";

export default function Game() {
  const [hint, setHint] = useState(null); // Single current hint
  const [currentHintId, setCurrentHintId] = useState(1);
  const [completedHints, setCompletedHints] = useState([]);
  const [unlockedIntels, setUnlockedIntels] = useState([]);
  const [penalties, setPenalties] = useState(0);
  const [pins, setPins] = useState([]);
  const [position, setPosition] = useState(null);
  const [totalHints, setTotalHints] = useState(0);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showIntel, setShowIntel] = useState(false);
  const [unlockingIntel, setUnlockingIntel] = useState(false);

  const downloadHintImage = async () => {
    if (!hint?.images || hint.images.length === 0) return;

    try {
      const token = localStorage.getItem("token");
      const backendURL =
        import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";
      const baseURL = backendURL.replace(/\/api$/, "");

      const currentImage = hint.images[currentImageIndex];
      const response = await fetch(`${baseURL}/hints/${currentImage}`, {
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

      const filename = currentImage.split("/").pop() || "hint-image.jpg";
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

  const nextImage = () => {
    if (hint?.images && currentImageIndex < hint.images.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    }
  };

  const prevImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    }
  };

  // Get current hint
  const fetchHint = async () => {
    try {
      const { data } = await axios.get("/game/hint");
      setHint(data.hint);
      setCurrentHintId(data.currentHintId);
      setCurrentImageIndex(0); // Reset to first image when new hint loads
      setCompletedHints(data.completedHints || []);
      setUnlockedIntels(data.unlockedIntels || []);
      setTotalHints(data.totalHints || 0);
      setShowIntel(false); // Hide intel panel when new hint loads
    } catch (error) {
      console.error("Failed to fetch hint:", error);
    }
  };

  const fetchState = async () => {
    const { data } = await axios.get("/game/state");
    setCurrentHintId(data.currentHintId);
    setCompletedHints(data.completedHints || []);
    setUnlockedIntels(data.unlockedIntels || []);
    setPenalties(data.penalties);
    setTotalHints(data.totalHints || 0);
  };

  const unlockIntel = async () => {
    if (unlockingIntel) return;

    const isUnlocked = unlockedIntels.includes(currentHintId);

    if (isUnlocked) {
      setShowIntel(!showIntel);
      return;
    }

    const confirmUnlock = window.confirm(
      `Unlock hint for this Clue?\n\nCost: +2 Penalties\n\nOnce unlocked, you can view it anytime without additional cost.`
    );

    if (!confirmUnlock) return;

    try {
      setUnlockingIntel(true);
      const { data } = await axios.post("/game/unlock-intel", {
        hintId: currentHintId,
      });

      if (data.success) {
        setUnlockedIntels(data.unlockedIntels);
        setPenalties(data.penalties);
        setShowIntel(true);
        alert(
          `Hint Unlocked!\n\n+2 Penalties\n\nYou can now view this hint anytime.`
        );
      }
    } catch (error) {
      if (error.response?.data?.alreadyUnlocked) {
        setShowIntel(true);
      } else if (error.response?.data?.message) {
        alert(error.response.data.message);
      } else {
        alert("Failed to unlock hint. Please try again.");
      }
    } finally {
      setUnlockingIntel(false);
    }
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
            `🎉 CONGRATULATIONS!\n\nYou've completed the treasure hunt!\n\nHints Completed: ${data.totalHints}\nPenalties: ${data.penalties}\n\nYou are a true champion! 🏆`
          );
          setGameCompleted(true);
        } else if (data.finalUnlocked) {
          alert(
            `🎯 AMAZING! Final hint unlocked!\n\nYou've completed all regular hints!\nPenalties: ${data.penalties}\n\nNow solve the final challenge! 🏆`
          );
        } else {
          alert(
            `${data.message}\n\nPenalties: ${data.penalties}\n📍 Moving to hint ${data.currentHintId}...`
          );
        }
        fetchHint();
        fetchState();
      } else {
        // Wrong answer
        alert(
          `${data.message}\n\nPenalties: ${data.penalties}\n\nKeep trying!`
        );
        setPenalties(data.penalties);
      }
    } catch (error) {
      if (error.response?.status === 403) {
        const message = error.response?.data?.message || "Action not allowed.";
        alert(`🚫 ${message}`);
      } else if (error.response?.status === 400) {
        alert(
          `${
            error.response?.data?.message ||
            "You are too far from this location!"
          }`
        );
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
            <h2 className="font-pixel text-xl uppercase tracking-[0.35em] text-white mb-4">
              🏆 Mission Complete!
            </h2>
            <p className="text-white text-lg font-semibold mb-2">
              Congratulations! You've completed the treasure hunt!
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
        {hint ? (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4 gap-2">
              <h3 className="text-lg font-bold text-brand-primary uppercase tracking-wider">
                {hint.isFinalHint ? "🎯 Final Challenge" : `Current Clue`}
              </h3>
              <div className="flex items-center gap-2">
                {/* Clue Button */}
                {hint.intel && hint.intel.trim() !== "" && (
                  <button
                    onClick={unlockIntel}
                    disabled={unlockingIntel}
                    className={`px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-all ${
                      unlockedIntels.includes(currentHintId)
                        ? showIntel
                          ? "bg-yellow-600 text-white border border-yellow-500"
                          : "bg-yellow-500/20 text-yellow-400 border border-yellow-500/50 hover:bg-yellow-500/30"
                        : "bg-brand-primary/20 text-brand-primary border border-brand-primary/50 hover:bg-brand-primary/30 active:scale-95"
                    }`}
                    title={
                      unlockedIntels.includes(currentHintId)
                        ? showIntel
                          ? "Hide Hint"
                          : "Show Hint"
                        : "Unlock Hint (Cost: 2 penalties)"
                    }
                  >
                    {unlockingIntel ? (
                      <span className="flex items-center gap-1">
                        <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      </span>
                    ) : unlockedIntels.includes(currentHintId) ? (
                      showIntel ? (
                        "🔓 Hide Hint"
                      ) : (
                        "🔓 Show Hint"
                      )
                    ) : (
                      "🔒 Hint"
                    )}
                  </button>
                )}
                <span className="px-3 py-1 rounded text-xs font-bold uppercase tracking-wider bg-yellow-500/20 text-yellow-400 border border-yellow-500/50">
                  {hint.isFinalHint ? "Final" : `Clue ${currentHintId}`}
                </span>
              </div>
            </div>

            {/* Clue Display */}
            {showIntel &&
              unlockedIntels.includes(currentHintId) &&
              hint.intel && (
                <div className="mb-4 p-4 bg-yellow-900/30 border-2 border-yellow-500/50 rounded-lg">
                  <div className="flex items-start gap-2">
                    <div className="flex-1">
                      <h4 className="text-yellow-400 font-bold text-sm uppercase mb-2">
                        Hint:
                      </h4>
                      <p className="text-gray-200 text-sm leading-relaxed whitespace-pre-line">
                        {hint.intel}
                      </p>
                    </div>
                  </div>
                </div>
              )}

            {hint.images && hint.images.length > 0 ? (
              <div className="relative">
                {/* Image Container with Mobile-Optimized Carousel */}
                <div className="relative rounded-lg overflow-hidden border-2 border-brand-gray-700 bg-brand-gray-900">
                  <AuthenticatedImage
                    src={`/hints/${hint.images[currentImageIndex]}`}
                    alt={`Hint ${currentImageIndex + 1} of ${
                      hint.images.length
                    }`}
                    className="w-full h-auto max-h-[70vh] object-contain"
                  />

                  {/* Download Button - Always visible on mobile */}
                  <button
                    onClick={downloadHintImage}
                    className="absolute top-2 right-2 md:top-4 md:right-4 bg-brand-primary/90 hover:bg-brand-primary text-white rounded-lg p-2 md:p-3 shadow-lg hover:shadow-glow-pink active:scale-95 transition-all z-10"
                    title="Download current image"
                  >
                    <ArrowDownTrayIcon className="h-4 w-4 md:h-5 md:w-5" />
                  </button>

                  {/* Navigation Arrows - Only show if multiple images */}
                  {hint.images.length > 1 && (
                    <>
                      {/* Previous Button */}
                      <button
                        onClick={prevImage}
                        disabled={currentImageIndex === 0}
                        className={`absolute left-2 md:left-4 top-1/2 -translate-y-1/2 p-2 md:p-3 rounded-full transition-all z-10 ${
                          currentImageIndex === 0
                            ? "bg-gray-700/50 text-gray-500 cursor-not-allowed"
                            : "bg-black/70 hover:bg-black/90 text-white active:scale-95"
                        }`}
                        title="Previous image"
                      >
                        <ChevronLeftIcon className="h-6 w-6 md:h-8 md:w-8" />
                      </button>

                      {/* Next Button */}
                      <button
                        onClick={nextImage}
                        disabled={currentImageIndex === hint.images.length - 1}
                        className={`absolute right-2 md:right-4 top-1/2 -translate-y-1/2 p-2 md:p-3 rounded-full transition-all z-10 ${
                          currentImageIndex === hint.images.length - 1
                            ? "bg-gray-700/50 text-gray-500 cursor-not-allowed"
                            : "bg-black/70 hover:bg-black/90 text-white active:scale-95"
                        }`}
                        title="Next image"
                      >
                        <ChevronRightIcon className="h-6 w-6 md:h-8 md:w-8" />
                      </button>

                      {/* Image Counter */}
                      <div className="absolute bottom-2 md:bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-3 md:px-4 py-1 md:py-2 rounded-full text-xs md:text-sm font-semibold">
                        {currentImageIndex + 1} / {hint.images.length}
                      </div>
                    </>
                  )}
                </div>

                {/* Thumbnail Strip - Mobile Optimized */}
                {hint.images.length > 1 && (
                  <div className="mt-3 md:mt-4">
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-brand-primary scrollbar-track-brand-gray-800">
                      {hint.images.map((image, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden border-2 transition-all ${
                            index === currentImageIndex
                              ? "border-brand-primary shadow-lg shadow-brand-primary/50 scale-105"
                              : "border-brand-gray-700 hover:border-brand-gray-500 opacity-70 hover:opacity-100"
                          }`}
                        >
                          <AuthenticatedImage
                            src={`/hints/${image}`}
                            alt={`Thumbnail ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 px-4 bg-brand-gray-900 rounded-lg border-2 border-brand-gray-700">
                <div className="text-6xl mb-4">�</div>
                <p className="text-gray-300">No hint image available</p>
              </div>
            )}
          </div>
        ) : (
          <div className="mb-6 text-center py-8 px-4 bg-brand-gray-900 rounded-lg border-2 border-brand-gray-700">
            <div className="text-5xl mb-4">⏳</div>
            <p className="text-gray-300 text-lg mb-2">Loading hint...</p>
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
              <span>Hints Completed:</span>
              <span className="font-bold text-xl">{completedHints.length}</span>
            </div>
            <div className="pixel-pill bg-brand-gray-700 border-brand-gray-700 text-white flex-1 justify-center">
              <span>Penalties:</span>
              <span className="font-bold text-xl">{penalties}</span>
            </div>
          </div>
        </div>

        <div className="pixel-card text-sm leading-relaxed">
          <h3 className="font-pixel text-lg uppercase tracking-[0.3em] text-brand-primary mb-6">
            Mission Brief
          </h3>

          {/* Game Rules Section */}
          <div className="mb-6">
            <h4 className="text-brand-secondary font-bold text-base mb-3">
              Game Rules
            </h4>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-start gap-3">
                <span className="text-brand-primary mt-1 font-bold">▸</span>
                <span>Only the team leader should log in.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-brand-primary mt-1 font-bold">▸</span>
                <span>
                  Vehicles are not allowed—violations will be detected.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-brand-primary mt-1 font-bold">▸</span>
                <span>
                  Refresh the map/website regularly for accurate geolocation.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-brand-primary mt-1 font-bold">▸</span>
                <span>
                  Download all clues for offline access (tap image → download
                  icon).
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-brand-primary mt-1 font-bold">▸</span>
                <span>
                  Journal clues have 2 valid answers; black-background clues
                  have 1.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-brand-primary mt-1 font-bold">▸</span>
                <span>
                  Locations and clues may repeat—loops are intentional.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-brand-primary mt-1 font-bold">▸</span>
                <span>
                  Scoring: +1 per correct clue submission, 1 penalty per wrong answer. Ranking is
                  based on hints solved, penalties, then time.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-brand-primary mt-1 font-bold">▸</span>
                <span>
                  If you face any issue during the game, send your team name and
                  contact number in the Treasure Hunt WhatsApp group.
                </span>
              </li>
            </ul>
          </div>

          {/* How to Play Section */}
          <div>
            <h4 className="text-brand-secondary font-bold text-base mb-3">
              How to Play
            </h4>
            <div className="space-y-4 text-gray-300">
              <div>
                <p className="font-semibold text-brand-primary mb-2">
                  1. Map & Pin Visibility
                </p>
                <p className="ml-4">
                  Only pins within 85 meters of your current position will
                  appear on the map.
                </p>
              </div>
              <div>
                <p className="font-semibold text-brand-primary mb-2">
                  2. Finding a Location
                </p>
                <ul className="ml-4 space-y-1">
                  <li>• Move physically close to the suspected location.</li>
                  <li>
                    • Reload the webpage after reaching the spot to reveal its
                    pin.
                  </li>
                </ul>
              </div>
              <div>
                <p className="font-semibold text-brand-primary mb-2">
                  3. Submitting a Location
                </p>
                <ul className="ml-4 space-y-1">
                  <li>• Tap the visible pin → Submit.</li>
                  <li>
                    • If correct, the next set of clues unlocks immediately.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
