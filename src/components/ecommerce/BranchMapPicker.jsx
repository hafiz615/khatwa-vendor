import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";

const defaultCenter = { lat: 29.3759, lng: 47.9774 };

export default function BranchMapPicker({ lat, lng, onPositionChange }) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";

  const { isLoaded, loadError } = useJsApiLoader({
    id: "khatwa-branch-map-loader",
    googleMapsApiKey: apiKey,
  });

  const latN = Number(lat);
  const lngN = Number(lng);
  const hasCoords = Number.isFinite(latN) && Number.isFinite(lngN);
  const position = hasCoords
    ? { lat: latN, lng: lngN }
    : defaultCenter;

  if (!apiKey) {
    return (
      <p className="text-sm text-amber-900 bg-amber-50 border border-amber-200 rounded-lg p-3">
        Add{" "}
        <code className="font-mono text-xs bg-amber-100 px-1 rounded">
          VITE_GOOGLE_MAPS_API_KEY
        </code>{" "}
        to your env file to use the map. You can still enter latitude and longitude
        manually below.
      </p>
    );
  }

  if (loadError) {
    return (
      <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg p-3">
        Could not load Google Maps. Check your API key and billing.
      </p>
    );
  }

  if (!isLoaded) {
    return <div className="h-[280px] bg-gray-100 animate-pulse rounded-lg border border-gray-200" />;
  }

  return (
    <GoogleMap
      mapContainerClassName="w-full h-[280px] rounded-lg border border-gray-200"
      center={position}
      zoom={hasCoords ? 15 : 11}
      onClick={(e) => {
        if (e.latLng) {
          onPositionChange(e.latLng.lat(), e.latLng.lng());
        }
      }}
      options={{ streetViewControl: false, mapTypeControl: false }}
    >
      {hasCoords ? <Marker position={position} /> : null}
    </GoogleMap>
  );
}
