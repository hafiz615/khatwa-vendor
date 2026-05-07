import { designerEndpoints } from "./api";
import apiConnector from "./apiConnector";

export const fetchProfileData = async (token) => {
  try {
    const { data } = await apiConnector(
      "GET",
      designerEndpoints.GET_PROFILE_API,
      null,
      { Authorization: `Bearer ${token}` }
    );
    return data;
  } catch (error) {
    console.error("Error fetching profile data:", error);
    throw error;
  }
};

export const updateImageAPI = async (field, formData, token) => {
  try {
    formData.append("field", field);
    const { data } = await apiConnector(
      "PUT",
      designerEndpoints.UPDATE_IMAGE_API,
      formData,
      {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      }
    );
    return data;
  } catch (error) {
    console.error("Error updating image:", error);
    throw error;
  }
};

export const updateProfileInfoAPI = async (profileInfo, token) => {
  try {
    const { data } = await apiConnector(
      "PUT",
      designerEndpoints.UPDATE_PROFILE_INFO_API,
      profileInfo,
      { Authorization: `Bearer ${token}` }
    );
    return data;
  } catch (error) {
    console.error("Error updating profile info:", error);
    throw error;
  }
};

export const updateProfileCardsAPI = async (formData, token) => {
  try {
    const { data } = await apiConnector(
      "PUT",
      designerEndpoints.UPDATE_PROFILE_CARDS_API,
      formData,
      {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      }
    );
    return data;
  } catch (error) {
    console.error("Error updating profile cards:", error);
    throw error;
  }
};