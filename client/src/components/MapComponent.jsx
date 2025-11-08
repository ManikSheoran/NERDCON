import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

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
        <Marker key={pin.id} position={[pin.lat, pin.lng]}>
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
      <Marker position={[position.lat, position.lng]}>
        <Popup className="text-brand-base">You are here</Popup>
      </Marker>
    </MapContainer>
  );
}
