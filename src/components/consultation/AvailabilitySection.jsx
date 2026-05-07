import { useState } from "react";
import {
  Clock,
  PlusCircle,
  ChevronRight,
  ChevronDown,
  Loader2,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import Button from "../common/Button";
import AvailabilityDayItem from "./AvailabilityDayItem";

function AvailabilitySection({
  availability,
  loading,
  error,
  onRetry,
  onOpenModal,
  onOpenEditModal,
}) {
  const [expandedDay, setExpandedDay] = useState(null);
  const [open, setOpen] = useState(false);

  const toggleDay = (day) => {
    setExpandedDay((prev) => (prev === day ? null : day));
  };

  return (
    <div className="bg-white rounded-2xl shadow p-5 space-y-">
      <div
        onClick={() => setOpen((p) => !p)}
        className="flex w-full items-center justify-between cursor-pointer"
      >
        <div className="flex items-center gap-2">
          {open ? (
            <ChevronDown className="w-5 h-5 text-blue-500" />
          ) : (
            <ChevronRight className="w-5 h-5 text-gray-400" />
          )}
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-500" /> Your Availability
          </h2>
          <p className="text-sm text-gray-500">(Kuwait Time)</p>
        </div>
        <Button onClick={onOpenModal} icon={<PlusCircle />}>
          Set
        </Button>
      </div>
      <p className="space-y-0 ms-8 text-sm text-gray-500">
        Manage your weekly consultation availability
      </p>

      {open && (
        <div className="border rounded-xl divide-y mt-3">
          {loading ? (
            <div className="flex flex-col items-center py-10 text-gray-500">
              <Loader2 className="w-6 h-6 animate-spin mb-2" />
              <p>Loading availability...</p>
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
          ) : !availability?.length ? (
            <div className="flex flex-col items-center py-10 text-gray-400">
              <Clock className="w-6 h-6 mb-2" />
              <p>No availability set yet.</p>
            </div>
          ) : (
            availability.map((dayData) => (
              <AvailabilityDayItem
                key={dayData.day}
                dayData={dayData}
                expanded={expandedDay === dayData.day}
                onToggle={() => toggleDay(dayData.day)}
                onOpenEditModal={() => onOpenEditModal(dayData.day)} // 🔹 pass day
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default AvailabilitySection;