import { Ruler, Eye, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { useState } from "react";
import { useSelector } from "react-redux";
import Modal from "../common/Modal";
import { deleteDesign } from "../../services/studio.service";

function DesignCard({ item, onDelete, onDeleteStart, onView, isAnyDeleting }) {
  const [confirmationModal, setConfirmationModal] = useState(null);
  const token = useSelector((state) => state.auth.token);

  const handleDelete = async () => {
    setConfirmationModal(null);
    onDeleteStart?.(item._id); // Notify parent that delete started
    const toastId = toast.loading("Deleting...");
    
    try {
      const result = await deleteDesign(item._id, token);
      if (result) {
        toast.success("Deleted successfully", { id: toastId });
        onDelete?.(item._id); // Remove from UI
      } else {
        toast.error("Could not delete. try again", { id: toastId });
        onDeleteStart?.(null); // Reset deleting state on failure
      }
    } catch (error) {
      console.error("Error deleting design:", error);
      toast.error("Could not delete, try again", { id: toastId });
      onDeleteStart?.(null); // Reset deleting state on error
    }
  };

  return (
    <div
      key={item._id}
      className="bg-white shadow-md rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100 relative"
    >
      {/* Image */}
      <div className="relative w-full h-52 overflow-hidden cursor-pointer"
        onClick={onView}>
        <img
          src={item.image}
          alt={item.name}
          className="object-cover w-full h-full hover:scale-105 transition-transform duration-300"
        />
        <span className="absolute top-3 left-3 bg-sky-600 text-white text-xs px-3 py-1 rounded-full">
          {item.digitalProductCategory.name}
        </span>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col justify-between">
        <div>
          <h3 className="font-semibold text-lg text-gray-800 line-clamp-1">
            {item.name}
          </h3>
          <p className="text-sm text-gray-500 mt-1 line-clamp-2">
            {item.description}
          </p>
        </div>

        {/* Details */}
        <div className="flex justify-between items-center mt-4">
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <Ruler className="w-4 h-4" />
            <span>{item.area} sq.ft</span>
          </div>
          <div className="text-sky-700 font-semibold">${item.price}</div>
        </div>

        {/* Action Icons */}
        <div className="flex gap-3 justify-between pt-2">
          <button
            onClick={onView}
            disabled={isAnyDeleting}
            className={`p-2 rounded-full transition ${
              isAnyDeleting
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-sky-100 hover:bg-sky-200 text-sky-700"
            }`}
            title="View Design"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              setConfirmationModal({
                text1: `Delete this design?`,
                text2: `Are you sure you want to delete this design.`,
                btn1Text: "Delete",
                btn2Text: "Cancel",
                btn1Handler: () => handleDelete(),
                btn2Handler: () => setConfirmationModal(null),
              });
            }}
            disabled={isAnyDeleting}
            className={`p-2 rounded-full transition ${
              isAnyDeleting
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-red-100 hover:bg-red-200 text-red-600"
            }`}
            title="Delete Design"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      {confirmationModal && <Modal data={confirmationModal} />}
    </div>
  );
}

export default DesignCard;