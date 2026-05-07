// /dashboard/consultations/meetings — booked consultations list
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setConsultations } from "../slices/consultation";
import { fetchConsultations } from "../services/consultation.service";
import ConsultationsSection from "../components/consultation/ConsultationsSection";

function ConsultationMeetingsPage() {
  const { consultations } = useSelector((state) => state.consultation);
  const { token } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const [filter, setFilter] = useState("all");
  const [consultationLoading, setConsultationLoading] = useState(false);
  const [consultationError, setConsultationError] = useState(null);

  const now = new Date();

  const filteredConsultations = consultations.filter((c) => {
    const date = new Date(c.dateTime);
    if (filter === "upcoming") return date > now;
    if (filter === "previous") return date < now;
    return true;
  });

  const loadConsultations = async () => {
    try {
      setConsultationLoading(true);
      setConsultationError(null);
      const res = await fetchConsultations(token, filter);
      if (res.success) dispatch(setConsultations(res.consultationData));
      else throw new Error(res.message);
    } catch {
      setConsultationError("Failed to load consultations.");
    } finally {
      setConsultationLoading(false);
    }
  };

  useEffect(() => {
    if (token) loadConsultations();
  }, [token, filter]);

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">
        Consultation meetings
      </h1>
      <p className="text-sm text-gray-600 -mt-4">
        Upcoming and past bookings, join links, and session details.
      </p>

      <ConsultationsSection
        consultations={filteredConsultations}
        loading={consultationLoading}
        error={consultationError}
        filter={filter}
        setFilter={setFilter}
        onRetry={loadConsultations}
      />
    </div>
  );
}

export default ConsultationMeetingsPage;
