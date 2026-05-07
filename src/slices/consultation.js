import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  consultations: [],
  availability: [],
  consultationPrice: 0,
};

const consultationSlice = createSlice({
  name: "consultation",
  initialState,
  reducers: {
    setConsultations: (state, action) => {
      state.consultations = action.payload || [];
    },
    setAvailability: (state, action) => {
      state.availability = action.payload;
    },
    setConsultationPrice: (state, action) => {
      state.consultationPrice = action.payload;
    },
  },
});

export const { setConsultations, setAvailability, setConsultationPrice } = consultationSlice.actions;
export default consultationSlice.reducer;
