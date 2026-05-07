import { Film, Image as ImageIcon, Trash2, Clock } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import Modal from "../common/Modal";
import { deleteStory } from "../../services/story.service";
import { useSelector } from "react-redux";

function StoryCard({ story, onDelete, onDeleteStart, isAnyDeleting }) {
  const token = useSelector((state) => state.auth.token);
  const [confirmationModal, setConfirmationModal] = useState(null);

  const handleDelete = async () => {
    setConfirmationModal(null);
    onDeleteStart?.(story._id);
    const toastId = toast.loading("Deleting...");

    try {
      const result = await deleteStory(story._id, token);
      if (result) {
        toast.success("Story deleted successfully", { id: toastId });
        onDelete?.(story._id);
      } else {
        toast.error("Could not delete story", { id: toastId });
        onDeleteStart?.(null);
      }
    } catch (error) {
      console.error("Error deleting story:", error);
      toast.error("Could not delete story", { id: toastId });
      onDeleteStart?.(null);
    }
  };

  const getTimeRemaining = () => {
    const now = new Date();
    const expires = new Date(story.expiresAt);
    const hoursLeft = Math.max(0, Math.floor((expires - now) / (1000 * 60 * 60)));
    const minutesLeft = Math.max(0, Math.floor((expires - now) / (1000 * 60)) % 60);
    
    if (hoursLeft > 0) return `${hoursLeft}h ${minutesLeft}m left`;
    if (minutesLeft > 0) return `${minutesLeft}m left`;
    return "Expired";
  };

  const isExpired = new Date(story.expiresAt) <= new Date();
  const isVideo = story.mediaType === "video";

  return (
    <article className="rounded-xl border bg-white overflow-hidden shadow-sm hover:shadow-md transition-all">
      <div className="relative w-full aspect-[9/16] bg-gray-100">
        {isVideo ? (
          <video
            src={story.media}
            muted
            className="w-full h-full object-cover"
          />
        ) : (
          <img
            src={story.media}
            alt="Story"
            className="w-full h-full object-cover"
          />
        )}
        
        <div className="absolute top-2 left-2 bg-black/60 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
          {isVideo ? <Film className="w-3 h-3" /> : <ImageIcon className="w-3 h-3" />}
          {isVideo ? "Video" : "Image"}
        </div>

        {isExpired && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <p className="text-white text-sm font-medium">Expired</p>
          </div>
        )}
      </div>

      <div className="p-3 space-y-2">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {getTimeRemaining()}
          </span>
          <span>{story.views?.length || 0} views</span>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-500 pt-2 border-t">
          <div className="flex items-center gap-3">
            <span>{story.likesCount || 0} likes</span>
            <span>{story.commentsCount || 0} comments</span>
          </div>

          <button
            onClick={(e) => {
              e.preventDefault();
              setConfirmationModal({
                text1: "Delete this story?",
                text2: "This action cannot be undone.",
                btn1Text: "Delete",
                btn2Text: "Cancel",
                btn1Handler: handleDelete,
                btn2Handler: () => setConfirmationModal(null),
              });
            }}
            disabled={isAnyDeleting}
            className={`p-1 rounded-full transition ${
              isAnyDeleting
                ? "text-gray-400 cursor-not-allowed"
                : "text-red-500 hover:bg-red-100"
            }`}
            title="Delete story"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {confirmationModal && <Modal data={confirmationModal} />}
    </article>
  );
}

export default StoryCard;
