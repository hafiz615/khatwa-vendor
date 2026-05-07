import { useState, useEffect, useCallback } from "react";
import { Settings, ChevronUp } from "lucide-react";
import {
  updateConsultationSettingsAPI,
  createConsultationServiceAPI,
  updateConsultationServiceAPI,
  deleteConsultationServiceAPI,
} from "../../services/consultationScheduling.service";
import { designerEndpoints } from "../../services/api";
import apiConnector from "../../services/apiConnector";

const WEEKDAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const MAX_SHIFTS_PER_DAY = 8;

function emptyDayState() {
  const o = {};
  WEEKDAYS.forEach((d) => {
    o[d] = {
      enabled: false,
      shifts: [{ from: "09:00", to: "12:00" }],
    };
  });
  return o;
}

function stateFromAvailability(availability) {
  const next = emptyDayState();
  (availability || []).forEach((entry) => {
    if (!entry?.day || !entry.slots?.length) return;
    next[entry.day] = {
      enabled: true,
      shifts: entry.slots.map((s) => ({
        from: (s.from || "09:00").toString(),
        to: (s.to || "17:00").toString(),
      })),
    };
  });
  return next;
}

function availabilityFromState(dayState) {
  const out = [];
  WEEKDAYS.forEach((day) => {
    const row = dayState[day];
    if (!row.enabled || !row.shifts?.length) return;
    const slots = row.shifts
      .map((s) => ({
        from: (s.from || "").trim(),
        to: (s.to || "").trim(),
      }))
      .filter((s) => s.from && s.to);
    if (slots.length === 0) return;
    out.push({ day, slots });
  });
  return out;
}

export default function ConsultationSchedulingSection({
  token,
  profile,
  setProfile,
  setErrorMsg,
}) {
  const [duration, setDuration] = useState(30);
  const [buffer, setBuffer] = useState(0);
  const [timezone, setTimezone] = useState("Asia/Kuwait");
  /** Hours before start: clients cannot cancel or reschedule inside this window */
  const [cutoffHours, setCutoffHours] = useState(24);
  const [dayState, setDayState] = useState(emptyDayState);
  const [savingSettings, setSavingSettings] = useState(false);
  const [savingCutoff, setSavingCutoff] = useState(false);
  const [savingAvailability, setSavingAvailability] = useState(false);

  const [services, setServices] = useState([]);
  const [titleEn, setTitleEn] = useState("");
  const [titleAr, setTitleAr] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setDuration(profile.consultationDurationMinutes ?? 30);
    setBuffer(profile.consultationBufferMinutes ?? 0);
    setTimezone(profile.consultationTimezone || "Asia/Kuwait");
    setCutoffHours(
      profile.consultationCancellationCutoffHours != null
        ? Number(profile.consultationCancellationCutoffHours)
        : 24
    );
    setDayState(stateFromAvailability(profile.availability));
    setServices(profile.consultationServices || []);
  }, [profile]);

  const refreshProfileSlice = useCallback(
    (patch) => {
      setProfile((prev) => (prev ? { ...prev, ...patch } : prev));
    },
    [setProfile]
  );

  const saveSettings = async () => {
    const h = Number(cutoffHours);
    if (!Number.isFinite(h) || h < 0 || h > 168) {
      setErrorMsg(
        "Reschedule window must be between 0 and 168 hours before start."
      );
      return;
    }
    setSavingSettings(true);
    try {
      const res = await updateConsultationSettingsAPI(
        {
          consultationDurationMinutes: Number(duration),
          consultationBufferMinutes: Number(buffer),
          consultationTimezone: timezone,
          consultationCancellationCutoffHours: h,
        },
        token
      );
      if (!res.success) {
        setErrorMsg(res.message || "Failed to save consultation settings.");
        return;
      }
      refreshProfileSlice({
        consultationDurationMinutes: Number(duration),
        consultationBufferMinutes: Number(buffer),
        consultationTimezone: timezone,
        consultationCancellationCutoffHours: h,
      });
    } catch (e) {
      setErrorMsg(
        e?.response?.data?.message || "Failed to save consultation settings."
      );
    } finally {
      setSavingSettings(false);
    }
  };

  const saveRescheduleWindowOnly = async () => {
    const h = Number(cutoffHours);
    if (!Number.isFinite(h) || h < 0 || h > 168) {
      setErrorMsg(
        "Reschedule window must be between 0 and 168 hours (7 days) before start."
      );
      return;
    }
    setSavingCutoff(true);
    try {
      const res = await updateConsultationSettingsAPI(
        {
          consultationDurationMinutes: Number(duration),
          consultationBufferMinutes: Number(buffer),
          consultationTimezone: timezone,
          consultationCancellationCutoffHours: h,
        },
        token
      );
      if (!res.success) {
        setErrorMsg(res.message || "Failed to save reschedule window.");
        return;
      }
      refreshProfileSlice({
        consultationCancellationCutoffHours: h,
      });
    } catch (e) {
      setErrorMsg(
        e?.response?.data?.message || "Failed to save reschedule window."
      );
    } finally {
      setSavingCutoff(false);
    }
  };

  const saveWeeklyAvailability = async () => {
    const payload = availabilityFromState(dayState);
    if (payload.length === 0) {
      setErrorMsg("Enable at least one day with start and end times.");
      return;
    }
    setSavingAvailability(true);
    try {
      const { data } = await apiConnector(
        "PUT",
        designerEndpoints.UPDATE_AVAILABILITY_API,
        { availability: payload },
        { Authorization: `Bearer ${token}` }
      );
      if (!data.success) {
        setErrorMsg(data.message || "Failed to update availability.");
        return;
      }
      refreshProfileSlice({ availability: data.data || payload });
    } catch (e) {
      setErrorMsg(
        e?.response?.data?.message || "Failed to update availability."
      );
    } finally {
      setSavingAvailability(false);
    }
  };

  const addOrUpdateService = async () => {
    const en = titleEn.trim();
    const ar = titleAr.trim();
    if (!en || !ar) {
      setErrorMsg("Service title (English and Arabic) is required.");
      return;
    }
    try {
      if (editingId) {
        const res = await updateConsultationServiceAPI(
          editingId,
          { titleEn: en, titleAr: ar },
          token
        );
        if (!res.success) {
          setErrorMsg(res.message || "Failed to update service.");
          return;
        }
        const next = services.map((s) =>
          String(s._id) === String(editingId)
            ? { ...s, titleEn: en, titleAr: ar }
            : s
        );
        setServices(next);
        setTitleEn("");
        setTitleAr("");
        setEditingId(null);
        refreshProfileSlice({ consultationServices: next });
      } else {
        const res = await createConsultationServiceAPI(
          { titleEn: en, titleAr: ar },
          token
        );
        if (!res.success || !res.data) {
          setErrorMsg(res.message || "Failed to create service.");
          return;
        }
        const next = [...services, res.data];
        setServices(next);
        setTitleEn("");
        setTitleAr("");
        refreshProfileSlice({ consultationServices: next });
      }
    } catch (e) {
      setErrorMsg(e?.response?.data?.message || "Service request failed.");
    }
  };

  const removeService = async (id) => {
    try {
      const res = await deleteConsultationServiceAPI(id, token);
      if (!res.success) {
        setErrorMsg(res.message || "Failed to delete service.");
        return;
      }
      const next = services.filter((s) => String(s._id) !== String(id));
      setServices(next);
      refreshProfileSlice({ consultationServices: next });
    } catch (e) {
      setErrorMsg(e?.response?.data?.message || "Failed to delete service.");
    }
  };

  const startEdit = (s) => {
    setEditingId(s._id);
    setTitleEn(s.titleEn || "");
    setTitleAr(s.titleAr || "");
  };

  const enabledDays = WEEKDAYS.filter((d) => dayState[d]?.enabled);
  const daysPreview =
    enabledDays.length === 0
      ? "No weekly hours set"
      : enabledDays.length === 7
        ? "Every day"
        : `${enabledDays.length} day${enabledDays.length !== 1 ? "s" : ""} (${enabledDays
            .map((d) => d.slice(0, 3))
            .join(", ")})`;
  const summaryLine = `${daysPreview} · ${duration} min sessions · ${buffer} min buffer · ${timezone} · reschedule/cancel cutoff ${cutoffHours}h before start · ${services.length} service${services.length !== 1 ? "s" : ""}`;

  return (
    <div className="mt-8 border rounded-xl p-5 bg-gray-50 space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-semibold text-gray-900">
            Consultation scheduling
          </h2>
          {!expanded ? (
            <p className="text-sm text-gray-600 mt-1">{summaryLine}</p>
          ) : (
            <p className="text-sm text-gray-600 mt-1">
              For each day: choose how many shifts and the hours of each shift.
              Set consultation duration and buffer globally, then your services
              list for clients.
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="shrink-0 inline-flex items-center gap-1.5 text-sm font-medium text-blue-700 hover:text-blue-800 hover:underline"
        >
          {expanded ? (
            <>
              Collapse
              <ChevronUp className="w-4 h-4" aria-hidden />
            </>
          ) : (
            <>
              Manage
              <Settings className="w-4 h-4" aria-hidden />
            </>
          )}
        </button>
      </div>

      <section className="rounded-lg border border-amber-200 bg-amber-50/60 px-4 py-4 space-y-3">
        <h3 className="font-medium text-gray-900">
          Reschedule &amp; cancellation window
        </h3>
        <p className="text-sm text-gray-700">
          Clients cannot <strong>cancel</strong> or <strong>reschedule</strong>{" "}
          within this many <strong>hours</strong> of the scheduled start. Set to
          0 to allow changes up to the start time (not recommended).
        </p>
        <div className="flex flex-col sm:flex-row sm:items-end gap-3">
          <label className="flex flex-col gap-1 text-sm min-w-[200px]">
            <span className="text-gray-800">Hours before start (0–168)</span>
            <input
              type="number"
              min={0}
              max={168}
              step={1}
              className="border rounded px-3 py-2 bg-white"
              value={cutoffHours}
              onChange={(e) => setCutoffHours(e.target.value)}
            />
          </label>
          <button
            type="button"
            className="px-4 py-2 rounded bg-amber-800 text-white text-sm font-medium hover:bg-amber-900 disabled:opacity-50 w-fit"
            disabled={savingCutoff}
            onClick={saveRescheduleWindowOnly}
          >
            {savingCutoff ? "Saving…" : "Save reschedule window"}
          </button>
        </div>
      </section>

      {expanded && (
      <>
      <section className="space-y-3">
        <h3 className="font-medium text-gray-800">Weekly availability</h3>
        <p className="text-xs text-gray-500">
          Choose which days you take consultations. For each day, set how many
          shifts you work and the start/end time of each shift (e.g. morning and
          afternoon). Times can be 12-hour (9:00 AM) or 24-hour (09:00).
        </p>
        <p className="text-xs text-gray-500">
          <strong>Consultation length</strong> and <strong>buffer</strong>{" "}
          between bookings apply to every slot; set them in Session settings
          below, then save both sections.
        </p>
        <div className="space-y-3">
          {WEEKDAYS.map((day) => (
            <div
              key={day}
              className="border rounded-lg px-3 py-3 bg-white space-y-2"
            >
              <div className="flex flex-wrap items-center gap-3">
                <label className="flex items-center gap-2 min-w-[140px]">
                  <input
                    type="checkbox"
                    checked={dayState[day].enabled}
                    onChange={(e) => {
                      const on = e.target.checked;
                      setDayState((prev) => ({
                        ...prev,
                        [day]: {
                          ...prev[day],
                          enabled: on,
                          shifts:
                            on && (!prev[day].shifts || prev[day].shifts.length === 0)
                              ? [{ from: "09:00", to: "12:00" }]
                              : prev[day].shifts,
                        },
                      }));
                    }}
                  />
                  <span className="text-sm font-medium">{day}</span>
                </label>
                {dayState[day].enabled && (
                  <label className="flex items-center gap-2 text-sm">
                    <span className="text-gray-600">Shifts</span>
                    <select
                      className="border rounded px-2 py-1"
                      value={dayState[day].shifts.length}
                      onChange={(e) => {
                        const n = Math.min(
                          MAX_SHIFTS_PER_DAY,
                          Math.max(1, parseInt(e.target.value, 10) || 1)
                        );
                        setDayState((prev) => {
                          const cur = prev[day];
                          let shifts = [...(cur.shifts || [])];
                          const defaults = [
                            { from: "09:00", to: "12:00" },
                            { from: "13:00", to: "17:00" },
                            { from: "18:00", to: "21:00" },
                          ];
                          if (shifts.length < n) {
                            while (shifts.length < n) {
                              const idx = shifts.length;
                              shifts.push(
                                defaults[idx] || {
                                  from: "09:00",
                                  to: "17:00",
                                }
                              );
                            }
                          } else {
                            shifts = shifts.slice(0, n);
                          }
                          return {
                            ...prev,
                            [day]: { ...cur, shifts },
                          };
                        });
                      }}
                    >
                      {Array.from({ length: MAX_SHIFTS_PER_DAY }, (_, i) => (
                        <option key={i + 1} value={i + 1}>
                          {i + 1}
                        </option>
                      ))}
                    </select>
                  </label>
                )}
              </div>
              {dayState[day].enabled && (
                <div className="pl-6 space-y-2 border-t border-gray-100 pt-2">
                  {(dayState[day].shifts || []).map((shift, idx) => (
                    <div
                      key={idx}
                      className="flex flex-wrap items-center gap-2 text-sm"
                    >
                      <span className="text-gray-500 w-16 shrink-0">
                        Shift {idx + 1}
                      </span>
                      <input
                        type="text"
                        className="border rounded px-2 py-1 w-28"
                        value={shift.from}
                        onChange={(e) =>
                          setDayState((prev) => {
                            const shifts = [...prev[day].shifts];
                            shifts[idx] = {
                              ...shifts[idx],
                              from: e.target.value,
                            };
                            return {
                              ...prev,
                              [day]: { ...prev[day], shifts },
                            };
                          })
                        }
                        placeholder="Start"
                      />
                      <span className="text-gray-400">to</span>
                      <input
                        type="text"
                        className="border rounded px-2 py-1 w-28"
                        value={shift.to}
                        onChange={(e) =>
                          setDayState((prev) => {
                            const shifts = [...prev[day].shifts];
                            shifts[idx] = { ...shifts[idx], to: e.target.value };
                            return {
                              ...prev,
                              [day]: { ...prev[day], shifts },
                            };
                          })
                        }
                        placeholder="End"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
        <button
          type="button"
          className="px-4 py-2 rounded bg-gray-900 text-white text-sm disabled:opacity-50"
          disabled={savingAvailability}
          onClick={saveWeeklyAvailability}
        >
          {savingAvailability ? "Saving…" : "Save weekly hours"}
        </button>
      </section>

      <section className="space-y-3">
        <h3 className="font-medium text-gray-800">Session settings</h3>
        <p className="text-xs text-gray-500 mb-2">
          Each booked appointment lasts the <strong>duration</strong>. The{" "}
          <strong>buffer</strong> is extra gap before the next bookable start
          time inside each shift.
        </p>
        <p className="text-xs text-gray-500">
          Reschedule and cancellation cutoff is set in the section above (always
          visible). It is also saved when you click &quot;Save session
          settings&quot; together with duration, buffer, and timezone.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <label className="flex flex-col gap-1 text-sm">
            <span>Consultation duration (minutes)</span>
            <input
              type="number"
              min={5}
              className="border rounded px-3 py-2"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span>Buffer between slots (minutes)</span>
            <input
              type="number"
              min={0}
              className="border rounded px-3 py-2"
              value={buffer}
              onChange={(e) => setBuffer(e.target.value)}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span>Timezone (IANA)</span>
            <input
              type="text"
              className="border rounded px-3 py-2"
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              placeholder="Asia/Kuwait"
            />
          </label>
        </div>
        <button
          type="button"
          className="px-4 py-2 rounded bg-gray-900 text-white text-sm disabled:opacity-50"
          disabled={savingSettings}
          onClick={saveSettings}
        >
          {savingSettings ? "Saving…" : "Save session settings"}
        </button>
      </section>

      <section className="space-y-3">
        <h3 className="font-medium text-gray-800">Consultation services</h3>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            className="border rounded px-3 py-2 text-sm flex-1"
            placeholder="Title (English)"
            value={titleEn}
            onChange={(e) => setTitleEn(e.target.value)}
          />
          <input
            type="text"
            className="border rounded px-3 py-2 text-sm flex-1"
            placeholder="Title (Arabic)"
            value={titleAr}
            onChange={(e) => setTitleAr(e.target.value)}
          />
          <button
            type="button"
            className="px-4 py-2 rounded bg-blue-700 text-white text-sm"
            onClick={addOrUpdateService}
          >
            {editingId ? "Update" : "Add"}
          </button>
          {editingId && (
            <button
              type="button"
              className="px-3 py-2 text-sm text-gray-600"
              onClick={() => {
                setEditingId(null);
                setTitleEn("");
                setTitleAr("");
              }}
            >
              Cancel edit
            </button>
          )}
        </div>
        <ul className="divide-y border rounded-lg bg-white">
          {services.length === 0 && (
            <li className="px-3 py-4 text-sm text-gray-500">
              No services yet. Clients need at least one to pick a offering when
              booking.
            </li>
          )}
          {services.map((s) => (
            <li
              key={s._id}
              className="px-3 py-2 flex flex-wrap items-center justify-between gap-2 text-sm"
            >
              <div>
                <span className="font-medium">{s.titleEn}</span>
                <span className="text-gray-500 mx-2">/</span>
                <span dir="rtl">{s.titleAr}</span>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="text-blue-700"
                  onClick={() => startEdit(s)}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="text-red-600"
                  onClick={() => removeService(s._id)}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>
      </>
      )}
    </div>
  );
}
