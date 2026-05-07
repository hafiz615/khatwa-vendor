// /dashboard/consultations/settings — price, scheduling, in-person venue, policy
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setConsultationPrice } from "../slices/consultation";
import {
  fetchConsultationPrice,
  updateConsultationPrice,
} from "../services/consultation.service";
import { fetchProfileData } from "../services/profile.service";
import ConsultationSchedulingSection from "../components/profile/ConsultationSchedulingSection";
import ConsultationInPersonVenueSection from "../components/profile/ConsultationInPersonVenueSection";
import FormErrorAlert from "../components/common/FormErrorAlert";
import { Edit2, CheckCircle2, XCircle } from "lucide-react";

function ConsultationSettingsPage() {
  const { consultationPrice } = useSelector((state) => state.consultation);
  const { token } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const [profile, setProfile] = useState(null);
  const [schedulingError, setSchedulingError] = useState("");

  const [price, setPrice] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [priceLoading, setPriceLoading] = useState(false);
  const [priceError, setPriceError] = useState(null);
  const [priceSuccess, setPriceSuccess] = useState(null);

  const loadProfile = async () => {
    if (!token) return;
    try {
      const res = await fetchProfileData(token);
      if (res.success) setProfile(res.data);
    } catch {
      setSchedulingError("Failed to load profile for consultation settings.");
    }
  };

  const loadConsultationPrice = async () => {
    try {
      setPriceLoading(true);
      setPriceError(null);
      const res = await fetchConsultationPrice(token);
      if (res.success)
        dispatch(setConsultationPrice(res.data.consultationPrice || 0));
      else throw new Error(res.message);
    } catch {
      setPriceError("Failed to fetch consultation price.");
    } finally {
      setPriceLoading(false);
    }
  };

  const handlePriceUpdate = async () => {
    if (!price) return setPriceError("Please enter a valid price.");

    try {
      setPriceLoading(true);
      setPriceError(null);
      setPriceSuccess(null);
      const res = await updateConsultationPrice(token, {
        consultationPrice: price,
      });
      if (res.success) {
        setPriceSuccess("Consultation price updated successfully!");
        loadConsultationPrice();
        setIsEditing(false);
      } else throw new Error(res.message);
    } catch (err) {
      setPriceError(err.response?.data?.message || "Failed to update price.");
    } finally {
      setPriceLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadProfile();
      loadConsultationPrice();
    }
  }, [token]);

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">
        Consultation settings
      </h1>
      <p className="text-sm text-gray-600 -mt-4">
        Pricing, availability, services, in-person venue, and reschedule policy.
      </p>

      {schedulingError && (
        <FormErrorAlert
          message={schedulingError}
          onClose={() => setSchedulingError("")}
        />
      )}

      <div className="bg-white shadow-sm rounded-2xl p-5 border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Consultation price</h2>
          {!isEditing && (
            <button
              type="button"
              onClick={() => {
                setIsEditing(true);
                setPrice(consultationPrice || 0);
                setPriceError(null);
                setPriceSuccess(null);
              }}
              className="text-blue-600 flex items-center gap-1 hover:underline transition"
            >
              <Edit2 className="w-4 h-4" /> Edit
            </button>
          )}
        </div>

        {!isEditing ? (
          <div>
            {priceLoading ? (
              <p className="text-gray-400 text-sm">Loading...</p>
            ) : consultationPrice ? (
              <p className="text-2xl font-semibold text-gray-800">
                <span className="text-[#16a34a]">KWD</span> {consultationPrice}
              </p>
            ) : (
              <p className="text-gray-400 italic text-sm">No price set</p>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-2 w-64">
              <span className="text-gray-500 font-medium">KWD</span>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                placeholder="Enter price"
                className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  priceError ? "border-red-500" : "border-gray-300"
                }`}
              />
            </div>
            {priceError && (
              <p className="text-red-500 text-sm flex items-center gap-1">
                <XCircle className="w-4 h-4" /> {priceError}
              </p>
            )}

            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={handlePriceUpdate}
                disabled={priceLoading}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-1 disabled:opacity-50"
              >
                {priceLoading ? (
                  <>
                    <span className="animate-spin border-2 border-white border-t-transparent rounded-full w-4 h-4"></span>
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" /> Save
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setPriceError(null);
                  setPriceSuccess(null);
                  setPrice(consultationPrice || 0);
                }}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 flex items-center gap-1"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {priceSuccess && (
          <p className="text-green-600 text-sm mt-2 flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4" /> {priceSuccess}
          </p>
        )}
      </div>

      {profile && (
        <>
          <ConsultationSchedulingSection
            token={token}
            profile={profile}
            setProfile={setProfile}
            setErrorMsg={setSchedulingError}
          />

          <ConsultationInPersonVenueSection
            token={token}
            profile={profile}
            consultationDurationMinutes={profile.consultationDurationMinutes}
            consultationBufferMinutes={profile.consultationBufferMinutes}
            consultationTimezone={profile.consultationTimezone}
            setProfile={setProfile}
            setErrorMsg={setSchedulingError}
          />
        </>
      )}
    </div>
  );
}

export default ConsultationSettingsPage;
