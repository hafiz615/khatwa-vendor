import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import PaymentMethods from "./PaymentMethods";
import { createSubscription } from "../services/subscription.service";
import toast from "react-hot-toast";
import { useState } from "react";

export default function PaymentMethodsPage() {
  const navigate = useNavigate();
  const token = useSelector((s) => s.auth.token);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleBack = () => {
    navigate(-1); // back to SubscriptionPage
  };

  const handleContinue = async (data) => {
    try {
      setLoading(true);
      const response = await createSubscription(token, data); // call backend
      console.log("Subscription response:", response);
      if (response?.success) {
        window.location.href = response?.data?.paymentData?.PaymentURL; // redirect to payment gateway
      } else {
        setError(response?.message || "Failed to initiate payment.");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while initiating payment.");
    setError(error?.message || "An error occurred while initiating payment.");
    }finally {
      setTimeout(() => setLoading(false), 3000);
    }
  };

  return <PaymentMethods onBack={handleBack} onContinue={handleContinue} error={error} setError={setError} loading={loading} setLoading={setLoading} />;
}
