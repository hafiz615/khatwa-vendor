import { useState } from "react";
import { ExternalLink, UserCircle2, Trash2, Upload } from "lucide-react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Modal from "../common/Modal";
import { deleteVendorBanner } from "../../services/banner.service";

const statusClass = {
  pending: "bg-amber-100 text-amber-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};

function BannerCard({ banner, onDelete, onDeleteStart, isAnyDeleting }) {
  const token = useSelector((s) => s.auth.token);
  const navigate = useNavigate();
  const [confirmationModal, setConfirmationModal] = useState(null);

  const handleDelete = async () => {
    setConfirmationModal(null);
    onDeleteStart?.(banner._id);
    const toastId = toast.loading("Deleting banner...");
    const ok = await deleteVendorBanner(banner._id, token);
    if (ok) {
      toast.success("Banner deleted", { id: toastId });
      onDelete?.(banner._id);
    } else {
      toast.error("Could not delete banner", { id: toastId });
      onDeleteStart?.(null);
    }
  };

  return (
    <article className="rounded-xl border bg-white overflow-hidden shadow-sm hover:shadow-md transition-all">
      <div className="relative aspect-[16/7] bg-gray-100">
        <img src={banner.image} alt={banner.name} className="w-full h-full object-cover" />
        <span
          className={`absolute top-2 left-2 px-2 py-1 rounded text-xs font-medium ${
            statusClass[banner.approvalStatus] || "bg-gray-100 text-gray-700"
          }`}
        >
          {banner.approvalStatus || "pending"}
        </span>
      </div>

      <div className="p-3 space-y-2">
        <div className="font-semibold text-gray-800">{banner.name}</div>
        <div className="text-xs text-gray-500">
          {new Date(banner.startDate).toLocaleDateString()} -{" "}
          {new Date(banner.endDate).toLocaleDateString()}
        </div>
        <div className="text-sm text-gray-600 flex items-center gap-2">
          {banner.tapActionType === "external_link" ? (
            <>
              <ExternalLink className="w-4 h-4" />
              <span className="truncate">{banner.externalUrl || "External link"}</span>
            </>
          ) : (
            <>
              <UserCircle2 className="w-4 h-4" />
              <span>Opens your profile</span>
            </>
          )}
        </div>
        {banner.approvalStatus === "rejected" && banner.rejectionReason && (
          <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded p-2 break-words whitespace-pre-wrap overflow-hidden max-h-24 overflow-y-auto">
            <span className="font-medium">Rejection reason:</span>{" "}
            {banner.rejectionReason}
          </p>
        )}

        {banner.approvalStatus === "rejected" && (
          <button
            type="button"
            onClick={() =>
              navigate(`/dashboard/banners/add-banner?resubmit=${banner._id}`)
            }
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition"
          >
            <Upload className="w-4 h-4" />
            Resubmit with edits
          </button>
        )}

        <div className="pt-2 border-t flex justify-end">
          <button
            onClick={() =>
              setConfirmationModal({
                text1: "Delete this banner?",
                text2: "This action cannot be undone.",
                btn1Text: "Delete",
                btn2Text: "Cancel",
                btn1Handler: handleDelete,
                btn2Handler: () => setConfirmationModal(null),
              })
            }
            disabled={isAnyDeleting}
            className={`p-1 rounded-full transition ${
              isAnyDeleting
                ? "text-gray-400 cursor-not-allowed"
                : "text-red-500 hover:bg-red-100"
            }`}
            title="Delete banner"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      {confirmationModal && <Modal data={confirmationModal} />}
    </article>
  );
}

export default BannerCard;
