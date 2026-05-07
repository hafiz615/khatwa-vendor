import { createSlice, isAction } from "@reduxjs/toolkit";

const initialState = {
  signupData: null,
  token: localStorage.getItem("token")
    ? JSON.parse(localStorage.getItem("token"))
    : null, //access token
  loading: false,
  otpToken: null,
  phoneForPasswordReset: localStorage.getItem("phone")
    ? JSON.parse(localStorage.getItem("phone"))
    : null,
};
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setSignupData(state, action) {
      state.signupData = action.payload;
    },
    setToken(state, action) {
      state.token = action.payload;
    },
    setLoading(state, action) {
      state.loading = action.payload;
    },
    setPhoneForPasswordReset(state, action) {
      state.phoneForPasswordReset = action.payload;
    },
    setOtpToken(state, action) {
      state.otpToken = action.payload;
    },
  },
});

export const {
  setSignupData,
  setToken,
  setLoading,
  setPhoneForPasswordReset,
  setOtpToken,
} = authSlice.actions;
export default authSlice.reducer;
