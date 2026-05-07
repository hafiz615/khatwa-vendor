import {
  CalendarDays,
  Loader2,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import ConsultationCard from "./ConsultationCard";

/**
 * Business user: show join whenever the booking is online, paid, scheduled, and a link exists.
 * Time-based rules can be added later.
 */
function getJoinMeetingState(c) {
  const isOnline = c.consultationType === "online";
  const paid = c.payment?.status === "paid";
  const scheduled = c.status === "Scheduled";
  const url = (c.zoomJoinUrl || "").trim();

  if (!isOnline || !paid || !scheduled) {
    return { showJoin: false, hint: null };
  }

  if (!url) {
    if (c.zoomProvisionError) {
      return {
        showJoin: false,
        hint: "Meeting link unavailable. Check Zoom settings or contact support.",
      };
    }
    return {
      showJoin: false,
      hint: "Meeting link will appear here once the booking is confirmed and Zoom is ready.",
    };
  }

  return { showJoin: true, hint: null, zoomJoinUrl: url };
}

function ConsultationsSection({
  consultations,
  loading,
  error,
  filter,
  setFilter,
  onRetry,
}) {
  const formatTime = (dateTime) => {
    const d = new Date(dateTime);
    const date = d.toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
    const hours = d.getHours();
    const minutes = d.getMinutes();
    const formatted = hours % 12 || 12;
    const ampm = hours >= 12 ? "PM" : "AM";
    return `${date} • ${formatted}${minutes ? `:${minutes}` : ""}${ampm}`;
  };

  return (
    <div className="bg-white rounded-2xl shadow p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <CalendarDays className="w-5 h-5 text-blue-500" /> Consultations
        </h2>

        <div className="flex gap-2">
          {["all", "upcoming", "previous"].map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-3 py-1 rounded-full text-sm ${
                filter === type
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center py-10 text-gray-500">
          <Loader2 className="w-6 h-6 animate-spin mb-2" />
          <p>Loading consultations...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center py-10 text-red-500">
          <AlertTriangle className="w-6 h-6 mb-2" />
          <p>{error}</p>
          <button
            onClick={onRetry}
            className="flex items-center gap-1 text-sm px-3 py-1.5 bg-red-100 text-red-700 rounded-md hover:bg-red-200"
          >
            <RefreshCw className="w-4 h-4" /> Retry
          </button>
        </div>
      ) : consultations.length ? (
        <div className="space-y-3">
          {consultations.map((c) => {
            const join = getJoinMeetingState(c);
            return (
              <ConsultationCard
                key={c._id}
                client={c.clientName}
                profile={c.userId?.profile}
                time={formatTime(c.dateTime)}
                service={c.service}
                type={c.consultationType}
                price={c.price}
                status={c.payment?.status ?? c.status ?? "—"}
                showJoinMeeting={join.showJoin}
                zoomJoinUrl={join.zoomJoinUrl}
                zoomMeetingPassword={c.zoomMeetingPassword}
                joinHint={join.hint}
              />
            );
          })}
        </div>
      ) : (
        <p className="text-gray-500 text-sm text-center py-4">
          No consultations found.
        </p>
      )}
    </div>
  );
}

export default ConsultationsSection;