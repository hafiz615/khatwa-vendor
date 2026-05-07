import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { PERMISSION_CHECKERS } from "../../utils/subscriptionAccess";

/**
 * Wraps a dashboard route and redirects to /dashboard/profile when the vendor's
 * active subscription plan does not include the required permission.
 *
 * Props:
 *   permission  – key from PERMISSION_CHECKERS (e.g. "postCreationAccess")
 *   children    – the page/component to render when access is granted
 */
export default function FeatureGuard({ permission, children }) {
  const subscriptionState = useSelector((state) => state.subscription);
  const isLoading = subscriptionState?.loading;
  const sub = subscriptionState?.subscription;

  // Block only initial fetch (no doc yet). If we already have a subscription object, evaluate permissions.
  if (isLoading && sub == null) return null;

  const checker = PERMISSION_CHECKERS[permission];
  const allowed = checker ? checker(subscriptionState) : false;

  if (!allowed) {
    return <Navigate to="/dashboard/my-subscription" replace />;
  }

  return children;
}
