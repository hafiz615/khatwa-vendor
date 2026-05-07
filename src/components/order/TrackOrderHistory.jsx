import { CheckCircle2, Circle } from "lucide-react";

function TrackOrderHistory({ order }) {
  if (!order) {
    return (
      <div className="text-center text-gray-500 py-10">
        Loading tracking info...
      </div>
    );
  }

  const { orderId, total, items = [], tracking = [] } = order;

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-2xl shadow-sm border">
      {/* Order Header */}
      <h2 className="text-xl font-semibold mb-3">Order Details</h2>

      <div className="flex justify-between items-center mb-4 text-gray-700">
        <p className="font-medium">Order #{orderId}</p>
        <p className="font-semibold text-gray-900">KWD {total}</p>
      </div>

      {/* Items List */}
      {items.length > 0 ? (
        <div className="border rounded-2xl mb-6">
          {items.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between border-b last:border-0 px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <img
                  src={item.thumbnail}
                  alt={item.name}
                  className="w-16 h-16 rounded-lg object-cover border"
                />
                <div>
                  <h3 className="font-medium text-gray-900">{item.name}</h3>
                  <p className="text-sm text-gray-500">
                    Quantity: {item.quantity}
                  </p>
                </div>
              </div>
              <p className="text-gray-700 font-medium">
                KWD {(item.price * item.quantity).toFixed(2)}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-center mb-6">
          No items found for this order.
        </p>
      )}

      {/* Tracking */}
      {tracking.length > 0 ? (
        <div>
          <h3 className="text-lg font-semibold mb-3">Tracking Progress</h3>
          <div className="relative pl-6 border-l-2 border-gray-200">
            {tracking.map((step, i) => {
              const isCompleted = step.completed;
              const isLast = i === tracking.length - 1;

              return (
                <div key={i} className="mb-6 relative">
                  <div className="absolute -left-[13px] top-1">
                    {isCompleted ? (
                      <CheckCircle2
                        size={20}
                        className="text-white bg-blue-600 rounded-full"
                      />
                    ) : (
                      <Circle
                        size={20}
                        className="text-gray-400 bg-white rounded-full"
                      />
                    )}
                  </div>

                  <div className="ml-2">
                    <p
                      className={`font-medium ${
                        isCompleted ? "text-gray-900" : "text-gray-500"
                      }`}
                    >
                      {step.status}
                    </p>

                    {step.date && (
                      <p className="text-sm text-gray-500">
                        {new Date(step.date).toLocaleString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    )}

                    {step.expected && (
                      <p className="text-sm text-gray-500">
                        Expected:{" "}
                        {new Date(step.expected).toLocaleString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    )}

                    {step.note && (
                      <p className="text-sm text-gray-600 mt-1">{step.note}</p>
                    )}
                  </div>

                  {!isLast && (
                    <div
                      className={`absolute left-[-2px] top-6 h-10 w-0.5 ${
                        isCompleted ? "bg-blue-600" : "bg-gray-200"
                      }`}
                    ></div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <p className="text-gray-500 text-center">
          No tracking updates available yet.
        </p>
      )}
    </div>
  );
}

export default TrackOrderHistory;