import { useState } from "react";
import { ArrowLeft, CreditCard, Wallet } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { useLocation } from "react-router-dom";
import { createSubscription } from "../services/subscription.service";
import FormErrorAlert from "../components/common/FormErrorAlert";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getPaymentMethods } from "../services/subscription.service";
import {toast} from "react-hot-toast";
import { setPaymentMethods } from "../slices/subscription";
export default function PaymentMethods({ onBack, onContinue, error, setError, loading, setLoading }) {
  const paymentMethods = useSelector((s) => s.subscription.paymentMethods);
  const [selected, setSelected] = useState(
    paymentMethods?.length > 0 ? paymentMethods[0].PaymentMethodCode : ""
  );
  const token = useSelector((s) => s.auth.token);
  const dispatch = useDispatch();

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const price = queryParams.get("price");
  const plan = queryParams.get("plan");
  const duration = queryParams.get("duration");

  const handleContinue = () => {
    const selectedMethod = paymentMethods.find(
      (m) => m.PaymentMethodCode === selected
    );

    const data = {
      name: plan,
      price: parseFloat(price),
      duration,
      PaymentMethodId: selectedMethod?.PaymentMethodId,
      platform:"web",
    };

    // Use the prop to trigger parent handler
    onContinue(data);
  };

  useEffect(() => {
    const fetchMethods = async () => {
       try {
        setLoading(true);
        const response = await getPaymentMethods(token, parseFloat(price));
        console.log("Payment Methods Response:", response);
        if (response) {
            // Proceed with subscription using the payment methods
            dispatch(setPaymentMethods(response));
            // navigate(`/payment-methods?price=${price}&plan=${plan.name}&duration=${duration}`);
            // toast.success("Payment methods fetched successfully.");

            // Further subscription logic can be added here
        }else {
            toast.error("Failed to fetch payment methods.");
        }
    } catch (error) {
        console.error("Error during subscription:", error);
        toast.error("An error occurred while processing your subscription.");
    } finally {
        setLoading(false);
    }
    }
    if (token) fetchMethods()
  },[])

  return (
    <div className="max-w-xl mx-auto">
      <div className="min-h-screen bg-white px-5 py-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={onBack}>
            <ArrowLeft size={22} />
          </button>
          <h1 className="text-xl font-bold">PAYMENT METHOD</h1>
        </div>

        {/* Plan Details */}
        <div className="border p-4 rounded-xl bg-gray-50 mb-6">
          <h2 className="text-lg font-semibold mb-1">{plan}</h2>
          <p className="text-gray-700">
            Price: <span className="font-semibold">{price} KWD</span>
          </p>
          <p className="text-gray-700">
            Duration: <span className="font-semibold">{duration}</span>
          </p>
        </div>

        {/* Payment Options */}
        <div className="space-y-4">
          {paymentMethods?.map((method) => (
            <label
              key={method.PaymentMethodId}
              className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer transition
                ${
                  selected === method.PaymentMethodCode
                    ? "border-blue-600 bg-blue-50"
                    : "border-gray-300"
                }`}
              onClick={() => setSelected(method.PaymentMethodCode)}
            >
              <div className="flex items-center gap-3">
                <img src={method.ImageUrl} className="w-6 h-6" />
                <span className="text-base font-semibold">
                  {method.PaymentMethodEn}
                </span>
              </div>

              {/* Radio Button */}
              <div
                className={`w-5 h-5 rounded-full border flex items-center justify-center
                  ${
                    selected === method.PaymentMethodCode
                      ? "bg-blue-600 border-blue-600"
                      : "border-gray-400"
                  }`}
              >
                {selected === method.PaymentMethodCode && (
                  <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
                )}
              </div>
            </label>
          ))}
        </div>
        {error && <FormErrorAlert message={error} onClose={()=> setError(null)} className="mt-6" />}
        {/* Continue Button */}
        <button
          disabled={loading}
          className="w-full bg-blue-600 text-white py-4 rounded-xl mt-10 font-semibold text-lg"
          onClick={handleContinue}
        >
         { loading ? "LOADING..." : "CONTINUE TO PAY"}
        </button>
      </div>
    </div>
  );
}
