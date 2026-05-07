// useLike.js
import { useRef, useState } from "react";
import toast from "react-hot-toast";
import { toggleLike } from "../services/post.service";

export function useLike(token) {
  const [liking, setLiking] = useState(false);
  const debounceRef = useRef(null);

  const handleLikeToggle = (post, setPost) => {
    if (!token) {
      toast.error("Please log in to like posts");
      return;
    }

    // Cancel any pending like
    if (debounceRef.current) clearTimeout(debounceRef.current);

    // Optimistic UI update immediately
    const prevLiked = post.isLikedByCurrentUser;
    const prevLikesCount = post.likesCount;
    setPost({
      ...post,
      isLikedByCurrentUser: !prevLiked,
      likesCount: prevLiked ? prevLikesCount - 1 : prevLikesCount + 1,
    });

    // Debounce server call
    debounceRef.current = setTimeout(async () => {
      try {
        setLiking(true);
        const success = await toggleLike(post._id, post.type, !prevLiked, token);
        console.log(success)
        if (success === null) {
        // revert if API failed
        setPost({
          ...post,
          isLikedByCurrentUser: prevLiked,
          likesCount: prevLikesCount,
        });
        toast.error("Failed to update like");
      }
      } catch (error) {
        setPost({
          ...post,
          isLikedByCurrentUser: prevLiked,
          likesCount: prevLikesCount,
        });
        toast.error("Something went wrong");
      } finally {
        setLiking(false);
      }
    }, 400); // only send after 400ms of no changes
  };

  return { handleLikeToggle, liking };
}
