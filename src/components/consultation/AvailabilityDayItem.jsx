import { ChevronDown, ChevronRight, Pencil, Trash2 } from "lucide-react";

function AvailabilityDayItem({
  dayData,
  expanded,
  onToggle,
  onOpenEditModal,
}) {
  const { day, slots = [] } = dayData;

  return (
    <div className="p-4 w-full text-left">
      <button
        onClick={onToggle}
        className="flex w-full  justify-between items-center"
      >
        <div className="flex flex-col items-center justify-between">
          <div className="flex items-center gap-2">
            {expanded ? (
              <ChevronDown className="w-4 h-4 text-blue-500" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-400" />
            )}
            <span className="font-medium text-gray-800">{day}</span>
          </div>
          <span
            className={`text-sm text-left ${
              slots.length ? "text-green-600" : "text-gray-400 italic"
            }`}
          >
            {slots.length
              ? `${slots.length} slot${slots.length > 1 ? "s" : ""}`
              : "No slots"}
          </span>
        </div>
        <div className="">
          <Pencil
            className="w-4 h-4 text-gray-400 hover:text-blue-500 cursor-pointer"
            onClick={() => onOpenEditModal(day)}
          />
        </div>
      </button>

      {expanded && (
        <div className="mt-3 pl-6 space-y-2 animate-fadeIn">
          {slots.length ? (
            slots.map((slot, idx) => (
              <div
                key={slot._id || idx}
                className="px-3 py-1 rounded-md bg-blue-50 border border-blue-100 text-blue-700 text-sm flex justify-between"
              >
                {slot.from} – {slot.to}
                <Trash2 className="w-4 h-4 text-gray-400 cursor-pointer hover:text-red-500" />
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-400 pl-1">
              No available slots for this day.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default AvailabilityDayItem;