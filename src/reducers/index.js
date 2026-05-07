import { combineReducers } from "@reduxjs/toolkit";
import authSlice from "../slices/auth";
import profileSlice from "../slices/profile";
import postSlice from "../slices/post";
import productSlice from "../slices/product";
import studioDesigns from "../slices/studio";
import conversationSlice from "../slices/conversation";
import projectSlice from "../slices/project";
import consultationSlice from "../slices/consultation";
import subscriptionSlice from "../slices/subscription";

const rootReducer = combineReducers({
    auth: authSlice,
    profile: profileSlice,
    post: postSlice,
    product: productSlice,
    studio: studioDesigns,
    conversation: conversationSlice,
    project: projectSlice,
    consultation: consultationSlice,
    subscription: subscriptionSlice,

});

export default rootReducer;