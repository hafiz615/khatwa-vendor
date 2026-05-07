"use client";
import { useState, useEffect } from "react";
import { X, Plus, Trash2, Loader2 } from "lucide-react";
import FormErrorAlert from "./common/FormErrorAlert";

function AvailabilityModal({ availability = [], isOpen, onClose, onSave, error, loading, setError }) {
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const times = [
    "12:00 AM","1:00 AM","2:00 AM","3:00 AM",
    "4:00 AM","5:00 AM","6:00 AM","7:00 AM",
    "8:00 AM","9:00 AM","10:00 AM","11:00 AM",
    "12:00 PM","1:00 PM","2:00 PM","3:00 PM",
    "4:00 PM","5:00 PM","6:00 PM","7:00 PM",
    "8:00 PM","9:00 PM","10:00 PM","11:00 PM"
  ];

  const [activeDays, setActiveDays] = useState([]);
  const [slots, setSlots] = useState({});
  const [initialSlots, setInitialSlots] = useState({});
  const [duplicateDays, setDuplicateDays] = useState([]);

  // Initialize slots from availability
  useEffect(() => {
    if (isOpen) {
      const slotsObj = {};
      availability.forEach(a => {
        slotsObj[a.day] = a.slots.map(s => ({ ...s, isNew: false })); // mark as initial
      });
      setSlots(slotsObj);
      setInitialSlots(slotsObj);
      setActiveDays([]); // no day selected initially
      setDuplicateDays([]);
    } else {
      setActiveDays([]);
      setSlots({});
      setInitialSlots({});
      setDuplicateDays([]);
    }
  }, [isOpen, availability]);

  // Detect duplicate/overlapping slots
  useEffect(() => {
    const dupDays = Object.entries(slots)
      .filter(([_, daySlots]) => {
        const seen = new Set();
        for (let s of daySlots) {
          const key = `${s.from}-${s.to}`;
          if (seen.has(key)) return true;
          seen.add(key);
        }
        return false;
      })
      .map(([day]) => day);
    setDuplicateDays(dupDays);
  }, [slots]);

  if (!isOpen) return null;

  const toggleDay = (day) => {
    if (loading) return;
    setActiveDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const handleAddSlot = (day) => {
    if (loading) return;
    setSlots(prev => ({
      ...prev,
      [day]: [...(prev[day] || []), { from: "8:00 AM", to: "9:00 AM", isNew: true }],
    }));
  };

  const handleSlotChange = (day, index, field, value) => {
    setSlots(prev => {
      const updated = { ...prev };
      updated[day][index][field] = value;
      if (field === "from") {
        const fromIndex = times.indexOf(value);
        const toTime = times[fromIndex + 1] || times[times.length - 1];
        if (times.indexOf(updated[day][index].to) <= fromIndex) {
          updated[day][index].to = toTime;
        }
      }
      return updated;
    });
  };

  const handleDeleteSlot = (day, index) => {
    if (loading) return;
    setSlots(prev => {
      const updated = { ...prev };
      updated[day].splice(index, 1);
      return { ...updated };
    });
  };

  const handleSave = () => {
    if (duplicateDays.length > 0 || loading) return;

    // Only send newly added slots
    const newSlots = Object.entries(slots)
      .map(([day, daySlots]) => {
        const addedSlots = daySlots.filter(s => s.isNew);
        return { day, slots: addedSlots.map(({ from, to }) => ({ from, to })) };
      })
      .filter(({ slots }) => slots.length > 0);

    onSave(newSlots);
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-lg p-6 relative overflow-y-auto max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Set Weekly Availability</h2>
          <button
            onClick={!loading ? onClose : undefined}
            className={`text-gray-500 hover:text-gray-700 ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Day Toggles */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {days.map(day => (
            <button
              key={day}
              disabled={loading}
              onClick={() => toggleDay(day)}
              className={`px-3 py-2 rounded-lg border text-sm font-medium transition ${
                activeDays.includes(day)
                  ? "bg-blue-500 text-white border-blue-600"
                  : "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200"
              } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {day}
            </button>
          ))}
        </div>

        {/* Slots */}
        <div className="space-y-4">
          {activeDays.map(day => (
            <div key={day} className="border rounded-xl p-4 bg-gray-50 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-gray-700">{day}</h3>
                <button
                  disabled={loading}
                  onClick={() => handleAddSlot(day)}
                  className={`text-blue-600 text-sm flex items-center gap-1 hover:text-blue-700 ${
                    loading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  <Plus className="w-4 h-4" /> Add Slot
                </button>
              </div>

              {(slots[day] || []).length > 0 ? (
                slots[day].map((slot, idx) => {
                  const fromIndex = times.indexOf(slot.from);
                  const availableToTimes = times.slice(fromIndex + 1);

                  const isReadOnly = !slot.isNew; // read-only if initial slot
                  const hasOverlap = (slots[day] || []).some((s, i) => {
                    if (i === idx) return false;
                    const start1 = times.indexOf(slot.from);
                    const end1 = times.indexOf(slot.to);
                    const start2 = times.indexOf(s.from);
                    const end2 = times.indexOf(s.to);
                    return start1 < end2 && end1 > start2;
                  });

                  return (
                    <div
                      key={idx}
                      className={`flex items-center gap-3 rounded-lg border p-2 ${
                        isReadOnly ? "bg-gray-100 border-gray-200" : "bg-white border-gray-300"
                      }`}
                    >
                      {isReadOnly ? (
                        <>
                          <span className="flex-1 text-sm text-gray-700">{slot.from}</span>
                          <span className="text-gray-500 text-sm">to</span>
                          <span className="flex-1 text-sm text-gray-700">{slot.to}</span>
                        </>
                      ) : (
                        <>
                          <select
                            disabled={loading}
                            value={slot.from}
                            onChange={(e) => handleSlotChange(day, idx, "from", e.target.value)}
                            className={`border rounded-md px-2 py-1 text-sm flex-1 ${hasOverlap ? "border-red-500" : ""}`}
                          >
                            {times.map(t => <option key={t} value={t}>{t}</option>)}
                          </select>
                          <span className="text-gray-500 text-sm">to</span>
                          <select
                            disabled={loading}
                            value={slot.to}
                            onChange={(e) => handleSlotChange(day, idx, "to", e.target.value)}
                            className={`border rounded-md px-2 py-1 text-sm flex-1 ${hasOverlap ? "border-red-500" : ""}`}
                          >
                            {availableToTimes.map(t => <option key={t} value={t}>{t}</option>)}
                          </select>
                          <button
                            disabled={loading}
                            onClick={() => handleDeleteSlot(day, idx)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          
                        </>
                      )}
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-gray-400 italic">No slots added yet.</p>
              )}

              {duplicateDays.includes(day) && (
                <p className="text-red-600 text-sm mt-1 font-medium">
                  Duplicate time slots found for {day}. Please remove duplicates.
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Error */}
        {error && <FormErrorAlert message={error} onClose={() => setError(null)} />}

        {/* Save Button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSave}
            disabled={duplicateDays.length > 0 || loading}
            className={`px-4 py-2 rounded-lg text-white flex items-center justify-center gap-2 transition ${
              duplicateDays.length > 0 || loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Saving...
              </>
            ) : (
              "Save"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AvailabilityModal;