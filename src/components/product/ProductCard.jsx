// ProductCard.jsx
import { Eye, Trash2, Tag, Pencil } from "lucide-react";
import toast from "react-hot-toast";
import Modal from "../common/Modal";
import { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { deleteProduct } from "../../services/product.service";

function ProductCard({
  product,
  onView,
  onEdit,
  onDelete,
  onDeleteStart,
  isAnyDeleting,
}) {
  const [confirmationModal, setConfirmationModal] = useState(null);
  const token = useSelector((state) => state.auth.token);
  const navigate = useNavigate();

  const handleDeleteContent = async () => {
    setConfirmationModal(null);
    onDeleteStart?.(product._id); // Notify parent that delete started
    const toastId = toast.loading("Deleting...");
    
    try {
      const result = await deleteProduct(product._id, token);
      if (result) {
        toast.success("Deleted successfully", { id: toastId });
        onDelete?.(product._id); // Remove from UI
      } else {
        toast.error("Could not delete. try again", { id: toastId });
        onDeleteStart?.(null); // Reset deleting state on failure
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Could not delete, try again", { id: toastId });
      onDeleteStart?.(null); // Reset deleting state on error
    }
  };

  return (
    <div 
    className="bg-white border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 ">
      {/* Image */}
      <div className="relative w-full aspect-square overflow-hidden group">
        <img
        onClick={() => navigate(`/dashboard/boutique/${product._id}`)}
          src={product.thumbnail}
          alt={product.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 cursor-pointer"
        />
        {/* Overlay Buttons */}
        <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onEdit?.();
            }}
            disabled={isAnyDeleting}
            className={`p-2 bg-white rounded-full shadow ${
              isAnyDeleting
                ? "cursor-not-allowed opacity-50"
                : "hover:bg-gray-100"
            }`}
            title="Edit product"
          >
            <Pencil className="w-4 h-4 text-blue-600" />
          </button>
          <button
            type="button"
            onClick={onView}
            disabled={isAnyDeleting}
            className={`p-2 bg-white rounded-full shadow ${
              isAnyDeleting
                ? "cursor-not-allowed opacity-50"
                : "hover:bg-gray-100"
            }`}
          >
            <Eye className="w-4 h-4 text-gray-700" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              setConfirmationModal({
                text1: `Delete this product?`,
                text2: `Are you sure you want to delete this product.`,
                btn1Text: "Delete",
                btn2Text: "Cancel",
                btn1Handler: () => handleDeleteContent(),
                btn2Handler: () => setConfirmationModal(null),
              });
            }}
            disabled={isAnyDeleting}
            className={`p-2 bg-white rounded-full shadow ${
              isAnyDeleting
                ? "cursor-not-allowed opacity-50"
                : "hover:bg-gray-100"
            }`}
          >
            <Trash2 className="w-4 h-4 text-red-500" />
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="p-4 space-y-1">
        <h3 className="font-medium text-gray-900 line-clamp-1 capitalize">
          {product.title}
        </h3>
        <p className="text-gray-500 text-sm line-clamp-2 capitalize">
          {product.description}
        </p>

        <div className="flex justify-between items-center mt-3">
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <Tag className="w-4 h-4 capitalize" /> {product.category.name}
          </div>
          <span className="font-semibold text-gray-800">
            KWD {product.price}
          </span>
        </div>

        <div className="flex justify-between items-center text-xs text-gray-400 mt-2">
          <span>{product.amountSold} sold</span>
        </div>
      </div>
      {confirmationModal && <Modal data={confirmationModal} />}
    </div>
  );
}

export default ProductCard;