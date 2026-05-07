import { commentEndpoints, LikeEndpoints, postEndpoints } from "./api";
import apiConnector from "./apiConnector";

export const createPost = async (token, formData, setErr) => {
  try {
    // Do not set Content-Type for FormData — axios must add multipart boundary
    const { data } = await apiConnector(
      "POST",
      postEndpoints.CREATE_POST_API,
      formData,
      { Authorization: `Bearer ${token}` }
    );
    if (!data.success) throw new Error(data.message);

    return data.success;
  } catch (error) {
    console.log("Error creating post:", error);
    setErr(error.response?.data?.error || "Failed to create post");
    return false;
  }
};

export const getDesignerPosts = async (token) => {
  try {
    const { data } = await apiConnector(
      "GET",
      postEndpoints.GET_DESIGNER_POST_API,
      null,
      {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      }
    );
    if (!data.success) throw new Error(data.message);
    return data.data;
  } catch (error) {
    console.log("Error fetching post:", error);
    return null;
  }
};

export const fetchDetailedPost = async (postId, type, token) => {
  try {
    const { data } = await apiConnector(
      "GET",
      `${postEndpoints.GET_DETAILED_POST_API}/${postId}?type=${type || "Post"}`,
      null,
      { Authorization: `Bearer ${token}` }
    );
    // console.log(data.post);
    if (!data.success) throw new Error(data.message);
    return data;
  } catch (error) {
    console.error("Error fetching detailed post:", error);
    return null;
  }
};

export const deletePost = async (postId, type, token) => {
  try {
    const response = await apiConnector(
      "DELETE",
      `${postEndpoints.DELETE_POST_API}${postId}?type=${type || "Post"}`,
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
    console.error("Error deleting post:", error);
    return false;
  }
};

export const addComment = async (contentId, payload, token) => {
  console.log(`${commentEndpoints.ADD_COMMENT_API}${contentId}/comments/add`);
  try {
    const { data } = await apiConnector(
      "POST",
      `${commentEndpoints.ADD_COMMENT_API}${contentId}/comments/add`,
      { ...payload },
      { Authorization: `Bearer ${token}` }
    );

    if (!data.success) throw new Error(data.message);
    return data.comment;
  } catch (error) {
    console.error("Error adding comment:", error);
    return null;
  }
};

export const deleteComment = async (commentId, token) => {
  try {
    const response = await apiConnector(
      "DELETE",
      `${commentEndpoints.DELETE_COMMENT_API}${commentId}/comments`,
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
    console.error("Error deleting comment:", error);
    return false;
  }
};

export const toggleLike = async (contentId, contentType, flag, token) => {
  try {
    const response = await apiConnector(
      "POST",
      `${LikeEndpoints.TOGGLE_LIKE_API}`,
      { contentId, contentType, flag },
      { Authorization: `Bearer ${token}` }
    );

    const data = response.data;
    console.log(data);
    if (data?.success) return data.liked;

    console.warn(
      `${flag ? "Like" : "Dislike"} failed:`,
      data?.message || "Unknown error"
    );
    return null;
  } catch (error) {
    console.error("Error liking/disliking post:", error);
    return null;
  }
};
