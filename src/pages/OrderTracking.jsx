import TrackOrderHistory from "../components/order/TrackOrderHistory";
import EditTrackingModal from "../components/order/EditTrackingModal";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchOrderTracking } from "../services/product.service";
import { useParams } from "react-router-dom";
import { setOrderTrackingData } from "../slices/product";
import { updateOrderTrackingStatus } from "../services/product.service";

function OrderTracking() {
  const { orderId } = useParams();
  const dispatch = useDispatch();
  const { orderTrackingData } = useSelector((s) => s.product);
  const token = useSelector((s) => s.auth.token);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const loadOrderTracking = async () => {
    try {
      setLoading(true);
      setError("");
      const result = await fetchOrderTracking(token, orderId);
      if (result.success) {
        dispatch(setOrderTrackingData(result.order));
      } else {
        setError("Failed to load order tracking.");
      }
    } catch (err) {
      console.error("Error fetching order tracking:", err);
      setError("Something went wrong while fetching order tracking.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) loadOrderTracking();
  }, [token, orderId]);

  const handleUpdateTracking = async (status, expectedDates, note) => {
    console.log("Updating tracking:", { status, expectedDates, note });
    // Call backend API here
    // setLoading(true);
    try {
      const result = await updateOrderTrackingStatus(
        token,
        orderId,
        status,
        expectedDates,
        note
      );
      console.log("Update result:", result);
      if (result?.success) {
        // ✅ Only reload after success
        await loadOrderTracking();
        return { success: true };
      } else {
        return { success: false, error: result?.data?.message || "Failed to update tracking." };
      }
    } catch (error) {
      console.error("Error updating order tracking:", error);
      return { success: false, error: "Something went wrong while updating." };
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      {/*Loading state */}
      {loading && (
        <div className="flex justify-center items-center min-h-[70vh]">
          <div className="loader" />
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <div className="text-center text-red-500 bg-red-50 border border-red-200 rounded-xl p-4">
          <p>{error}</p>
          <button
            onClick={loadOrderTracking}
            className="mt-3 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      )}

      {/* Empty or valid data */}
      {!loading && !error && (
        <>
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Order Tracking</h2>
            {/* Always render modal — it handles its own visibility */}
            <EditTrackingModal
              order={orderTrackingData}
              onUpdate={handleUpdateTracking}
            />
          </div>

          {/* Conditionally render only the tracking view */}
          {orderTrackingData ? (
            <TrackOrderHistory order={orderTrackingData} />
          ) : (
            <div className="text-center text-gray-500 py-16">
              <p>No tracking data available for this order.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default OrderTracking;