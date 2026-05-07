// API base URL from .env.dev (development) or .env.prod (production), per MODE in .env
export const BASE_URL = import.meta.env.VITE_BASE_URL + "/api/v1";

export const authEndpoints = {
  SENDOTP_API: `${BASE_URL}/auth/send-otp`,
  SIGNUP_API: `${BASE_URL}/auth/signup`,
  LOGIN_API: `${BASE_URL}/auth/login`,
  VERIFY_OTP_API: `${BASE_URL}/auth/verify-otp`,
  OAUTH_GOOGLE_API: `${BASE_URL}/auth/oauth/google`,
  MOVE_TO_DASHBOARD_API: `${BASE_URL}/auth/move-to-dashboard`,
  RESUBMIT_DESIGNER_APPLICATION_API: `${BASE_URL}/auth/resubmit-designer-application`,
  STATUS_CHECK_API: `${BASE_URL}/auth/status-check`,

  REFRESH_API: `${BASE_URL}/auth/refresh-token`,
  Send_OTP_FOR_PASSWORD_RESET_API: `${BASE_URL}/auth/forgot-password/send-otp`,
  PASSWORD_RESET_API: `${BASE_URL}/auth/forgot-password/reset`,
};
export const postCategoriesEndpoints ={
  GET_POST_CAT_API: `${BASE_URL}/posts/categories`,
  CREATE_POST_CAT_API: `${BASE_URL}/posts/categories`,
}
export const postEndpoints ={
  GET_POST_API: `${BASE_URL}/posts/`,
  CREATE_POST_API: `${BASE_URL}/posts/create`,
  GET_DESIGNER_POST_API: `${BASE_URL}/posts/designer-posts`,
  GET_DETAILED_POST_API: `${BASE_URL}/posts/details`,
  DELETE_POST_API: `${BASE_URL}/posts/`,
}
export const productEndpoints ={
  CREATE_PPRODUCT_API: `${BASE_URL}/products/create`,
  GET_DESIGNER_PRODUCTS_API: `${BASE_URL}/products/designer-products`,
  PRODUCT_CAT_API: `${BASE_URL}/products/categories`,
  GET_DETAILED_PRODUCT_API: `${BASE_URL}/products`,
  /** PUT multipart: same fields as create; omit files to keep existing images */
  UPDATE_PRODUCT_API: (productId) => `${BASE_URL}/products/${productId}`,
  DELETE_PRODUCT_API: `${BASE_URL}/products/`,
  GET_ORDERS: `${BASE_URL}/products/purchase-history`,
  GET_ORDER_TRACKING: `${BASE_URL}/products/order/tracking/`,
  UPDATE_ORDER_TRACKING_HISTORY: `${BASE_URL}/products/order/status/`,
}
export const commentEndpoints ={
  ADD_COMMENT_API: `${BASE_URL}/posts/`,
  DELETE_COMMENT_API: `${BASE_URL}/posts/`,
}
export const LikeEndpoints ={
  TOGGLE_LIKE_API: `${BASE_URL}/posts/likes/toggle`,
}
export const storyEndpoints = {
  CREATE_STORY_API: `${BASE_URL}/stories/create`,
  GET_DESIGNER_STORIES_API: `${BASE_URL}/stories/designer-stories`,
  DELETE_STORY_API: `${BASE_URL}/stories/`,
};

export const bannerEndpoints = {
  CREATE_VENDOR_BANNER_API: `${BASE_URL}/banners/vendor`,
  GET_VENDOR_BANNERS_API: `${BASE_URL}/banners/vendor`,
  DELETE_VENDOR_BANNER_API: `${BASE_URL}/banners/vendor/`,
};

export const studioEndpoints ={
  DESIGN_CAT_API: `${BASE_URL}/studio/categories`,
  CREATE_DESIGN_API: `${BASE_URL}/studio/`,
  GET_DESIGNER_DESIGN_API: `${BASE_URL}/studio/featured/designer/designs`,
  GET_DETAILED_DESIGN_API: `${BASE_URL}/studio/featured`,
  DELETE_DESIGN_API: `${BASE_URL}/studio/featured/`,

}
export const chatEndpoints = {
  CHATLIST_API: `${BASE_URL}/messages/chat-list`,
  CONVERSATION_API: `${BASE_URL}/messages`,
  CHAT_IMAGES_API: `${BASE_URL}/messages/chat-images`,
}

export const projectEndpoints = {
  GET_ALL_PROJECTS_API: `${BASE_URL}/projects/all`,
  GET_ASSIGNED_PROJECTS_API: `${BASE_URL}/projects/assigned-projects`,
  GET_INVITED_PROJECTS_API: `${BASE_URL}/projects/invited`,
  GET_PROJECT_DETAILS_API: `${BASE_URL}/projects/details/`,
  GET_INVITATION_DETAILS_API: (projectId) =>
    `${BASE_URL}/projects/invitations/${projectId}/details`,
  RESPOND_TO_INVITATION_API: (projectId) =>
    `${BASE_URL}/projects/invitations/${projectId}/respond`,
  GET_PROJECT_MILESTONES_API: (projectId) =>
    `${BASE_URL}/projects/${projectId}/milestones`,
  SAVE_PROJECT_MILESTONE_PLAN_API: (projectId) =>
    `${BASE_URL}/projects/${projectId}/milestones/plan`,
  SUBMIT_PROJECT_MILESTONE_PLAN_API: (projectId) =>
    `${BASE_URL}/projects/${projectId}/milestones/plan/submit`,
  SUBMIT_PROJECT_MILESTONE_API: (projectId, milestoneId) =>
    `${BASE_URL}/projects/${projectId}/milestones/${milestoneId}/submit`,
  SUBMIT_PROPOSAL_API: `${BASE_URL}/projects/proposal/send`,
  GET_PROJECT_PROPOSALS_API: `${BASE_URL}/projects/proposals`,

}
/** No auth required — used by vendor profile to pick type & category */
export const publicEndpoints = {
  BUSINESS_TYPES_PUBLIC: `${BASE_URL}/admin/business-types/public`,
};

export const designerEndpoints = {
  GET_PROFILE_API: `${BASE_URL}/designers/profile`,
  UPDATE_IMAGE_API: `${BASE_URL}/designers/image`,
  UPDATE_PROFILE_INFO_API: `${BASE_URL}/designers/profile-info`,
  GET_AVAILABILITY_API: `${BASE_URL}/designers/availability-slots`,
  SET_AVAILABILITY_API: `${BASE_URL}/designers/availability/add`,
  UPDATE_AVAILABILITY_API: `${BASE_URL}/designers/availability/edit`,
  GET_CONSULTATION_PRICE_API: `${BASE_URL}/designers/consultation-price`,
  SET_CONSULTATION_PRICE_API: `${BASE_URL}/designers/consultation-price`,
  GET_SUBSCRIPTION_DATA_API: `${BASE_URL}/designers/subscription-data`,
  UPDATE_PROFILE_CARDS_API: `${BASE_URL}/designers/profile-cards`,
  CONSULTATION_SETTINGS_API: `${BASE_URL}/designers/consultation-settings`,
  CONSULTATION_SERVICES_API: `${BASE_URL}/designers/consultation-services`,
  CONSULTATION_SERVICE_BY_ID_API: (id) =>
    `${BASE_URL}/designers/consultation-services/${id}`,
  CONSULTATION_SERVICES_PUBLIC_API: (designerId) =>
    `${BASE_URL}/designers/consultation-services/public/${designerId}`,
  CONSULTATION_CALENDAR_API: (designerId, year, month) =>
    `${BASE_URL}/designers/consultation-calendar/${designerId}?year=${year}&month=${month}`,
  ECOMMERCE_SHIPPING_FEES_API: `${BASE_URL}/designers/ecommerce/shipping-fees`,
  ECOMMERCE_STORE_TAXONOMY_API: `${BASE_URL}/designers/ecommerce/store-taxonomy`,
  ECOMMERCE_STORE_CATEGORY_CREATE_API: `${BASE_URL}/designers/ecommerce/store-categories`,
  ECOMMERCE_STORE_SUBCATEGORY_CREATE_API: `${BASE_URL}/designers/ecommerce/store-subcategories`,
  ECOMMERCE_STORE_TAXONOMY_SELECTION_API: `${BASE_URL}/designers/ecommerce/store-taxonomy-selection`,
  PAYOUTS_API: `${BASE_URL}/designers/payouts`,
  PAYOUT_TRANSACTIONS_API: `${BASE_URL}/designers/payout-transactions`,
}

export const consultationEndpoints = {
  GET_CONSULTATIONS_API: `${BASE_URL}/consultation/`,
}
export const subscriptionEndpoints = {
GET_PAYMENT_METHODS_API: `${BASE_URL}/products/order/payment-methods`,
  CREATE_SUBSCRIPTION_API: `${BASE_URL}/subscription/`,
  GET_CALLBACK_API: `${BASE_URL}/subscription/callback`,
  GET_ERROR_API: `${BASE_URL}/subscription/error`,
  GET_DESIGNER_SUBSCRIPTION_API: `${BASE_URL}/subscription/designer-subscription`,
}
export const businessTypeEndpoints = {
  GET_PUBLIC_BUSINESS_TYPES_API: `${BASE_URL}/admin/business-types/public`,
};