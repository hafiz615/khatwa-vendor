import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

export default function SubscriptionGuard({ children }) {
  const user = useSelector((s) => s.profile.user);
  const { subscription, loading } = useSelector((s) => s.subscription);

  console.log("SubscriptionGuard - Subscription:", subscription);
  console.log("SubscriptionGuard - Loading:", loading);

  // Must be logged in
  if (!user) {
    console.log("No user found, redirecting to login");
    return <Navigate to="/" replace />;
  }

  // Show loading state while fetching subscription
  if (loading) return null

  // Check subscription status
  const hasActiveSubscription = subscription && subscription.status === "active";
  
  if (!hasActiveSubscription) {
    // console.log("No active subscription, redirecting to /subscription");
    // console.log("Subscription status:", subscription?.status);
    return <Navigate to="/subscription" replace />;
  }

  console.log("Active subscription found, allowing access");
  // Subscription active → allow navigation
  return children;
}