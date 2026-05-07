import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { signup, verifyOTP, sendOTP } from "../../services/auth.service";
import { setToken, setSignupData } from "../../slices/auth";
import { setUser } from "../../slices/profile";
import { sendOtpForPasswordReset } from "../../services/auth.service";
import toast from "react-hot-toast";
import FormErrorAlert from "../common/FormErrorAlert";

export default function VerifyOTP() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const signupData = useSelector((state) => state.auth.signupData);
  const { profile, civilIdFile, businessLicenseFile, commercialLicenseFile } =
    location.state || {};
  console.log("profile from otp page", profile, civilIdFile, businessLicenseFile, commercialLicenseFile);
  const phoneForPasswordReset = useSelector(
    (state) => state.auth.phoneForPasswordReset
  );

  // console.log("phoneForPasswordReset", phoneForPasswordReset);
  const [loading, setLoading] = useState(false);
  // const [err, setErr] = useState(null);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(30);
  const [err, setErr] = useState(null);
  const inputRefs = useRef([]);

  // Countdown timer
  useEffect(() => {
    if (timer <= 0) return;

    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const handleChange = (index, value) => {
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();

    if (/^\d{6}$/.test(pastedData)) {
      const newOtp = pastedData.split("");
      setOtp(newOtp);
      inputRefs.current[5]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpCode = otp.join("");

    if (otpCode.length !== 6) return;

    // if signupData is available then use this flow for signup
    console.log("signupData", signupData, phoneForPasswordReset);
    if (signupData && !phoneForPasswordReset) {
      setLoading(true);
      console.log("Verifying OTP for signup...");

      const verified = await dispatch(
        verifyOTP(signupData.countryCode + signupData.phone, otpCode, "signup")
      );

      if (verified) {
        console.log("OTP verified, proceeding with signup...", signupData);
        let formData = new FormData();
        for (const key in signupData) {
          formData.append(key, signupData[key]);
        }
        if (profile) formData.append("profile", profile);
        if (civilIdFile) formData.append("civilIdDoc", civilIdFile);
        if (businessLicenseFile)
          formData.append("businessLicenseDoc", businessLicenseFile);
        if (commercialLicenseFile)
          formData.append("commercialLicenseDoc", commercialLicenseFile);
        const data = await signup(formData, navigate);
        if (data) {
          dispatch(setToken(data.accessToken));
          dispatch(setUser(data.user));
          localStorage.setItem("token", JSON.stringify(data.accessToken));
          localStorage.setItem("user", JSON.stringify(data.user));
          navigate("/dashboard/post");
        }
      }

      setLoading(false);
    } else {
      //if signupData is not available then use this flow for pass reset
      // console.log(phoneForPasswordReset);
      if (phoneForPasswordReset) {
        console.log("Verifying OTP for password reset...");
        const verified = await dispatch(
          verifyOTP(phoneForPasswordReset, otpCode, "reset-password")
        );

        if (verified) {
          navigate("/reset-password");
        }
      }
    }
  };

  const handleResend = async () => {
    if (timer === 0 && signupData && !phoneForPasswordReset) {
      // console.log("Resending OTP...");
      setLoading(true);
      // Restart timer and reset OTP input
      setTimer(57);
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();

      // Re-dispatch signupData and OTP send request
      dispatch(setSignupData(signupData)); // ensures state consistency
      dispatch(sendOTP(signupData, navigate));
      setLoading(false);
      return;
    }
    if (timer === 0) {
      //send otp for password reset
      setLoading(true);
      const result = await dispatch(
        sendOtpForPasswordReset({ phone: phoneForPasswordReset }, setErr)
      );
      if (result) {
        toast.success("Otp send to you phone");
        setTimer(57);
      } else {
        toast.success("Something went wrong, please try again");
      }
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-sm p-6 mx-auto">
        {/* Header */}

        {/* Main Content */}
        <div className="flex-1 px-6 pt-8">
          <h1 className="text-2xl font-bold text-center mb-3">VERIFY OTP</h1>
          <p className="text-gray-500 text-center text-sm mb-12 px-4">
            Enter your OTP which has been sent to your email and completely
            verify your account.
          </p>

          <form onSubmit={handleSubmit} className="space-y-8">
            <FormErrorAlert
              message={err}
              onClose={() => setErr(null)} // optional close button
            />
            {/* OTP Input Boxes */}
            <div className="flex justify-center gap-4">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  className="w-14 h-14 text-center text-2xl font-semibold border-2 border-gray-200 rounded-lg focus:border-blue-600 focus:outline-none transition-colors"
                  aria-label={`OTP digit ${index + 1}`}
                />
              ))}
            </div>

            {/* Resend Timer */}
            <div className="text-center">
              {timer > 0 ? (
                <p className="text-gray-500 text-sm">
                  Resend in{" "}
                  <span className="font-semibold">{formatTime(timer)}</span>
                </p>
              ) : (
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleResend}
                  className="text-blue-600 text-sm font-semibold hover:underline"
                >
                  Resend OTP
                </button>
              )}
            </div>

            {/* Confirm Button */}
            <div className="pt-32">
              <button
                disabled={loading}
                type="submit"
                className="w-full bg-blue-600 text-white py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                { loading ? "LOADING..." : "CONFIRM"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
