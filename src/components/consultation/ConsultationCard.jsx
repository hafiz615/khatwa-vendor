import { User2, Video } from "lucide-react";

function formatTypeLabel(type) {
  if (!type) return "";
  const t = String(type).toLowerCase();
  if (t === "online") return "Online";
  if (t === "inperson") return "In person";
  return type;
}

function ConsultationCard({
  client,
  profile,
  time,
  service,
  type,
  price,
  status,
  showJoinMeeting = false,
  zoomJoinUrl,
  zoomMeetingPassword,
  joinHint,
}) {
  return (
    <div className="p-4 border rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 hover:shadow-sm transition">
      <div className="flex items-center gap-3 min-w-0">
        {profile ? (
          <img
            src={profile}
            alt={client}
            className="w-12 h-12 rounded-full object-cover shrink-0"
          />
        ) : (
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 shrink-0">
            <User2 className="w-6 h-6" />
          </div>
        )}

        <div className="min-w-0">
          <p className="font-medium">{client}</p>
          <p className="text-xs text-gray-500">{time}</p>
          <p className="text-xs text-gray-600">
            {service} · {formatTypeLabel(type)}
          </p>
          {joinHint ? (
            <p className="text-xs text-amber-700 mt-1">{joinHint}</p>
          ) : null}
          {showJoinMeeting && zoomMeetingPassword ? (
            <p className="text-xs text-gray-500 mt-1">
              Passcode:{" "}
              <span className="font-mono text-gray-800">{zoomMeetingPassword}</span>
            </p>
          ) : null}
        </div>
      </div>

      <div className="flex flex-col sm:items-end gap-2 shrink-0">
        <div className="text-right text-sm">
          <p className="font-semibold text-blue-600">KWD {price}</p>
          <p className="text-xs text-gray-500 capitalize">{status}</p>
        </div>
        {showJoinMeeting && zoomJoinUrl ? (
          <a
            href={zoomJoinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition"
          >
            <Video className="w-4 h-4" />
            Join meeting
          </a>
        ) : null}
      </div>
    </div>
  );
}

export default ConsultationCard;