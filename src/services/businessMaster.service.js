import { publicEndpoints } from "./api";
import apiConnector from "./apiConnector";

export async function fetchPublicBusinessMaster() {
  const { data } = await apiConnector(
    "GET",
    publicEndpoints.BUSINESS_TYPES_PUBLIC,
    null,
    null
  );
  if (!data.success) {
    throw new Error(data.message || "Failed to load business types");
  }
  return {
    businessTypes: data.businessTypes || [],
    businessCategories: data.businessCategories || [],
  };
}
