import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import FormInput from "../common/FormInput";
import { googleAuth, login } from "../../services/auth.service";
import { useDispatch } from "react-redux";
import { setToken } from "../../slices/auth";
import { setUser } from "../../slices/profile";
import FormErrorAlert from "../common/FormErrorAlert";
// import { GoogleLogin } from "@react-oauth/google";
// import toast from "react-hot-toast";

function LoginForm() {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      emailOrPhone: "",
      password: "",
      //   rememberMe: true,
    },
  });

  const [showPassword, setShowPassword] = useState(false);

  const emailOrPhone = watch("emailOrPhone");
  const isPhoneNumber = /^\d+$/.test(emailOrPhone);

  const onSubmit = async (data) => {
    let payload = { ...data };

    // If it's a phone (digits only), prepend +965
    if (/^\d+$/.test(payload.emailOrPhone)) {
      payload.emailOrPhone = `+965${payload.emailOrPhone}`;
    }

    const dataPayload = payload.emailOrPhone.includes("+")
      ? { ...payload, phone: payload.emailOrPhone }
      : { ...payload, email: payload.emailOrPhone };
    setLoading(true);
    const result = await login(dataPayload, setErr);
    if (result) {
      dispatch(setToken(result.accessToken));
      dispatch(setUser(result.user));
      localStorage.setItem("token", JSON.stringify(result.accessToken));
      localStorage.setItem("user", JSON.stringify(result.user));
      // console.log("result", result);
      navigate("/dashboard/posts");
    }

    setLoading(false);
    // API Call
  };

  // const handleGoogleSuccess = async (credentialResponse) => {
  //   try {
  //     console.log(credentialResponse);
  //     const idToken = credentialResponse.credential;

  //     if (!idToken) {
  //       toast.error("Google sign-in failed. Please try again.");
  //       return;
  //     }

  //     // Send ID token to backend for verification
  //     const data = await googleAuth({ idToken });
  //     console.log("data", data);
  //     if (data?.success) {
  //       dispatch(setToken(data.accessToken));
  //       dispatch(setUser(data.user));
  //       localStorage.setItem("token", JSON.stringify(data.accessToken));
  //       localStorage.setItem("user", JSON.stringify(data.user));
  //       navigate("/posts");
  //     } else {
  //       toast.error(data?.message || "Google sign-in failed");
  //     }
  //   } catch (error) {
  //     console.error("Google login error:", error);
  //     toast.error("Google sign-in failed. Try again later.");
  //   }
  // };

  // const handleGoogleError = () => {
  //   toast.error("Google sign-in was cancelled or failed.");
  // };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-sm p-6">
        {/* Header */}
        {/* <Back /> */}

        {/* Logo */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold tracking-tight">KHATWA</h1>
          <p
            className="text-2xl font-bold mt-1"
            style={{ fontFamily: "Arial" }}
          >
            خطوة
          </p>
        </div>
        <FormErrorAlert
          message={err}
          onClose={() => setErr(null)} // optional close button
        />
        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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

          <FormInput
            label="Password"
            id="password"
            placeholder="Enter password"
            type={showPassword ? "text" : "password"}
            prefix="02"
            name="password"
            register={register}
            rules={{
              required: "Password is required",
              minLength: {
                value: 6,
                message: "Password must be at least 6 characters",
              },
            }}
            rightIcon={
              <span onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </span>
            }
            errors={errors}
          />

          {/* Remember me & Forgot password */}
          <div className="flex items-center justify-between">
            {/* <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                {...register("rememberMe")}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Remember me</span>
            </label> */}
            <Link
              to="/forgot-password"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Forgot password?
            </Link>
          </div>

          {/* Login Button */}
          <button
            disabled={loading}
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-lg transition-colors"
          >
            {loading ? "Loading..." : "LOG IN"}
          </button>
        </form>

        {/* Divider */}
        {/* <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-gray-500">OR LOG IN WITH</span>
          </div>
        </div> */}

        {/* Social Login Buttons */}
        {/* <div className="grid grid-cols-1 gap-4 mb-8 justify-center">
          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              useOneTap
            />
          </div>

          {/* Conditionally render Apple button for iOS only 
          {(() => {
            const userAgent =
              navigator.userAgent || navigator.vendor || window.opera;
            const isIOS =
              /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream;

            if (!isIOS) {
              return (
                <button
                  className="flex items-center justify-center py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  onClick={() => {
                    // TODO: implement Apple sign-in flow
                    toast("Apple Sign-In coming soon!");
                  }}
                >
                  <svg
                    className="w-6 h-6"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                  </svg>
                </button>
              );
            }
            return null;
          })()}
        </div> */}

        {/* Sign Up Link */}
        <p className="text-center text-sm text-gray-600 mt-5">
          Don't have an account?{" "}
          <Link to={"/signup"} className="text-blue-500">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}

export default LoginForm;
