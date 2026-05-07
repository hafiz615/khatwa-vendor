import { productEndpoints } from "./api";
import apiConnector from "./apiConnector";

export const updateProduct = async (token, productId, formData, setErr) => {
  try {
    const { data } = await apiConnector(
      "PUT",
      productEndpoints.UPDATE_PRODUCT_API(productId),
      formData,
      {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      }
    );
    if (!data.success) throw new Error(data.message);
    return data;
  } catch (error) {
    console.log("Error updating product:", error);
    setErr?.(error.response?.data?.message || "Failed to update product");
    return null;
  }
};

export const createProduct = async (token, formData, setErr) => {
  try {
    const { data } = await apiConnector(
      "POST",
      productEndpoints.CREATE_PPRODUCT_API,
      formData,
      {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      }
    );
    if (!data.success) throw new Error(data.message);

    return data.success;
  } catch (error) {
    console.log("Error creating product:", error);
    setErr(error.response?.data?.message || "Failed to create product");
    return false;
  }
};

export const fetchDesignerProducts = async (token) => {
  try {
    const { data } = await apiConnector(
      "GET",
      productEndpoints.GET_DESIGNER_PRODUCTS_API,
      null,
      { Authorization: `Bearer ${token}` }
    );
    if (!data.success) throw new Error(data.message);
    return data.products;
  } catch (error) {
    console.log("Error fetching products:", error);
    return null;
  }
};

export const fetchDetailedProduct = async (productId, token) => {
  try {
    const { data } = await apiConnector(
      "GET",
      `${productEndpoints.GET_DETAILED_PRODUCT_API}/${productId}`,
      null,
      { Authorization: `Bearer ${token}` }
    );
    console.log(data.product);
    if (!data.success) throw new Error(data.message);
    return data.product;
  } catch (error) {
    console.error("Error fetching detailed product:", error);
    return null;
  }
};

export const deleteProduct = async (productId, token) => {
  try {
    const response = await apiConnector(
      "DELETE",
      `${productEndpoints.DELETE_PRODUCT_API}${productId}`,
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
    console.error("Error deleting product:", error);
    return false;
  }
};

export const fetchMyOrders = async (token, page, limit) => {
  try {
    const { data } = await apiConnector(
      "GET",
      `${productEndpoints.GET_ORDERS}?page=${page}&limit=${limit}`,
      null,
      { Authorization: `Bearer ${token}` }
    );
    if (!data.success) throw new Error(data.message);
    return data;
  } catch (error) {
    console.error("Error fetching orders:", error);
    return false;
  }
}

export const fetchOrderTracking = async (token, orderId) => {
  try {
    const { data } = await apiConnector(
      "GET",
      `${productEndpoints.GET_ORDER_TRACKING}${orderId}`,
      null,
      { Authorization: `Bearer ${token}` }
    );
    console.log("Fetched order tracking data:", data);
    if (!data.success) throw new Error(data.message);
    return data;
  }
  catch (error) {
    console.error("Error fetching order tracking:", error);
    return null;
  }
}

export const updateOrderTrackingStatus = async (token, orderId, status, expectedDates, note) => {
  try {
    const { data } = await apiConnector(
      "PUT",
      `${productEndpoints.UPDATE_ORDER_TRACKING_HISTORY}${orderId}`,
      { status, expectedDates, note },
      { Authorization: `Bearer ${token}` }
    );
    console.log("Update response data:", data);
    if (!data?.success) {
      console.warn("Update failed:", data?.message || "Unknown error");
      return data;
    }
    return data;
  } catch (error) {
    console.error("Error updating order tracking status:", error);
    return error.response;
  }
}