import { useState } from "react";
import { useForm } from "react-hook-form";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Loader2, Send } from "lucide-react";
import FormInput from "../components/common/FormInput";
import { submitProposal } from "../services/project.service";
import FormErrorAlert from "../components/common/FormErrorAlert";

function AddProposal() {
  const { projectId } = useParams();
  const token = useSelector((state) => state.auth.token);
  const navigate = useNavigate();
  const [err, setErr] = useState(null);

  const today = new Date().toISOString().split("T")[0]; // e.g. "2025-11-05"

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm();

  const onSubmit = async (data) => {
    try {
      const payload = { ...data, projectId };
      console.log("Submitting proposal with payload:", payload);
      const res = await submitProposal(token, payload);
      console.log("Proposal submission response:", res);
      if (res.success) {
        reset();
        navigate("/proposals");
      } else {
        setErr(res.message || "Failed to submit proposal");
      }
    } catch (err) {
      console.error(err);
      setErr("Error submitting proposal");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow p-8 border border-gray-100">
        <h1 className="text-2xl font-semibold text-gray-800 mb-6">
          Submit Your Proposal
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <FormErrorAlert
                      message={err}
                      onClose={() => setErr(null)} // optional close button
            />
          {/* Proposed Budget */}
          <FormInput
            label="Proposed Budget (KWD)"
            id="proposedBudget"
            name="proposedBudget"
            placeholder="e.g. 1000K - 1500K"
            register={register}
            rules={{
              required: "Budget is required",
              minLength: {
                value: 2,
                message: "Enter a valid budget range",
              },
            }}
            errors={errors}
          />

          {/* Proposed Delivery Time */}
          <div>
            <label
              htmlFor="proposedDeliveryTime"
              className="block text-sm text-gray-700 mb-2"
            >
              Proposed Delivery Time
            </label>
            <input
              id="proposedDeliveryTime"
              type="date"
              min={today} // ⬅️ Prevent selecting past dates
              {...register("proposedDeliveryTime", {
                required: "Delivery time is required",
                validate: (value) =>
                  new Date(value) >= new Date(today) ||
                  "Delivery date cannot be in the past",
              })}
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.proposedDeliveryTime && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                {errors.proposedDeliveryTime.message}
              </p>
            )}
          </div>

          {/* Proposal Details */}
          <div>
            <label
              htmlFor="details"
              className="block text-sm text-gray-700 mb-2"
            >
              Proposal Details
            </label>
            <textarea
              id="details"
              {...register("details", {
                required: "Please describe your proposal",
                minLength: {
                  value: 500,
                  message: "Details must be at least 500 characters",
                },
              })}
              placeholder="Describe your approach, timeline, and other details..."
              rows={4}
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            ></textarea>
            {errors.details && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                {errors.details.message}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-60"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            <span>{isSubmitting ? "Submitting..." : "Submit Proposal"}</span>
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddProposal;