import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect } from "react";

// Recenter component
function RecenterButton({ position }) {
  const map = useMap();

  const recenter = () => {
    map.setView([position.lat, position.lng], 18, {
      animate: true,
      duration: 1,
    });
  };

  useEffect(() => {
    const container = map.getContainer();
    const button = document.createElement("button");
    button.innerHTML = "📍";
    button.className = "leaflet-recenter-button";
    button.title = "Recenter to your location";
    button.onclick = recenter;

    container.appendChild(button);

    return () => {
      container.removeChild(button);
    };
  }, [map, position]);

  return null;
}

const pinIcon = L.divIcon({
  className: "custom-pin-icon",
  html: `
    <div class="relative flex items-center justify-center">
      <div class="absolute inset-0 animate-ping opacity-30">
        <div class="h-8 w-8 rounded-full bg-brand-accent"></div>
      </div>
      <div class="relative pixel-map-pin">
        <span class="pixel-map-pin__core"></span>
      </div>
    </div>
  `,
  iconSize: [32, 40],
  iconAnchor: [16, 36],
  popupAnchor: [0, -36],
});

const playerIcon = L.divIcon({
  className: "custom-player-icon",
  html: `
    <div class="relative flex items-center justify-center">
      <div class="absolute inset-0 animate-pulse">
        <div class="h-10 w-10 rounded-full bg-brand-highlight opacity-40"></div>
      </div>
      <div class="relative">
        <div class="pixel-map-pin pixel-map-pin--self">
          <span class="pixel-map-pin__core"></span>
        </div>
        <div class="absolute -top-1 -right-1 h-3 w-3 bg-brand-mellow rounded-full border-2 border-brand-base animate-bounce"></div>
      </div>
    </div>
  `,
  iconSize: [40, 48],
  iconAnchor: [20, 44],
  popupAnchor: [0, -44],
});

export default function MapComponent({ pins, position, onSelect }) {
  return (
    <MapContainer
      center={[position.lat, position.lng]}
      zoom={18}
      className="h-[28rem] w-full bg-brand-gray-800 dark-mode-map"
      scrollWheelZoom
      zoomControl={true}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <RecenterButton position={position} />
      {pins.map((pin) => (
        <Marker key={pin.id} position={[pin.lat, pin.lng]} icon={pinIcon}>
          <Popup className="custom-popup" closeButton={true}>
            <div className="space-y-3 p-2 bg-brand-secondary">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 bg-brand-primary rounded-full animate-pulse"></div>
                <p className="font-pixel text-[0.7rem] uppercase tracking-wider text-brand-primary">
                  Target Location
                </p>
              </div>
              <p className="font-semibold text-gray-100 text-base">
                {pin.name}
              </p>
              <button
                type="button"
                className="pixel-button w-full px-4 py-2 text-[0.6rem] justify-center"
                onClick={() => onSelect(pin.id)}
              >
                Submit Answer
              </button>
            </div>
          </Popup>
        </Marker>
      ))}
      <Marker position={[position.lat, position.lng]} icon={playerIcon}>
        <Popup className="custom-popup" closeButton={true}>
          <div className="space-y-2 p-2 bg-brand-secondary">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 bg-brand-primary rounded-full animate-pulse"></div>
              <p className="font-pixel text-[0.7rem] uppercase tracking-wider text-brand-primary">
                Your Position
              </p>
            </div>
            <p className="font-semibold text-gray-100">You are here</p>
          </div>
        </Popup>
      </Marker>
    </MapContainer>
  );
}
