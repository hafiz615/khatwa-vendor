import { Search, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Button from "../components/common/Button";
import { useSelector, useDispatch } from "react-redux";
import { setMyOrders } from "../slices/product";
import { useEffect, useState } from "react";
import { fetchMyOrders } from "../services/product.service";
import FormErrorAlert from "../components/common/FormErrorAlert";

function MyOrders() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { myOrders } = useSelector((s) => s.product);
  const token = useSelector((s) => s.auth.token);

  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch orders
  const loadOrders = async () => {
    if (!token) return;

    setLoading(true);
    setError("");
    try {
      const result = await fetchMyOrders(token, page, 10);
      console.log("Fetched Orders:", result);

      if (result.success) {
        dispatch(setMyOrders(result.data || []));
        setPagination(result.pagination || { currentPage: 1, totalPages: 1 });
      } else {
        setError("Failed to load orders");
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError("Something went wrong while fetching your orders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [token, page]);

  const onTrackOrder = (order) => {
    navigate(`/dashboard/orders/track/${order._id}`);
  };

  return (
    <div className="max-w-3xl p-6">
      {/* Header */}
      <h2 className="text-2xl font-semibold mb-4">Received Orders</h2>

      {/* Search bar (optional, not functional yet) */}
      {/* <div className="relative mb-6">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          size={18}
        />
        <input
          type="text"
          placeholder="Search orders"
          className="w-full pl-10 pr-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div> */}

      {/* Loading state */}
      {loading && (
        <div className="flex justify-center items-center min-h-[50vh]">
          <div className="loader" />
        </div>
      )}

      {/* Error state */}
      {!loading && error && <FormErrorAlert message={error} onClose={()=>setError(null)}/>}

      {/* Empty state */}
      {!loading && !error && (!myOrders || myOrders.length === 0) && (
        <div className="text-center text-gray-500 py-16">
          <p>No purchase history found.</p>
        </div>
      )}

      {/* Orders list */}
      {!loading && !error && myOrders?.length > 0 && (
        <div className="space-y-4">
          {myOrders.map((order) => (
            <div
              key={order._id}
              className="border rounded-2xl p-4 bg-white shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Order header */}
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold text-lg">Order #{order.order}</h3>
                <span
                  className={`text-sm font-medium px-3 py-1 rounded-full capitalize ${
                    order.status === "delivered"
                      ? "bg-green-100 text-green-700"
                      : order.status === "cancelled"
                      ? "bg-red-100 text-red-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {order.status}
                </span>
              </div>

              {/* Order details */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-gray-600 mb-3">
                <p>
                  <span className="font-medium text-gray-800">Date:</span>{" "}
                  {new Date(order.createdAt).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
                <p>
                  <span className="font-medium text-gray-800">Items:</span>{" "}
                  {order.items}
                </p>
                <p>
                  <span className="font-medium text-gray-800">Price:</span> KWD{" "}
                  {order.total?.toFixed(2)}
                </p>
                <p className="hidden md:block">
                  <span className="font-medium text-gray-800">Status:</span>{" "}
                  {order.status}
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap gap-3 mt-2">
                {order.status?.toLowerCase() !== "delivered" && (
                  <Button
                    className="bg-blue-600 text-white hover:bg-blue-700 flex-1 sm:flex-none"
                    onClick={() => onTrackOrder(order)}
                  >
                    Track Order
                  </Button>
                )}
              </div>
            </div>
          ))}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center gap-4 mt-6">
              <Button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="bg-gray-200 text-gray-700 hover:bg-gray-300"
              >
                Previous
              </Button>
              <span className="text-gray-600">
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>
              <Button
                disabled={page >= pagination.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="bg-gray-200 text-gray-700 hover:bg-gray-300"
              >
                Next
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default MyOrders;