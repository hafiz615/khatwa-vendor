import { io } from "socket.io-client";
import store from "../store/store"; // redux store
import { setSubscription } from "../slices/subscription";
import { normalizeDesignerSubscriptionDoc } from "../services/subscription.service";

// From .env.dev or .env.prod per MODE in .env
const SOCKET_URL = import.meta.env.VITE_BASE_URL;

let socket;

export const connectSocket = (token) => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      withCredentials: true,
      extraHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });

    // Subscription expired event
    socket.on("subscription_expired", (data) => {

      store.dispatch(setSubscription(null));

      // Trigger window event so App can redirect
      window.dispatchEvent(new CustomEvent("subscription_expired", { detail: data }));
    });
    socket.on("subscription_downgraded", (data) => {
      store.dispatch(
        setSubscription(normalizeDesignerSubscriptionDoc(data.newPlan))
      );
      // Trigger window event
      window.dispatchEvent(new CustomEvent("subscription_downgraded", { detail: data }));
    });

    socket.on("new_project_invitation", (data) => {
      window.dispatchEvent(
        new CustomEvent("new_project_invitation", { detail: data })
      );
    });

  }
  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
