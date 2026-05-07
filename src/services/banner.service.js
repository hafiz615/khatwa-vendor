import { bannerEndpoints } from "./api";
import apiConnector from "./apiConnector";

export const createBanner = async (token, formData, setErr) => {
  try {
    const { data } = await apiConnector(
      "POST",
      bannerEndpoints.CREATE_VENDOR_BANNER_API,
      formData,
      { Authorization: `Bearer ${token}` }
    );
    if (!data.success) throw new Error(data.message);
    return data.data;
  } catch (error) {
    console.log("Error creating banner:", error);
    setErr?.(error.response?.data?.message || "Failed to create banner");
    return null;
  }
};

export const updateVendorBanner = async (bannerId, token, formData, setErr) => {
  try {
    const { data } = await apiConnector(
      "PUT",
      `${bannerEndpoints.CREATE_VENDOR_BANNER_API}/${bannerId}`,
      formData,
      { Authorization: `Bearer ${token}` }
    );
    if (!data.success) throw new Error(data.message);
    return data.data;
  } catch (error) {
    console.log("Error resubmitting banner:", error);
    setErr?.(error.response?.data?.message || "Failed to resubmit banner");
    return null;
  }
};

export const getVendorBanners = async (token) => {
  try {
    const { data } = await apiConnector(
      "GET",
      bannerEndpoints.GET_VENDOR_BANNERS_API,
      null,
      { Authorization: `Bearer ${token}` }
    );
    if (!data.success) throw new Error(data.message);
    return data.data || [];
  } catch (error) {
    console.log("Error fetching vendor banners:", error);
    return null;
  }
};

export const deleteVendorBanner = async (bannerId, token) => {
  try {
    const { data } = await apiConnector(
      "DELETE",
      `${bannerEndpoints.DELETE_VENDOR_BANNER_API}${bannerId}`,
      null,
      { Authorization: `Bearer ${token}` }
    );
    return !!data?.success;
  } catch (error) {
    console.log("Error deleting vendor banner:", error);
    return false;
  }
};
