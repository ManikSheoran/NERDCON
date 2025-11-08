import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const pinIcon = L.divIcon({
  className: "",
  html: '<div class="pixel-map-pin"><span class="pixel-map-pin__core"></span></div>',
  iconSize: [32, 32],
  iconAnchor: [16, 30],
  popupAnchor: [0, -28],
});

const playerIcon = L.divIcon({
  className: "",
  html: '<div class="pixel-map-pin pixel-map-pin--self"><span class="pixel-map-pin__core"></span></div>',
  iconSize: [34, 34],
  iconAnchor: [17, 32],
  popupAnchor: [0, -30],
});

export default function MapComponent({ pins, position, onSelect }) {
  return (
    <MapContainer
      center={[position.lat, position.lng]}
      zoom={18}
      className="h-[26rem] w-full bg-brand-base"
      scrollWheelZoom
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {pins.map((pin) => (
        <Marker key={pin.id} position={[pin.lat, pin.lng]} icon={pinIcon}>
          <Popup className="text-brand-base">
            <div className="space-y-2">
              <p className="font-semibold">{pin.name}</p>
              <button
                type="button"
                className="pixel-button px-4 py-2 text-[0.6rem]"
                onClick={() => onSelect(pin.id)}
              >
                Select
              </button>
            </div>
          </Popup>
        </Marker>
      ))}
      <Marker position={[position.lat, position.lng]} icon={playerIcon}>
        <Popup className="text-brand-base">You are here</Popup>
      </Marker>
    </MapContainer>
  );
}
