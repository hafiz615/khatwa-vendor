import { useState } from "react";
import { X, CalendarDays, Edit, AlertCircle, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import FormSelectInput from "../common/FormSelectInput";
import FormInput from "../common/FormInput";

function EditTrackingModal({ order, onUpdate }) {
  const [isOpen, setIsOpen] = useState(false);
  const [expectedDates, setExpectedDates] = useState({});
  const [dateErrors, setDateErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm({ defaultValues: { status: "", note: "" } });

  const selectedStatus = watch("status");
  if (!order) return null;

  const availableOptions = order.tracking
    .filter((t) => !t.completed)
    .map((t) => t.status);

  const handleExpectedChange = (key, date) => {
    setExpectedDates((prev) => ({ ...prev, [key]: date }));
  };

  const getLastCompletedDate = (order, selectedKey) => {
    const lastCompleted = [...order.tracking]
      .reverse()
      .find((t) => t.completed || t.key === selectedKey);
    return lastCompleted?.date || new Date().toISOString();
  };

  const selectedIndex = order.tracking.findIndex(
    (t) => t.status === selectedStatus
  );

  const futureStatuses =
    selectedIndex >= 0
      ? order.tracking.slice(selectedIndex + 1).filter((s) => !s.completed)
      : [];

  const minAllowedDate = getLastCompletedDate(
    order,
    order.tracking.find((t) => t.status === selectedStatus)?.key
  );

  const onSubmit = async (data) => {
  try {
    setSaving(true);
    setSaveError("");
    setSaveSuccess(false);

    const selectedKey = order.tracking.find(
      (t) => t.status === data.status
    )?.key;

    const lastCompleted = getLastCompletedDate(order, selectedKey);
    const invalid = Object.entries(expectedDates).some(
      ([, date]) => new Date(date) <= new Date(lastCompleted)
    );

    if (invalid) {
      setSaveError("Expected dates must be after the previous step.");
      setSaving(false);
      return;
    }

    // Call parent update handler and get result
    const result = await onUpdate(selectedKey, expectedDates, data.note?.trim() || "");

    if (result?.success) {
      // Success: show message and close after short delay
      setSaveSuccess(true);
      setTimeout(() => {
        setIsOpen(false);
        setSaveSuccess(false);
        reset();
        setExpectedDates({});
        setDateErrors({});
      }, 800);
    } else {
      // API returned failure: show error in modal
      setSaveError(result?.error || "Failed to update tracking. Please try again.");
    }
  } catch (e) {
    console.error(e);
    setSaveError("Failed to update tracking. Please try again.");
  } finally {
    setSaving(false);
  }
};


  return (
    <>
      <button
        className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 flex items-center gap-2"
        onClick={() => setIsOpen(true)}
      >
        <Edit size={18} />
        Edit Tracking
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-lg relative">
            {/* Close button */}
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
              onClick={() => {
                setIsOpen(false);
                reset();
                setExpectedDates({});
              }}
            >
              <X size={20} />
            </button>

            <h2 className="text-xl font-semibold mb-4">Edit Order Tracking</h2>

            {/* ✅ Select Next Status */}
            <FormSelectInput
              label="Select Next Status"
              name="status"
              placeholder="Choose a status"
              options={availableOptions}
              register={register}
              rules={{ required: "Please select a status" }}
              errors={errors}
            />

            {/* ✅ Optional Note Field */}
            {selectedStatus && (
              <div className="mb-4">
                <FormInput
                  label="Note (optional)"
                  name="note"
                  placeholder="Add a note about this update"
                  register={register}
                  errors={errors}
                />
              </div>
            )}

            {/* ✅ Expected Dates for Future Steps */}
            {futureStatuses.length > 0 && (
              <div className="space-y-3 mb-4">
                <p className="text-gray-700 font-medium mb-2">
                  Add expected dates for upcoming steps:
                </p>

                {futureStatuses.map((future) => (
                  <div key={future.key}>
                    <label className="block mb-1 font-medium text-gray-700">
                      {future.status}
                    </label>
                    <div className="flex items-center border rounded-xl px-2">
                      <CalendarDays className="text-gray-400 mr-2" size={18} />
                      <input
                        type="datetime-local"
                        className="w-full py-2 focus:outline-none"
                        min={minAllowedDate.slice(0, 16)}
                        value={expectedDates[future.key] || ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (new Date(value) <= new Date(minAllowedDate)) {
                            setDateErrors((prev) => ({
                              ...prev,
                              [future.key]:
                                "Expected date must be after previous status",
                            }));
                          } else {
                            setDateErrors((prev) => ({
                              ...prev,
                              [future.key]: "",
                            }));
                          }
                          handleExpectedChange(future.key, value);
                        }}
                      />
                    </div>

                    {dateErrors[future.key] && (
                      <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                        <AlertCircle size={14} /> {dateErrors[future.key]}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* ✅ Error Message */}
            {saveError && (
              <p className="text-red-500 text-sm mb-3 flex items-center gap-2">
                <AlertCircle size={16} /> {saveError}
              </p>
            )}

            {/* ✅ Buttons */}
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 rounded-xl border"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit(onSubmit)}
                disabled={!selectedStatus || saving}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white flex items-center gap-2 disabled:opacity-50"
              >
                {saving && <Loader2 className="animate-spin" size={16} />}
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default EditTrackingModal;