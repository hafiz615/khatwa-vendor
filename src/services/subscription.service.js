import { designerEndpoints, subscriptionEndpoints } from "./api";
import apiConnector from "./apiConnector";

/**
 * Unwrap and attach planPermissions from planId when the API omits the flat field (older servers).
 */
export function normalizeDesignerSubscriptionDoc(doc) {
  if (doc == null || typeof doc !== "object") return doc;
  const next = { ...doc };
  const plan = next.planId;
  if (
    (!next.planPermissions ||
      typeof next.planPermissions !== "object" ||
      Array.isArray(next.planPermissions)) &&
    plan &&
    typeof plan === "object" &&
    plan.permissions &&
    typeof plan.permissions === "object" &&
    !Array.isArray(plan.permissions)
  ) {
    try {
      next.planPermissions = JSON.parse(JSON.stringify(plan.permissions));
    } catch {
      next.planPermissions = { ...plan.permissions };
    }
  }
  return next;
}

export const getPaymentMethods = async (token, amount) => {
  try {
    const { data } = await apiConnector(
      "GET",
      `${subscriptionEndpoints.GET_PAYMENT_METHODS_API}?amount=${amount}`,
      null,
      { Authorization: `Bearer ${token}` }
    );
    if (!data.success) throw new Error(data.message);
    return data.data;
  } catch (error) {
    console.log("Error fetching designs:", error);
    return null;
  }
};

export const createSubscription = async (token, subscriptionData) => {
  try {
    const { data } = await apiConnector(
        "POST",
        subscriptionEndpoints.CREATE_SUBSCRIPTION_API,
        subscriptionData,
        { Authorization: `Bearer ${token}` }
    );
    console.log("Subscription created:", data);
    if(!data.success) return {success: false, message: data?.response?.data?.message};
    return {success: true, data: data.data};
  } catch (error) {
    console.log("Error creating subscription:", error);
    return {success: false, message: error?.response?.data?.message || "Subscription creation failed."};
  }
};

export const getSubscriptionData = async (token) => {
  try {
    const { data } = await apiConnector(
        "GET",
        designerEndpoints.GET_SUBSCRIPTION_DATA_API,
        null,
        { Authorization: `Bearer ${token}` }
    );
    if (!data.success) throw new Error(data.message);
    return normalizeDesignerSubscriptionDoc(data.data);
  } catch (error) {
    console.log("Error fetching subscription data:", error);
    throw error;
  }
};