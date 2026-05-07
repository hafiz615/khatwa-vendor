// MyPosts.jsx
import { useNavigate } from "react-router-dom";
import Button from "../components/common/Button";
import PostCard from "../components/post/PostCard";
import { useEffect, useState } from "react";
import { getDesignerPosts } from "../services/post.service";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { setPosts } from "../slices/post";

function MyPosts() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth.token);
  const { posts } = useSelector((state) => state.post);
  const [loading, setLoading] = useState(true);
  const [deletingPostId, setDeletingPostId] = useState(null);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const data = await getDesignerPosts(token);
        if (data) {
          dispatch(setPosts(data));
        } else {
          toast.error("Failed to fetch posts");
        }
      } catch (error) {
        console.error("Error fetching posts", error);
        toast.error("Failed to fetch posts");
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchPosts();
  }, [token, dispatch]);

  const handleDeleteStart = (postId) => {
    setDeletingPostId(postId);
  };

  const handleDelete = (deletedPostId) => {
    // Immediately remove from UI
    dispatch(setPosts(posts.filter((p) => p._id !== deletedPostId)));
    setDeletingPostId(null);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-[calc(100vh-50px)] flex justify-center items-center">
        <div className="loader" />
      </div>
    );
  }

  // Empty state
  if (!posts || posts.length === 0) {
    return (
      <div className="min-h-[calc(100vh-50px)] flex flex-col justify-center items-center text-gray-500 space-y-2 text-center">
        <p className="text-sm sm:text-lg md:text-xl">
          You haven't posted anything yet.
        </p>
        <Button onClick={() => navigate("/dashboard/posts/add-post")}>Create Post</Button>
      </div>
    );
  }

  // Data state
  return (
    <section className="w-full">
      <header className="mb-4 flex justify-between items-center">
        <div>
          <h1 className="text-md sm:text-xl md:text-2xl lg:text-3xl font-semibold">
            My Posts
          </h1>
          <p className="text-sm text-gray-500">
            {posts.length} {posts.length === 1 ? "Post" : "Posts"} uploaded
          </p>
        </div>
        {
          loading === false && <Button onClick={() => navigate("/dashboard/posts/add-post")}>Add Post</Button>
        }
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {posts.map((post) => (
          <PostCard
            key={post._id}
            post={post}
            onDelete={handleDelete}
            onDeleteStart={handleDeleteStart}
            isAnyDeleting={deletingPostId !== null}
          />
        ))}
      </div>
    </section>
  );
}

export default MyPosts;