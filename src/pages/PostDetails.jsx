import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import Modal from "../components/common/Modal";
import {
  ArrowLeft,
  Heart,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  SendHorizonal,
  Trash2,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  fetchDetailedPost,
  addComment,
  deleteComment,
  deletePost,
} from "../services/post.service";
import { useSelector } from "react-redux";
import { useLike } from "../hooks/useLike";
import { getPostMediaItems } from "../utils/postMedia";

function PostDetails() {
  const navigate = useNavigate();
  const location = useLocation();
  const { postId } = useParams();
  const type = location.search.split("=")[1];
  const token = useSelector((state) => state.auth.token);
  const user = useSelector((state) => state.profile.user);
  const { handleLikeToggle } = useLike(token);
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFullDesc, setShowFullDesc] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);
  const [transition, setTransition] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deletingCommentId, setDeletingCommentId] = useState(null);
  const [localPost, setLocalPost] = useState(post);
  const [confirmationModal, setConfirmationModal] = useState(null);
  const [deletingContentId, setDeletingContentId] = useState(null);
  const isAnyDeleting = deletingContentId !== null;

  useEffect(() => {
    setCurrentImage(0);
  }, [postId]);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        const data = await fetchDetailedPost(postId, type, token);
        if (!data) throw new Error("Post not found");
        setPost(data.post);
        setLocalPost(data.post);
        setComments(data.comments.reverse() || []);
      } catch (error) {
        toast.error("Failed to fetch post details");
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchDetails();
  }, [postId, token, type]);

  const handleDeleteContent = async () => {
    setConfirmationModal(null);
    // onDeleteStart?.(post._id); // Notify parent that delete started
    const toastId = toast.loading("Deleting...");

    try {
      const result = await deletePost(postId, post.type, token);
      if (result) {
        toast.success("Deleted successfully", { id: toastId });
        navigate(-1);
        // onDelete?.(post._id); // Remove from UI
      } else {
        toast.error("Could not delete, try again", { id: toastId });
        // onDeleteStart?.(null); // Reset deleting state on failure
      }
    } catch (error) {
      console.error("Error deleting post:", error);
      toast.error("Could not delete, try again", { id: toastId });
      // onDeleteStart?.(null); // Reset deleting state on error
    }
  };

  const handleAddComment = async (type) => {
    if (!commentText.trim()) return toast.error("Comment cannot be empty!");
    try {
      setSubmitting(true);
      const newComment = await addComment(
        postId,
        {
          contentType: type,
          text: commentText,
        },
        token
      );
      setComments((prev) => [newComment, ...prev]);
      setCommentText("");
    } catch (error) {
      toast.error("Failed to post comment");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (id) => {
    // const confirmDelete = window.confirm("Are you sure you want to delete this comment?");
    // if (!confirmDelete) return;
    if (deletingCommentId) return; // prevent parallel deletions
    setDeletingCommentId(id);
    try {
      toast.loading("Deleting comment...", { id: "deleteComment" });
      const result = await deleteComment(id, token);
      if (result) {
        setComments((prev) => prev.filter((c) => c._id !== id));
        toast.success("Comment deleted", { id: "deleteComment" });
      }
    } catch (error) {
      toast.error("Failed to delete comment", { id: "deleteComment" });
    } finally {
      setDeletingCommentId(null);
    }
  };

  const handleLike = () => handleLikeToggle(localPost, setLocalPost);

  if (loading)
    return (
      <div className="w-full flex items-center justify-center mt-32">
        <div className="loader">Loading...</div>
      </div>
    );

  if (!post)
    return (
      <div className="min-h-screen flex flex-col justify-center items-center text-gray-500">
        <p>Post not found</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-2 underline text-blue-600"
        >
          Go back
        </button>
      </div>
    );

  const toggleDescription = () => setShowFullDesc(!showFullDesc);

  const mediaItems = getPostMediaItems(post);
  const mediaCount = mediaItems.length;

  const prevImage = () => {
    if (mediaCount < 2) return;
    setTransition(true);
    setCurrentImage((prev) => (prev === 0 ? mediaCount - 1 : prev - 1));
  };

  const nextImage = () => {
    if (mediaCount < 2) return;
    setTransition(true);
    setCurrentImage((prev) => (prev === mediaCount - 1 ? 0 : prev + 1));
  };

  return (
    <>
      <section className="px-4 pb-4 sm:px-6 sm:pb-6 lg:px-10 lg:pb-10 max-w-4xl mx-auto">
        {/* Back */}
        <div className="flex justify-between items-end my-4 mt-10">
          <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-black"
        >
          <ArrowLeft className="w-5 h-5" /> Back to Posts
        </button>
        <button
            onClick={(e) => {
              e.preventDefault();
              setConfirmationModal({
                text1: `Delete this ${post.type}?`,
                text2: `All related content will be deleted.`,
                btn1Text: "Delete",
                btn2Text: "Cancel",
                btn1Handler: () => handleDeleteContent(),
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

        {/* Media */}
        <div className="relative w-full aspect-video bg-gray-100 rounded-xl overflow-hidden">
          {mediaCount > 0 ? (
            <div className="w-full h-full relative overflow-hidden">
              <div
                className="flex h-full"
                style={{
                  transform: `translateX(-${currentImage * 100}%)`,
                  transition: transition
                    ? "transform 0.5s ease-in-out"
                    : "none",
                }}
              >
                {mediaItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="w-full flex-shrink-0 h-full min-w-full"
                  >
                    {item.mediaType === "video" ? (
                      <video
                        src={item.url}
                        controls
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <img
                        src={item.url}
                        alt={post.title || "Post"}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                ))}
              </div>

              {mediaCount > 1 && currentImage > 0 && (
                <button
                  type="button"
                  onClick={prevImage}
                  className="absolute top-1/2 left-2 -translate-y-1/2 bg-black/30 text-white rounded-full p-2"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}
              {mediaCount > 1 && currentImage < mediaCount - 1 && (
                <button
                  type="button"
                  onClick={nextImage}
                  className="absolute top-1/2 right-2 -translate-y-1/2 bg-black/30 text-white rounded-full p-2"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              No media available
            </div>
          )}
        </div>

        {/* Details */}
        <div className="mt-6 space-y-3">
          <p className="text-gray-700">
            {showFullDesc
              ? post.description
              : `${post.description.slice(0, 150)}${
                  post.description.length > 150 ? "..." : ""
                }`}{" "}
            {post.description.length > 150 && (
              <button
                onClick={toggleDescription}
                className="text-blue-600 underline text-sm"
              >
                {showFullDesc ? "Show Less" : "Show More"}
              </button>
            )}
          </p>

          {/* Hashtags */}
          {post.hashtags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-8">
              {post.hashtags.map((tag, idx) => (
                <span
                  key={idx}
                  className="text-blue-600 text-sm cursor-pointer hover:underline"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          
          <div className="flex items-center gap-6 text-gray-500 text-md mt-3">
            <span className="flex items-center gap-1">
              <Heart
                onClick={handleLike}
                className={`w-4 h-4 cursor-pointer transition-transform scale-110 duration-200 ${
                  localPost.isLikedByCurrentUser
                    ? "text-red-500 fill-red-500"
                    : "text-red-500"
                }`}
              />{" "}
              {localPost.likesCount || 0}
            </span>
            <span className="flex items-center gap-1">
              <MessageCircle className="w-4 h-4  text-blue-500" />{" "}
              {comments.length}
            </span>
            <span className="capitalize">{post.type}</span>
          </div>

          <div className="mt-6 border-t pt-4 text-sm text-gray-500">
            <p>Posted on {new Date(post.createdAt).toLocaleDateString()}</p>
            {post.category && (
              <p>
                Category:{" "}
                <span className="font-medium">{post.category.name}</span>
              </p>
            )}
          </div>
        </div>

        {/* Comments Section */}
        <div className="mt-10 border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Comments ({comments.length})
          </h3>

          {comments.length === 0 ? (
            <p className="text-gray-500 text-sm">No comments yet.</p>
          ) : (
            <div className="space-y-4">
              {comments.map((c) => (
                <div key={c._id} className="flex gap-3 items-start group">
                  <img
                    src={c.user?.profile || "/default-avatar.png"}
                    alt={c.user?.name || "User"}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div className="bg-gray-100 rounded-lg px-3 py-2 max-w-lg flex-1 relative">
                    <div className="flex justify-between items-start">
                      <p className="text-sm font-medium text-gray-800">
                        {c.user?.name || "User"}
                      </p>

                      {/* Delete button (for comment owner or post owner) */}
                      {(c.user?._id === user?._id ||
                        post.user?._id === user?._id) && (
                        <button
                          disabled={deletingCommentId === c._id}
                          onClick={() => handleDeleteComment(c._id)}
                          className="text-red-500 opacity-0 group-hover:opacity-100 transition"
                          title="Delete Comment"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <p className="text-sm text-gray-700 mt-1">{c.text}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(c.createdAt).toLocaleString([], {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Comment input */}
          {(user?.role === "designer" || user?._id === post.user?._id) && (
            <div className="mt-6 flex items-center gap-3">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a comment..."
                className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <button
                onClick={() => handleAddComment(post.type)}
                disabled={submitting}
                className={`flex items-center gap-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 ${
                  submitting && "opacity-60 cursor-not-allowed"
                }`}
              >
                <SendHorizonal className="w-4 h-4" />
                {submitting ? "Posting..." : "Send"}
              </button>
            </div>
          )}
        </div>
      </section>
      {confirmationModal && <Modal data={confirmationModal} />}
    </>
  );
}

export default PostDetails;