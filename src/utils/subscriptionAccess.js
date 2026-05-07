/**
 * All subscription permission checks for the vendor dashboard.
 *
 * The active subscription object stored in Redux (state.subscription.subscription)
 * has shape:
 *   { planId: { permissions: { bannerAccess, postCreationAccess, studioAccess,
 *               ecommerceAccess, chatAccess, consultationAccess, ... } }, status, ... }
 *
 * Rule: inside /dashboard the SubscriptionGuard already guarantees an active subscription
 * exists. Within that context a missing permission flag (undefined) is treated as false.
 * Before the subscription loads the check also returns false to avoid showing items.
 */

function getPermissions(subscriptionState) {
  const sub = subscriptionState?.subscription;
  if (!sub) return null;

  // API sends this explicitly (see getDesignerSubscriptionData planPermissions)
  const flat = sub.planPermissions;
  if (flat && typeof flat === "object" && !Array.isArray(flat)) {
    return flat;
  }

  const plan = sub.planId;
  if (plan == null || typeof plan === "string") return null;
  if (typeof plan !== "object") return null;
  const raw = plan.permissions;
  if (raw == null) return null;
  if (typeof raw !== "object") return null;
  return raw;
}

function isPermissionOn(v) {
  if (v === true || v === "true" || v === "yes" || v === "Yes") return true;
  if (v === 1 || v === "1") return true;
  return false;
}

function checkFlag(subscriptionState, flag) {
  const perms = getPermissions(subscriptionState);
  if (!perms) return false;
  return isPermissionOn(perms[flag]);
}

export function hasBannerAccess(subscriptionState) {
  return checkFlag(subscriptionState, "bannerAccess");
}

export function hasPostAccess(subscriptionState) {
  return checkFlag(subscriptionState, "postCreationAccess");
}

// Stories share the same gate as posts (no separate storyAccess flag in the model)
export function hasStoryAccess(subscriptionState) {
  return checkFlag(subscriptionState, "postCreationAccess");
}

export function hasBoutiqueAccess(subscriptionState) {
  return checkFlag(subscriptionState, "ecommerceAccess");
}

export function hasStudioAccess(subscriptionState) {
  return checkFlag(subscriptionState, "studioAccess");
}

export function hasChatAccess(subscriptionState) {
  return checkFlag(subscriptionState, "chatAccess");
}

export function hasConsultationAccess(subscriptionState) {
  return checkFlag(subscriptionState, "consultationAccess");
}

/** Boutique orders or consultations — both can generate vendor payouts */
export function hasPayoutAccess(subscriptionState) {
  return (
    hasBoutiqueAccess(subscriptionState) || hasConsultationAccess(subscriptionState)
  );
}

/** Design Kit / project invitations (admin label: "Eligible for Design Kit projects") */
export function hasDesignKitAccess(subscriptionState) {
  return checkFlag(subscriptionState, "designKitAccess");
}

/** Eligible for clients to send Design Kit project invitations via chat (subscription plan flag). */
export function hasEligibleForProjectsViaChat(subscriptionState) {
  return checkFlag(subscriptionState, "eligibleForProjectsViaChat");
}

/**
 * Map from a string key to the matching access helper.
 * Used by SideBar and FeatureGuard to stay in sync.
 */
/** For refetch / debugging: null means no permission map could be resolved */
export function getSubscriptionPermissionObject(subscriptionState) {
  return getPermissions(subscriptionState);
}

export const PERMISSION_CHECKERS = {
  bannerAccess: hasBannerAccess,
  postCreationAccess: hasPostAccess,
  storyAccess: hasStoryAccess,
  ecommerceAccess: hasBoutiqueAccess,
  studioAccess: hasStudioAccess,
  chatAccess: hasChatAccess,
  consultationAccess: hasConsultationAccess,
  payoutAccess: hasPayoutAccess,
  designKitAccess: hasDesignKitAccess,
  eligibleForProjectsViaChat: hasEligibleForProjectsViaChat,
};
