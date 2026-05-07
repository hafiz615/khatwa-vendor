import { XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function SubscriptionFailed() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-red-50 p-4">
      <div className="bg-white shadow-xl rounded-2xl p-8 max-w-md text-center">
        <XCircle className="w-20 h-20 mx-auto text-red-600" />

        <h1 className="text-2xl font-bold mt-4 text-red-700">
          Payment Failed
        </h1>

        <p className="text-gray-600 mt-2">
          Your payment could not be processed.  
          Please try again or use a different payment method.
        </p>

        <button
          onClick={() => navigate("/subscription")}
          className="mt-6 w-full py-3 rounded-xl bg-red-600 text-white hover:bg-red-700 transition"
        >
          Try Again
        </button>

        <button
          onClick={() => navigate("/")}
          className="mt-3 w-full py-3 rounded-xl border border-red-400 text-red-600 hover:bg-red-100 transition"
        >
          Go Back Home
        </button>
      </div>
    </div>
  );
}
