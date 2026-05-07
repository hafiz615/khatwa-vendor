import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    designs: null,
};
const studioSlice = createSlice({
    name: "studio",
    initialState,
    reducers: {
        setDesigns(state, action) {
            state.designs = action.payload;
        },

    },
});

export const { setDesigns } = studioSlice.actions;
export default studioSlice.reducer;