import { Check, Circle } from "lucide-react";

export default function SubscriptionCard({
  plan,
  price,
  billingMode,
  onToggle,
  onSubscribe,
  buttonStatus = "subscribe", // subscribe | activated | upgrade
}) {
  const getButtonText = () => {
  if (buttonStatus === "activated") return "ACTIVATED PLAN";
  if (buttonStatus === "upgrade") return "UPGRADE";
  if (buttonStatus === "not_allowed") return "UNAVAILABLE";
  return "SUBSCRIBE";
};

const isDisabled =
  buttonStatus === "activated" || buttonStatus === "not_allowed";


  return (
    <div
      className={`rounded-2xl text-white p-6 shadow-xl bg-gradient-to-b ${plan.color}`}
    >
      {/* Title */}
      <h2 className="text-xl font-bold mb-2">{plan.name}</h2>

      {/* Price */}
      <div className="text-5xl font-bold">KD {price}</div>
      <p className="opacity-80 mb-4">
        {billingMode === "monthly" ? "Monthly" : "Annual"}
      </p>

      {/* Billing Toggle */}
      <div className="w-fit flex items-center bg-white/20 rounded-xl py-1 px-2 mb-4 justify-between text-sm">
        <button
          onClick={() => onToggle("monthly")}
          className={`px-4 py-1 rounded-lg font-semibold ${
            billingMode === "monthly" ? "bg-white text-black" : "text-white"
          }`}
        >
          Monthly
        </button>

        <button
          onClick={() => onToggle("annual")}
          className={`px-4 py-1 rounded-lg font-semibold ${
            billingMode === "annual" ? "bg-white text-black" : "text-white"
          }`}
        >
          Annual
        </button>
      </div>

      {/* Features */}
      <ul className="space-y-3 text-sm">
        {plan.features.map((f, i) => (
          <li key={i} className="flex items-center gap-2 opacity-90">
            {i < plan.ticks ? (
              <Check size={16} className="text-white" />
            ) : (
              <Circle size={12} className="text-white" />
            )}
            {f}
          </li>
        ))}
      </ul>

      {/* Subscribe Button */}
      <button
        disabled={isDisabled}
        className={`w-full py-3 rounded-xl mt-6 font-semibold ${
          isDisabled
            ? "bg-white/40 text-black/40 cursor-not-allowed"
            : "bg-white text-black"
        }`}
        onClick={!isDisabled ? onSubscribe : undefined}
      >
        {getButtonText()}
      </button>
    </div>
  );
}
