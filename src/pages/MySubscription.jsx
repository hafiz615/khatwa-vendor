import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import SubscriptionCard from "../components/subscription/SubscriptionCard";
import { plans } from "../constans";
import { getPaymentMethods } from "../services/subscription.service";
import { setPaymentMethods } from "../slices/subscription";
import toast from "react-hot-toast";

function MySubscription() {
  const { subscription } = useSelector((s) => s.subscription);
  const token = useSelector((s) => s.auth.token);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  console.log("Current Subscription:", subscription);

  const [billingMode, setBillingMode] = useState(plans.map(() => "monthly"));

  const handleToggle = (index, mode) => {
    setBillingMode((prev) => {
      const copy = [...prev];
      copy[index] = mode;
      return copy;
    });
  };

  const handleUpgradeSubscription = async (plan, price, duration) => {
    // console.log("Upgrading to plan:", plan.name, "with price:", price, "and duration:", duration);
    try {
      const response = await getPaymentMethods(token, price);
      console.log("Payment methods response:", response);
      if (response) {
        dispatch(setPaymentMethods(response));
        navigate(
          `/payment-methods?price=${price}&plan=${plan.name}&duration=${duration}`
        );
      } else {
        toast.error("Failed to fetch payment methods.");
      }
    } catch (error) {
      console.error("Error during subscription upgrade:", error);
      toast.error("Error processing subscription.");
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#f5f5f5] py-12 px-4 grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-6">
      {plans.map((plan, index) => {
        const price =
          billingMode[index] === "monthly"
            ? plan.monthly
            : plan.annual.toFixed(2);

        let buttonStatus = "subscribe";

        if (subscription?.status === "active") {
          const activePlanName = subscription.planId?.name;
          const activePlan = plans.find((p) => p.name === activePlanName);

          if (activePlan) {
            const activeTier = activePlan.ticks;
            const currentTier = plan.ticks;
            // Admin / DB convention: 5 = monthly, 10 = annual (see admin payment facet)
            const activeDuration = subscription.planId.durationDays;
            const selectedDuration = billingMode[index] === "monthly" ? 5 : 10;

            if (activePlanName === plan.name) {
              // SAME PLAN → Check duration logic
              const hasDuration =
                typeof activeDuration === "number" && !Number.isNaN(activeDuration);
              if (!hasDuration) {
                // API used to omit durationDays; avoid falsely showing UNAVAILABLE
                buttonStatus =
                  billingMode[index] === "annual" ? "upgrade" : "activated";
              } else if (selectedDuration > activeDuration) {
                buttonStatus = "upgrade"; // monthly → annual
              } else if (selectedDuration === activeDuration) {
                buttonStatus = "activated"; // same exact subscription
              } else {
                buttonStatus = "not_allowed"; // annual → monthly (not allowed)
              }
            } else if (currentTier > activeTier) {
              buttonStatus = "upgrade"; // higher tier
            } else {
              buttonStatus = "not_allowed"; // lower tier
            }
          }
        }

        return (
          <SubscriptionCard
            key={index}
            plan={plan}
            price={price}
            billingMode={billingMode[index]}
            onToggle={(mode) => handleToggle(index, mode)}
            onSubscribe={() =>
              handleUpgradeSubscription(plan, price, billingMode[index])
            }
            buttonStatus={buttonStatus}
          />
        );
      })}
    </div>
  );
}

export default MySubscription;
