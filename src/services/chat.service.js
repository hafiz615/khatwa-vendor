import { chatEndpoints } from "./api";
import apiConnector from "./apiConnector"

export const getChatList = async (token) => {
  try {
    const { data } = await apiConnector(
      "GET",
      chatEndpoints.CHATLIST_API,
      null,
      { Authorization: `Bearer ${token}` }
    );
    console.log(data);
    if (!data.success) throw new Error(data.message);
    return data;
  } catch (error) {
    console.error("Error fetching chat", error);
    return null;
  }
};