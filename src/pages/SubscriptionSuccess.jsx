import { CheckCircle } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

export default function SubscriptionSuccess() {
  const location = useLocation();
  const navigate = useNavigate();

  // Optional: Receive payment details from redirect params or state
  const { planName, amount, duration } = location.state || {};

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-50 p-4">
      <div className="bg-white shadow-xl rounded-2xl p-8 max-w-md text-center">
        <CheckCircle className="w-20 h-20 mx-auto text-green-600" />

        <h1 className="text-2xl font-bold mt-4 text-green-700">
          Subscription Activated
        </h1>

        <p className="text-gray-600 mt-2">
          Your payment was successfully completed.
        </p>

        {planName && (
          <div className="mt-4 bg-green-100 rounded-xl p-4 text-left">
            <p><strong>Plan:</strong> {planName}</p>
            <p><strong>Amount:</strong> {amount}</p>
            <p><strong>Duration:</strong> {duration}</p>
          </div>
        )}

        <button
          onClick={() => navigate("/")}
          className="mt-6 w-full py-3 rounded-xl bg-green-600 text-white hover:bg-green-700 transition"
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
}
