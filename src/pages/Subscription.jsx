import { useSelector, useDispatch } from "react-redux";
import { useState } from "react";
import { getPaymentMethods } from "../services/subscription.service";
import toast from "react-hot-toast";
import { setPaymentMethods, setSubscription } from "../slices/subscription";
import { useNavigate } from "react-router-dom";
import SubscriptionCard from "../components/subscription/SubscriptionCard";
import { plans } from "../constans";
import { setUser } from "../slices/profile";
import { setToken } from "../slices/auth";
import { setSubScriptionModalOpen } from "../slices/subscription";
import { useEffect } from "react";
export default function SubscriptionPage() {
  const token = useSelector((s) => s.auth.token);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { subscription, subScriptionModalOpen } = useSelector((s) => s.subscription);
  console.log("SubscriptionPage - subscription:", subscription, "subScriptionModalOpen:", subScriptionModalOpen);
  const [billingMode, setBillingMode] = useState(plans.map(() => "monthly"));

  const handleToggle = (index, mode) => {
    setBillingMode((prev) => {
      const updated = [...prev];
      updated[index] = mode;
      return updated;
    });
  };

  const handleSubscribe = async (plan, price, duration) => {
    try {
      const response = await getPaymentMethods(token, price);

      if (response) {
        dispatch(setPaymentMethods(response));
        navigate(
          `/payment-methods?price=${price}&plan=${plan.name}&duration=${duration}`
        );
      } else {
        toast.error("Failed to fetch payment methods.");
      }
    } catch (error) {
      toast.error("Error processing subscription.");
    }
  };

  const handleLogout = () => {
    dispatch(setToken(null));
    dispatch(setUser(null));
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("phone");
    navigate("/");
  };

  //  if subscription data is present, redirect to my-subscription page
  useEffect(() => {
    if(subscription){
      navigate("/dashboard/my-subscription");
    }
  }, [subscription]);
  return (
    <div className="min-h-screen w-full bg-[#f5f5f5] py-12 px-4">
      {/* Top Bar */}
      { subScriptionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-2xl p-6 w-96 max-w-sm shadow-lg text-center">
        <h2 className="text-xl font-semibold mb-4">Subscription Expired</h2>
        <p className="mb-6 text-gray-600">
          Your subscription has expired. Please subscribe to continue using dashboard features.
        </p>
        <button
          onClick={() => dispatch(setSubScriptionModalOpen(false))}
          className="bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700 transition"
        >
          Subscribe Now
        </button>
      </div>
    </div>
      )}
      {
        !subscription && (
          <>
          <div className="w-full mb-10">
        <div
          className="
      w-full 
      bg-white 
      shadow-lg 
      rounded-2xl 
      p-6 
      flex 
      flex-col 
      md:flex-row 
      items-center 
      md:justify-between 
      gap-4 
      border 
      border-gray-200
      backdrop-blur-md
    "
        >
          <h1 className="text-xl md:text-2xl font-semibold text-gray-800 text-center md:text-left">
            To use the features of the dashboard, you need to subscribe.
          </h1>

          <button
            onClick={handleLogout}
            className="
        px-5 
        py-2.5 
        rounded-xl 
        bg-gradient-to-r 
        from-red-600 
        to-red-500 
        text-white 
        font-semibold 
        shadow-md 
        hover:shadow-lg 
        hover:scale-105 
        transition-all
        flex 
        items-center 
        gap-2
      "
          >
            <span>Logout</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6A2.25 2.25 0 005.25 5.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan, index) => {
          const price =
            billingMode[index] === "monthly"
              ? plan.monthly
              : plan.annual.toFixed(2);

          return (
            <SubscriptionCard
              key={index}
              plan={plan}
              price={price}
              billingMode={billingMode[index]}
              onToggle={(mode) => handleToggle(index, mode)}
              onSubscribe={() =>
                handleSubscribe(plan, price, billingMode[index])
              }
              buttonStatus="subscribe" // always subscribe
            />
          );
        })}
      </div>
          </>
        )}
      
    </div>
  );
}
