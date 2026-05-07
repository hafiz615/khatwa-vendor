import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import Back from "../common/Back";
import FormInput from "../common/FormInput";
import { useDispatch, useSelector } from "react-redux";
import { useState } from "react";
import { sendOtpForPasswordReset } from "../../services/auth.service";
import FormErrorAlert from "../common/FormErrorAlert";
function ForgetPassword() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [err, setErr] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  //   const isEmail = (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)
  //   const isEightDigitPhone = (val) => (val || "").replace(/\D/g, "").length === 8

  const onSubmit = async (payload) => {
    // Call API here if needed

    const data = payload.emailOrPhone.includes("+")
      ? { ...payload, phone: `+965${payload.emailOrPhone}` }
      : { ...payload, email: payload.emailOrPhone };

    console.log(data);

    const result = await dispatch(sendOtpForPasswordReset(data, setErr));
    console.log(result);
    if (result) {
      navigate("/verify");
    }
  };
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-sm p-6">
        {/* Top bar with Back */}
        {/* <Back/> */}

        {/* Header */}
        <h1 className="text-2xl font-bold text-center mb-8">FORGOT PASSWORD</h1>
        <p className="mt-2 text-center text-sm leading-relaxed text-gray-500">
          We will send you an email with an OTP to reset your password.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 ">
          <FormErrorAlert
            message={err}
            onClose={() => setErr(null)} // optional close button
          />
          <div>
            <FormInput
              label="Email or Phone Number"
              id="emailOrPhone"
              placeholder="Enter email or phone number"
              prefix="01"
              name="emailOrPhone"
              register={register}
              rules={{
                required: "Email or phone number is required",
                validate: (value) => {
                  if (/^\d+$/.test(value)) {
                    if (value.length !== 8)
                      return "Phone number must be exactly 8 digits";
                  } else if (value.includes("@")) {
                    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                      return "Please enter a valid email address";
                    }
                  } else {
                    return "Please enter a valid email or phone number";
                  }
                  return true;
                },
              }}
              errors={errors}
            />

            {errors && (
              <p className="mt-2 text-sm text-red-600">{errors.message}</p>
            )}
          </div>

          <div className="pt-28" />

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-md bg-blue-600 py-3 text-center text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
          >
            {isSubmitting ? "PLEASE WAIT..." : "CONTINUE"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ForgetPassword;
