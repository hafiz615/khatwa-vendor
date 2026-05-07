import { useState } from "react";
import { useForm } from "react-hook-form";
import { Eye, EyeOff } from "lucide-react";
import { useSelector } from "react-redux";
import { resetPassword } from "../services/auth.service";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import FormErrorAlert from "../components/common/FormErrorAlert";

function ResetPassword() {
  const { otpToken } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [err, setErr] = useState(null);
  console.log(otpToken);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm();

  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const newPassword = watch("newPassword", "");
  useEffect(() => {
    if (!otpToken) {
      navigate("/verify");
      // return null;
    }
  }, []);
  const onSubmit = async (data) => {
    console.log("Change Password Data:", data);
    const phone = JSON.parse(localStorage.getItem("phone"));
    const result = await resetPassword({ ...data, otpToken, phone }, setErr);
    if (result) {
      navigate("/");
    }
  };

  const passwordRules = {
    length: newPassword.length >= 8,
    upper: /[A-Z]/.test(newPassword),
    number: /\d/.test(newPassword),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword),
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center pt-10 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm p-6">
        {/* Header */}
        <div className="flex items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Change Password</h2>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* New Password */}
          <FormErrorAlert
            message={err}
            onClose={() => setErr(null)} // optional close button
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Password
            </label>
            <div className="relative">
              <input
                type={showNew ? "text" : "password"}
                placeholder="Enter new password"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-600"
                {...register("newPassword", {
                  required: "New password is required",
                })}
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute inset-y-0 right-3 flex items-center text-gray-500"
              >
                {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Password strength */}
            <div className="mt-3 space-y-1 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <span
                  className={`w-2 h-2 rounded-full ${
                    passwordRules.length ? "bg-green-500" : "bg-gray-300"
                  }`}
                />
                <p>At least 8 characters</p>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`w-2 h-2 rounded-full ${
                    passwordRules.upper ? "bg-green-500" : "bg-gray-300"
                  }`}
                />
                <p>Contains uppercase letter</p>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`w-2 h-2 rounded-full ${
                    passwordRules.number ? "bg-green-500" : "bg-gray-300"
                  }`}
                />
                <p>Contains number</p>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`w-2 h-2 rounded-full ${
                    passwordRules.special ? "bg-green-500" : "bg-gray-300"
                  }`}
                />
                <p>Contains special character</p>
              </div>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                placeholder="Confirm new password"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-600"
                {...register("confirmPassword", {
                  required: "Please confirm your password",
                  validate: (val) =>
                    val === newPassword || "Passwords do not match",
                })}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute inset-y-0 right-3 flex items-center text-gray-500"
              >
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-red-500 text-sm mt-1">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full mt-8 py-3 rounded-md font-semibold text-sm text-white transition ${
              isSubmitting
                ? "bg-blue-400 cursor-not-allowed opacity-70"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {isSubmitting ? "UPDATING..." : "UPDATE PASSWORD"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ResetPassword;