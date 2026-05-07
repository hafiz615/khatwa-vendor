import apiConnector from "./apiConnector";
import { designerEndpoints } from "./api";

export async function fetchShippingFeeTiers(token) {
  const { data } = await apiConnector(
    "GET",
    designerEndpoints.ECOMMERCE_SHIPPING_FEES_API,
    null,
    { Authorization: `Bearer ${token}` }
  );
  return data;
}

export async function saveShippingFeeTiers(token, feeKwd) {
  const { data } = await apiConnector(
    "PUT",
    designerEndpoints.ECOMMERCE_SHIPPING_FEES_API,
    { feeKwd },
    { Authorization: `Bearer ${token}` }
  );
  return data;
}

/// GET admin + own vendor categories (with subcategories) and current store
/// taxonomy selection for the authenticated designer.
export async function fetchStoreTaxonomy(token) {
  const { data } = await apiConnector(
    "GET",
    designerEndpoints.ECOMMERCE_STORE_TAXONOMY_API,
    null,
    { Authorization: `Bearer ${token}` }
  );
  return data;
}

/// Create a vendor-scoped top-level category. Accepts FormData with `name`,
/// optional `description`, optional `image` file.
export async function createVendorCategory(token, formData) {
  const { data } = await apiConnector(
    "POST",
    designerEndpoints.ECOMMERCE_STORE_CATEGORY_CREATE_API,
    formData,
    {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    }
  );
  return data;
}

/// Create a vendor-scoped subcategory under any admin category or own vendor
/// category. FormData fields: `name`, `parentCategoryId`, optional
/// `description`, optional `image`.
export async function createVendorSubcategory(token, formData) {
  const { data } = await apiConnector(
    "POST",
    designerEndpoints.ECOMMERCE_STORE_SUBCATEGORY_CREATE_API,
    formData,
    {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    }
  );
  return data;
}

export async function saveStoreTaxonomySelection(
  token,
  { selectedCategoryIds, selectedSubcategoryIds }
) {
  const { data } = await apiConnector(
    "PUT",
    designerEndpoints.ECOMMERCE_STORE_TAXONOMY_SELECTION_API,
    { selectedCategoryIds, selectedSubcategoryIds },
    { Authorization: `Bearer ${token}` }
  );
  return data;
}
