import { studioEndpoints } from "./api";
import apiConnector from "./apiConnector";

export const createDesign = async (token, formData, setErr) => {
  try {
    const { data } = await apiConnector(
      "POST",
      studioEndpoints.CREATE_DESIGN_API,
      formData,
      {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      }
    );
    if (!data.success) throw new Error(data.message);

    return data;
  } catch (error) {
    console.log("Error creating design:", error);
    setErr(error.response?.data?.message || "Failed to create design");
    return false;
  }
};

export const getDesigenerFeturedDesigns = async (token) => {
  try {
    const { data } = await apiConnector(
      "GET",
      studioEndpoints.GET_DESIGNER_DESIGN_API,
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

export const fetchDetailedDesign = async (designId, token) => {
  try {
    const { data } = await apiConnector(
      "GET",
      `${studioEndpoints.GET_DETAILED_DESIGN_API}/${designId}`,
      null,
      { Authorization: `Bearer ${token}` }
    );
    console.log(data.data);
    if (!data.success) throw new Error(data.message);
    return data.data;
  } catch (error) {
    console.error("Error fetching detailed design:", error);
    return null;
  }
};

export const deleteDesign = async (designId, token) => {
  try {
    const response = await apiConnector(
      "DELETE",
      `${studioEndpoints.DELETE_DESIGN_API}${designId}`,
      null,
      { Authorization: `Bearer ${token}` }
    );
    if (response.status === 204) {
      return true;
    }

    const data = response.data;
    if (!data?.success) {
      console.warn("Delete failed:", data?.message || "Unknown error");
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error deleting design:", error);
    return false;
  }
};
