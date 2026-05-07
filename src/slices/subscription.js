import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  loading: true,
  subscription: null,
  paymentMethods: null,
  subScriptionModalOpen: false,
};
const subscriptionSlice = createSlice({
  name: "subscription",
  initialState,
  reducers: {
    setLoading(state, action) {
      state.loading = action.payload;
    },
    setSubscription(state, action) {
      state.subscription = action.payload;
      state.loading = false;
    },
    setPaymentMethods(state, action) {
      state.paymentMethods = action.payload;
    },
    setSubScriptionModalOpen(state, action) {
      state.subScriptionModalOpen = action.payload;
    }
  },
});

export const {
    setLoading,
  setSubscription,
  setPaymentMethods,
  setSubScriptionModalOpen
} = subscriptionSlice.actions;
export default subscriptionSlice.reducer;
