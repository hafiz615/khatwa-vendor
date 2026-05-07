import { setLoading, setOtpToken, setPhoneForPasswordReset } from "../slices/auth";
import apiConnector from "./apiConnector";
import { toast } from "react-hot-toast";
import { authEndpoints } from "./api";

export const sendOTP = (payload, navigate, files = {}) => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    // Extract only phone, email, countryCode for OTP endpoint
    let otpPayload;
    
    if (payload instanceof FormData) {
      otpPayload = {
        countryCode: payload.get("countryCode"),
        phone: payload.get("phone"),
        email: payload.get("email")
      };
    } else {
      otpPayload = {
        countryCode: payload.countryCode,
        phone: payload.phone,
        email: payload.email
      };
    }

    const { data } = await apiConnector("POST", authEndpoints.SENDOTP_API, otpPayload);

    if (!data.success) throw new Error(data.message);

    toast.success(data.message);
    
    // Navigate with files in state
    navigate("/verify", {
      state: files
    });
  } catch (error) {
    console.error("Error while sending OTP:", error);
    toast.error(error.response?.data?.message || "Failed to send OTP");
  } finally {
    dispatch(setLoading(false));
  }
};

export const verifyOTP = (phone, otp, purpose)=> async (dispatch)=> {
  try {
    const { data } = await apiConnector("POST", authEndpoints.VERIFY_OTP_API, {
      phone,
      otp,
      purpose,
    });

    if (!data.success) throw new Error(data.message);
    // toast.success(data.message);
    dispatch(setOtpToken(data?.token))
    return true;
  } catch (error) {
    console.error("Error verifying OTP:", error);
    toast.error(error.response?.data?.message || "Failed to verify OTP");
    return false;
  }
};

export const signup = async (payload, navigate) => {
  try {
    const { data } = await apiConnector("POST", authEndpoints.SIGNUP_API, payload, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    if (!data.success) throw new Error(data.message);

    toast.success(data.message);
    return data;
  } catch (error) {
    console.error("Error during signup:", error);
    toast.error(error.response?.data?.message || "Failed to create account");
  }
};
export const googleAuth = async (idToken, navigate) => {
  try {
    const { data } = await apiConnector("POST", authEndpoints.OAUTH_GOOGLE_API, idToken);

    if (!data.success) throw new Error(data.message);

    toast.success(data.message);
    return data;
  } catch (error) {
    console.error("Error during signup:", error);
    toast.error(error.response?.data?.message || "Failed to create account");
  }
};
export const login = async (payload, setErr) => {
  try {
    const { data } = await apiConnector("POST", authEndpoints.LOGIN_API, {
      ...payload,
    });
    if (!data.success) throw new Error(data.message);

    // toast.success(data.message);
    return data;
  } catch (error) {
    console.log("Error during login:", error);
    setErr(error.response?.data?.message || "Failed to login");
  }
};
export const sendOtpForPasswordReset = (payload, setErr) => async (dispatch) => {
  try {
    const { data } = await apiConnector("POST", authEndpoints.Send_OTP_FOR_PASSWORD_RESET_API, 
      { ...payload});
    if (!data.success) throw new Error(data.message);

    // toast.success(data.message);
    console.log(data)
    dispatch(setPhoneForPasswordReset(data.phone))
    localStorage.setItem("phone",JSON.stringify(data.phone))
    return data.success;
  } catch (error) {
    console.log("Error while semding otp:", error);
    setErr(error.response?.data?.message || "Failed to send otp");
    return false
  }
};
export const resetPassword = async (payload, setErr) => {
  try {
    const { data } = await apiConnector("POST", authEndpoints.PASSWORD_RESET_API, {
      ...payload,
    });
    if (!data.success) throw new Error(data.message);

    // toast.success(data.message);
    return true;
  } catch (error) {
    console.log("Error during login:", error);
    setErr(error.response?.data?.message || "Failed to login");
    return false;
  }
};