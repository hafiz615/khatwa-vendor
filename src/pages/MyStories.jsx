import { useNavigate } from "react-router-dom";
import Button from "../components/common/Button";
import StoryCard from "../components/story/StoryCard";
import { useEffect, useState } from "react";
import { getDesignerStories } from "../services/story.service";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";

function MyStories() {
  const navigate = useNavigate();
  const token = useSelector((state) => state.auth.token);
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingStoryId, setDeletingStoryId] = useState(null);

  useEffect(() => {
    const fetchStories = async () => {
      setLoading(true);
      try {
        const data = await getDesignerStories(token);
        if (data) {
          setStories(data);
        } else {
          toast.error("Failed to fetch stories");
        }
      } catch (error) {
        console.error("Error fetching stories", error);
        toast.error("Failed to fetch stories");
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchStories();
  }, [token]);

  const handleDeleteStart = (storyId) => {
    setDeletingStoryId(storyId);
  };

  const handleDelete = (deletedStoryId) => {
    setStories((prev) => prev.filter((s) => s._id !== deletedStoryId));
    setDeletingStoryId(null);
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-50px)] flex justify-center items-center">
        <div className="loader" />
      </div>
    );
  }

  if (!stories || stories.length === 0) {
    return (
      <div className="min-h-[calc(100vh-50px)] flex flex-col justify-center items-center text-gray-500 space-y-2 text-center">
        <p className="text-sm sm:text-lg md:text-xl">
          You haven't posted any stories yet.
        </p>
        <Button onClick={() => navigate("/dashboard/stories/add-story")}>
          Create Story
        </Button>
      </div>
    );
  }

  return (
    <section className="w-full">
      <header className="mb-4 flex justify-between items-center">
        <div>
          <h1 className="text-md sm:text-xl md:text-2xl lg:text-3xl font-semibold">
            My Stories
          </h1>
          <p className="text-sm text-gray-500">
            {stories.length} active {stories.length === 1 ? "story" : "stories"}
          </p>
        </div>
        <Button onClick={() => navigate("/dashboard/stories/add-story")}>
          Add Story
        </Button>
      </header>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {stories.map((story) => (
          <StoryCard
            key={story._id}
            story={story}
            onDelete={handleDelete}
            onDeleteStart={handleDeleteStart}
            isAnyDeleting={deletingStoryId !== null}
          />
        ))}
      </div>
    </section>
  );
}

export default MyStories;
