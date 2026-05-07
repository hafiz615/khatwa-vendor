import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { fetchDetailedDesign } from "../services/studio.service";
import { Ruler, FileText } from "lucide-react";
import toast from "react-hot-toast";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Modal from "../components/common/Modal";
import { Trash2 } from "lucide-react";
import { deleteDesign } from "../services/studio.service";

function DesignDetails() {
  const { designId } = useParams();
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.auth);
  const [design, setDesign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirmationModal, setConfirmationModal] = useState(null);
  const [deletingContentId, setDeletingContentId] = useState(null);
  const isAnyDeleting = deletingContentId !== null;

  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await fetchDetailedDesign(designId, token);
        if (res) setDesign(res);
        else toast.error("Failed to fetch design details");
      } catch (error) {
        console.error("Error fetching design details:", error);
        toast.error("Something went wrong");
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [designId, token]);

  const handleDelete = async () => {
    setConfirmationModal(null);
    // onDeleteStart?.(item._id); // Notify parent that delete started
    const toastId = toast.loading("Deleting...");
    
    try {
      const result = await deleteDesign(designId, token);
      if (result) {
        toast.success("Deleted successfully", { id: toastId });
        navigate("/studio");
        // onDelete?.(item._id); // Remove from UI
      } else {
        toast.error("Could not delete. try again", { id: toastId });
        // onDeleteStart?.(null); // Reset deleting state on failure
      }
    } catch (error) {
      console.error("Error deleting design:", error);
      toast.error("Could not delete, try again", { id: toastId });
      // onDeleteStart?.(null); // Reset deleting state on error
    }
  };
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[70vh]">
        <div className="loader" />
      </div>
    );
  }

  if (!design) {
    return (
      <div className="flex justify-center items-center min-h-[70vh] text-gray-500">
        Design not found
      </div>
    );
  }

  return (
    <>
    <div className="min-h-screen bg-gray-50 py-6 px-5 lg:px-20">
      <div className="flex justify-between items-end my-4">
        <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-600 hover:text-black"
            >
              <ArrowLeft className="w-5 h-5" /> Back to Studio
      </button>
      <button
                  onClick={(e) => {
                    e.preventDefault();
                    setConfirmationModal({
                      text1: `Delete this design?`,
                      text2: `All related content will be deleted.`,
                      btn1Text: "Delete",
                      btn2Text: "Cancel",
                      btn1Handler: () => handleDelete(),
                      btn2Handler: () => setConfirmationModal(null),
                    });
                  }}
                  disabled={isAnyDeleting}
                  className={`inline-flex text-sm w-fit items-center gap-2 px-2 py-2 rounded-lg font-medium
          border border-red-400 text-red-600 bg-red-50
          transition-all duration-200
          ${
            isAnyDeleting
              ? "cursor-not-allowed opacity-50"
              : "hover:bg-red-100 hover:border-red-500 hover:text-red-700"
          }`}
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
      </div>
      {/* Image Banner */}
      <div className="relative w-full h-80 rounded-2xl overflow-hidden shadow-md">
        <img
          src={design.image}
          alt={design.name}
          className="object-cover w-full h-full"
        />
        <span className="absolute top-5 left-5 bg-sky-600 text-white text-xs px-3 py-1 rounded-full shadow">
          {design.digitalProductCategory?.name}
        </span>
      </div>

      {/* Content */}
      <div className="bg-white shadow-md rounded-2xl p-8 mt-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center border-b pb-5 mb-6">
          <h1 className="text-2xl font-bold text-gray-800">{design.name}</h1>
          <div className="mt-4 sm:mt-0 text-sky-700 font-semibold text-xl">
            ${design.price}
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-600 leading-relaxed mb-6">
          {design.description || "No description provided."}
        </p>

        {/* Details */}
        <div className="flex flex-wrap gap-6 mb-8">
          <div className="flex items-center gap-2 text-gray-600">
            <Ruler className="w-4 h-4 text-sky-600" />
            <span>{design.area} sq.ft</span>
          </div>

          {design.designerId?.isFeatured && (
            <span className="bg-yellow-100 text-yellow-700 text-xs px-3 py-1 rounded-full">
              Featured Designer
            </span>
          )}
        </div>

        {/* Designer Info */}
        {/* <div className="flex items-center gap-4 mb-8">
          <img
            src={design.designerId?.userId?.profile}
            alt={design.designerId?.userId?.name}
            className="w-14 h-14 rounded-full object-cover border"
          />
          <div>
            <h3 className="text-lg font-semibold text-gray-800">
              {design.designerId?.userId?.name}
            </h3>
            <p className="text-sm text-gray-500">Designer</p>
          </div>
        </div> */}

        {/* PDF Button */}
        {design.file && (
          <a
            href={design.file}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white px-5 py-2 rounded-xl shadow transition-all"
          >
            <FileText className="w-4 h-4" />
            View PDF
          </a>
        )}
      </div>
    </div>
    {confirmationModal && <Modal data={confirmationModal} />}
    </>
  );
}

export default DesignDetails;
