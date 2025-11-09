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

  // get current hint
  const fetchHint = async () => {
    const { data } = await axios.get("/game/hint");
    setHint(data.hint);
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
    const { data } = await axios.post("/game/submit", {
      pinId,
      lat: position.lat,
      lng: position.lng,
    });
    if (data.success) {
      alert(`✅ Correct! Earned ${data.earned} points.`);
      fetchHint();
      fetchState();
    } else {
      alert(`❌ Wrong! Penalties: ${data.penalties}`);
      setPenalties(data.penalties);
    }
  };

  return (
    <div className="space-y-10">
      <section className="pixel-card">
        <h2 className="font-pixel text-xl uppercase tracking-[0.35em] text-brand-mellow drop-shadow-highlight">
          Current Intel
        </h2>
        <p className="mt-6 text-lg leading-relaxed text-brand-highlight">
          {hint?.text ? (
            hint.text
          ) : (
            <span className="animate-pulse text-brand-highlight">
              Calibrating scanners...
            </span>
          )}
        </p>
        <br />
        <hr />
        <br />
        <h3 className="font-pixel text-md uppercase tracking-[0.3em] text-brand-mellow drop-shadow-highlight">
          Mission Map
        </h3>
        <br />
        <button
          type="button"
          onClick={refreshPins}
          disabled={!position}
          className="pixel-button px-5 py-2 text-[0.6rem] disabled:cursor-not-allowed disabled"
          aria-label="Refresh pins"
        >
          Refresh Pins <ArrowPathIcon className="h-6 w-6" />
        </button>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm">
          {/* <span className="text-brand-highlight/70">
              Use your scanner to locate nearby pins and recon targets.
            </span> */}
        </div>
        <div className="mt-6 overflow-hidden rounded-3xl border-4 border-brand-primary/70 shadow-pixel">
          {position ? (
            <MapComponent
              pins={pins}
              position={position}
              onSelect={handlePinSelect}
            />
          ) : (
            <div className="flex h-[24rem] items-center justify-center bg-brand-base/90 text-brand-highlight/70">
              Enable location services to deploy your scanner.
            </div>
          )}
        </div>
      </section>

      <section className="flex flex-col gap-8 lg:flex-row">
        <div className="flex flex-col gap-6 lg:flex-1">
          <div className="pixel-card">
            <h3 className="font-pixel text-xl uppercase tracking-[0.3em] text-brand-mellow drop-shadow-highlight">
              Team Status
            </h3>
            <div className="mt-6 flex flex-wrap gap-4">
              <span className="pixel-pill border-brand-highlight/80 bg-brand-highlight text-brand-accent">
                Score: {score}
              </span>
              <span className="pixel-pill border-brand-accent/80 bg-brand-accent text-brand-mellow">
                Penalties: {penalties}
              </span>
            </div>
          </div>

          <div className="pixel-card text-sm leading-relaxed text-brand-highlight/80">
            <h3 className="font-pixel text-xl text-base uppercase tracking-[0.3em] text-brand-mellow drop-shadow-highlight">
              Mission Briefing
            </h3>
            <ul className="mt-6 list-disc space-y-3 pl-6 text-brand-highlight/80">
              <li>Read the current intel and triangulate the target zone.</li>
              <li>
                Move in the real world &amp; tap a pin to submit your guess.
              </li>
              <li>
                Correct hits boost your score, misses add penalties - choose
                wisely.
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
