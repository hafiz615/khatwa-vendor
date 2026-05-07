import { Heart, MessageCircle, PlayCircle, Trash2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import toast from "react-hot-toast";
import Modal from "../common/Modal";
import { deletePost } from "../../services/post.service";
import { useSelector } from "react-redux";
import { useLike } from "../../hooks/useLike";
import { getPostMediaItems } from "../../utils/postMedia";

function PostCard({ post, onDelete, onDeleteStart, isAnyDeleting }) {
  const navigate = useNavigate();
  const token = useSelector((state) => state.auth.token);
  const { handleLikeToggle } = useLike(token);
  const [localPost, setLocalPost] = useState(post);
  const [confirmationModal, setConfirmationModal] = useState(null);

  // View handler
  const handleViewClick = (e) => {
    e.stopPropagation();
    navigate(`/dashboard/posts/${post._id}?type=${post.type}`);
  };

  // Delete handler
  const handleDelete = async () => {
    setConfirmationModal(null);
    onDeleteStart?.(post._id); // Notify parent that delete started
    const toastId = toast.loading("Deleting...");

    try {
      const result = await deletePost(post._id, post.type, token);
      if (result) {
        toast.success("Deleted successfully", { id: toastId });
        onDelete?.(post._id); // Remove from UI
      } else {
        toast.error("Could not delete, try again", { id: toastId });
        onDeleteStart?.(null); // Reset deleting state on failure
      }
    } catch (error) {
      console.error("Error deleting post:", error);
      toast.error("Could not delete, try again", { id: toastId });
      onDeleteStart?.(null); // Reset deleting state on error
    }
  };

  // Like handler
  const handleLike = () => handleLikeToggle(localPost, setLocalPost);

  return (
    <article className="rounded-xl border bg-white overflow-hidden shadow-sm hover:shadow-md transition-all">
      {/* Media */}
      <div className="relative w-full aspect-video bg-gray-100 cursor-pointer"
        onClick={handleViewClick}>
        {(() => {
          const preview = getPostMediaItems(post)[0];
          if (!preview?.url) {
            return (
              <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                No media
              </div>
            );
          }
          if (preview.mediaType === "video") {
            return (
              <>
                <video
                  src={preview.url}
                  muted
                  className="w-full h-full object-cover"
                />
                <PlayCircle className="absolute inset-0 m-auto text-white/80 w-12 h-12 pointer-events-none" />
              </>
            );
          }
          return (
            <img
              src={preview.url}
              alt={post.title || "Post"}
              className="w-full h-full object-cover"
            />
          );
        })()}
      </div>

      {/* Details */}
      <div className="p-4 space-y-2">
        <p className="text-sm text-gray-600 line-clamp-2">
          {post.description}
        </p>

        <div className="flex items-center justify-between text-sm text-gray-500 pt-2 border-t mt-2">
          {/* Stats */}
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Heart
                onClick={handleLike}
                className={`w-4 h-4 cursor-pointer transition-transform scale-110 duration-200 ${
                  localPost.isLikedByCurrentUser
                    ? "text-red-500 fill-red-500 scale-110"
                    : "text-red-500"
                }`}
              />
              <span>{localPost.likesCount || 0}</span>
            </span>

            <span className="flex items-center gap-1">
              <Link to={`/dashboard/posts/${post._id}?type=${post.type}`}>
                <MessageCircle className="w-4 h-4 text-blue-500" />
              </Link>
              {post.commentsCount || 0}
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleViewClick}
              className="px-2 py-1 rounded-md text-sm font-medium text-sky-700 bg-sky-100 hover:bg-sky-200 hover:text-sky-800 transition-all shadow-sm"
            >
              View
            </button>

            <button
              onClick={(e) => {
                e.preventDefault();
                setConfirmationModal({
                  text1: `Delete this ${post.type}?`,
                  text2: `All related content will be deleted.`,
                  btn1Text: "Delete",
                  btn2Text: "Cancel",
                  btn1Handler: () => handleDelete(),
                  btn2Handler: () => setConfirmationModal(null),
                });
              }}
              disabled={isAnyDeleting}
              className={`p-1 rounded-full transition ${
                isAnyDeleting
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-red-500 hover:bg-red-100"
              }`}
              title="Delete post"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {confirmationModal && <Modal data={confirmationModal} />}
    </article>
  );
}

export default PostCard;