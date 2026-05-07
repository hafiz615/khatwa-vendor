import { useEffect, useState } from "react";
import { MapPin } from "lucide-react";
import BranchMapPicker from "../ecommerce/BranchMapPicker";
import { updateConsultationSettingsAPI } from "../../services/consultationScheduling.service";

export default function ConsultationInPersonVenueSection({
  token,
  profile,
  consultationDurationMinutes,
  consultationBufferMinutes,
  consultationTimezone,
  setProfile,
  setErrorMsg,
}) {
  const [address, setAddress] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    const loc = profile?.consultationInPersonLocation;
    if (!loc) {
      setAddress("");
      setLat("");
      setLng("");
      return;
    }
    setAddress(loc.address || "");
    setLat(loc.lat != null ? String(loc.lat) : "");
    setLng(loc.lng != null ? String(loc.lng) : "");
  }, [profile]);

  const patchProfile = (patch) => {
    setProfile((prev) => (prev ? { ...prev, ...patch } : prev));
  };

  const handleSave = async () => {
    const trimmedAddress = address.trim();

    const basePayload = {
      consultationDurationMinutes: Number(consultationDurationMinutes ?? 30),
      consultationBufferMinutes: Number(consultationBufferMinutes ?? 0),
      consultationTimezone: consultationTimezone || "Asia/Kuwait",
    };

    let consultationInPersonLocation = null;
    if (trimmedAddress) {
      const latN = Number(lat);
      const lngN = Number(lng);
      if (!Number.isFinite(latN) || !Number.isFinite(lngN)) {
        setErrorMsg(
          "Please pick a location on the map or enter valid latitude/longitude.",
        );
        return;
      }
      consultationInPersonLocation = {
        address: trimmedAddress,
        lat: latN,
        lng: lngN,
      };
    }

    setSaving(true);
    setSuccessMsg("");
    try {
      const res = await updateConsultationSettingsAPI(
        {
          ...basePayload,
          consultationInPersonLocation,
        },
        token,
      );

      if (!res.success) {
        setErrorMsg(res.message || "Failed to save in-person location.");
        return;
      }

      setSuccessMsg("In-person meeting location saved.");
      patchProfile({
        consultationInPersonLocation:
          res?.data?.consultationInPersonLocation || null,
      });
    } catch (e) {
      setErrorMsg(
        e?.response?.data?.message || "Failed to save in-person location.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="bg-white shadow-sm rounded-2xl p-5 border space-y-4">
      <div className="flex items-start gap-2">
        <MapPin className="w-5 h-5 text-blue-600 mt-0.5" />
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            In-person meeting location
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Clients see this address and map pin when they choose in-person
            consultation. Keep the written address and selected map location in
            sync.
          </p>
        </div>
      </div>

      <label className="block text-sm font-medium text-gray-700">
        Address
        <textarea
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Enter meeting address (building, street, area)"
          rows={3}
          className="mt-1 w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </label>

      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">
          Select location on map
        </p>
        <BranchMapPicker
          lat={lat}
          lng={lng}
          onPositionChange={(nextLat, nextLng) => {
            setLat(String(nextLat));
            setLng(String(nextLng));
          }}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label className="text-sm font-medium text-gray-700">
          Latitude
          <input
            type="number"
            step="any"
            value={lat}
            onChange={(e) => setLat(e.target.value)}
            placeholder="e.g. 29.3759"
            className="mt-1 w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </label>
        <label className="text-sm font-medium text-gray-700">
          Longitude
          <input
            type="number"
            step="any"
            value={lng}
            onChange={(e) => setLng(e.target.value)}
            placeholder="e.g. 47.9774"
            className="mt-1 w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </label>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 rounded bg-gray-900 text-white text-sm disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save location"}
        </button>
        <button
          type="button"
          onClick={() => {
            setAddress("");
            setLat("");
            setLng("");
            setSuccessMsg("");
          }}
          className="px-4 py-2 rounded bg-gray-100 text-gray-700 text-sm hover:bg-gray-200"
        >
          Clear fields
        </button>
      </div>

      {successMsg ? (
        <p className="text-green-600 text-sm">{successMsg}</p>
      ) : null}
    </section>
  );
}
