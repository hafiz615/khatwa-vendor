import { storyEndpoints } from "./api";
import apiConnector from "./apiConnector";

export const createStory = async (token, formData, setErr) => {
  try {
    const { data } = await apiConnector(
      "POST",
      storyEndpoints.CREATE_STORY_API,
      formData,
      { Authorization: `Bearer ${token}` }
    );
    if (!data.success) throw new Error(data.message);
    return data.success;
  } catch (error) {
    console.log("Error creating story:", error);
    setErr?.(error.response?.data?.error || "Failed to create story");
    return false;
  }
};

export const getDesignerStories = async (token) => {
  try {
    const { data } = await apiConnector(
      "GET",
      storyEndpoints.GET_DESIGNER_STORIES_API,
      null,
      { Authorization: `Bearer ${token}` }
    );
    if (!data.success) throw new Error(data.message);
    return data.stories;
  } catch (error) {
    console.log("Error fetching stories:", error);
    return null;
  }
};

export const deleteStory = async (storyId, token) => {
  try {
    const response = await apiConnector(
      "DELETE",
      `${storyEndpoints.DELETE_STORY_API}${storyId}`,
      null,
      { Authorization: `Bearer ${token}` }
    );
    
    const data = response.data;
    if (data?.success) return true;
    
    console.warn("Delete failed:", data?.message || "Unknown error");
    return false;
  } catch (error) {
    console.error("Error deleting story:", error);
    return false;
  }
};
