import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    products: null,
    myOrders: null,
    orderTrackingData: null,
};
const productSlice = createSlice({
    name: "product",
    initialState,
    reducers: {
        setProducts(state, action) {
            state.products = action.payload;
        },
        setMyOrders(state, action) {
            state.myOrders = action.payload;
        },
        setOrderTrackingData(state, action) {
            state.orderTrackingData = action.payload;
        }

    },
});

export const { setProducts, setMyOrders, setOrderTrackingData } = productSlice.actions;
export default productSlice.reducer;