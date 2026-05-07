"use client";
import { useState, useEffect } from "react";
import { X, Plus, Trash2, Loader2 } from "lucide-react";
import FormErrorAlert from "../common/FormErrorAlert";

function EditAvailabilityModal({
  availability,
  isOpen,
  onClose,
  onSave,
  error,
  loading,
  setError,
  dayToEdit,
}) {
  const times = [
    "12:00 AM", "1:00 AM", "2:00 AM", "3:00 AM",
    "4:00 AM", "5:00 AM", "6:00 AM", "7:00 AM",
    "8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM",
    "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM",
    "4:00 PM", "5:00 PM", "6:00 PM", "7:00 PM",
    "8:00 PM", "9:00 PM", "10:00 PM", "11:00 PM",
  ];

  const [slots, setSlots] = useState([]);
  const [duplicates, setDuplicates] = useState([]);

  // Load slots when modal opens
  useEffect(() => {
    if (dayToEdit && availability) {
      const dayData = availability.find((d) => d.day === dayToEdit);
      setSlots(dayData?.slots ? [...dayData.slots] : []);
    }
  }, [dayToEdit, availability]);

  // Detect duplicate slots
  useEffect(() => {
    const seen = new Set();
    const dup = [];

    slots.forEach((s) => {
      const key = `${s.from}-${s.to}`;
      if (seen.has(key)) dup.push(key);
      seen.add(key);
    });

    setDuplicates(dup);
  }, [slots]);

  if (!isOpen || !dayToEdit) return null;

  const handleAddSlot = () => {
    setSlots((prev) => [...prev, { from: "8:00 AM", to: "9:00 AM" }]);
  };

  const handleSlotChange = (index, field, value) => {
    setSlots((prev) => {
      const updated = [...prev];
      const slot = { ...updated[index], [field]: value };

      // Auto update "to" if needed
      if (field === "from") {
        const fromIndex = times.indexOf(value);
        const nextTime = times[fromIndex + 1] || times[times.length - 1];

        if (!slot.to || times.indexOf(slot.to) <= fromIndex) {
          slot.to = nextTime;
        }
      }

      updated[index] = slot;
      return updated;
    });
  };

  const handleDeleteSlot = (index) => {
    setSlots((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (duplicates.length > 0 || loading) return;

    onSave([
      {
        day: dayToEdit,
        slots,
      },
    ]);
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-lg p-6 relative overflow-y-auto max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">
            Update slots for {dayToEdit}
          </h2>
          <button
            onClick={!loading ? onClose : undefined}
            className={`text-gray-500 hover:text-gray-700 ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Slots */}
        <div className="space-y-4">
          {slots.map((slot, idx) => {
            const fromIndex = times.indexOf(slot.from);
            const endOptions = times.slice(fromIndex + 1);

            return (
              <div
                key={idx}
                className="flex items-center gap-3 bg-white rounded-lg border p-2"
              >
                {/* From */}
                <select
                  disabled={loading}
                  value={slot.from}
                  onChange={(e) =>
                    handleSlotChange(idx, "from", e.target.value)
                  }
                  className="border rounded-md px-2 py-1 text-sm flex-1"
                >
                  {times.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>

                <span className="text-gray-500 text-sm">to</span>

                {/* To */}
                <select
                  disabled={loading}
                  value={slot.to}
                  onChange={(e) =>
                    handleSlotChange(idx, "to", e.target.value)
                  }
                  className="border rounded-md px-2 py-1 text-sm flex-1"
                >
                  {endOptions.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>

                {/* Delete */}
                <button
                  disabled={loading}
                  onClick={() => handleDeleteSlot(idx)}
                  className={`text-red-500 hover:text-red-700 ${
                    loading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}

          {slots.length === 0 && (
            <p className="text-sm text-gray-400 italic">
              No slots added yet.
            </p>
          )}

          {/* Add button */}
          <button
            onClick={handleAddSlot}
            disabled={loading}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm"
          >
            <Plus className="w-4 h-4" /> Add Slot
          </button>
        </div>

        {/* Duplicate warning */}
        {duplicates.length > 0 && (
          <p className="text-red-600 text-sm mt-2 font-medium">
            Duplicate time slots detected.
          </p>
        )}

        {/* Global error */}
        {error && (
          <FormErrorAlert message={error} onClose={() => setError(null)} />
        )}

        {/* Save */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSave}
            disabled={duplicates.length > 0 || loading}
            className={`px-4 py-2 rounded-lg text-white flex items-center justify-center gap-2 transition ${
              duplicates.length > 0 || loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
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

export default EditAvailabilityModal;